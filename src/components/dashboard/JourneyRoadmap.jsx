import { ArrowRight } from 'lucide-react'
import JourneyStep from './JourneyStep.jsx'

const TONE_HEX = {
  navy: '#5B8DEF',
  gold: '#E8C077',
  skyline: '#5FB5D6',
  sage: '#7FBF8F',
  muted: '#8A93A8',
}

const RING_SIZE = 72

export default function JourneyRoadmap({ steps, onViewRoadmap }) {
  return (
    <div className="relative overflow-hidden rounded-card bg-navy-950 p-7 shadow-raised">
      <div className="pointer-events-none absolute -right-10 -top-6 opacity-[0.06]">
        <img src="/castle.png" alt="" className="h-[280px] w-auto" />
      </div>

      <div className="relative z-10 flex items-center justify-between">
        <div>
          <p className="text-[11.5px] font-medium tracking-[0.14em] text-gold-400 uppercase">Your university journey</p>
          <p className="mt-1 text-[12.5px] text-parchment-100/50">Your personalized path to top universities</p>
        </div>
        <button
          onClick={onViewRoadmap}
          className="flex items-center gap-1.5 rounded-full border border-parchment-100/15 px-3.5 py-1.5 text-[12px] text-parchment-50 hover:bg-parchment-50/[0.06]"
        >
          View Full Roadmap <ArrowRight size={12} />
        </button>
      </div>

      {/* no fixed height here — the row grows to fit labels naturally,
          the connecting line is positioned via absolute offset math
          (top = RING_SIZE / 2) so it always threads through the exact
          vertical center of each ring regardless of total row height */}
      <div className="relative z-10 mt-10 px-4">
        <div
          className="pointer-events-none absolute left-4 right-4 z-0"
          style={{ top: RING_SIZE / 2 }}
        >
          <svg width="100%" height="6" viewBox="0 0 1000 6" preserveAspectRatio="none" className="overflow-visible">
            <defs>
              <linearGradient id="journey-line" x1="0" y1="0" x2="1" y2="0">
                {steps.map((s, i) => (
                  <stop key={i} offset={`${(i / (steps.length - 1)) * 100}%`} stopColor={TONE_HEX[s.tone]} />
                ))}
              </linearGradient>
            </defs>
            <line x1="0" y1="3" x2="1000" y2="3" stroke="url(#journey-line)" strokeWidth="3" strokeOpacity="0.65" />
            {steps.slice(0, -1).map((s, i) => {
              const segments = steps.length - 1
              const startPct = (i / segments) * 1000
              const endPct = ((i + 1) / segments) * 1000
              return [0.33, 0.66].map((frac, j) => (
                <circle
                  key={`${i}-${j}`}
                  cx={startPct + (endPct - startPct) * frac}
                  cy="3"
                  r="3.5"
                  fill={TONE_HEX[s.tone]}
                />
              ))
            })}
          </svg>
        </div>

        <div className="relative z-10 flex items-start justify-between">
          {steps.map((s) => (
            <JourneyStep
              key={s.key}
              icon={s.icon}
              label={s.label}
              detail={s.detail}
              progress={s.progress}
              tone={s.tone}
              onClick={s.onClick}
            />
          ))}
        </div>
      </div>
    </div>
  )
}