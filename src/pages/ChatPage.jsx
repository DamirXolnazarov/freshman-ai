import { useState, useEffect, useRef } from 'react'
import Sidebar from '../components/layout/Sidebar.jsx'
import ChatBackground from '../components/chat/ChatBackground.jsx'
import { UserMessage, AIMessage } from '../components/chat/ChatMessage.jsx'
import ChatContextSidebar from '../components/chat/ChatContextSidebar.jsx'
import { useVoiceMode } from '../hooks/useVoiceMode.js'
import VoiceOrb from '../components/chat/VoiceOrb.jsx'
import ProfileInsightCard from '../components/chat/ProfileInsightCard.jsx'
import ExtractionProgress from '../components/chat/ExtractionProgress.jsx'
import CastleBuildLoader from '../components/chat/CastleBuildLoader.jsx'
import ThinkingStatus from '../components/chat/ThinkingStatus.jsx'
import { detectScoreMention, analyzeScore } from '../lib/scoreAnalysis.js'
import { parseReminderIntent } from '../lib/reminderIntent.js'
import { createReminder } from '../lib/reminders.js'
import ScoreAnalysisCard from '../components/chat/cards/ScoreAnalysisCard.jsx'
import UniversitySnapshotCard from '../components/chat/cards/UniversitySnapshotCard.jsx'
import ReminderCreatedCard from '../components/chat/cards/ReminderCreatedCard.jsx'
import ChatInput from '../components/chat/ChatInput.jsx'
import TaskCreatedCard from '../components/chat/cards/TaskCreatedCard.jsx'
import RoadmapUpdateCard from '../components/chat/cards/RoadmapUpdateCard.jsx'
import OpportunitySuggestionCard from '../components/chat/cards/OpportunitySuggestionCard.jsx'
import YouTubeEmbed, { extractYouTubeId } from '../components/chat/YouTubeEmbed.jsx'
import MarkdownLite from '../components/chat/MarkdownLite.jsx'
import Card from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import { ArrowRight } from 'lucide-react'
import {
  chatWithAdvisorStream,
  extractProfileUpdate,
  extractProfileFromDocument,
  extractExplicitPortfolioRequest,
  extractRemovalIntent,
  enrollmentYearFromGrade,
  generateRoadmap,
} from '../lib/groq.js'
import { extractTextFromPdf } from '../lib/resumeParser.js'
import { computeCompleteness, roadmapReadinessGaps } from '../lib/profileCompleteness.js'
import { computeGaps } from '../lib/gapDetection.js'
import { getSavedUniversities } from '../lib/universities.js'
import { getOpportunities, saveOpportunity, scoreMatch } from '../lib/opportunities.js'
import { createTask } from '../lib/tasks.js'
import { parseTaskIntent } from '../lib/taskIntent.js'
import { findRelevantVideo } from '../lib/freshmanVideos.js'
import { withRetry } from '../lib/withRetry.js'
import { canCallNow, msUntilNextCall } from '../lib/rateLimiter.js'
import { notify } from '../lib/toast.js'
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
const REMOVE_INTENT = /\b(remove|delete|take out|get rid of)\b.*\b(portfolio|that|this|it)?\b/i

