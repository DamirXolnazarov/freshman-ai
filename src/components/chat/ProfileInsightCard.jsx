import { Sparkle } from 'lucide-react'
import Button from '../ui/Button.jsx'
import Card from '../ui/Card.jsx'

export default function ProfileInsightCard({ eyebrow = 'Profile insight', title, tags = [], body, onAdd, onDismiss }) {
  return (
    <Card className="p-5 shadow-panel">
      <div className="flex items-center gap-1.5 text-[11.5px] font-medium tracking-[0.12em] text-gold-600 uppercase">
        <Sparkle size={13} className="fill-gold-500 text-gold-500" />
        {eyebrow}
      </div>

      {body && <p className="mt-2.5 text-[14.5px] leading-relaxed text-ink-700">{body}</p>}

      <div className="mt-3.5 rounded-control bg-parchment-100 px-4 py-3">
        <p className="font-serif text-[15.5px] text-navy-900">{title}</p>
        {tags.length > 0 && (
          <p className="mt-1 text-[12.5px] text-ink-500">{tags.join(' · ')}</p>
        )}
      </div>

      <div className="mt-4 flex gap-2.5">
        <Button variant="primary" size="sm" onClick={onAdd}>
          Add to Portfolio
        </Button>
        <Button variant="ghost" size="sm" onClick={onDismiss}>
          Not now
        </Button>
      </div>
    </Card>
  )
}
