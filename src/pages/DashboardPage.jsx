import { useState, useEffect } from 'react'
import { Search, Bell, Trophy, Landmark, FileStack, Flag, PenLine, Star, CheckSquare, Send, Sparkles, ArrowRight, MessageCircle, User } from 'lucide-react'
import Sidebar from '../components/layout/Sidebar.jsx'
import Card from '../components/ui/Card.jsx'
import JourneyRoadmap from '../components/dashboard/JourneyRoadmap.jsx'
import CategoryCard from '../components/dashboard/CategoryCard.jsx'
import TodaysTasksCard from '../components/dashboard/TodaysTasksCard.jsx'
import MiniCalendarCard from '../components/dashboard/MiniCalendarCard.jsx'
import ApplicationOverviewCard from '../components/dashboard/ApplicationOverviewCard.jsx'
import ProfileStrengthCard from '../components/dashboard/ProfileStrengthCard.jsx'
import QuickInsightsCard from '../components/dashboard/QuickInsightsCard.jsx'
import UpcomingDeadlinesCard from '../components/dashboard/UpcomingDeadlinesCard.jsx'
import RecommendedOpportunitiesCard from '../components/dashboard/RecommendedOpportunitiesCard.jsx'
import { supabase } from '../lib/supabase.js'
import { computeCompleteness } from '../lib/profileCompleteness.js'
import { getOpportunityApplications } from '../lib/opportunities.js'
import { getSavedUniversities } from '../lib/universities.js'
import { getEssays } from '../lib/essays.js'
import { getTasks, toggleTaskStatus } from '../lib/tasks.js'
import { computeGaps, topGap } from '../lib/gapDetection.js'

const CHIP_ICON_BG = {
  essay: 'bg-skyline-300/30 text-skyline-700',
  research: 'bg-sage/20 text-sage',
  sat: 'bg-[#4A3B6B]/12 text-[#4A3B6B]',
}

function safeGradeLevel(grade) {
  if (!grade || grade < 9 || grade > 12) return null
  return grade
}