export default function ChatPage({ onNavigate, studentId, initialName }) {
  const [items, setItems] = useState([])
  const [streamingText, setStreamingText] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [voiceModeOpen, setVoiceModeOpen] = useState(false)
  const [isParsingResume, setIsParsingResume] = useState(false)
  const [memoryFacts, setMemoryFacts] = useState([])
  const [hasOfferedRoadmap, setHasOfferedRoadmap] = useState(false)
  const [studentInfo, setStudentInfo] = useState({
    name: initialName || 'Student',
    cohort: 'Cohort not set yet',
    completeness: 0,
  })
  const scrollRef = useRef(null)
  const shownActivityTitles = useRef(new Set())
  const suggestedOpportunityIds = useRef(new Set())

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

      const { data: studentRow } = await supabase.from('students').select('name').eq('id', studentId).single()
      const { data: profile } = await supabase.from('student_profile').select('*').eq('student_id', studentId).maybeSingle()
      const { data: portfolioItems } = await supabase.from('portfolio_items').select('*').eq('student_id', studentId)
      const { data: existingRoadmap } = await supabase.from('roadmap_steps').select('id').eq('student_id', studentId).limit(1)

      setHasOfferedRoadmap(!!existingRoadmap?.length)

      const facts = []
      if (profile?.sat_score) facts.push(`SAT ${profile.sat_score}`)
      if (profile?.target_schools?.length) facts.push(`Interested in ${profile.target_schools[0]}`)
      if (profile?.major) facts.push(profile.major)
      if (profile?.honors?.length) facts.push(profile.honors[0])
      setMemoryFacts(facts)

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
    const { data: current } = await supabase.from('student_profile').select('*').eq('student_id', studentId).maybeSingle()

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
    setItems((prev) => [...prev, { id: nextId(), kind: 'insight', status: 'idle', insight: { ...activity, sourceMessage } }])
  }

  async function maybeShowInsight(newest, text) {
    const key = newest.title?.trim().toLowerCase()
    if (!key) return

    const { data: existing } = await supabase
      .from('portfolio_items')
      .select('id, title')
      .eq('student_id', studentId)

    const alreadyExists = existing?.some((p) => p.title?.trim().toLowerCase() === key)
    const alreadyShownThisSession = shownActivityTitles.current.has(key)

    if (!alreadyExists && !alreadyShownThisSession) {
      shownActivityTitles.current.add(key)
      pushInsightCard(newest, text)
    }
  }

  async function maybeCreateTask(text) {
    const parsed = parseTaskIntent(text)
    if (!parsed) return
    const task = await createTask(studentId, { title: parsed.title, due_date: parsed.dueDate })
    setItems((prev) => [...prev, { id: nextId(), kind: 'task_created', task }])
  }

  async function maybeCreateReminder(text) {
  const parsed = parseReminderIntent(text)
  if (!parsed) return
  const reminder = await createReminder(studentId, parsed)
  setItems((prev) => [...prev, { id: nextId(), kind: 'reminder_created', reminder }])
}

async function maybeAnalyzeScore(text) {
  const scoreInfo = detectScoreMention(text)
  if (!scoreInfo) return
  const savedUniversities = await getSavedUniversities(studentId)
  const analysis = analyzeScore(scoreInfo, savedUniversities)
  setItems((prev) => [...prev, { id: nextId(), kind: 'score_analysis', analysis }])
}

