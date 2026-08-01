import { eventsForDay } from '../../lib/calendarEvents.js'

const TYPE_DOT = {
  university: 'bg-navy-900',
  opportunity: 'bg-gold-500',
  task: 'bg-sage',
  reminder: 'bg-[#4A3B6B]',
}

export default function MonthGrid({ year, month, events, onDayClick }) {
  const firstOfMonth = new Date(year, month, 1)
  const startWeekday = firstOfMonth.getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const today = new Date()

  const cells = []
  for (let i = 0; i < startWeekday; i++) cells.push(null)
  for (let day = 1; day <= daysInMonth; day++) cells.push(day)

  return (
    <div>
      <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-medium text-ink-500">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
          <div key={d} className="py-1.5">{d}</div>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (!day) return <div key={i} />
          const dateObj = new Date(year, month, day)
          const dayEvents = eventsForDay(events, dateObj)
          const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === day

          return (
            <button
              key={i}
              onClick={() => dayEvents.length > 0 && onDayClick(dayEvents, dateObj)}
              className={`flex h-16 flex-col items-start rounded-control border p-1.5 text-left transition-colors ${
                isToday ? 'border-gold-500 bg-gold-500/[0.06]' : 'border-navy-900/[0.06] hover:bg-parchment-100'
              }`}
            >
              <span className={`text-[11.5px] ${isToday ? 'font-medium text-gold-600' : 'text-ink-700'}`}>{day}</span>
              <div className="mt-auto flex gap-1">
                {dayEvents.slice(0, 3).map((e) => (
                  <span key={e.id} className={`h-1.5 w-1.5 rounded-full ${TYPE_DOT[e.type] || 'bg-ink-500'}`} />
                ))}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}