function dateKey(d) {
  const dt = new Date(d)
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`
}

export default function DashboardPage({ onNavigate, studentId }) {
  const [studentName, setStudentName] = useState('')
  const [profile, setProfile] = useState(null)
  const [portfolioItems, setPortfolioItems] = useState([])
  const [savedUniversities, setSavedUniversities] = useState([])
  const [oppApplications, setOppApplications] = useState([])
  const [essays, setEssays] = useState([])
  const [tasks, setTasks] = useState([])
  const [programData, setProgramData] = useState([])
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

      if (savedUnis?.length) {
        const { data: programs } = await supabase
          .from('university_programs')
          .select('*')
          .in('university_id', savedUnis.map((s) => s.university_id))
        setProgramData(programs || [])
      }

      setLoading(false)
    }
    load()
  }, [studentId])

async function handleToggleTask(id, currentStatus) {
  const nextStatus = currentStatus === 'done' ? 'todo' : 'done'
  setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status: nextStatus } : t)))
  try {
    await toggleTaskStatus(id, currentStatus)
  } catch {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status: currentStatus } : t)))
  }
}

  const completeness = computeCompleteness(profile, portfolioItems.length)
  const experiencesProgress = Math.min(100, Math.round((portfolioItems.length / 6) * 100))

  const universitiesProgress = savedUniversities.length
    ? Math.round(savedUniversities.reduce((sum, s) => sum + (Object.values(s.checklist || {}).filter(Boolean).length / 8) * 100, 0) / savedUniversities.length)
    : 0

  const allApps = [...savedUniversities.map((s) => ({ checklist: s.checklist || {}, deadline: s.deadline, name: s.universities?.name })), ...oppApplications.map((a) => ({ checklist: a.checklist, deadline: a.deadline, name: a.opportunities?.title }))]
  const applicationsProgress = allApps.length
    ? Math.round(allApps.reduce((sum, a) => sum + (Object.values(a.checklist).filter(Boolean).length / Math.max(1, Object.keys(a.checklist).length || 1)) * 100, 0) / allApps.length)
    : 0

  const totalSubmittable = allApps.length
  const submitted = allApps.filter((a) => a.checklist.submitted).length
  const decisionProgress = totalSubmittable ? Math.round((submitted / totalSubmittable) * 100) : 0

  const gradeLevel = safeGradeLevel(profile?.grade_level)

  const journeySteps = [
    { key: 'profile', icon: User, label: 'Profile', detail: 'Who you are', progress: completeness, tone: 'navy', onClick: () => onNavigate?.('profile') },
    { key: 'experiences', icon: Trophy, label: 'Experiences', detail: "What you've built", progress: experiencesProgress, tone: 'gold', onClick: () => onNavigate?.('portfolio') },
    { key: 'universities', icon: Landmark, label: 'Universities', detail: "Where you're aiming", progress: universitiesProgress, tone: 'skyline', onClick: () => onNavigate?.('universities') },
    { key: 'applications', icon: FileStack, label: 'Applications', detail: "What you're preparing", progress: applicationsProgress, tone: 'sage', onClick: () => onNavigate?.('applications') },
    { key: 'decision', icon: Flag, label: 'Decision', detail: "Where you'll go", progress: decisionProgress, tone: 'muted', onClick: () => onNavigate?.('applications') },
  ]

  const gaps = computeGaps(profile, portfolioItems, savedUniversities, programData)
  const primaryGap = topGap(gaps)

  const tagCounts = {}
  portfolioItems.forEach((p) => (p.tags || []).forEach((t) => (tagCounts[t] = (tagCounts[t] || 0) + 1)))
  const strongestTag = Object.entries(tagCounts).sort((a, b) => b[1] - a[1])[0]?.[0]

  const tasksThisWeek = tasks.filter((t) => {
    if (!t.due_date) return false
    const daysUntil = (new Date(t.due_date) - new Date()) / 86400000
    return daysUntil >= 0 && daysUntil <= 7
  })

  // --- calendar events, keyed by yyyy-mm-dd ---
  const eventsByDay = {}
  tasks.forEach((t) => {
    if (!t.due_date) return
    const k = dateKey(t.due_date)
    eventsByDay[k] = [...(eventsByDay[k] || []), { type: 'task', label: t.title }]
  })
  savedUniversities.forEach((s) => {
    if (!s.deadline) return
    const k = dateKey(s.deadline)
    eventsByDay[k] = [...(eventsByDay[k] || []), { type: 'deadline', label: s.universities?.name }]
  })

  // --- upcoming deadlines, merged from university + opportunity deadlines ---
  const upcomingDeadlines = [
    ...savedUniversities.filter((s) => s.deadline).map((s) => ({ label: `${s.universities?.name} Deadline`, date: s.deadline })),
    ...oppApplications.filter((a) => a.deadline).map((a) => ({ label: a.opportunities?.title, date: a.deadline })),
  ]

  // --- application overview counts ---
  const overviewCounts = allApps.reduce(
    (acc, a) => {
      if (a.checklist.submitted) acc.submitted++
      else if (Object.values(a.checklist).some(Boolean)) acc.inProgress++
      else acc.planned++
      return acc
    },
    { inProgress: 0, planned: 0, submitted: 0, completed: 0 }
  )

  // --- profile strength breakdown (heuristic — swap in real per-category scoring if you have it) ---
  const strengthBreakdown = [
    { label: 'Academic Performance', level: profile?.gpa >= 3.7 ? 'Excellent' : profile?.gpa >= 3.3 ? 'Strong' : profile ? 'Good' : 'In Progress' },
    { label: 'Extracurriculars', level: portfolioItems.length >= 5 ? 'Strong' : portfolioItems.length >= 2 ? 'Good' : 'In Progress' },
    { label: 'Essays', level: essays.length >= 2 ? 'Good' : essays.length === 1 ? 'In Progress' : 'In Progress' },
    { label: 'Recommendations', level: 'In Progress' },
  ]

  const quickInsights = [
    { type: 'opportunity', count: oppApplications.length || 0, label: 'new opportunities match your profile', detail: 'Based on your saved schools and activities' },
    ...(essays.length ? [{ type: 'essay', count: essays.length, label: 'essay draft needs review', detail: 'Keep momentum going before the deadline' }] : []),
    { type: 'task', count: tasksThisWeek.length, label: 'tasks completed this week', detail: 'Keep up the pace' },
  ]

  const recommendedOpportunities = oppApplications.slice(0, 3).map((a) => ({
    title: a.opportunities?.title || 'Opportunity',
    subtitle: [a.opportunities?.category, a.opportunities?.type].filter(Boolean).join(' · '),
    matchLabel: a.match_score >= 80 ? 'High Match' : a.match_score >= 50 ? 'Good Match' : null,
    deadline: a.deadline,
  }))

function handleAskSubmit(e) {
  e.preventDefault()
  if (!askInput.trim()) return
  onNavigate?.('chat', { prefill: askInput.trim(), autoSend: true })
  setAskInput('')
}

  return (
    <div className="flex h-screen bg-parchment-50">
      <Sidebar
        activePage="dashboard"
        onNavigate={onNavigate}
        student={{ name: studentName || 'Student', cohort: profile?.enrollment_year ? `Class of ${profile.enrollment_year + 4}` : 'Cohort not set yet', completeness }}
      />

      <main className="flex-1 min-w-0 overflow-y-auto px-9 py-8">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="font-serif text-[25px] text-navy-900">
              {studentName ? `Good to see you, ${studentName.split(' ')[0]}!` : 'Welcome.'} 👋
            </h1>
            <p className="mt-1 text-[13px] text-ink-500">Let's continue building your strongest application.</p>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-2 rounded-control border border-navy-900/10 bg-white px-3.5 py-2 text-ink-500">
              <Search size={15} strokeWidth={1.75} />
              <input placeholder="Search anything…" className="w-44 bg-transparent text-[13px] outline-none placeholder:text-ink-500/60" />
            </div>
            <button className="relative flex h-9 w-9 items-center justify-center rounded-control border border-navy-900/8 text-navy-900/60 hover:text-navy-900">
              <Bell size={15} strokeWidth={1.75} />
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-gold-500" />
            </button>
          </div>
        </header>

        <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-12">
          {/* LEFT COLUMN */}
          <div className="min-w-0 space-y-5 xl:col-span-8">
            <JourneyRoadmap steps={journeySteps} onViewRoadmap={() => onNavigate?.('roadmap')} />

            <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 xl:grid-cols-6">
              <CategoryCard icon={Trophy} label="Portfolio" value={portfolioItems.length} detail="Experiences" tone="gold" onClick={() => onNavigate?.('portfolio')} />
              <CategoryCard icon={Landmark} label="Universities" value={savedUniversities.length} detail="Saved" tone="skyline" onClick={() => onNavigate?.('universities')} />
              <CategoryCard icon={FileStack} label="Applications" value={allApps.length} detail="Active" tone="plum" onClick={() => onNavigate?.('applications')} />
              <CategoryCard icon={PenLine} label="Essays" value={essays.length} detail="Drafts" tone="gold" onClick={() => onNavigate?.('essays')} />
              <CategoryCard icon={Star} label="Opportunities" value={oppApplications.length} detail="Saved" tone="sage" onClick={() => onNavigate?.('opportunities')} />
              <CategoryCard icon={CheckSquare} label="Tasks" value={tasksThisWeek.length} detail="This week" tone="dusty" onClick={() => onNavigate?.('tasks')} />
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <TodaysTasksCard
                tasks={tasks}
                onToggle={handleToggleTask}
                onAddTask={() => onNavigate?.('tasks')}
                onViewAll={() => onNavigate?.('tasks')}
              />
              <MiniCalendarCard eventsByDay={eventsByDay} onOpenDay={() => onNavigate?.('calendar')} />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <ApplicationOverviewCard counts={overviewCounts} onViewAll={() => onNavigate?.('applications')} />
              <ProfileStrengthCard completeness={completeness} breakdown={strengthBreakdown} />
              <QuickInsightsCard insights={quickInsights} />
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="min-w-0 space-y-5 xl:col-span-4">
          <div className="relative overflow-hidden rounded-card border border-navy-900/8 bg-parchment-50 p-7 shadow-panel">
  <div
    className="pointer-events-none absolute inset-y-0 right-0 w-[42%]"
    style={{
      backgroundImage: 'url(/castle-chat.png)',
      backgroundPosition: 'right bottom',
      backgroundSize: 'contain',
      backgroundRepeat: 'no-repeat',
      opacity: 0.9,
    }}
  />

  <div className="relative z-10">
    <p className="flex items-center gap-1.5 font-serif text-[21px] text-navy-900">
      Ask Freshman AI <Sparkles size={16} className="text-gold-500" />
    </p>
    <p className="mt-1 text-[13px] text-ink-500">Your personal admissions advisor</p>

    <form onSubmit={handleAskSubmit} className="mt-5 flex items-center gap-2 rounded-control border border-navy-900/10 bg-white/80 px-4 py-3 backdrop-blur-sm">
      <input
        value={askInput}
        onChange={(e) => setAskInput(e.target.value)}
        placeholder="What should I work on today?"
        className="flex-1 bg-transparent text-[13.5px] text-ink-900 outline-none placeholder:text-ink-500/60"
      />
      <button type="submit" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy-900 text-parchment-50 transition-transform hover:scale-105">
        <Send size={14} strokeWidth={2} />
      </button>
    </form>

    <div className="mt-3.5 grid max-w-[85%] grid-cols-2 gap-2">
      {[
        { key: 'profile', label: 'Review my profile', prompt: 'Can you review my profile and tell me where I stand?' },
        { key: 'research', label: 'Find opportunities', prompt: 'Find opportunities that match my profile.' },
        { key: 'next', label: 'Suggest next steps', prompt: 'What should I focus on next?' },
        { key: 'essay', label: 'Review my essay', prompt: 'Can you review my latest essay draft?' },
      ].map((chip) => (
        <button
          key={chip.key}
          onClick={() => onNavigate?.('chat', { prefill: chip.prompt, autoSend: true })}
          className="flex items-center gap-1.5 rounded-control border border-navy-900/8 bg-white/70 px-2.5 py-2.5 text-left text-[11.5px] text-ink-900 transition-colors hover:bg-white"
        >
          <MessageCircle size={12} strokeWidth={1.75} className="text-gold-600" />
          {chip.label}
        </button>
      ))}
    </div>

    {primaryGap && (
      <button
        onClick={() => onNavigate?.(primaryGap.type === 'score' ? 'roadmap' : 'opportunities')}
        className="mt-4 flex items-center gap-1 text-[12px] text-skyline-600 hover:underline"
      >
        Next step: {primaryGap.title.toLowerCase()} <ArrowRight size={11} />
      </button>
    )}
  </div>
</div>

            <UpcomingDeadlinesCard deadlines={upcomingDeadlines} onViewAll={() => onNavigate?.('calendar')} />

            <RecommendedOpportunitiesCard
              opportunities={recommendedOpportunities}
              onViewAll={() => onNavigate?.('opportunities')}
              onOpen={() => onNavigate?.('opportunities')}
            />
          </div>
        </div>
      </main>
    </div>
  )
}