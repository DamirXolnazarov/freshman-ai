import { useState, useEffect, useRef } from 'react'
import Sidebar from '../components/layout/Sidebar.jsx'
import ChatHeader from '../components/layout/ChatHeader.jsx'
import { UserMessage, AIMessage } from '../components/chat/ChatMessage.jsx'
import { useVoiceMode } from '../hooks/useVoiceMode.js'
import VoiceOrb from '../components/chat/VoiceOrb.jsx'
import ProfileInsightCard from '../components/chat/ProfileInsightCard.jsx'
import ExtractionProgress from '../components/chat/ExtractionProgress.jsx'
import CastleBuildLoader from '../components/chat/CastleBuildLoader.jsx'
import ChatInput from '../components/chat/ChatInput.jsx'
import Card from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import RecentAdditionsPanel from '../components/panels/RecentAdditionsPanel.jsx'
import SuggestedPanel from '../components/panels/SuggestedPanel.jsx'
import { ArrowRight } from 'lucide-react'
import {
  chatWithAdvisorStream,
  extractProfileUpdate,
  extractProfileFromDocument,
  extractExplicitPortfolioRequest,
  enrollmentYearFromGrade,
  generateRoadmap,
} from '../lib/groq.js'
import { extractTextFromPdf } from '../lib/resumeParser.js'
import { computeCompleteness, roadmapReadinessGaps } from '../lib/profileCompleteness.js'
import { computeGaps } from '../lib/gapDetection.js'
import { getSavedUniversities } from '../lib/universities.js'
import { withRetry } from '../lib/withRetry.js'
import { supabase } from '../lib/supabase.js'

function timeNow() {
  return new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}
let uid = 0
function nextId() {
  uid += 1
  return `m${Date.now()}_${uid}`
}

const ROADMAP_INTENT = /\b(build|make|create|generate|show)\b.*\broadmap\b|\broadmap\b.*\b(build|make|create|generate)\b/i
const ADD_TO_PORTFOLIO_INTENT = /\b(add|put|save)\b.*\b(this|that|it)\b.*\bportfolio\b|\bportfolio\b.*\b(add|put|save)\b/i

