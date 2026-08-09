import { ArrowRight } from 'lucide-react'
import Card from '../ui/Card.jsx'

export default function RecommendedOpportunitiesCard({ opportunities, onViewAll, onOpen }) {
  return (
    <Card className="p-5 shadow-panel">
      <div className="flex items-center justify-between">
        <p className="text-[13px] font-medium text-navy-900">Recommended Opportunities</p>
        <button onClick={onViewAll} className="flex items-center gap-1 text-[11.5px] text-skyline-600 hover:underline">
          View All <ArrowRight size={11} />
        </button>
      </div>

      <ul className="mt-3.5 space-y-3">
        {opportunities.length === 0 && <li className="text-[12.5px] text-ink-500/70">Chat with the AI to surface matches based on your profile.</li>}
        {opportunities.slice(0, 3).map((o, i) => (
          <li key={i}>
            <button onClick={() => onOpen?.(o)} className="w-full rounded-control border border-navy-900/8 p-3 text-left hover:bg-parchment-100">
              <div className="flex items-center justify-between">
                <p className="text-[12.5px] font-medium text-ink-900">{o.title}</p>
                {o.matchLabel && <span className="shrink-0 rounded-full bg-sage/20 px-2 py-0.5 text-[10px] text-sage">{o.matchLabel}</span>}
              </div>
              <p className="mt-0.5 text-[11px] text-ink-500">{o.subtitle}</p>
              {o.deadline && <p className="mt-1 text-[11px] text-ink-500">Deadline: {new Date(o.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>}
            </button>
          </li>
        ))}
      </ul>
    </Card>
  )
}