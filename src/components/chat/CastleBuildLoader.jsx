import { useState } from 'react'
import FreshmanCrest, { BRAND } from '../ui/FreshmanCrest.jsx'

const PHRASES = [
  'Building your response…',
  'Structuring your experience…',
  'Connecting the dots…',
  'Forging your next step…',
]

// A handful of large, clean bricks — three courses, narrowing upward —
// rather than a dense grid. Simple enough to read as "construction" at
// a glance, not a texture of tiny rectangles.
const ROWS = [
  { y: 0, bricks: 5 },
  { y: 1, bricks: 4 },
  { y: 2, bricks: 3 },
]
const BRICK_W = 15
const BRICK_H = 12
const GAP = 2

export default function CastleBuildLoader({ label, size = 72 }) {
  const [phrase] = useState(() => label || PHRASES[Math.floor(Math.random() * PHRASES.length)])
  const totalRows = ROWS.length

  return (
    <div className="flex items-center gap-4">
      <div className="relative shrink-0" style={{ width: size, height: size * 1.12 }}>
        {/* rising bricks, fade out once the crest is ready */}
        <svg
          viewBox="0 0 90 60"
          width={size}
          height={size * 0.62}
          className="absolute bottom-0 left-1/2 -translate-x-1/2 animate-[fade-up_0.4s_ease_2.4s_both,glow-pulse_0s_linear_2.8s_forwards]"
          style={{ animationName: 'settle-out' }}
        >
          <style>{`
            @keyframes settle-out { to { opacity: 0; transform: translate(-50%, 4px) scale(0.96); } }
          `}</style>
          {ROWS.map((row, rowIdx) => {
            const rowFromBottom = totalRows - 1 - row.y
            const rowWidth = row.bricks * (BRICK_W + GAP) - GAP
            const startX = 45 - rowWidth / 2
            return Array.from({ length: row.bricks }).map((_, i) => {
              const delay = ((totalRows - 1 - rowIdx) * 0.16 + i * 0.05).toFixed(2)
              return (
                <rect
                  key={`${rowIdx}-${i}`}
                  x={startX + i * (BRICK_W + GAP)}
                  y={60 - (rowFromBottom + 1) * (BRICK_H + GAP)}
                  width={BRICK_W}
                  height={BRICK_H}
                  rx="2.5"
                  fill={i % 2 === 0 ? BRAND.blue : BRAND.midnight}
                  className="animate-brick-rise"
                  style={{ animationDelay: `${delay}s` }}
                />
              )
            })
          })}
        </svg>

        {/* crisp crest settles in once construction completes */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 animate-[fade-up_0.5s_ease_2.5s_both]">
          <FreshmanCrest size={size * 0.72} />
        </div>
      </div>
      <p className="font-serif text-[15px] text-navy-800 dark:text-parchment-100 italic">{phrase}</p>
    </div>
  )
}
