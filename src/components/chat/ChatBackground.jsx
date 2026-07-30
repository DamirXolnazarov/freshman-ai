// Subtle classical line-art — a colonnade fading toward the edges, with a
// laurel motif centered low. Pure SVG, no external assets, tinted into
// the brand's own gold/navy so it reads as "academy," not stock photography.
// Deliberately faint (opacity ~4-6%) so it's a texture behind chat bubbles,
// never competing with them.
export default function ChatBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <svg
        className="absolute inset-0 h-full w-full opacity-[0.05]"
        viewBox="0 0 800 600"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >
        {/* colonnade */}
        {[60, 160, 260, 540, 640, 740].map((x, i) => (
          <g key={i} stroke="#1E3A8A" strokeWidth="1.5">
            {/* capital */}
            <rect x={x - 14} y="60" width="28" height="10" />
            {/* shaft with fluting */}
            <line x1={x - 9} y1="70" x2={x - 9} y2="420" />
            <line x1={x} y1="70" x2={x} y2="420" />
            <line x1={x + 9} y1="70" x2={x + 9} y2="420" />
            {/* base */}
            <rect x={x - 16} y="420" width="32" height="10" />
          </g>
        ))}
        {/* entablature line connecting the columns */}
        <line x1="20" y1="55" x2="780" y2="55" stroke="#1E3A8A" strokeWidth="2" />

        {/* laurel motif, centered low */}
        <g transform="translate(400 500)" stroke="#D2AF6B" strokeWidth="1.5" fill="none">
          {Array.from({ length: 6 }).map((_, i) => {
            const angle = -30 + i * 12
            const rad = (angle * Math.PI) / 180
            const x = Math.sin(rad) * 70
            const y = -Math.cos(rad) * 70
            return <ellipse key={`l-${i}`} cx={-x} cy={y} rx="10" ry="5" transform={`rotate(${-angle} ${-x} ${y})`} />
          })}
          {Array.from({ length: 6 }).map((_, i) => {
            const angle = -30 + i * 12
            const rad = (angle * Math.PI) / 180
            const x = Math.sin(rad) * 70
            const y = -Math.cos(rad) * 70
            return <ellipse key={`r-${i}`} cx={x} cy={y} rx="10" ry="5" transform={`rotate(${angle} ${x} ${y})`} />
          })}
        </g>
      </svg>

      {/* soft fade so it never fights foreground content */}
      <div className="absolute inset-0 bg-gradient-to-b from-parchment-50/40 via-transparent to-parchment-50/60" />
    </div>
  )
}