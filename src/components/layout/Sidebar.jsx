import {
  LayoutDashboard,
  Map,
  Landmark,
  FileStack,
  Sparkles,
  PenLine,
  FolderOpen,
  CheckSquare,
  CalendarDays,
} from 'lucide-react'
import FreshmanCrest from '../ui/FreshmanCrest.jsx'

const NAV = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'chat', label: 'Chat', icon: Sparkles },
  { key: 'roadmap', label: 'Roadmap', icon: Map },
  { key: 'universities', label: 'Universities', icon: Landmark },
  { key: 'opportunities', label: 'Opportunities', icon: Sparkles },
  { key: 'portfolio', label: 'Portfolio', icon: FolderOpen },
  { key: 'essays', label: 'Essays & Drafts', icon: PenLine },
  { key: 'applications', label: 'Applications', icon: FileStack },
  { key: 'tasks', label: 'Tasks', icon: CheckSquare },
  { key: 'calendar', label: 'Calendar', icon: CalendarDays },
]

// Sidebar.jsx
const LIVE_PAGES = new Set(['dashboard', 'chat', 'roadmap', 'portfolio', 'universities', 'essays', 'applications', 'opportunities'])

export default function Sidebar({
  student = { name: 'Damirbek X.', cohort: 'Class of 2027', completeness: 78 },
  activePage = 'chat',
  onNavigate = () => {},
}) {
  return (
    <aside className="hidden lg:flex w-[248px] shrink-0 flex-col bg-navy-950 text-parchment-100 px-5 py-6">
      <div className="flex items-center gap-3 px-1">
        <FreshmanCrest size={34} />
        <div className="leading-tight">
          <p className="font-serif text-[17px] tracking-wide text-parchment-50">Freshman</p>
          <p className="text-[10px] tracking-[0.18em] text-gold-400 uppercase">Academy</p>
        </div>
      </div>

      <nav className="mt-9 flex flex-col gap-0.5">
        {NAV.map(({ key, label, icon: Icon }) => {
          const active = key === activePage
          const live = LIVE_PAGES.has(key)
          return (
            <button
              key={key}
              onClick={() => live && onNavigate(key)}
              title={live ? undefined : 'Not built in this MVP yet'}
              className={`group flex items-center gap-3 rounded-control px-3 py-2.5 text-left text-[13.5px] transition-colors ${
                active
                  ? 'bg-parchment-50/[0.08] text-parchment-50'
                  : live
                  ? 'text-parchment-100/60 hover:bg-parchment-50/[0.05] hover:text-parchment-100'
                  : 'text-parchment-100/30 cursor-default'
              }`}
            >
              <Icon size={17} strokeWidth={1.75} className={active ? 'text-gold-400' : ''} />
              {label}
              {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-gold-400" />}
            </button>
          )
        })}
      </nav>

      <div className="mt-auto pt-6">
        <div className="rounded-card bg-parchment-50/[0.06] p-3.5">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-full bg-gold-400/20 border border-gold-400/40 flex items-center justify-center text-[12px] font-medium text-gold-300">
              {student.name.split(' ')[0][0]}
            </div>
            <div className="leading-tight">
              <p className="text-[13px] text-parchment-50">{student.name}</p>
              <p className="text-[11px] text-parchment-100/50">{student.cohort}</p>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-parchment-100/55">
            <span>Profile completeness</span>
            <span className="text-parchment-100/80">{student.completeness}%</span>
          </div>
          <div className="mt-1.5 h-1.5 w-full rounded-full bg-parchment-50/10">
            <div
              className="h-1.5 rounded-full bg-gradient-to-r from-skyline-500 to-gold-400"
              style={{ width: `${student.completeness}%` }}
            />
          </div>
        </div>

        <blockquote className="mt-5 px-1 text-[11.5px] leading-relaxed text-parchment-100/45 font-serif italic">
          "The mind is not a vessel to be filled, but a fire to be kindled."
          <footer className="mt-1 not-italic text-[10.5px] text-parchment-100/35">— Plutarch</footer>
        </blockquote>
      </div>
    </aside>
  )
}