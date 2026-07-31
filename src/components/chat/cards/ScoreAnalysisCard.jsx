import { TrendingUp } from 'lucide-react'
import Card from '../../ui/Card.jsx'

export default function ScoreAnalysisCard({ analysis }) {
  return (
    <Card className="p-4 shadow-panel max-w-sm">
      <div className="flex items-center gap-2 text-[12px] font-medium text-skyline-600">
        <TrendingUp size={14} strokeWidth={2} /> {analysis.type} Analysis
      </div>
      <p className="mt-1.5 font-serif text-[22px] text-navy-900">{analysis.score}</p>
      <p className="mt-1 text-[12.5px] text-ink-700">{analysis.headline}</p>

      {analysis.comparisons.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {analysis.comparisons.map((c) => (
            <li key={c.name} className="flex items-center justify-between text-[12px]">
              <span className="text-ink-900">{c.name}</span>
              <span
                className={
                  c.status === 'below' ? 'text-[#8B5A5A]' : c.status === 'above' ? 'text-sage' : 'text-gold-600'
                }
              >
                {c.range} · {c.status}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}