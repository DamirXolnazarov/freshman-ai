import { BrainCircuit } from 'lucide-react'
import Card from '../ui/Card.jsx'

export default function AIMemoryPanel({ facts = [] }) {
  return (
    <Card className="p-5 shadow-panel">
      <div className="flex items-center gap-1.5 text-[11.5px] font-medium tracking-[0.12em] text-gold-600 uppercase">
        <BrainCircuit size={14} />
        What Freshman AI knows
      </div>
      <ul className="mt-3.5 space-y-2.5">
        {facts.map((fact, i) => (
          <li key={i} className="flex items-start gap-2 text-[13px] leading-snug text-ink-700">
            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-gold-500" />
            {fact}
          </li>
        ))}
      </ul>
    </Card>
  )
}