import { AlertTriangle, Clock } from 'lucide-react'
import { ArrowRight } from 'lucide-react'
import Card from '../ui/Card.jsx'

function daysLeft(dateStr) {
  return Math.round((new Date(dateStr).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0)) / 86400000)
}

export default function UpcomingDeadlinesCard({ deadlines, onViewAll }) {
  const sorted = [...deadlines].filter((d) => d.date).sort((a, b) => new Date(a.date) - new Date(b.date)).slice(0, 3)

  return (
    <Card className="p-5 shadow-panel">
      <div className="flex items-center justify-between">
        <p className="text-[13px] font-medium text-navy-900">Upcoming Deadlines</p>
        <button onClick={onViewAll} className="flex items-center gap-1 text-[11.5px] text-skyline-600 hover:underline">
          View All <ArrowRight size={11} />
        </button>
      </div>

      <ul className="mt-3.5 space-y-2.5">
        {sorted.length === 0 && <li className="text-[12.5px] text-ink-500/70">Nothing on the horizon yet.</li>}
        {sorted.map((d, i) => {
          const left = daysLeft(d.date)
          const urgent = left <= 21
          return (
            <li key={i} className={`flex items-center gap-2.5 rounded-control p-2.5 ${urgent ? 'bg-[#C6564A]/[0.07]' : 'bg-navy-900/[0.04]'}`}>
              <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${urgent ? 'bg-[#C6564A]/15 text-[#C6564A]' : 'bg-navy-900/[0.08] text-navy-700'}`}>
                {urgent ? <AlertTriangle size={13} /> : <Clock size={13} />}
              </span>
              <div className="min-w-0 flex-1">
                <p className={`truncate text-[12.5px] font-medium ${urgent ? 'text-[#9A3B2E]' : 'text-ink-900'}`}>{d.label}</p>
                <p className="text-[11px] text-ink-500">{new Date(d.date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</p>
              </div>
              <span className={`shrink-0 text-[11.5px] font-medium ${urgent ? 'text-[#C6564A]' : 'text-ink-500'}`}>{left} days left</span>
            </li>
          )
        })}
      </ul>
    </Card>
  )
}