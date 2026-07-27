import { Mic, Square, X } from 'lucide-react'
import FreshmanCrest from '../ui/FreshmanCrest.jsx'

const STATUS_COPY = {
  listening: 'Listening…',
  thinking: 'Thinking…',
  speaking: 'Speaking…',
  idle: 'Tap to talk',
}

export default function VoiceOrb({ status, transcript, onStart, onStop, onClose }) {
  const pulsing = status === 'listening' || status === 'speaking'

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-navy-950">
      <button
        onClick={onClose}
        className="absolute right-6 top-6 rounded-full border border-parchment-100/20 p-2 text-parchment-100/70 transition-colors hover:border-parchment-100/40 hover:text-parchment-100"
        aria-label="Exit voice mode"
      >
        <X size={20} strokeWidth={1.75} />
      </button>

      <div className="relative flex h-40 w-40 items-center justify-center">
        {pulsing && <span className="absolute inset-0 rounded-full bg-gold-500/20 animate-glow-pulse" />}
        <div
          className={`relative flex h-28 w-28 items-center justify-center rounded-full border border-gold-500/30 bg-navy-900 transition-transform ${
            pulsing ? 'scale-105' : 'scale-100'
          }`}
        >
          <FreshmanCrest size={48} />
        </div>
      </div>

      <p className="mt-8 font-serif text-[20px] text-parchment-50">{STATUS_COPY[status] || STATUS_COPY.idle}</p>

      <p className="mt-4 min-h-[3em] max-w-md px-6 text-center text-[15px] leading-relaxed text-parchment-100/70">
        {transcript || (status === 'idle' ? "Say something — I'm listening for your voice." : '')}
      </p>

      <div className="mt-8">
        {status === 'listening' ? (
          <button
            onClick={onStop}
            className="flex items-center gap-2 rounded-full bg-gold-500 px-6 py-3 text-[14px] font-medium text-navy-950"
          >
            <Square size={15} strokeWidth={2} /> Stop &amp; send
          </button>
        ) : status === 'idle' ? (
          <button
            onClick={onStart}
            className="flex items-center gap-2 rounded-full bg-parchment-50 px-6 py-3 text-[14px] font-medium text-navy-900"
          >
            <Mic size={16} strokeWidth={1.75} /> Start talking
          </button>
        ) : null}
      </div>
    </div>
  )
}