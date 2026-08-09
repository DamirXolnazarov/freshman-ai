import { Star, PenLine, CheckSquare } from 'lucide-react'
import Card from '../ui/Card.jsx'

const ICON = { opportunity: Star, essay: PenLine, task: CheckSquare }
const ICON_BG = { opportunity: 'bg-gold-400/25 text-gold-700', essay: 'bg-skyline-300/30 text-skyline-700', task: 'bg-sage/20 text-sage' }

export default function QuickInsightsCard({ insights }) {
  return (
    <Card className="p-5 shadow-panel">
      <div className="flex items-center justify-between">
        <p className="text-[13px] font-medium text-navy-900">Quick Insights</p>
        <span className="text-[11px] text-ink-500">This week</span>
      </div>

      <ul className="mt-3.5 space-y-3">
        {insights.length === 0 && <li className="text-[12.5px] text-ink-500/70">No new insights yet.</li>}
        {insights.map((ins, i) => {
          const Icon = ICON[ins.type] || Star
          return (
            <li key={i} className="flex items-start gap-2.5">
              <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${ICON_BG[ins.type] || ICON_BG.opportunity}`}>
                <Icon size={13} strokeWidth={1.75} />
              </span>
              <div className="min-w-0">
                <p className="text-[12.5px] text-ink-900">
                  <span className="font-medium">{ins.count}</span> {ins.label}
                </p>
                <p className="text-[11px] text-ink-500">{ins.detail}</p>
              </div>
            </li>
          )
        })}
      </ul>

      <p className="mt-3.5 text-[12px] text-gold-700">Keep up the momentum! 🚀</p>
    </Card>
  )
}