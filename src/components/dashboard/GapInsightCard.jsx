import { AlertTriangle, Sparkles } from 'lucide-react'
import Card from '../ui/Card.jsx'
import Button from '../ui/Button.jsx'

const SEVERITY_TONE = {
  high: 'text-[#8B5A5A]',
  medium: 'text-gold-600',
  low: 'text-skyline-600',
}

export default function GapInsightCard({ gap, onExplore }) {
  if (!gap) {
    return (
      <Card className="p-5 shadow-panel bg-gradient-to-br from-parchment-100 to-parchment-50 lg:col-span-2">
        <p className="text-[11.5px] font-medium tracking-[0.1em] text-gold-600 uppercase">Profile check</p>
        <p className="mt-2 font-serif text-[16.5px] text-navy-900">No major gaps detected — nice work.</p>
        <p className="mt-1.5 text-[13px] text-ink-700">Keep building your portfolio and refining your roadmap.</p>
      </Card>
    )
  }

  return (
    <Card className="p-5 shadow-panel bg-gradient-to-br from-parchment-100 to-parchment-50 lg:col-span-2">
      <div className="flex items-center gap-1.5 text-[11.5px] font-medium tracking-[0.1em] uppercase">
        <AlertTriangle size={13} className={SEVERITY_TONE[gap.severity]} />
        <span className={SEVERITY_TONE[gap.severity]}>Gap detected</span>
      </div>
      <p className="mt-2 font-serif text-[16.5px] text-navy-900">{gap.title}</p>
      <p className="mt-1.5 text-[13px] leading-relaxed text-ink-700">{gap.description}</p>
      <Button variant="primary" size="sm" className="mt-3.5 flex items-center gap-1.5" onClick={onExplore}>
        <Sparkles size={13} />
        {gap.type === 'score' ? 'Go to Roadmap' : 'Find opportunities'}
      </Button>
    </Card>
  )
}