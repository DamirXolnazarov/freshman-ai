import { Bell, ArrowRight } from 'lucide-react'
import Card from '../../ui/Card.jsx'

export default function ReminderCreatedCard({ reminder, onOpenCalendar }) {
  return (
    <Card className="p-4 shadow-panel max-w-sm">
      <div className="flex items-center gap-2 text-[12px] font-medium text-[#4A3B6B]">
        <Bell size={14} strokeWidth={2} /> Reminder Created
      </div>
      <p className="mt-1.5 font-serif text-[15px] text-navy-900">{reminder.title}</p>
      <p className="mt-0.5 text-[12.5px] text-ink-500">
        {new Date(reminder.event_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
        {reminder.event_time ? ` · ${reminder.event_time}` : ''}
      </p>
      <button onClick={onOpenCalendar} className="mt-2.5 flex items-center gap-1 text-[12px] text-skyline-600 hover:underline">
        Calendar <ArrowRight size={11} />
      </button>
    </Card>
  )
}