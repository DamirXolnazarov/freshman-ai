// Brand colors kept here since other files (chat orb shader, gradients)
// import BRAND directly — losing this export would break those.
export const BRAND = {
  midnight: '#0B1426',
  blue: '#1E3A8A',
  accent: '#3B82F6',
  stone: '#E9EEF5',
  white: '#FFFFFF',
}

export default function FreshmanCrest({ size = 40, className = '' }) {
  return (
    <img
      src="./logo.png"
      alt="Freshman Academy"
      width={size}
      height={size}
      className={className}
      style={{ width: size, height: size, objectFit: 'contain' }}
    />
  )
}