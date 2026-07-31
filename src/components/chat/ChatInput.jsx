import { useState, useRef, useEffect } from 'react'
import { Paperclip, Sparkles, ArrowUp } from 'lucide-react'
import VoiceButton from './VoiceButton.jsx'
import MentionMenu from './MentionMenu.jsx'
import { searchUniversities } from '../../lib/universities.js'
import { supabase } from '../../lib/supabase.js'

const SLASH_COMMANDS = ['/task', '/reminder', '/upload', '/note', '/application', '/essay', '/opportunity', '/university']

export default function ChatInput({ onSend, disabled = false, onUploadResume, onVoiceClick, voiceSupported, studentId }) {
  const [value, setValue] = useState('')
  const [focused, setFocused] = useState(false)
  const [mentionResults, setMentionResults] = useState([])
  const fileInputRef = useRef(null)

  const showSlashMenu = value.startsWith('/') && value.length <= 12
  const mentionMatch = value.match(/@([\w\s]{0,30})$/)

  useEffect(() => {
    if (!mentionMatch || !studentId) {
      setMentionResults([])
      return
    }
    const query = mentionMatch[1].trim()

    const timeout = setTimeout(async () => {
      if (query.length < 1) {
        setMentionResults([])
        return
      }
      const [unis, { data: items }] = await Promise.all([
        searchUniversities({ query }),
        supabase.from('portfolio_items').select('id, title').eq('student_id', studentId).ilike('title', `%${query}%`).limit(4),
      ])
      setMentionResults([
        ...unis.slice(0, 4).map((u) => ({ type: 'university', id: u.id, label: u.name })),
        ...(items || []).map((i) => ({ type: 'portfolio', id: i.id, label: i.title })),
      ])
    }, 200)

    return () => clearTimeout(timeout)
  }, [value, studentId]) // eslint-disable-line react-hooks/exhaustive-deps

  function selectMention(result) {
    setValue((prev) => prev.replace(/@([\w\s]{0,30})$/, `@${result.label} `))
    setMentionResults([])
  }

  function submit(e) {
    e.preventDefault()
    if (!value.trim() || disabled) return
    onSend?.(value.trim())
    setValue('')
    setMentionResults([])
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (file) onUploadResume?.(file)
    e.target.value = ''
  }

  const hasText = value.trim().length > 0

  return (
    <div className="relative">
      {showSlashMenu && (
        <div className="absolute bottom-full left-4 mb-2 w-56 overflow-hidden rounded-control border border-navy-900/10 bg-white shadow-raised">
          {SLASH_COMMANDS.filter((c) => c.startsWith(value)).map((c) => (
            <button key={c} onClick={() => setValue(c + ' ')} className="block w-full px-3 py-2 text-left text-[12.5px] text-ink-900 hover:bg-parchment-100">
              {c}
            </button>
          ))}
        </div>
      )}

      <MentionMenu results={mentionResults} onSelect={selectMention} />

      <form
        onSubmit={submit}
        className={`flex items-center gap-3 rounded-[36px] bg-navy-950 px-5 transition-shadow ${
          focused ? 'shadow-raised ring-2 ring-skyline-500/40' : 'shadow-panel'
        }`}
        style={{ height: 72 }}
      >
        <input ref={fileInputRef} type="file" accept="application/pdf" onChange={handleFileChange} className="hidden" />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          className="text-parchment-100/50 hover:text-parchment-100 transition-colors disabled:opacity-40"
          aria-label="Upload resume or LinkedIn PDF"
        >
          <Paperclip size={19} strokeWidth={1.75} />
        </button>

        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          disabled={disabled}
          placeholder={disabled ? 'Freshman AI is responding…' : 'Ask anything about your admissions journey…'}
          className="flex-1 bg-transparent text-[14.5px] text-parchment-50 placeholder:text-parchment-100/40 outline-none disabled:opacity-60"
        />

        <button type="button" className="text-parchment-100/50 hover:text-parchment-100 transition-colors" aria-label="Suggested prompts">
          <Sparkles size={18} strokeWidth={1.75} />
        </button>
        <VoiceButton onClick={onVoiceClick} supported={voiceSupported} />
        <button
          type="submit"
          disabled={!hasText || disabled}
          className={`flex h-9 w-9 items-center justify-center rounded-full text-navy-950 transition-colors disabled:opacity-40 ${
            hasText ? 'bg-gold-500' : 'bg-skyline-500'
          }`}
        >
          <ArrowUp size={17} strokeWidth={2} />
        </button>
      </form>
    </div>
  )
}