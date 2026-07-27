/**
 * The Freshman crest — rebuilt as clean, continuous vector paths (no
 * brick-grid seams). This is the mark used everywhere the brand needs
 * to look finished: nav, headers, favicon, landing hero. Colors are the
 * brand's own (Midnight / Freshman Blue / Stone), not the app's UI
 * accent palette, so the mark reads consistently regardless of surface.
 */

export const BRAND = {
  midnight: '#0B1426',
  blue: '#1E3A8A',
  accent: '#3B82F6',
  stone: '#E9EEF5',
  white: '#FFFFFF',
}

// Flat-topped shield, tapering to a point.
export const SHIELD_PATH =
  'M12,10 H88 C88,10 90,10 90,12 V54 C90,80 74,98 50,112 C26,98 10,80 10,54 V12 C10,10 12,10 12,10 Z'

// Castle silhouette: crenellated skyline (five towers, center tallest)
// that tapers down into the shield's point. One continuous path — the
// shading is applied as a fill split, not a grid of separate bricks.
export const CASTLE_PATH =
  'M14,84 V50 V38 H20 V28 H28 V38 H34 V18 H42 V38 H48 V44 H50 V10 H58 V44 H60 V38 H66 V18 H74 V38 H80 V28 H88 V38 H86 V50 V84 L70,104 L50,110 L30,104 Z'

export default function FreshmanCrest({ size = 40, animate = false, className = '' }) {
  return (
    <svg
      width={size}
      height={size * 1.12}
      viewBox="0 0 100 112"
      fill="none"
      className={className}
      role="img"
      aria-label="Freshman Academy crest"
    >
      <defs>
        <clipPath id="fa-shield-clip">
          <path d={SHIELD_PATH} />
        </clipPath>
        <clipPath id="fa-castle-clip">
          <path d={CASTLE_PATH} />
        </clipPath>
        <clipPath id="fa-left-half">
          <rect x="0" y="0" width="49" height="112" />
        </clipPath>
        <linearGradient id="fa-shade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={BRAND.midnight} />
          <stop offset="100%" stopColor="#152449" />
        </linearGradient>
      </defs>

      <g clipPath="url(#fa-shield-clip)">
        <rect x="0" y="0" width="100" height="112" fill={BRAND.stone} />

        <g clipPath="url(#fa-castle-clip)">
          <rect x="0" y="0" width="100" height="112" fill={BRAND.white} />
          <g clipPath="url(#fa-left-half)">
            <rect x="0" y="0" width="100" height="112" fill="url(#fa-shade)" className={animate ? 'animate-fade-up' : ''} />
          </g>
          {/* faint seam down the center — the "signature shadow" from the brand sheet */}
          <rect x="48.5" y="0" width="1" height="112" fill={BRAND.blue} fillOpacity="0.25" />
        </g>

        {/* forward-pointing flag, upper right — the brand's own detail */}
        <path d="M74,20 L82,24 L74,28 Z" fill={BRAND.accent} />
        <rect x="73.4" y="18" width="1.1" height="12" fill={BRAND.blue} />
      </g>

      <path d={SHIELD_PATH} stroke={BRAND.blue} strokeWidth="2.5" fill="none" strokeLinejoin="round" />
    </svg>
  )
}
