import { useState, useEffect } from 'react'
import { Search, Bell, User, Trophy, Landmark, FileStack, Flag, PenLine, Star, CheckSquare, Send, Sparkles, ArrowRight, MessageCircle } from 'lucide-react'
import Sidebar from '../components/layout/Sidebar.jsx'
import Card from '../components/ui/Card.jsx'
import ProgressBar from '../components/ui/ProgressBar.jsx'
import JourneyStep from '../components/dashboard/JourneyStep.jsx'
import CategoryCard from '../components/dashboard/CategoryCard.jsx'
import FreshmanCrest from '../components/ui/FreshmanCrest.jsx'
import { supabase } from '../lib/supabase.js'
import { computeCompleteness } from '../lib/profileCompleteness.js'
import { getOpportunityApplications } from '../lib/opportunities.js'
import { getSavedUniversities } from '../lib/universities.js'
import { getEssays } from '../lib/essays.js'
import { getTasks } from '../lib/tasks.js'
import { computeGaps, topGap } from '../lib/gapDetection.js'

const CHIP_ICON_BG = {
  essay: 'bg-skyline-300/30 text-skyline-700',
  research: 'bg-sage/20 text-sage',
  sat: 'bg-[#4A3B6B]/12 text-[#4A3B6B]',
}

function timeAgo(dateStr) {
  const diffMs = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diffMs / 60000)
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days === 1) return 'Yesterday'
  return `${days}d ago`
}