export default function ChatPage({ onNavigate, studentId, initialName }) {
  const [items, setItems] = useState([])
  const [streamingText, setStreamingText] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [voiceModeOpen, setVoiceModeOpen] = useState(false)
  const [isParsingResume, setIsParsingResume] = useState(false)
  const [recentAdditions, setRecentAdditions] = useState([])
  const [hasOfferedRoadmap, setHasOfferedRoadmap] = useState(false)
  const [studentInfo, setStudentInfo] = useState({
    name: initialName || 'Student',
    cohort: 'Cohort not set yet',
    completeness: 0,
  })
  const scrollRef = useRef(null)

  const voice = useVoiceMode({ onSend: handleSend })

  useEffect(() => {
    if (!studentId) return

    async function load() {
      const { data: history } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('student_id', studentId)
        .order('created_at', { ascending: true })

      if (history?.length) {
        setItems(
          history.map((m) => ({
            id: m.id,
            kind: m.role === 'user' ? 'user' : 'assistant',
            content: m.content,
            time: timeNow(),
          }))
        )
      }

      const { data: portfolioItems } = await supabase
        .from('portfolio_items')
        .select('*')
        .eq('student_id', studentId)
        .order('created_at', { ascending: false })
        .limit(5)

      if (portfolioItems?.length) {
        setRecentAdditions(
          portfolioItems.map((it) => ({ title: it.title, when: new Date(it.created_at).toLocaleDateString() }))
        )
      }

      const { data: studentRow } = await supabase
        .from('students')
        .select('name')
        .eq('id', studentId)
        .single()

      const { data: profile } = await supabase
        .from('student_profile')
        .select('*')
        .eq('student_id', studentId)
        .maybeSingle()

      const { data: existingRoadmap } = await supabase
        .from('roadmap_steps')
        .select('id')
        .eq('student_id', studentId)
        .limit(1)

      setHasOfferedRoadmap(!!existingRoadmap?.length)

      const classOf = profile?.enrollment_year ? profile.enrollment_year + 4 : null
      const completeness = computeCompleteness(profile, portfolioItems?.length || 0)

      setStudentInfo({
        name: studentRow?.name || initialName || 'Student',
        cohort: classOf ? `Class of ${classOf}` : 'Cohort not set yet',
        completeness,
      })
    }
    load()
  }, [studentId])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [items, streamingText])

  function updateItem(id, patch) {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)))
  }

  async function saveMessage(role, content) {
    const { error } = await supabase.from('chat_messages').insert({ student_id: studentId, role, content })
    if (error) console.error('Failed to save chat message:', error.message, error)
  }

  async function persistProfileMerge(insight, existingActivitiesCount) {
    const { data: current } = await supabase
      .from('student_profile')
      .select('*')
      .eq('student_id', studentId)
      .maybeSingle()

    const gradeLevel = insight.grade_level || current?.grade_level || null
    const enrollmentYear = enrollmentYearFromGrade(gradeLevel) || current?.enrollment_year || null

    const merged = {
      target_schools: [...new Set([...(current?.target_schools || []), ...(insight.target_schools || [])])],
      honors: [...new Set([...(current?.honors || []), ...(insight.honors || [])])],
      interests: [...new Set([...(current?.interests || []), ...(insight.interests || [])])],
      education_history: insight.education_history?.length ? insight.education_history : (current?.education_history || []),
      major: insight.major || current?.major || null,
      country: insight.country || current?.country || null,
      city: insight.city || current?.city || null,
      age: insight.age || current?.age || null,
      grade_level: gradeLevel,
      enrollment_year: enrollmentYear,
      gpa: insight.gpa || current?.gpa || null,
      sat_score: insight.sat_score || current?.sat_score || null,
      act_score: insight.act_score || current?.act_score || null,
      updated_at: new Date().toISOString(),
    }

    await supabase.from('student_profile').update(merged).eq('student_id', studentId)

    const classOf = merged.enrollment_year ? merged.enrollment_year + 4 : null
    setStudentInfo((prev) => ({
      ...prev,
      cohort: classOf ? `Class of ${classOf}` : prev.cohort,
      completeness: computeCompleteness(merged, existingActivitiesCount),
    }))

    return merged
  }

  function pushInsightCard(activity, sourceMessage) {
    setItems((prev) => [
      ...prev,
      { id: nextId(), kind: 'insight', status: 'idle', insight: { ...activity, sourceMessage } },
    ])
  }

  async function handleRoadmapRequest(text) {
    const userItem = { id: nextId(), kind: 'user', content: text, time: timeNow() }
    setItems((prev) => [...prev, userItem])
    saveMessage('user', text)

    const [{ data: profile }, { data: portfolioItems }, savedUniversities] = await Promise.all([
      supabase.from('student_profile').select('*').eq('student_id', studentId).maybeSingle(),
      supabase.from('portfolio_items').select('*').eq('student_id', studentId),
      getSavedUniversities(studentId),
    ])

    const gaps = roadmapReadinessGaps(profile, portfolioItems?.length || 0)
    const firstName = studentInfo.name.split(' ')[0]

    if (gaps.length > 0) {
      const gapText = gaps.map((g) => g.label).join(', ')
      const reply = `I'd love to build you a really specific roadmap, ${firstName} — but I'm missing ${gapText}. Want to fill me in on any of that first?`
      const assistantItem = { id: nextId(), kind: 'assistant', content: reply, time: timeNow() }
      setItems((prev) => [...prev, assistantItem])
      saveMessage('assistant', reply)
      return
    }

    const reply = `Pulling everything together — your goals, stats, and activities — and taking you to your roadmap now…`
    const assistantItem = { id: nextId(), kind: 'assistant', content: reply, time: timeNow() }
    setItems((prev) => [...prev, assistantItem])
    saveMessage('assistant', reply)

    // detected gaps feed directly into roadmap generation, so the plan is
    // explicitly justified by real numbers, not just generically personalized
    const detectedGaps = computeGaps(profile, portfolioItems || [], savedUniversities || [])
    const { steps } = await generateRoadmap(profile, portfolioItems, detectedGaps)

    if (steps.length > 0) {
      await supabase.from('roadmap_steps').delete().eq('student_id', studentId)
      const rows = steps.map((s, i) => ({
        student_id: studentId,
        stage: s.stage,
        title: s.title,
        description: s.description,
        status: 'pending',
        order_index: i,
      }))
      await supabase.from('roadmap_steps').insert(rows)
    }

    setTimeout(() => {
      onNavigate('roadmap', { autoGenerate: false })
    }, 900)
  }

  async function handleSend(text) {
    if (!text.trim() || isStreaming || !studentId) return

    if (ROADMAP_INTENT.test(text)) {
      await handleRoadmapRequest(text)
      return
    }

    const userItem = { id: nextId(), kind: 'user', content: text, time: timeNow() }
    setItems((prev) => [...prev, userItem])
    saveMessage('user', text)

    setIsStreaming(true)
    setStreamingText('')

    const historyForModel = [...items, userItem]
      .filter((it) => it.kind === 'user' || it.kind === 'assistant')
      .map((it) => ({ role: it.kind === 'user' ? 'user' : 'assistant', content: it.content }))

    let full = ''
    let failed = false
    try {
      full = await withRetry(
        () =>
          chatWithAdvisorStream(
            historyForModel,
            (chunk) => setStreamingText((prev) => prev + chunk),
            studentInfo.name !== 'Student' ? studentInfo.name.split(' ')[0] : null
          ),
        { retries: 2 }
      )
    } catch {
      failed = true
    }

    if (failed) {
      setIsStreaming(false)
      setStreamingText('')
      setItems((prev) => [...prev, { id: nextId(), kind: 'error', failedText: text, time: timeNow() }])
      return
    }

    if (voiceModeOpen) {
      voice.speakReply(full)
    }

    const assistantItem = { id: nextId(), kind: 'assistant', content: full, time: timeNow() }
    setItems((prev) => [...prev, assistantItem])
    setIsStreaming(false)
    setStreamingText('')
    saveMessage('assistant', full)

    // explicit "add this to my portfolio" request — dedicated, more lenient pass
    if (ADD_TO_PORTFOLIO_INTENT.test(text)) {
      const recentUserMessages = [...items, userItem]
        .filter((it) => it.kind === 'user')
        .map((it) => it.content)

      const explicit = await extractExplicitPortfolioRequest(recentUserMessages)
      if (explicit.found) {
        pushInsightCard(
          { title: explicit.title, tags: explicit.tags, summary: explicit.summary, impact: explicit.impact, skills: explicit.skills },
          text
        )
      }
    }

    const fullHistoryForExtraction = [...historyForModel, { role: 'assistant', content: full }]
    const insight = await extractProfileUpdate(fullHistoryForExtraction)

    if (insight.activities.length > 0) {
      pushInsightCard(insight.activities[insight.activities.length - 1], text)
    }

    const hasProfileUpdates =
      insight.target_schools.length || insight.honors.length || insight.interests.length ||
      insight.major || insight.country || insight.city || insight.age || insight.grade_level ||
      insight.gpa || insight.sat_score || insight.act_score

    if (hasProfileUpdates) {
      const merged = await persistProfileMerge(insight, recentAdditions.length)

      if (!hasOfferedRoadmap) {
        const gaps = roadmapReadinessGaps(merged, recentAdditions.length)
        if (gaps.length === 0) {
          setHasOfferedRoadmap(true)
          const offerText = `By the way, ${studentInfo.name.split(' ')[0]} — I think I have enough now to build you a real roadmap. Want me to put one together?`
          const offerItem = { id: nextId(), kind: 'assistant', content: offerText, time: timeNow() }
          setItems((prev) => [...prev, offerItem])
          saveMessage('assistant', offerText)
        }
      }
    }
  }

  async function handleAddInsight(itemId) {
    const target = items.find((it) => it.id === itemId)
    if (!target) return
    updateItem(itemId, { status: 'extracting' })

    const { title, tags, summary, impact, skills, sourceMessage } = target.insight

    const { error } = await supabase.from('portfolio_items').insert({
      student_id: studentId,
      title,
      tags,
      summary,
      impact: impact || '',
      skills,
      source_message: sourceMessage,
    })

    setTimeout(() => {
      updateItem(itemId, { status: 'added' })
      if (!error) {
        setRecentAdditions((prev) => [{ title, when: 'Just now', isNew: true }, ...prev].slice(0, 5))
      }
    }, 1400)
  }

  function handleDismissInsight(itemId) {
    setItems((prev) => prev.filter((it) => it.id !== itemId))
  }

  async function handleUploadResume(file) {
    if (!studentId || isParsingResume) return
    setIsParsingResume(true)

    setItems((prev) => [...prev, { id: nextId(), kind: 'assistant', content: `Reading ${file.name}…`, time: timeNow() }])

    try {
      const text = await extractTextFromPdf(file)

      if (!text || text.length < 20) {
        setItems((prev) => [
          ...prev,
          {
            id: nextId(),
            kind: 'assistant',
            content: `I couldn't find any readable text in ${file.name} — if it's a scanned image rather than an exported PDF, I can't read it yet. Try exporting directly from Google Docs/Word/LinkedIn instead of scanning.`,
            time: timeNow(),
          },
        ])
        setIsParsingResume(false)
        return
      }

      const insight = await extractProfileFromDocument(text)

      if (insight.activities.length > 0) {
        await supabase.from('portfolio_items').insert(
          insight.activities.map((a) => ({
            student_id: studentId,
            title: a.title,
            tags: a.tags,
            summary: a.summary,
            impact: a.impact || '',
            skills: a.skills,
            source_message: `Imported from ${file.name}`,
          }))
        )
        setRecentAdditions((prev) =>
          [...insight.activities.map((a) => ({ title: a.title, when: 'Just now', isNew: true })), ...prev].slice(0, 5)
        )
      }

      await persistProfileMerge(insight, recentAdditions.length + insight.activities.length)

      const summaryParts = []
      if (insight.activities.length) summaryParts.push(`${insight.activities.length} activities/experiences`)
      if (insight.target_schools.length) summaryParts.push(`target schools (${insight.target_schools.join(', ')})`)
      if (insight.education_history?.length) summaryParts.push(`${insight.education_history.length} schools attended`)
      if (insight.honors.length) summaryParts.push(`${insight.honors.length} honors`)

      const summaryText = summaryParts.length
        ? `I've read through ${file.name} and added ${summaryParts.join(', ')} to your profile. Anything you'd like to correct or add?`
        : `I've read ${file.name}, but couldn't confidently pull out structured details — feel free to tell me about your experience directly instead.`

      setItems((prev) => [...prev, { id: nextId(), kind: 'assistant', content: summaryText, time: timeNow() }])
    } catch {
      setItems((prev) => [
        ...prev,
        {
          id: nextId(),
          kind: 'assistant',
          content: "I had trouble reading that file — make sure it's a text-based PDF (not a scanned image) and try again.",
          time: timeNow(),
        },
      ])
    } finally {
      setIsParsingResume(false)
    }
  }

  return (
    <div className="flex h-screen bg-parchment-50">
      <Sidebar activePage="chat" onNavigate={onNavigate} student={studentInfo} />

      <div className="flex flex-1 min-w-0">
        <main className="flex flex-1 flex-col min-w-0">
          <ChatHeader />

          <div ref={scrollRef} className="flex-1 overflow-y-auto px-8 py-7 space-y-6">
            {items.length === 0 && !isStreaming && (
              <AIMessage>
                <p className="text-[14.5px] leading-relaxed text-ink-700">
                  Hi, I'm Freshman AI. Tell me about yourself — what you're studying, schools you're
                  aiming for, things you've built or led — and I'll help turn it into a clear plan.
                </p>
              </AIMessage>
            )}

            {items.map((it) => {
              if (it.kind === 'user') {
                return (
                  <UserMessage key={it.id} time={it.time}>
                    {it.content}
                  </UserMessage>
                )
              }

              if (it.kind === 'assistant') {
                return (
                  <AIMessage key={it.id}>
                    <p className="text-[14.5px] leading-relaxed text-ink-700">{it.content}</p>
                  </AIMessage>
                )
              }

              if (it.kind === 'error') {
                return (
                  <AIMessage key={it.id} showAvatar={false}>
                    <Card className="p-4 shadow-panel border-dusty/40">
                      <p className="text-[13.5px] text-ink-700">
                        I had trouble reaching Freshman AI just now — connection hiccup, not you.
                      </p>
                      <Button
                        variant="quiet"
                        size="sm"
                        className="mt-2.5"
                        onClick={() => {
                          setItems((prev) => prev.filter((x) => x.id !== it.id))
                          handleSend(it.failedText)
                        }}
                      >
                        Try again
                      </Button>
                    </Card>
                  </AIMessage>
                )
              }

              return (
                <AIMessage key={it.id} showAvatar={false}>
                  {it.status === 'idle' && (
                    <ProfileInsightCard
                      title={it.insight.title}
                      tags={it.insight.tags}
                      body="I found something worth structuring into your portfolio."
                      onAdd={() => handleAddInsight(it.id)}
                      onDismiss={() => handleDismissInsight(it.id)}
                    />
                  )}

                  {it.status === 'extracting' && (
                    <div className="space-y-5">
                      <CastleBuildLoader label="Structuring your experience…" size={56} />
                      <ExtractionProgress currentIndex={2} />
                    </div>
                  )}

                  {it.status === 'added' && (
                    <Card className="p-5 shadow-panel">
                      <p className="text-[14px] text-ink-700">Added to your portfolio.</p>
                      <div className="mt-3.5 rounded-control bg-parchment-100 px-4 py-3.5">
                        <div className="flex items-center justify-between">
                          <p className="font-serif text-[15.5px] text-navy-900">{it.insight.title}</p>
                          <span className="rounded-full bg-navy-900/[0.06] px-2.5 py-0.5 text-[11px] text-navy-800">
                            {it.insight.tags?.[0]}
                          </span>
                        </div>
                        <p className="mt-1.5 text-[13px] text-ink-700">{it.insight.summary}</p>
                        <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-ink-500">
                          {it.insight.impact && <span>Impact: {it.insight.impact}</span>}
                          <span>Category: {it.insight.tags?.join(', ')}</span>
                          {it.insight.skills?.length > 0 && <span>Skills: {it.insight.skills.join(', ')}</span>}
                        </div>
                      </div>
                      <button
                        onClick={() => onNavigate('portfolio')}
                        className="mt-3.5 flex items-center gap-1 text-[13px] text-skyline-600 hover:underline"
                      >
                        View in portfolio <ArrowRight size={13} />
                      </button>
                    </Card>
                  )}
                </AIMessage>
              )
            })}

            {isStreaming && (
              <AIMessage>
                <p className="text-[14.5px] leading-relaxed text-ink-700">
                  {streamingText}
                  <span className="ml-0.5 inline-block h-4 w-[2px] animate-pulse bg-navy-900/50 align-middle" />
                </p>
              </AIMessage>
            )}
          </div>

          <div className="px-8 pb-6">
            <ChatInput
              onSend={handleSend}
              disabled={isStreaming || isParsingResume}
              onUploadResume={handleUploadResume}
              onVoiceClick={() => setVoiceModeOpen(true)}
              voiceSupported={voice.supported}
            />
          </div>
        </main>

        <aside className="hidden xl:flex w-[320px] shrink-0 flex-col gap-5 overflow-y-auto border-l border-navy-900/[0.06] px-5 py-6">
          <RecentAdditionsPanel items={recentAdditions} />
          <SuggestedPanel title="Consider exploring Stanford's CS research program" deadline="Dec 15, 2025" />
        </aside>
      </div>

      {voiceModeOpen && (
        <VoiceOrb
          status={voice.status}
          transcript={voice.transcript}
          onStart={voice.startListening}
          onStop={() => voice.submitTranscript()}
          onClose={() => {
            voice.cancelVoice()
            setVoiceModeOpen(false)
          }}
        />
      )}
    </div>
  )
}