import Card from '../ui/Card.jsx'
import { ArrowRight } from 'lucide-react'

const TONE_BG = {
  navy: 'bg-navy-900/8 text-navy-900',
  gold: 'bg-gold-500/15 text-gold-600',
  skyline: 'bg-skyline-300/25 text-skyline-700',
  sage: 'bg-sage/15 text-sage',
  plum: 'bg-[#4A3B6B]/12 text-[#4A3B6B]',
  dusty: 'bg-dusty/25 text-[#8B5A5A]',
}

export default function CategoryCard({ icon: Icon, label, value, detail, tone, onClick }) {
  return (
    <Card className="p-4 shadow-panel">
      <div className={`flex h-9 w-9 items-center justify-center rounded-control ${TONE_BG[tone]}`}>
        <Icon size={17} strokeWidth={1.75} />
      </div>
      <p className="mt-3 font-serif text-[22px] text-navy-900">{value}</p>
      <p className="text-[12px] text-ink-500">{label}</p>
      {detail && <p className="mt-1 text-[11px] text-ink-500/70">{detail}</p>}
      <button onClick={onClick} className="mt-2.5 flex items-center gap-1 text-[11.5px] text-skyline-600 hover:underline">
        View {label} <ArrowRight size={11} />
      </button>
    </Card>
  )
}