import { useState, useEffect } from 'react'
import {
  Search,
  Bell,
  GraduationCap,
  Landmark,
  FileStack,
  Compass,
  PenLine,
  CheckSquare,
  BookOpen,
  Sprout,
  Building2,
  ShieldCheck,
  Flag,
  Star,
  ChevronRight,
} from 'lucide-react'
import Sidebar from '../components/layout/Sidebar.jsx'
import Card from '../components/ui/Card.jsx'
import StatCard from '../components/dashboard/StatCard.jsx'
import JourneyPillars from '../components/dashboard/JourneyPillars.jsx'
import GapInsightCard from '../components/dashboard/GapInsightCard.jsx'
import { useUniversityStrategyProgress } from '../hooks/useUniversityStrategyProgress.js'
import AskFreshmanPanel from '../components/dashboard/AskFreshmanPanel.jsx'
import { supabase } from '../lib/supabase.js'
import { computeCompleteness } from '../lib/profileCompleteness.js'
import { getOpportunityApplications } from '../lib/opportunities.js'
import { getSavedUniversities } from '../lib/universities.js'
import { computeGaps, topGap } from '../lib/gapDetection.js'

const STAGE_META = {
  'Academic': { icon: BookOpen, tone: 'navy' },
  'Personal Story': { icon: Sprout, tone: 'plum' },
  'Activities': { icon: ShieldCheck, tone: 'sage' },
  'University Strategy': { icon: Building2, tone: 'gold' },
  'Application Materials': { icon: Compass, tone: 'skyline' },
  'Submit & Beyond': { icon: Flag, tone: 'muted' },
}
const STAGE_ORDER = Object.keys(STAGE_META)

