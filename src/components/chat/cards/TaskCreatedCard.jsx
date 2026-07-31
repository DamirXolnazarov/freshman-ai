import { Check, ArrowRight } from 'lucide-react'
import Card from '../../ui/Card.jsx'

export default function TaskCreatedCard({ title, dueDate, onOpenTasks }) {
  return (
    <Card className="p-4 shadow-panel max-w-sm">
      <div className="flex items-center gap-2 text-[12px] font-medium text-sage">
        <Check size={14} strokeWidth={2.5} /> Task Added
      </div>
      <p className="mt-1.5 font-serif text-[15px] text-navy-900">{title}</p>
      <p className="mt-0.5 text-[12.5px] text-ink-500">Due {new Date(dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</p>
      <button onClick={onOpenTasks} className="mt-2.5 flex items-center gap-1 text-[12px] text-skyline-600 hover:underline">
        Open Tasks <ArrowRight size={11} />
      </button>
    </Card>
  )
}