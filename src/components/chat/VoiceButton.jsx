import { Mic } from 'lucide-react'

export default function VoiceButton({ onClick, supported }) {
  if (!supported) return null
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-parchment-100/50 hover:text-parchment-100 transition-colors"
      aria-label="Start voice mode"
    >
      <Mic size={18} strokeWidth={1.75} />
    </button>
  )
}