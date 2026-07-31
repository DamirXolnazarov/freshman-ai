const TONE_COLOR = {
  navy: '#5B8DEF',
  gold: '#E8C077',
  skyline: '#5FB5D6',
  sage: '#7FBF8F',
  muted: '#8A93A8',
}

export default function ProgressRing({ progress, tone, size = 72, glow = false, children }) {
  const color = TONE_COLOR[tone] || TONE_COLOR.navy
  const pct = Math.max(0, Math.min(100, progress))

  return (
    <div
      className="relative flex shrink-0 items-center justify-center rounded-full"
      style={{
        width: size,
        height: size,
        background: `conic-gradient(${color} ${pct}%, rgba(255,255,255,0.12) ${pct}%)`,
        boxShadow: glow && pct > 0 ? `0 0 18px 1px ${color}55` : 'none',
      }}
    >
      <div
        className="absolute flex items-center justify-center rounded-full"
        style={{ width: size - 7, height: size - 7, background: glow ? '#0B1A33' : '#FAF5EA' }}
      >
        {children}
      </div>
    </div>
  )
}