export default function DashboardPage({ onNavigate, studentId }) {
  const [studentName, setStudentName] = useState('')
  const [profile, setProfile] = useState(null)
  const [portfolioItems, setPortfolioItems] = useState([])
  const [savedUniversities, setSavedUniversities] = useState([])
  const [oppApplications, setOppApplications] = useState([])
  const [essays, setEssays] = useState([])
  const [tasks, setTasks] = useState([])
  const [askInput, setAskInput] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!studentId) return
    async function load() {
      const [{ data: student }, { data: prof }, { data: portfolio }, savedUnis, opps, essayList, taskList] = await Promise.all([
        supabase.from('students').select('name').eq('id', studentId).single(),
        supabase.from('student_profile').select('*').eq('student_id', studentId).maybeSingle(),
        supabase.from('portfolio_items').select('*').eq('student_id', studentId).order('created_at', { ascending: false }),
        getSavedUniversities(studentId),
        getOpportunityApplications(studentId),
        getEssays(studentId),
        getTasks(studentId),
      ])
      setStudentName(student?.name || 'Student')
      setProfile(prof)
      setPortfolioItems(portfolio || [])
      setSavedUniversities(savedUnis || [])
      setOppApplications(opps || [])
      setEssays(essayList || [])
      setTasks(taskList || [])
      setLoading(false)
    }
    load()
  }, [studentId])

  const completeness = computeCompleteness(profile, portfolioItems.length)
  const experiencesProgress = Math.min(100, Math.round((portfolioItems.length / 6) * 100))

  const universitiesProgress = savedUniversities.length
    ? Math.round(savedUniversities.reduce((sum, s) => sum + (Object.values(s.checklist || {}).filter(Boolean).length / 8) * 100, 0) / savedUniversities.length)
    : 0

  const allApps = [...savedUniversities.map((s) => ({ checklist: s.checklist || {} })), ...oppApplications.map((a) => ({ checklist: a.checklist }))]
  const applicationsProgress = allApps.length
    ? Math.round(allApps.reduce((sum, a) => sum + (Object.values(a.checklist).filter(Boolean).length / Math.max(1, Object.keys(a.checklist).length || 1)) * 100, 0) / allApps.length)
    : 0

  const totalSubmittable = allApps.length
  const submitted = allApps.filter((a) => a.checklist.submitted).length
  const decisionProgress = totalSubmittable ? Math.round((submitted / totalSubmittable) * 100) : 0

  const journeySteps = [
    { key: 'profile', icon: User, label: 'Profile', detail: 'Who you are', progress: completeness, tone: 'navy', page: 'profile' },
    { key: 'experiences', icon: Trophy, label: 'Experiences', detail: "What you've built", progress: experiencesProgress, tone: 'gold', page: 'portfolio' },
    { key: 'universities', icon: Landmark, label: 'Universities', detail: "Where you're aiming", progress: universitiesProgress, tone: 'skyline', page: 'universities' },
    { key: 'applications', icon: FileStack, label: 'Applications', detail: "What you're preparing", progress: applicationsProgress, tone: 'sage', page: 'applications' },
    { key: 'decision', icon: Flag, label: 'Decision', detail: "Where you'll go", progress: decisionProgress, tone: 'muted', page: 'applications' },
  ]

  const gaps = computeGaps(profile, portfolioItems, savedUniversities)
  const primaryGap = topGap(gaps)

  const tagCounts = {}
  portfolioItems.forEach((p) => (p.tags || []).forEach((t) => (tagCounts[t] = (tagCounts[t] || 0) + 1)))
  const strongestTag = Object.entries(tagCounts).sort((a, b) => b[1] - a[1])[0]?.[0]

  const activity = [
    ...portfolioItems.slice(0, 3).map((p) => ({ label: `Added: ${p.title}`, date: p.created_at, icon: Trophy })),
    ...savedUniversities.slice(0, 3).map((s) => ({ label: `Saved: ${s.universities?.name}`, date: s.created_at, icon: Landmark })),
    ...essays.slice(0, 3).map((e) => ({ label: `Essay draft updated: ${e.title}`, date: e.updated_at, icon: PenLine })),
  ]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 4)

  const tasksThisWeek = tasks.filter((t) => {
    if (!t.due_date) return false
    const daysUntil = (new Date(t.due_date) - new Date()) / 86400000
    return daysUntil >= 0 && daysUntil <= 7
  })

  function handleAskSubmit(e) {
    e.preventDefault()
    onNavigate?.('chat')
  }

  return (
    <div className="flex h-screen bg-parchment-50">
      <Sidebar activePage="dashboard" onNavigate={onNavigate} student={{ name: studentName || 'Student', cohort: profile?.enrollment_year ? `Class of ${profile.enrollment_year + 4}` : 'Cohort not set yet', completeness }} />

      <div className="flex flex-1 min-w-0">
        <main className="flex-1 min-w-0 overflow-y-auto px-9 py-8">
          <header className="flex items-center justify-between">
            <div>
              <h1 className="font-serif text-[25px] text-navy-900">
                {studentName ? `Good to see you, ${studentName.split(' ')[0]}!` : 'Welcome.'} 👋
              </h1>
              <p className="mt-1 text-[13px] text-ink-500">Let's continue building your strongest application.</p>
            </div>
            <div className="flex items-center gap-2.5">
              <button className="flex h-9 w-9 items-center justify-center rounded-control border border-navy-900/8 text-navy-900/60 hover:text-navy-900">
                <Search size={15} strokeWidth={1.75} />
              </button>
              <button className="relative flex h-9 w-9 items-center justify-center rounded-control border border-navy-900/8 text-navy-900/60 hover:text-navy-900">
                <Bell size={15} strokeWidth={1.75} />
                <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-gold-500" />
              </button>
            </div>
          </header>

          <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-[1fr_320px]">
            <div>
              {/* University Journey */}
              <Card className="p-6 shadow-panel">
                <div className="flex items-center justify-between">
                  <p className="text-[11.5px] font-medium tracking-[0.14em] text-ink-500 uppercase">Your university journey</p>
                  <button
                    onClick={() => onNavigate?.('roadmap')}
                    className="flex items-center gap-1 rounded-full border border-navy-900/10 px-3 py-1.5 text-[12px] text-navy-900 hover:bg-parchment-100"
                  >
                    View Full Roadmap <ArrowRight size={12} />
                  </button>
                </div>
                <div className="mt-6 flex items-start">
                  {journeySteps.map((s, i) => (
                    <JourneyStep
                      key={s.key}
                      icon={s.icon}
                      label={s.label}
                      detail={s.detail}
                      progress={s.progress}
                      tone={s.tone}
                      isLast={i === journeySteps.length - 1}
                      onClick={() => onNavigate?.(s.page)}
                    />
                  ))}
                </div>
              </Card>

              {/* Ask Freshman AI */}
              <Card className="relative mt-5 overflow-hidden p-6 shadow-panel">
                <div className="relative z-10 max-w-[68%]">
                  <p className="flex items-center gap-1.5 font-serif text-[18px] text-navy-900">
                    Ask Freshman AI <Sparkles size={15} className="text-gold-500" />
                  </p>
                  <p className="mt-1 text-[13px] text-ink-500">Your personal admissions advisor. Always here to help.</p>

                  <form onSubmit={handleAskSubmit} className="mt-4 flex items-center gap-2 rounded-control border border-navy-900/10 bg-parchment-50 px-3.5 py-2.5">
                    <input
                      value={askInput}
                      onChange={(e) => setAskInput(e.target.value)}
                      placeholder="What should I work on today?"
                      className="flex-1 bg-transparent text-[13px] text-ink-900 outline-none placeholder:text-ink-500/60"
                    />
                    <button type="submit" className="flex h-8 w-8 items-center justify-center rounded-full bg-navy-900 text-parchment-50">
                      <Send size={13} strokeWidth={2} />
                    </button>
                  </form>

                  <p className="mt-4 text-[11px] font-medium text-ink-500 uppercase tracking-wide">Continue a conversation</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {[
                      { key: 'essay', label: 'Essay brainstorming', detail: 'Personal Statement' },
                      { key: 'research', label: 'Research opportunities', detail: strongestTag ? `${strongestTag} focus` : 'Computer Science' },
                      { key: 'sat', label: 'SAT strategy', detail: 'Improve my score' },
                    ].map((chip) => (
                      <button
                        key={chip.key}
                        onClick={() => onNavigate?.('chat')}
                        className="flex items-center gap-2 rounded-control border border-navy-900/8 bg-parchment-50 px-3 py-2 text-left hover:bg-parchment-100"
                      >
                        <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${CHIP_ICON_BG[chip.key]}`}>
                          <MessageCircle size={13} strokeWidth={1.75} />
                        </span>
                        <span>
                          <p className="text-[12px] text-ink-900">{chip.label}</p>
                          <p className="text-[10.5px] text-ink-500">{chip.detail}</p>
                        </span>
                      </button>
                    ))}
                  </div>
                  <button onClick={() => onNavigate?.('chat')} className="mt-3 text-[12px] text-skyline-600 hover:underline">
                    View all chats →
                  </button>
                </div>

                <div className="pointer-events-none absolute -right-4 bottom-0 opacity-[0.15]">
                  <FreshmanCrest size={150} />
                </div>
              </Card>

              {/* Category cards */}
              <div className="mt-5 grid grid-cols-2 gap-3.5 sm:grid-cols-3 xl:grid-cols-6">
                <CategoryCard icon={Trophy} label="Portfolio" value={portfolioItems.length} detail="Experiences" tone="gold" onClick={() => onNavigate?.('portfolio')} />
                <CategoryCard icon={Landmark} label="Universities" value={savedUniversities.length} detail="Saved" tone="skyline" onClick={() => onNavigate?.('universities')} />
                <CategoryCard icon={FileStack} label="Applications" value={allApps.length} detail="Active" tone="plum" onClick={() => onNavigate?.('applications')} />
                <CategoryCard icon={PenLine} label="Essays" value={essays.length} detail="Drafts" tone="gold" onClick={() => onNavigate?.('essays')} />
                <CategoryCard icon={Star} label="Opportunities" value={oppApplications.length} detail="Saved" tone="sage" onClick={() => onNavigate?.('opportunities')} />
                <CategoryCard icon={CheckSquare} label="Tasks" value={tasksThisWeek.length} detail="This week" tone="dusty" onClick={() => onNavigate?.('tasks')} />
              </div>
            </div>

            {/* Right column */}
            <div className="space-y-4">
              <Card className="p-5 shadow-panel">
                <div className="flex items-center justify-between">
                  <p className="text-[13px] font-medium text-navy-900">Your Profile</p>
                  <button onClick={() => onNavigate?.('profile')} className="flex items-center gap-1 text-[11.5px] text-skyline-600 hover:underline">
                    View Profile <ArrowRight size={11} />
                  </button>
                </div>
                <div className="mt-3 flex items-center gap-2.5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gold-400/20 border border-gold-400/40 text-[14px] font-medium text-gold-700">
                    {(studentName || 'S')[0]}
                  </div>
                  <div>
                    <p className="text-[13.5px] text-navy-900">{studentName || 'Student'}</p>
                    <p className="text-[11.5px] text-ink-500">
                      {profile?.grade_level ? `Grade ${profile.grade_level}` : 'Grade not set'}
                    </p>
                    {profile?.enrollment_year && (
                      <p className="text-[11.5px] text-ink-500">Class of {profile.enrollment_year + 4}</p>
                    )}
                  </div>
                </div>
                {profile?.major && (
                  <button
                    onClick={() => onNavigate?.('profile')}
                    className="mt-2.5 flex items-center gap-1 text-[12px] text-ink-700 hover:text-navy-900"
                  >
                    {profile.major} (Intended)
                  </button>
                )}
                <div className="mt-3.5 flex items-center justify-between text-[11px] text-ink-500">
                  <span>Profile Completeness</span>
                  <span className="text-ink-900">{completeness}%</span>
                </div>
                <ProgressBar value={completeness} className="mt-1.5" />
              </Card>

              <Card className="p-5 shadow-panel bg-gradient-to-br from-parchment-100 to-parchment-50">
                <p className="flex items-center gap-1.5 text-[13px] font-medium text-navy-900">
                  <Sparkles size={13} className="text-gold-500" /> Today's Insight
                </p>
                {strongestTag ? (
                  <p className="mt-2 text-[13px] leading-relaxed text-ink-700">
                    Your <span className="font-medium text-navy-900">{strongestTag.toLowerCase()}</span> profile has become one of your strongest application assets.
                  </p>
                ) : (
                  <p className="mt-2 text-[13px] leading-relaxed text-ink-700">
                    Chat with Freshman AI about what you've built — that's how insights like this start showing up.
                  </p>
                )}
                {primaryGap && (
                  <>
                    <p className="mt-2 text-[12.5px] text-gold-700">The next logical step is {primaryGap.title.toLowerCase()}.</p>
                    <button
                      onClick={() => onNavigate?.(primaryGap.type === 'score' ? 'roadmap' : 'opportunities')}
                      className="mt-2 flex items-center gap-1 text-[12.5px] text-skyline-600 hover:underline"
                    >
                      {primaryGap.type === 'score' ? "Let's fix this" : "Let's find opportunities"} <ArrowRight size={11} />
                    </button>
                  </>
                )}
              </Card>

              <Card className="p-5 shadow-panel">
                <div className="flex items-center justify-between">
                  <p className="text-[13px] font-medium text-navy-900">Recent Activity</p>
                  <button className="flex items-center gap-1 text-[11.5px] text-skyline-600 hover:underline">
                    View All <ArrowRight size={11} />
                  </button>
                </div>
                <ul className="mt-3 space-y-3">
                  {activity.length === 0 && <li className="text-[12.5px] text-ink-500/70">Nothing yet — start chatting to build your profile.</li>}
                  {activity.map((a, i) => (
                    <li key={i} className="flex items-center gap-2.5">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-navy-900/[0.06] text-navy-800">
                        <a.icon size={13} strokeWidth={1.75} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[12.5px] text-ink-900">{a.label}</p>
                      </div>
                      <span className="shrink-0 text-[11px] text-ink-500">{timeAgo(a.date)}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}