const TONE_COLOR = {
  navy: '#152449',
  gold: '#D2AF6B',
  skyline: '#3B7BA8',
  sage: '#8CA089',
  muted: '#C7C2B4',
}

export default function ProgressRing({ progress, tone, size = 56, children }) {
  const color = TONE_COLOR[tone] || TONE_COLOR.navy
  const pct = Math.max(0, Math.min(100, progress))

  return (
    <div
      className="relative flex shrink-0 items-center justify-center rounded-full"
      style={{
        width: size,
        height: size,
        background: `conic-gradient(${color} ${pct}%, rgba(23,30,44,0.08) ${pct}%)`,
      }}
    >
      <div
        className="absolute flex items-center justify-center rounded-full bg-parchment-50"
        style={{ width: size - 6, height: size - 6 }}
      >
        {children}
      </div>
    </div>
  )
}