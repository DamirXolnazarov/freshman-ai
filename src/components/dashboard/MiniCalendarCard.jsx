import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Card from '../ui/Card.jsx'

const DOT_TONE = { deadline: 'bg-[#C6564A]', task: 'bg-skyline-500', event: 'bg-sage', exam: 'bg-[#6B5A9E]' }

function buildMonthGrid(year, month) {
  const first = new Date(year, month, 1)
  const startWeekday = first.getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells = []
  for (let i = 0; i < startWeekday; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  return cells
}

export default function MiniCalendarCard({ eventsByDay = {}, onOpenDay }) {
  const [cursor, setCursor] = useState(() => {
    const d = new Date()
    return { year: d.getFullYear(), month: d.getMonth() }
  })

  const cells = useMemo(() => buildMonthGrid(cursor.year, cursor.month), [cursor])
  const today = new Date()
  const monthLabel = new Date(cursor.year, cursor.month, 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })

  function shift(delta) {
    setCursor((c) => {
      const d = new Date(c.year, c.month + delta, 1)
      return { year: d.getFullYear(), month: d.getMonth() }
    })
  }

  function keyFor(day) {
    return `${cursor.year}-${String(cursor.month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }

  return (
    <Card className="p-5 shadow-panel">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[13px] font-medium text-navy-900">Calendar</p>
          <p className="text-[11px] text-ink-500">{monthLabel}</p>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => shift(-1)} className="flex h-6 w-6 items-center justify-center rounded-full text-ink-500 hover:bg-navy-900/[0.06]">
            <ChevronLeft size={13} />
          </button>
          <button onClick={() => shift(1)} className="flex h-6 w-6 items-center justify-center rounded-full text-ink-500 hover:bg-navy-900/[0.06]">
            <ChevronRight size={13} />
          </button>
        </div>
      </div>

      <div className="mt-3.5 grid grid-cols-7 gap-y-1.5 text-center">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <span key={i} className="text-[10px] font-medium text-ink-500/70">{d}</span>
        ))}
        {cells.map((day, i) => {
          if (!day) return <span key={i} />
          const key = keyFor(day)
          const dayEvents = eventsByDay[key] || []
          const isToday = today.getFullYear() === cursor.year && today.getMonth() === cursor.month && today.getDate() === day
          return (
            <button
              key={i}
              onClick={() => onOpenDay?.(key)}
              className={`mx-auto flex h-7 w-7 flex-col items-center justify-center rounded-full text-[11px] transition-colors ${
                isToday ? 'bg-navy-900 text-parchment-50' : 'text-ink-900 hover:bg-navy-900/[0.06]'
              }`}
            >
              {day}
              {dayEvents.length > 0 && (
                <span className="mt-0.5 flex gap-0.5">
                  {dayEvents.slice(0, 3).map((e, j) => (
                    <span key={j} className={`h-1 w-1 rounded-full ${DOT_TONE[e.type] || DOT_TONE.event} ${isToday ? 'opacity-90' : ''}`} />
                  ))}
                </span>
              )}
            </button>
          )
        })}
      </div>

      <div className="mt-3.5 flex flex-wrap gap-3 border-t border-navy-900/[0.06] pt-3 text-[10.5px] text-ink-500">
        <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[#C6564A]" /> Deadlines</span>
        <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-skyline-500" /> Tasks</span>
        <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-sage" /> Events</span>
      </div>
    </Card>
  )
}