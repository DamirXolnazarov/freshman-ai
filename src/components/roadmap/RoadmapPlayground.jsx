import { useState, useEffect, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { useSpring, animated } from '@react-spring/three'
import { AnimatePresence, motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import FreshmanCrest, { BRAND } from '../ui/FreshmanCrest.jsx'

// Castle silhouette matching the brand mark: five towers, center tallest,
// tapering down into the shield's point.
const ROWS = [
  { bricks: 7 },
  { bricks: 6 },
  { bricks: 5 },
  { bricks: 4 },
  { bricks: 3 },
  { bricks: 1 },
]
const BRICK_SIZE = [0.85, 0.5, 0.55]
const GAP = 0.1

function buildBrickLayout() {
  const bricks = []
  ROWS.forEach((row, rowIdx) => {
    const rowWidth = row.bricks * (BRICK_SIZE[0] + GAP) - GAP
    const startX = -rowWidth / 2
    for (let i = 0; i < row.bricks; i++) {
      const isCenter = rowIdx === ROWS.length - 1
      bricks.push({
        id: `${rowIdx}-${i}`,
        target: [isCenter ? 0 : startX + i * (BRICK_SIZE[0] + GAP), rowIdx * (BRICK_SIZE[1] + GAP), 0],
        fallFrom: [
          (isCenter ? 0 : startX + i * (BRICK_SIZE[0] + GAP)) + (Math.random() - 0.5) * 2,
          6 + Math.random() * 3,
          (Math.random() - 0.5) * 2,
        ],
        delay: rowIdx * 100 + i * 40,
        // left half navy, right half stone/white — matches the shield's split
        color: i < row.bricks / 2 ? BRAND.midnight : BRAND.stone,
        isTopBrick: rowIdx === ROWS.length - 1,
      })
    }
  })
  return bricks
}

function Brick({ b, phase }) {
  const settled = phase !== 'falling'
  const isThrowingBrick = b.isTopBrick && (phase === 'throwing' || phase === 'cracking' || phase === 'revealed')

  const style = useSpring({
    position: isThrowingBrick ? [0, 1, 5] : settled ? b.target : b.fallFrom,
    scale: isThrowingBrick ? [5, 5, 5] : [1, 1, 1],
    rotZ: isThrowingBrick ? Math.PI * 3 : 0,
    opacity: phase === 'revealed' && !isThrowingBrick ? 0.15 : 1,
    config: isThrowingBrick
      ? { tension: 90, friction: 16 }
      : settled
      ? { tension: 160, friction: 20 }
      : { tension: 0 },
    delay: settled && !isThrowingBrick ? b.delay : 0,
  })

  return (
    <animated.mesh position={style.position} scale={style.scale} rotation-z={style.rotZ}>
      <boxGeometry args={BRICK_SIZE} />
      <animated.meshStandardMaterial color={b.color} transparent opacity={style.opacity} />
    </animated.mesh>
  )
}

function CastleScene({ phase }) {
  const bricks = useMemo(buildBrickLayout, [])
  return (
    <>
      <ambientLight intensity={0.75} />
      <directionalLight position={[3, 5, 4]} intensity={1.2} />
      <group position={[0, -1.6, 0]}>
        {bricks.map((b) => (
          <Brick key={b.id} b={b} phase={phase} />
        ))}
      </group>
    </>
  )
}

function CrackGlitch() {
  const cracks = useMemo(
    () =>
      Array.from({ length: 6 }).map((_, i) => ({
        id: i,
        d: `M ${50 + (Math.random() - 0.5) * 20},${50 + (Math.random() - 0.5) * 20} L ${Math.random() * 100},${Math.random() * 100}`,
        delay: i * 0.03,
      })),
    []
  )

  return (
    <div className="absolute inset-0 z-20 overflow-hidden">
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
        {cracks.map((c) => (
          <motion.path
            key={c.id}
            d={c.d}
            stroke={BRAND.stone}
            strokeWidth="0.35"
            fill="none"
            initial={{ pathLength: 0, opacity: 0.9 }}
            animate={{ pathLength: 1, opacity: [0.9, 0.6, 0] }}
            transition={{ duration: 0.5, delay: c.delay, ease: 'easeOut' }}
          />
        ))}
      </svg>

      <motion.div
        className="absolute inset-0 bg-skyline-500 mix-blend-screen"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.4, 0, 0.25, 0], x: [0, -5, 4, -2, 0] }}
        transition={{ duration: 0.4, times: [0, 0.2, 0.4, 0.7, 1] }}
      />
      <motion.div
        className="absolute inset-0 bg-gold-500 mix-blend-screen"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.3, 0, 0.15, 0], x: [0, 5, -4, 2, 0] }}
        transition={{ duration: 0.4, times: [0, 0.2, 0.4, 0.7, 1] }}
      />
      <motion.div
        className="absolute inset-0"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.05) 0px, transparent 2px, transparent 4px)',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.7, 0] }}
        transition={{ duration: 0.35 }}
      />
    </div>
  )
}

