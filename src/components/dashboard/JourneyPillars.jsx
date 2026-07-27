import { Check } from 'lucide-react'

const TONES = {
  navy: { ring: 'border-navy-900', bg: 'bg-navy-900', text: 'text-navy-900' },
  plum: { ring: 'border-[#4A3B6B]', bg: 'bg-[#4A3B6B]', text: 'text-[#4A3B6B]' },
  sage: { ring: 'border-sage', bg: 'bg-sage', text: 'text-sage' },
  gold: { ring: 'border-gold-500', bg: 'bg-gold-500', text: 'text-gold-600' },
  skyline: { ring: 'border-skyline-600', bg: 'bg-skyline-600', text: 'text-skyline-600' },
  muted: { ring: 'border-ink-500/25', bg: 'bg-ink-500/15', text: 'text-ink-500' },
}

export default function JourneyPillars({ stages = [] }) {
  return (
    <div className="flex items-start justify-between gap-1">
      {stages.map((stage, i) => {
        const tone = TONES[stage.tone] || TONES.navy
        const complete = stage.progress === 100
        return (
          <div key={stage.label} className="flex flex-1 flex-col items-center text-center">
            <div
              className={`relative flex h-14 w-14 items-center justify-center rounded-full border-2 ${tone.ring} ${
                complete ? tone.bg : 'bg-parchment-50'
              }`}
            >
              <stage.icon
                size={20}
                strokeWidth={1.75}
                className={complete ? 'text-parchment-50' : tone.text}
              />
              {complete && (
                <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-sage text-parchment-50 ring-2 ring-parchment-50">
                  <Check size={11} strokeWidth={2.5} />
                </span>
              )}
            </div>
            <p className="mt-2.5 text-[13px] font-medium text-navy-900">{stage.label}</p>
            <p className={`mt-0.5 font-serif text-[19px] ${tone.text}`}>{stage.progress}%</p>
            <p className="mt-0.5 max-w-[110px] text-[11px] leading-snug text-ink-500">{stage.detail}</p>
          </div>
        )
      })}
    </div>
  )
}
