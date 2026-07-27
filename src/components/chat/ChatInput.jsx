import { useState, useRef } from 'react'
import { Paperclip, Sparkles, ArrowUp } from 'lucide-react'
import VoiceButton from './VoiceButton.jsx'

export default function ChatInput({ onSend, disabled = false, onUploadResume, onVoiceClick, voiceSupported }) {
  const [value, setValue] = useState('')
  const fileInputRef = useRef(null)

  function submit(e) {
    e.preventDefault()
    if (!value.trim() || disabled) return
    onSend?.(value.trim())
    setValue('')
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (file) onUploadResume?.(file)
    e.target.value = ''
  }

  return (
    <form onSubmit={submit} className="flex items-center gap-3 rounded-card bg-navy-950 px-4 py-3 shadow-raised">
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        onChange={handleFileChange}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled}
        className="text-parchment-100/50 hover:text-parchment-100 transition-colors disabled:opacity-40"
        aria-label="Upload resume or LinkedIn PDF"
        title="Upload resume or LinkedIn PDF"
      >
        <Paperclip size={18} strokeWidth={1.75} />
      </button>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={disabled}
        placeholder={disabled ? 'Freshman AI is responding…' : 'Ask anything about your journey…'}
        className="flex-1 bg-transparent text-[14.5px] text-parchment-50 placeholder:text-parchment-100/40 outline-none disabled:opacity-60"
      />
      <button type="button" className="text-parchment-100/50 hover:text-parchment-100 transition-colors" aria-label="Suggested prompts">
        <Sparkles size={18} strokeWidth={1.75} />
      </button>
      <VoiceButton onClick={onVoiceClick} supported={voiceSupported} />
      <button
        type="submit"
        disabled={!value.trim() || disabled}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-gold-500 text-navy-950 transition-opacity disabled:opacity-40"
        aria-label="Send message"
      >
        <ArrowUp size={17} strokeWidth={2} />
      </button>
    </form>
  )
}