// phases: button -> falling -> settled -> throwing -> cracking -> revealed
export default function RoadmapPlayground({ active, hasExistingRoadmap, onGenerateClick, onComplete }) {
  const [phase, setPhase] = useState(active ? 'falling' : 'button')

  useEffect(() => {
    if (!active) return
    setPhase('falling')
    const t1 = setTimeout(() => setPhase('settled'), 1300)
    const t2 = setTimeout(() => setPhase('throwing'), 1900)
    const t3 = setTimeout(() => setPhase('cracking'), 2450)
    const t4 = setTimeout(() => setPhase('revealed'), 3050) // popup arrives after crack settles, not instantly
    return () => [t1, t2, t3, t4].forEach(clearTimeout)
  }, [active])

  return (
    <div className="relative mt-6 h-[560px] overflow-hidden rounded-card bg-navy-950 shadow-panel">
      {phase === 'button' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
          <FreshmanCrest size={48} />
          <p className="max-w-xs text-center text-[13.5px] text-parchment-100/60">
            {hasExistingRoadmap
              ? 'Ready to rebuild your roadmap with your latest profile?'
              : 'Ask Freshman AI in chat, or generate your roadmap right here.'}
          </p>
          <button
            onClick={onGenerateClick}
            className="mt-1 flex items-center gap-2 rounded-control bg-gold-500 px-5 py-2.5 text-[13.5px] font-medium text-navy-950 transition-colors hover:bg-gold-400"
          >
            <Sparkles size={15} />
            {hasExistingRoadmap ? 'Regenerate roadmap' : 'Generate my roadmap'}
          </button>
        </div>
      )}

      {phase !== 'button' && (
        <>
          <div className="absolute inset-0">
            <Canvas camera={{ position: [4, 2.5, 8], fov: 42 }}>
              <CastleScene phase={phase} />
            </Canvas>
          </div>

          {(phase === 'falling' || phase === 'settled') && (
            <p className="absolute bottom-8 left-1/2 -translate-x-1/2 font-serif text-[14.5px] italic text-parchment-100/60">
              Building your roadmap…
            </p>
          )}
        </>
      )}

      {phase === 'cracking' && <CrackGlitch />}

      <AnimatePresence>
        {phase === 'revealed' && (
          <motion.div
            className="absolute inset-0 z-30 flex items-center justify-center bg-navy-950/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.35 }}
          >
            <motion.div
              initial={{ opacity: 0, y: 14, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="flex w-full max-w-xs flex-col items-center rounded-card bg-parchment-50 px-7 py-8 text-center shadow-raised"
            >
              <FreshmanCrest size={40} />
              <p className="mt-3.5 font-serif text-[17.5px] text-navy-900">Your roadmap is ready.</p>
              <p className="mt-2 text-[13px] leading-relaxed text-ink-700">
                Tailored to your goals, stats, and activities.
              </p>
              <button
                onClick={() => {
                  setPhase('button')
                  onComplete?.()
                }}
                className="mt-5 rounded-control bg-navy-900 px-6 py-2.5 text-[13px] text-parchment-50 transition-colors hover:bg-navy-800"
              >
                Check it out
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}