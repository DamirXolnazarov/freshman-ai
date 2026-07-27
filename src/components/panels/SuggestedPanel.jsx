import { Compass } from 'lucide-react'
import Card from '../ui/Card.jsx'
import Button from '../ui/Button.jsx'

export default function SuggestedPanel({ title, deadline }) {
  return (
    <Card className="p-5 shadow-panel bg-gradient-to-br from-parchment-100 to-parchment-50">
      <div className="flex items-center gap-1.5 text-[11.5px] font-medium tracking-[0.12em] text-gold-600 uppercase">
        <Compass size={14} />
        Suggested next step
      </div>
      <p className="mt-2.5 font-serif text-[15px] leading-snug text-navy-900">{title}</p>
      {deadline && <p className="mt-1.5 text-[12px] text-ink-500">Deadline: {deadline}</p>}
      <Button variant="primary" size="sm" className="mt-3.5">
        Explore
      </Button>
    </Card>
  )
}