import { useEffect, useRef } from 'react'
import anime from 'animejs'
import { SHIELD_PATH, CASTLE_PATH, BRAND } from '../ui/FreshmanCrest.jsx'

export default function HeroCrestForge({ size = 180 }) {
  const bricksRef = useRef(null)
  const shieldRef = useRef(null)
  const castleRef = useRef(null)

  useEffect(() => {
    const bricks = bricksRef.current.querySelectorAll('.forge-brick')

    const timeline = anime.timeline({ easing: 'easeOutExpo' })

    timeline
      .add({
        targets: bricks,
        translateY: [-14, 0],
        opacity: [0, 1],
        scale: [0.85, 1],
        delay: anime.stagger(45, { from: 'last' }),
        duration: 550,
      })
      .add(
        {
          targets: shieldRef.current,
          strokeDashoffset: [anime.setDashoffset, 0],
          duration: 900,
          easing: 'easeInOutSine',
        },
        '-=300'
      )
      .add(
        {
          targets: castleRef.current,
          opacity: [0, 1],
          duration: 400,
        },
        '-=200'
      )

    return () => timeline.pause()
  }, [])

  const rows = 4
  const cols = 5

  return (
    <div className="relative" style={{ width: size, height: size * 1.12 }}>
      <svg viewBox="0 0 100 112" width={size} height={size * 1.12} fill="none">
        <defs>
          <clipPath id="forge-shield-clip">
            <path d={SHIELD_PATH} />
          </clipPath>
        </defs>

        <g ref={bricksRef} clipPath="url(#forge-shield-clip)">
          {Array.from({ length: rows }).map((_, r) =>
            Array.from({ length: cols }).map((_, c) => (
              <rect
                key={`${r}-${c}`}
                className="forge-brick"
                x={c * 20}
                y={r * 28}
                width={19}
                height={26}
                fill={(r + c) % 2 === 0 ? BRAND.midnight : BRAND.stone}
                opacity="0"
              />
            ))
          )}
        </g>

        <g ref={castleRef} clipPath="url(#forge-shield-clip)" opacity="0">
          <rect width="100" height="112" fill={BRAND.stone} />
          <g clipPath="url(#forge-shield-clip)">
            <path d={CASTLE_PATH} fill={BRAND.midnight} />
          </g>
        </g>

        <path
          ref={shieldRef}
          d={SHIELD_PATH}
          stroke={BRAND.blue}
          strokeWidth="2.5"
          fill="none"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  )
}