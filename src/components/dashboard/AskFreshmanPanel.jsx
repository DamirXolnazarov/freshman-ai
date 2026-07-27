import { useState } from 'react'
import { Send } from 'lucide-react'
import Card from '../ui/Card.jsx'
import FreshmanCrest from '../ui/FreshmanCrest.jsx'

const QUICK_ACTIONS = ['Help me with essays', 'Find scholarships', 'Review my profile', 'Add achievement']

export default function AskFreshmanPanel({ onOpenChat }) {
  const [value, setValue] = useState('')

  return (
    <Card className="flex h-full flex-col p-5 shadow-panel">
      <div className="flex items-center gap-2.5">
        <FreshmanCrest size={30} />
        <div>
          <p className="text-[13px] font-medium text-navy-900">Freshman AI</p>
          <p className="flex items-center gap-1 text-[11px] text-sage">
            <span className="h-1.5 w-1.5 rounded-full bg-sage" /> Online
          </p>
        </div>
      </div>

      <div className="mt-4 flex-1 space-y-3 overflow-y-auto">
        <div className="ml-auto max-w-[85%] rounded-card rounded-tr-sm bg-navy-900 px-3.5 py-2.5 text-[13px] text-parchment-50">
          I organized a hackathon at my school with 150 participants.
        </div>
        <div className="max-w-[90%] rounded-card rounded-tl-sm bg-parchment-100 px-3.5 py-2.5 text-[13px] leading-relaxed text-ink-700">
          That's an impressive initiative. Leadership and impact like this strengthen your
          application greatly. I can add this to your portfolio.
        </div>
        <div className="rounded-control border border-navy-900/[0.08] bg-parchment-50 p-3.5">
          <p className="text-[13px] font-serif text-navy-900">Hackathon Organizer</p>
          <ul className="mt-1.5 space-y-0.5 text-[11.5px] text-ink-500">
            <li>Role: Organizer &amp; Lead</li>
            <li>Impact: 150 participants</li>
            <li>Category: Leadership, Technology, Community</li>
          </ul>
          <button
            onClick={onOpenChat}
            className="mt-2.5 w-full rounded-control bg-navy-900 py-1.5 text-[12.5px] text-parchment-50 hover:bg-navy-800 transition-colors"
          >
            Add to portfolio
          </button>
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (value.trim()) onOpenChat?.()
        }}
        className="mt-4 flex items-center gap-2 rounded-control border border-navy-900/10 bg-parchment-100 px-3 py-2"
      >
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Ask Freshman AI…"
          className="flex-1 bg-transparent text-[13px] text-ink-900 placeholder:text-ink-500/60 outline-none"
        />
        <button type="submit" className="text-navy-900" aria-label="Send">
          <Send size={15} strokeWidth={1.75} />
        </button>
      </form>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {QUICK_ACTIONS.map((a) => (
          <button
            key={a}
            onClick={onOpenChat}
            className="rounded-full border border-navy-900/10 px-2.5 py-1 text-[11px] text-ink-700 hover:bg-parchment-100 transition-colors"
          >
            {a}
          </button>
        ))}
      </div>
    </Card>
  )
}
