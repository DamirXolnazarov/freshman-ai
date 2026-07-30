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
import ProgressBar from '../ui/ProgressBar.jsx'

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

const LIVE_PAGES = new Set([
  'dashboard', 'chat', 'roadmap', 'portfolio', 'universities',
  'essays', 'applications', 'opportunities', 'tasks', 'calendar', 'profile',
])

export default function Sidebar({
  student = { name: 'Damirbek X.', cohort: 'Class of 2027', completeness: 78 },
  activePage = 'chat',
  onNavigate = () => {},
}) {
  return (
    <aside className="hidden lg:flex w-[196px] shrink-0 flex-col bg-navy-950 text-parchment-100 px-3.5 py-5">
      <button onClick={() => onNavigate('dashboard')} className="flex items-center gap-2 px-1.5">
        <FreshmanCrest size={24} />
        <p className="font-serif text-[14.5px] tracking-wide text-parchment-50">Freshman</p>
      </button>

      <nav className="mt-7 flex flex-col gap-0.5">
        {NAV.map(({ key, label, icon: Icon }) => {
          const active = key === activePage
          const live = LIVE_PAGES.has(key)
          return (
            <button
              key={key}
              onClick={() => live && onNavigate(key)}
              title={live ? undefined : 'Not built in this MVP yet'}
              className={`group flex items-center gap-2.5 rounded-control px-2.5 py-2 text-left text-[12.5px] transition-colors ${
                active
                  ? 'bg-parchment-50/[0.08] text-parchment-50'
                  : live
                  ? 'text-parchment-100/55 hover:bg-parchment-50/[0.05] hover:text-parchment-100'
                  : 'text-parchment-100/25 cursor-default'
              }`}
            >
              <Icon size={15} strokeWidth={1.75} className={active ? 'text-gold-400' : ''} />
              {label}
            </button>
          )
        })}
      </nav>

      <div className="mt-auto pt-4">
        <button
          onClick={() => onNavigate('profile')}
          className="w-full rounded-control bg-parchment-50/[0.06] px-2.5 py-2.5 text-left transition-colors hover:bg-parchment-50/[0.1]"
        >
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 shrink-0 rounded-full bg-gold-400/20 border border-gold-400/40 flex items-center justify-center text-[10.5px] font-medium text-gold-300">
              {student.name.split(' ')[0][0]}
            </div>
            <div className="min-w-0 leading-tight">
              <p className="truncate text-[12px] text-parchment-50">{student.name}</p>
              <p className="truncate text-[10px] text-parchment-100/45">{student.cohort}</p>
            </div>
          </div>
          <ProgressBar value={student.completeness} className="mt-2" trackClassName="bg-parchment-50/10" />
        </button>
      </div>
    </aside>
  )
}