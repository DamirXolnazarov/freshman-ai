import { ArrowRight } from 'lucide-react'
import JourneyStep from './JourneyStep.jsx'

const TONE_HEX = {
  navy: '#5B8DEF',
  gold: '#E8C077',
  skyline: '#8B7FE8',
  sage: '#7FBF8F',
  muted: '#8A93A8',
}

const RING_SIZE = 72

export default function JourneyRoadmap({ steps, onViewRoadmap }) {
  return (
    <div className="relative overflow-hidden rounded-card bg-navy-950 p-7 shadow-raised">
      {/* castle photo background, bottom-right, fading into the navy */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: 'url(/castle-roadmap.png)',
          backgroundPosition: 'right bottom',
          backgroundSize: '55% auto',
          backgroundRepeat: 'no-repeat',
          opacity: 0.5,
        }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: 'linear-gradient(90deg, #0B1A33 35%, rgba(11,26,51,0.55) 65%, rgba(11,26,51,0.15) 100%)',
        }}
      />

      <div className="relative z-10 flex items-center justify-between">
        <div>
          <p className="text-[11.5px] font-medium tracking-[0.14em] text-gold-400 uppercase">Your admissions roadmap</p>
          <p className="mt-1 text-[12.5px] text-parchment-100/50">Your personalized path to top universities</p>
        </div>
        <button
          onClick={onViewRoadmap}
          className="flex items-center gap-1.5 rounded-full border border-parchment-100/15 px-3.5 py-1.5 text-[12px] text-parchment-50 transition-colors hover:bg-parchment-50/[0.06]"
        >
          View Full Roadmap <ArrowRight size={12} />
        </button>
      </div>

      <div className="relative z-10 mt-10 flex items-start px-2">
        {steps.map((s, i) => (
          <div
            key={s.key}
            className="flex items-start"
            style={{ flex: i === steps.length - 1 ? '0 0 auto' : '1 1 0%' }}
          >
            <div className="shrink-0">
              <JourneyStep
                icon={s.icon}
                label={s.label}
                detail={s.detail}
                progress={s.progress}
                tone={s.tone}
                onClick={s.onClick}
              />
            </div>

            {i < steps.length - 1 && (
              <div
                className="relative min-w-[24px] flex-1"
                style={{ marginTop: RING_SIZE / 2 - 1, height: 2 }}
              >
                <div
                  className="h-full w-full rounded-full"
                  style={{
                    background: `linear-gradient(90deg, ${TONE_HEX[s.tone]}80, ${TONE_HEX[steps[i + 1].tone]}80)`,
                  }}
                />
                <span
                  className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full"
                  style={{ background: TONE_HEX[s.tone] }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}