async function maybeShowUniversitySnapshot(text) {
  const savedUniversities = await getSavedUniversities(studentId)
  const mentioned = savedUniversities.find((s) => text.toLowerCase().includes(s.universities?.name?.toLowerCase()))
  if (mentioned) {
    setItems((prev) => [...prev, { id: nextId(), kind: 'university_snapshot', savedUniversity: mentioned }])
  }
}

  async function maybeSuggestOpportunity(insight) {
    if (!insight.major && !insight.interests?.length) return
    const all = await getOpportunities({})
    const { data: profile } = await supabase.from('student_profile').select('*').eq('student_id', studentId).maybeSingle()
    const ranked = all.map((o) => ({ ...o, matchScore: scoreMatch(o, profile) })).sort((a, b) => b.matchScore - a.matchScore)
    const top = ranked[0]
    if (top && top.matchScore >= 70 && !suggestedOpportunityIds.current.has(top.id)) {
      suggestedOpportunityIds.current.add(top.id)
      setItems((prev) => [...prev, { id: nextId(), kind: 'opportunity_suggestion', opportunity: top, matchScore: top.matchScore }])
    }
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
      setItems((prev) => [...prev, { id: nextId(), kind: 'assistant', content: reply, time: timeNow() }])
      saveMessage('assistant', reply)
      return
    }

    const reply = `Pulling everything together and taking you to your roadmap now…`
    setItems((prev) => [...prev, { id: nextId(), kind: 'assistant', content: reply, time: timeNow() }])
    saveMessage('assistant', reply)

    const detectedGaps = computeGaps(profile, portfolioItems || [], savedUniversities || [])
    const { steps } = await generateRoadmap(profile, portfolioItems, detectedGaps)

    let progress = 0
    if (steps.length > 0) {
      await supabase.from('roadmap_steps').delete().eq('student_id', studentId)
      const rows = steps.map((s, i) => ({ student_id: studentId, stage: s.stage, title: s.title, description: s.description, status: 'pending', order_index: i }))
      await supabase.from('roadmap_steps').insert(rows)
    }

    setItems((prev) => [...prev, { id: nextId(), kind: 'roadmap_update', progress }])

    setTimeout(() => onNavigate('roadmap', { autoGenerate: false }), 900)
  }

  async function handleRemoveRequest(text) {
    const userItem = { id: nextId(), kind: 'user', content: text, time: timeNow() }
    setItems((prev) => [...prev, userItem])
    saveMessage('user', text)

    const { data: existing } = await supabase.from('portfolio_items').select('id, title').eq('student_id', studentId)

    if (!existing?.length) {
      const reply = "Your portfolio's empty right now, so there's nothing for me to remove."
      setItems((prev) => [...prev, { id: nextId(), kind: 'assistant', content: reply, time: timeNow() }])
      saveMessage('assistant', reply)
      return
    }

    const result = await extractRemovalIntent(text, existing.map((e) => e.title))

    if (!result.found) {
      const reply = "I'm not sure which item you mean — can you say the exact name from your portfolio?"
      setItems((prev) => [...prev, { id: nextId(), kind: 'assistant', content: reply, time: timeNow() }])
      saveMessage('assistant', reply)
      return
    }

    const match = existing.find((e) => e.title.trim().toLowerCase() === result.matched_title.trim().toLowerCase())
    if (!match) {
      const reply = "I couldn't find an exact match for that in your portfolio — can you double check the name?"
      setItems((prev) => [...prev, { id: nextId(), kind: 'assistant', content: reply, time: timeNow() }])
      saveMessage('assistant', reply)
      return
    }

    await supabase.from('portfolio_items').delete().eq('id', match.id)
    shownActivityTitles.current.delete(match.title.trim().toLowerCase())
    notify.success(`${match.title} removed from your portfolio`)

    const reply = `Done — removed "${match.title}" from your portfolio.`
    setItems((prev) => [...prev, { id: nextId(), kind: 'assistant', content: reply, time: timeNow() }])
    saveMessage('assistant', reply)
  }

  async function handleSend(text) {
    if (!text.trim() || isStreaming || !studentId) return

    if (!canCallNow()) {
      const waitSec = Math.ceil(msUntilNextCall() / 1000)
      setItems((prev) => [...prev, { id: nextId(), kind: 'assistant', content: `Give me just a second — try again in a moment.`, time: timeNow() }])
      return
    }

    if (ROADMAP_INTENT.test(text)) {
      await handleRoadmapRequest(text)
      return
    }

    if (REMOVE_INTENT.test(text)) {
      await handleRemoveRequest(text)
      return
    }

    const userItem = { id: nextId(), kind: 'user', content: text, time: timeNow() }
    setItems((prev) => [...prev, userItem])
    saveMessage('user', text)

    await maybeCreateTask(text)
    await maybeCreateReminder(text)
await maybeAnalyzeScore(text)
await maybeShowUniversitySnapshot(text)

    setIsStreaming(true)
    setStreamingText('')

    const historyForModel = [...items, userItem]
      .filter((it) => it.kind === 'user' || it.kind === 'assistant')
      .map((it) => ({ role: it.kind === 'user' ? 'user' : 'assistant', content: it.content }))

    let full = ''
    let failed = false
    try {
      full = await withRetry(
        () => chatWithAdvisorStream(historyForModel, (chunk) => setStreamingText((prev) => prev + chunk), studentInfo.name !== 'Student' ? studentInfo.name.split(' ')[0] : null),
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

    if (voiceModeOpen) voice.speakReply(full)

    setItems((prev) => [...prev, { id: nextId(), kind: 'assistant', content: full, time: timeNow() }])
    setIsStreaming(false)
    setStreamingText('')
    saveMessage('assistant', full)

    // relevant Freshman Academy video, if the topic matches one we have
    

    const isSubstantive = text.trim().split(/\s+/).length >= 4

const video = isSubstantive ? findRelevantVideo(text) : null
if (video) {
  setItems((prev) => [...prev, { id: nextId(), kind: 'video', videoId: video.videoId, title: video.title }])
}

if (isSubstantive && ADD_TO_PORTFOLIO_INTENT.test(text)) {
  // ...existing block unchanged
}
    if (video) {
      setItems((prev) => [...prev, { id: nextId(), kind: 'video', videoId: video.videoId, title: video.title }])
    }

    if (ADD_TO_PORTFOLIO_INTENT.test(text)) {
      const recentUserMessages = [...items, userItem].filter((it) => it.kind === 'user').map((it) => it.content)
      const explicit = await extractExplicitPortfolioRequest(recentUserMessages)
      if (explicit.found) {
        await maybeShowInsight({ title: explicit.title, tags: explicit.tags, summary: explicit.summary, impact: explicit.impact, skills: explicit.skills }, text)
      }
    }

    if (!isSubstantive) return // "hey", "thanks", "ok" etc — nothing to extract, stop here

const fullHistoryForExtraction = [...historyForModel, { role: 'assistant', content: full }]
const insight = await extractProfileUpdate(fullHistoryForExtraction)

    if (insight.activities.length > 0) {
      const newest = insight.activities[insight.activities.length - 1]
      await maybeShowInsight(newest, text)
    }

    const hasProfileUpdates =
      insight.target_schools.length || insight.honors.length || insight.interests.length ||
      insight.major || insight.country || insight.city || insight.age || insight.grade_level ||
      insight.gpa || insight.sat_score || insight.act_score

    if (hasProfileUpdates) {
      const merged = await persistProfileMerge(insight, 0)
      await maybeSuggestOpportunity(merged)

      if (!hasOfferedRoadmap) {
        const gaps = roadmapReadinessGaps(merged, 0)
        if (gaps.length === 0) {
          setHasOfferedRoadmap(true)
          const offerText = `By the way, ${studentInfo.name.split(' ')[0]} — I think I have enough now to build you a real roadmap. Want me to put one together?`
          setItems((prev) => [...prev, { id: nextId(), kind: 'assistant', content: offerText, time: timeNow() }])
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
      student_id: studentId, title, tags, summary, impact: impact || '', skills, source_message: sourceMessage,
    })

    setTimeout(() => {
      updateItem(itemId, { status: 'added' })
      if (!error) notify.success(`${title} added to your portfolio`)
    }, 1400)
  }

  function handleDismissInsight(itemId) {
    setItems((prev) => prev.filter((it) => it.id !== itemId))
  }

  async function handleSaveOpportunity(itemId, opportunity) {
    await saveOpportunity(studentId, opportunity.id)
    notify.success(`${opportunity.name} saved`)
    updateItem(itemId, { saved: true })
  }

  async function handleUploadResume(file) {
    if (!studentId || isParsingResume) return
    setIsParsingResume(true)
    setItems((prev) => [...prev, { id: nextId(), kind: 'assistant', content: `Reading ${file.name}…`, time: timeNow() }])

    try {
      const text = await extractTextFromPdf(file)
      if (!text || text.length < 20) {
        setItems((prev) => [...prev, { id: nextId(), kind: 'assistant', content: `I couldn't find any readable text in ${file.name} — try exporting directly from Google Docs/Word instead of scanning.`, time: timeNow() }])
        setIsParsingResume(false)
        return
      }

      const insight = await extractProfileFromDocument(text)

      if (insight.activities.length > 0) {
        await supabase.from('portfolio_items').insert(
          insight.activities.map((a) => ({ student_id: studentId, title: a.title, tags: a.tags, summary: a.summary, impact: a.impact || '', skills: a.skills, source_message: `Imported from ${file.name}` }))
        )
      }

      await persistProfileMerge(insight, insight.activities.length)

      const summaryParts = []
      if (insight.activities.length) summaryParts.push(`${insight.activities.length} activities`)
      if (insight.target_schools.length) summaryParts.push(`target schools (${insight.target_schools.join(', ')})`)
      if (insight.honors.length) summaryParts.push(`${insight.honors.length} honors`)

      const summaryText = summaryParts.length
        ? `I've read through ${file.name} and added ${summaryParts.join(', ')} to your profile.`
        : `I've read ${file.name}, but couldn't confidently pull out structured details.`

      setItems((prev) => [...prev, { id: nextId(), kind: 'assistant', content: summaryText, time: timeNow() }])
    } catch {
      setItems((prev) => [...prev, { id: nextId(), kind: 'assistant', content: "I had trouble reading that file — try a text-based PDF.", time: timeNow() }])
    } finally {
      setIsParsingResume(false)
    }
  }

  return (
    <div className="flex h-screen bg-parchment-50">
      <Sidebar activePage="chat" onNavigate={onNavigate} student={studentInfo} />

      <div className="relative flex flex-1 min-w-0">
        <ChatBackground image="/picture1.png" />

        <main className="relative z-10 flex flex-1 flex-col min-w-0">
          <header className="border-b border-navy-900/[0.06] px-8 py-6">
            <h1 className="font-serif text-[22px] text-navy-900">Chat with Freshman AI</h1>
            <p className="mt-1 text-[13px] text-ink-500">Your admissions co-pilot — wise like a mentor, strategic like an advisor.</p>
          </header>

          <div ref={scrollRef} className="flex-1 overflow-y-auto px-8 py-8">
            <div className="mx-auto max-w-[820px] space-y-7">
              {items.length === 0 && !isStreaming && (
                <div className="pt-16 text-center">
                  <p className="font-serif text-[22px] text-navy-900">Your journey starts with a single conversation.</p>
                  <div className="mt-6 flex flex-wrap justify-center gap-2">
                    {['Build my roadmap', 'Review my profile', 'Find universities', 'Improve my resume', 'Find scholarships'].map((p) => (
                      <button key={p} onClick={() => handleSend(p)} className="rounded-full border border-navy-900/10 bg-white px-4 py-2 text-[13px] text-ink-700 hover:bg-parchment-100">
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {items.map((it) => {
                if (it.kind === 'user') return <UserMessage key={it.id} time={it.time}>{it.content}</UserMessage>

                if (it.kind === 'assistant') {
                  return (
                    <AIMessage key={it.id} content={it.content}>
                      <MarkdownLite text={it.content} className="text-[15px] leading-[1.7] text-ink-700" />
                    </AIMessage>
                  )
                }

                if (it.kind === 'video') {
                  return (
                    <AIMessage key={it.id} showAvatar={false}>
                      <YouTubeEmbed videoId={it.videoId} title={it.title} />
                    </AIMessage>
                  )
                }

                if (it.kind === 'task_created') {
                  return (
                    <AIMessage key={it.id} showAvatar={false}>
                      <TaskCreatedCard title={it.task.title} dueDate={it.task.due_date} onOpenTasks={() => onNavigate('tasks')} />
                    </AIMessage>
                  )
                }

                if (it.kind === 'roadmap_update') {
                  return (
                    <AIMessage key={it.id} showAvatar={false}>
                      <RoadmapUpdateCard progress={it.progress} onOpenRoadmap={() => onNavigate('roadmap')} />
                    </AIMessage>
                  )
                }

                if (it.kind === 'opportunity_suggestion') {
                  return (
                    <AIMessage key={it.id} showAvatar={false}>
                      <OpportunitySuggestionCard
                        opportunity={it.opportunity}
                        matchScore={it.matchScore}
                        onSave={() => handleSaveOpportunity(it.id, it.opportunity)}
                        onView={() => onNavigate('opportunities')}
                      />
                    </AIMessage>
                  )
                }
                if (it.kind === 'score_analysis') {
  return (
    <AIMessage key={it.id} showAvatar={false}>
      <ScoreAnalysisCard analysis={it.analysis} />
    </AIMessage>
  )
}

if (it.kind === 'university_snapshot') {
  return (
    <AIMessage key={it.id} showAvatar={false}>
      <UniversitySnapshotCard savedUniversity={it.savedUniversity} onView={() => onNavigate('universities')} />
    </AIMessage>
  )
}

if (it.kind === 'reminder_created') {
  return (
    <AIMessage key={it.id} showAvatar={false}>
      <ReminderCreatedCard reminder={it.reminder} onOpenCalendar={() => onNavigate('calendar')} />
    </AIMessage>
  )
}

                if (it.kind === 'error') {
                  return (
                    <AIMessage key={it.id} showAvatar={false}>
                      <Card className="p-4 shadow-panel border-dusty/40 max-w-sm">
                        <p className="text-[13.5px] text-ink-700">Connection hiccup — not you.</p>
                        <Button variant="quiet" size="sm" className="mt-2.5" onClick={() => { setItems((prev) => prev.filter((x) => x.id !== it.id)); handleSend(it.failedText) }}>
                          Try again
                        </Button>
                      </Card>
                    </AIMessage>
                  )
                }

                // insight
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
                      <div className="space-y-5 max-w-sm">
                        <CastleBuildLoader label="Structuring your experience…" size={56} />
                        <ExtractionProgress currentIndex={2} />
                      </div>
                    )}
                    {it.status === 'added' && (
                      <Card className="p-5 shadow-panel max-w-sm">
                        <p className="text-[14px] text-ink-700">Added to your portfolio.</p>
                        <p className="mt-1.5 font-serif text-[15px] text-navy-900">{it.insight.title}</p>
                        <button onClick={() => onNavigate('portfolio')} className="mt-3 flex items-center gap-1 text-[13px] text-skyline-600 hover:underline">
                          View in portfolio <ArrowRight size={13} />
                        </button>
                      </Card>
                    )}
                  </AIMessage>
                )
              })}

              {isStreaming && (
                streamingText ? (
                  <AIMessage content={streamingText}>
                    <MarkdownLite text={streamingText} className="text-[15px] leading-[1.7] text-ink-700" />
                  </AIMessage>
                ) : (
                  <AIMessage showAvatar={false}><ThinkingStatus /></AIMessage>
                )
              )}
            </div>
          </div>

          <div className="px-8 pb-7">
            <div className="mx-auto max-w-[820px]">
              <ChatInput
  onSend={handleSend}
  disabled={isStreaming || isParsingResume}
  onUploadResume={handleUploadResume}
  onVoiceClick={() => setVoiceModeOpen(true)}
  voiceSupported={voice.supported}
  studentId={studentId}
/>
            </div>
          </div>
        </main>

        <ChatContextSidebar
          memoryFacts={memoryFacts}
          todaysFocus={[]}
          suggestedOpportunity={null}
          upcomingDeadlines={[]}
          roadmapChanges={[]}
          completeness={studentInfo.completeness}
          onNavigate={onNavigate}
        />
      </div>

      {voiceModeOpen && (
        <VoiceOrb
          status={voice.status}
          transcript={voice.transcript}
          onStart={voice.startListening}
          onStop={() => voice.submitTranscript()}
          onClose={() => { voice.cancelVoice(); setVoiceModeOpen(false) }}
        />
      )}
    </div>
  )
}