export default function DashboardPage({ onNavigate, studentId }) {
  const [studentName, setStudentName] = useState('')
  const [profile, setProfile] = useState(null)
  const [portfolioItems, setPortfolioItems] = useState([])
  const [roadmapSteps, setRoadmapSteps] = useState([])
  const [oppApplications, setOppApplications] = useState([])
  const [savedUniversities, setSavedUniversities] = useState([])
  const [loading, setLoading] = useState(true)

  const uniStrategy = useUniversityStrategyProgress(studentId)

  useEffect(() => {
    if (!studentId) return
    async function load() {
      const [{ data: student }, { data: prof }, { data: portfolio }, { data: roadmap }, opps, savedUnis] = await Promise.all([
        supabase.from('students').select('name').eq('id', studentId).single(),
        supabase.from('student_profile').select('*').eq('student_id', studentId).maybeSingle(),
        supabase.from('portfolio_items').select('*').eq('student_id', studentId).order('created_at', { ascending: false }),
        supabase.from('roadmap_steps').select('*').eq('student_id', studentId).order('order_index'),
        getOpportunityApplications(studentId),
        getSavedUniversities(studentId),
      ])
      setStudentName(student?.name || 'Student')
      setProfile(prof)
      setPortfolioItems(portfolio || [])
      setRoadmapSteps(roadmap || [])
      setOppApplications(opps || [])
      setSavedUniversities(savedUnis || [])
      setLoading(false)
    }
    load()
  }, [studentId])

  const completeness = computeCompleteness(profile, portfolioItems.length)

  const pillars = STAGE_ORDER.map((stage) => {
    if (stage === 'University Strategy') {
      return {
        label: stage,
        icon: STAGE_META[stage].icon,
        tone: STAGE_META[stage].tone,
        progress: uniStrategy.progress,
        detail: uniStrategy.detail,
      }
    }

    const stageSteps = roadmapSteps.filter((s) => s.stage === stage)
    const progress = stageSteps.length
      ? Math.round((stageSteps.filter((s) => s.status === 'done').length / stageSteps.length) * 100)
      : 0
    return {
      label: stage,
      icon: STAGE_META[stage].icon,
      tone: STAGE_META[stage].tone,
      progress,
      detail: stageSteps.length ? `${stageSteps.length} steps` : 'Not started',
    }
  })

  const oppSubmitted = oppApplications.filter((a) => a.checklist.submitted).length
  const gaps = computeGaps(profile, portfolioItems, savedUniversities)
  const primaryGap = topGap(gaps)

  const stats = [
    { icon: GraduationCap, iconBg: 'bg-skyline-300/30 text-skyline-600', label: 'Profile completeness', value: `${completeness}%`, detail: '' },
    { icon: Landmark, iconBg: 'bg-navy-900/8 text-navy-900', label: 'Target schools', value: String(profile?.target_schools?.length || 0), detail: (profile?.target_schools || []).slice(0, 3).join(', ') },
    { icon: FileStack, iconBg: 'bg-sage/15 text-sage', label: 'Roadmap steps', value: String(roadmapSteps.length), detail: roadmapSteps.length ? `${roadmapSteps.filter((s) => s.status === 'done').length} done` : 'None yet' },
    { icon: Star, iconBg: 'bg-gold-500/15 text-gold-600', label: 'Opportunities tracked', value: String(oppApplications.length), detail: oppApplications.length ? `${oppSubmitted} submitted` : 'None yet' },
    { icon: PenLine, iconBg: 'bg-dusty/25 text-[#8B5A5A]', label: 'Portfolio items', value: String(portfolioItems.length), detail: '' },
    { icon: CheckSquare, iconBg: 'bg-skyline-300/30 text-skyline-600', label: 'Tasks completed', value: String(roadmapSteps.filter((s) => s.status === 'done').length), detail: '' },
  ]

  return (
    <div className="flex h-screen bg-parchment-50">
      <Sidebar activePage="dashboard" onNavigate={onNavigate} student={{ name: studentName || 'Student', cohort: profile?.enrollment_year ? `Class of ${profile.enrollment_year + 4}` : 'Cohort not set yet', completeness }} />

      <div className="flex flex-1 min-w-0">
        <main className="flex-1 min-w-0 overflow-y-auto px-8 py-7">
          <header className="flex items-center justify-between">
            <div>
              <h1 className="font-serif text-[24px] text-navy-900">
                {studentName ? `Good to see you, ${studentName.split(' ')[0]}.` : 'Welcome.'}
              </h1>
              <p className="mt-1 text-[13.5px] text-ink-500">Every great application begins with a clear plan.</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-control border border-navy-900/10 bg-parchment-50 px-3.5 py-2 text-ink-500">
                <Search size={15} strokeWidth={1.75} />
                <input placeholder="Search anything…" className="w-40 bg-transparent text-[13px] outline-none placeholder:text-ink-500/60" />
              </div>
              <button className="relative flex h-9 w-9 items-center justify-center rounded-control border border-navy-900/10 text-navy-900">
                <Bell size={16} strokeWidth={1.75} />
                <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-gold-500" />
              </button>
            </div>
          </header>

          <section className="mt-6 grid grid-cols-2 gap-3.5 sm:grid-cols-3 xl:grid-cols-6">
            {stats.map((s) => (
              <StatCard key={s.label} {...s} />
            ))}
          </section>

          <Card className="mt-5 p-6 shadow-panel">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11.5px] font-medium tracking-[0.12em] text-ink-500 uppercase">Your university journey</p>
                <p className="mt-1 text-[13px] text-ink-500">The six pillars of a strong application</p>
              </div>
              <button onClick={() => onNavigate?.('roadmap')} className="flex items-center gap-1 text-[13px] text-skyline-600 hover:underline">
                View full roadmap <ChevronRight size={14} />
              </button>
            </div>
            <div className="mt-6">
              {roadmapSteps.length === 0 && !loading ? (
                <p className="text-[13px] text-ink-500">
                  No roadmap yet — ask Freshman AI in chat to "build my roadmap" once your profile has a bit more detail.
                </p>
              ) : (
                <JourneyPillars stages={pillars} />
              )}
            </div>
          </Card>

          <section className="mt-5 grid grid-cols-1 gap-3.5 lg:grid-cols-3">
            <GapInsightCard
              gap={primaryGap}
              onExplore={() => onNavigate?.(primaryGap?.type === 'score' ? 'roadmap' : 'opportunities')}
            />

            <Card className="p-5 shadow-panel">
              <p className="text-[11.5px] font-medium tracking-[0.1em] text-ink-500 uppercase">Target schools</p>
              <ul className="mt-3.5 space-y-2">
                {(profile?.target_schools || []).length === 0 && (
                  <li className="text-[13px] text-ink-500">None added yet.</li>
                )}
                {(profile?.target_schools || []).map((school) => (
                  <li key={school} className="text-[13px] text-ink-900">{school}</li>
                ))}
              </ul>
            </Card>
          </section>

          {gaps.length > 1 && (
            <Card className="mt-5 p-5 shadow-panel">
              <p className="text-[11.5px] font-medium tracking-[0.1em] text-ink-500 uppercase">Other gaps worth knowing about</p>
              <ul className="mt-3 space-y-2.5">
                {gaps.slice(1, 4).map((g) => (
                  <li key={g.key} className="text-[13px] text-ink-700">
                    <span className="font-medium text-ink-900">{g.title}.</span> {g.description}
                  </li>
                ))}
              </ul>
            </Card>
          )}

          <div className="mt-5 rounded-card bg-navy-950 px-7 py-5">
            <p className="font-serif text-[15px] italic text-parchment-100/90">
              "Education is the kindling of a flame, not the filling of a vessel."
            </p>
            <p className="mt-1 text-[11.5px] tracking-[0.1em] text-gold-400 uppercase">— Socrates</p>
          </div>
        </main>

        <aside className="hidden xl:block w-[320px] shrink-0 border-l border-navy-900/[0.06] px-5 py-6">
          <AskFreshmanPanel onOpenChat={() => onNavigate?.('chat')} />
        </aside>
      </div>
    </div>
  )
}