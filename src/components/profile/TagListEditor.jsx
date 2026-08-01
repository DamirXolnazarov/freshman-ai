import { useState } from 'react'
import { X, Plus } from 'lucide-react'

export default function TagListEditor({ label, values = [], onChange, placeholder }) {
  const [input, setInput] = useState('')

  function add() {
    const trimmed = input.trim()
    if (!trimmed || values.includes(trimmed)) return
    onChange([...values, trimmed])
    setInput('')
  }

  function remove(value) {
    onChange(values.filter((v) => v !== value))
  }

  return (
    <div>
      <label className="text-[11.5px] font-medium text-ink-500 uppercase tracking-wide">{label}</label>
      <div className="mt-1.5 flex items-center gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              add()
            }
          }}
          placeholder={placeholder}
          className="flex-1 rounded-control border border-navy-900/10 bg-white px-3 py-2 text-[13px] text-ink-900 outline-none focus:border-gold-500"
        />
        <button
          type="button"
          onClick={add}
          disabled={!input.trim()}
          className="flex h-9 w-9 items-center justify-center rounded-control border border-navy-900/10 text-navy-900 hover:bg-parchment-100 disabled:opacity-40"
        >
          <Plus size={15} />
        </button>
      </div>
      {values.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {values.map((v) => (
            <span key={v} className="flex items-center gap-1 rounded-full bg-parchment-100 px-2.5 py-1 text-[12px] text-ink-700">
              {v}
              <button type="button" onClick={() => remove(v)} className="text-ink-500/60 hover:text-[#8B5A5A]">
                <X size={11} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}