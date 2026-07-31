import { Check } from 'lucide-react'
import ProgressRing from './ProgressRing.jsx'

const TONE_TEXT = {
  navy: 'text-[#5B8DEF]',
  gold: 'text-[#E8C077]',
  skyline: 'text-[#5FB5D6]',
  sage: 'text-[#7FBF8F]',
  muted: 'text-[#8A93A8]',
}
const TONE_BG = {
  navy: 'bg-[#5B8DEF]',
  gold: 'bg-[#E8C077]',
  skyline: 'bg-[#5FB5D6]',
  sage: 'bg-[#7FBF8F]',
  muted: 'bg-[#8A93A8]',
}

export default function JourneyStep({ icon: Icon, label, detail, progress, tone, onClick }) {
  const complete = progress >= 100

  return (
    <button onClick={onClick} className="group relative z-10 flex flex-col items-center text-center">
      <ProgressRing progress={progress} tone={tone} size={72} glow>
        <div className="relative flex h-full w-full items-center justify-center rounded-full transition-transform group-hover:scale-105">
          <Icon size={22} strokeWidth={1.75} className={complete ? TONE_TEXT[tone] : 'text-parchment-100/70'} />
          {complete && (
            <span className={`absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full ${TONE_BG[tone]} text-navy-950 ring-2 ring-navy-950`}>
              <Check size={11} strokeWidth={3} />
            </span>
          )}
        </div>
      </ProgressRing>
      <p className="mt-3 text-[13.5px] font-medium text-parchment-50">{label}</p>
      <p className={`mt-0.5 font-serif text-[21px] ${TONE_TEXT[tone]}`}>{progress}%</p>
      <p className="mt-0.5 max-w-[110px] text-[11px] leading-snug text-parchment-100/50">{detail}</p>
    </button>
  )
}