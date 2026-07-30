import { Check } from 'lucide-react'
import ProgressRing from './ProgressRing.jsx'

const TONE_TEXT = {
  navy: 'text-navy-900',
  gold: 'text-gold-600',
  skyline: 'text-skyline-600',
  sage: 'text-sage',
  muted: 'text-ink-500',
}
const TONE_BAR = {
  navy: 'bg-navy-900',
  gold: 'bg-gold-500',
  skyline: 'bg-skyline-500',
  sage: 'bg-sage',
  muted: 'bg-ink-500/30',
}

export default function JourneyStep({ icon: Icon, label, detail, progress, tone, isLast, onClick }) {
  const complete = progress >= 100

  return (
    <div className="flex flex-1 items-center">
      <button onClick={onClick} className="group flex flex-1 flex-col items-center text-center">
        <ProgressRing progress={progress} tone={tone} size={56}>
          <div className={`relative flex h-full w-full items-center justify-center rounded-full transition-transform group-hover:scale-105 ${complete ? TONE_BAR[tone] : 'bg-parchment-100'}`}>
            <Icon size={19} strokeWidth={1.75} className={complete ? 'text-parchment-50' : TONE_TEXT[tone]} />
            {complete && (
              <span className="absolute -bottom-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-sage text-parchment-50 ring-2 ring-parchment-50">
                <Check size={10} strokeWidth={2.5} />
              </span>
            )}
          </div>
        </ProgressRing>
        <p className="mt-2.5 text-[13px] font-medium text-navy-900">{label}</p>
        <p className={`mt-0.5 font-serif text-[19px] ${TONE_TEXT[tone]}`}>{progress}%</p>
        <p className="mt-0.5 max-w-[100px] text-[11px] leading-snug text-ink-500">{detail}</p>
      </button>

      {!isLast && (
        <div className="mx-1 mb-9 h-[3px] flex-1 rounded-full bg-navy-900/[0.08]">
          <div className={`h-[3px] rounded-full ${TONE_BAR[tone]}`} style={{ width: `${Math.min(progress, 100)}%`, opacity: 0.55 }} />
        </div>
      )}
    </div>
  )
}