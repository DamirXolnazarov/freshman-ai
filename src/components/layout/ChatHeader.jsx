import { UserRound, Sparkles } from 'lucide-react'
import Button from '../ui/Button.jsx'

export default function ChatHeader() {
  return (
    <header className="flex items-start justify-between border-b border-navy-900/[0.06] px-8 py-6">
      <div>
        <h1 className="font-serif text-[24px] text-navy-900">Chat with Freshman AI</h1>
        <p className="mt-1 text-[13.5px] text-ink-500">Your admissions co-pilot — wise like a mentor, sharp like a strategist.</p>
      </div>
      <div className="flex items-center gap-2.5">
        <Button variant="quiet" size="sm" className="flex items-center gap-1.5">
          <UserRound size={14} strokeWidth={1.75} />
          Profile memory
        </Button>
        <Button variant="ghost" size="sm" className="!px-2.5">
          <Sparkles size={16} strokeWidth={1.75} className="text-gold-600" />
        </Button>
      </div>
    </header>
  )
}
