import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Sidebar from '../components/layout/Sidebar.jsx'
import Card from '../components/ui/Card.jsx'
import MonthGrid from '../components/calendar/MonthGrid.jsx'
import { getCalendarEvents, eventsForMonth } from '../lib/calendarEvents.js'

const TYPE_LABEL = { university: 'University', opportunity: 'Opportunity', task: 'Task', reminder: 'Reminder' }
const TYPE_DOT = { university: 'bg-navy-900', opportunity: 'bg-gold-500', task: 'bg-sage', reminder: 'bg-[#4A3B6B]' }

export default function CalendarPage({ onNavigate, studentId }) {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [cursor, setCursor] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState(null)

  useEffect(() => {
    if (!studentId) return
    getCalendarEvents(studentId).then((data) => {
      setEvents(data)
      setLoading(false)
    })
  }, [studentId])

  const year = cursor.getFullYear()
  const month = cursor.getMonth()
  const monthLabel = cursor.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
  const monthEvents = eventsForMonth(events, year, month).sort((a, b) => new Date(a.date) - new Date(b.date))

  function changeMonth(delta) {
    setCursor(new Date(year, month + delta, 1))
    setSelectedDay(null)
  }

  return (
    <div className="flex h-screen bg-parchment-50">
      <Sidebar activePage="calendar" onNavigate={onNavigate} />

      <main className="flex-1 min-w-0 overflow-y-auto px-8 py-7">
        <header>
          <h1 className="font-serif text-[24px] text-navy-900">Calendar</h1>
          <p className="mt-1 text-[13.5px] text-ink-500">
            University, opportunity, and task deadlines, all in one place.
          </p>
        </header>

        {loading && <p className="mt-8 text-[13.5px] text-ink-500">Loading your calendar…</p>}

        {!loading && (
          <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-[1fr_320px]">
            <Card className="p-5 shadow-panel">
              <div className="flex items-center justify-between">
                <p className="font-serif text-[16px] text-navy-900">{monthLabel}</p>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => changeMonth(-1)} className="rounded-control border border-navy-900/10 p-1.5 text-navy-900 hover:bg-parchment-100">
                    <ChevronLeft size={15} />
                  </button>
                  <button onClick={() => changeMonth(1)} className="rounded-control border border-navy-900/10 p-1.5 text-navy-900 hover:bg-parchment-100">
                    <ChevronRight size={15} />
                  </button>
                </div>
              </div>
              <div className="mt-4">
                <MonthGrid year={year} month={month} events={events} onDayClick={(evts, date) => setSelectedDay({ evts, date })} />
              </div>
              <div className="mt-4 flex gap-4 text-[11.5px] text-ink-500">
                {Object.entries(TYPE_LABEL).map(([type, label]) => (
                  <span key={type} className="flex items-center gap-1.5">
                    <span className={`h-2 w-2 rounded-full ${TYPE_DOT[type]}`} /> {label}
                  </span>
                ))}
              </div>
            </Card>

            <Card className="p-5 shadow-panel">
              <p className="text-[11.5px] font-medium tracking-[0.1em] text-ink-500 uppercase">
                {selectedDay ? selectedDay.date.toLocaleDateString(undefined, { month: 'long', day: 'numeric' }) : 'This month'}
              </p>
              <div className="mt-3 space-y-2.5">
                {(selectedDay ? selectedDay.evts : monthEvents).length === 0 && (
                  <p className="text-[12.5px] text-ink-500/70">Nothing here.</p>
                )}
                {(selectedDay ? selectedDay.evts : monthEvents).map((e) => (
                  <div key={e.id} className="flex items-start gap-2">
                    <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${TYPE_DOT[e.type]}`} />
                    <div>
                      <p className={`text-[12.5px] ${e.done ? 'text-ink-500 line-through' : 'text-ink-900'}`}>{e.title}</p>
                      {!selectedDay && (
                        <p className="text-[11px] text-ink-500">
                          {new Date(e.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {selectedDay && (
                <button onClick={() => setSelectedDay(null)} className="mt-3 text-[12px] text-skyline-600 hover:underline">
                  Show whole month
                </button>
              )}
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}