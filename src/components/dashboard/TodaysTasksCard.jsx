import { useState } from 'react'
import { ArrowRight, Plus } from 'lucide-react'
import Card from '../ui/Card.jsx'

function dueLabel(dateStr) {
  if (!dateStr) return null
  const days = Math.round((new Date(dateStr).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0)) / 86400000)
  if (days < 0) return 'Overdue'
  if (days === 0) return 'Due today'
  if (days === 1) return 'Due tomorrow'
  return `Due ${new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`
}

export default function TodaysTasksCard({ tasks, onToggle, onAddTask, onViewAll }) {
  const [optimistic, setOptimistic] = useState({})

  const visible = [...tasks]
    .sort((a, b) => (a.due_date ? new Date(a.due_date) : Infinity) - (b.due_date ? new Date(b.due_date) : Infinity))
    .slice(0, 6)

  function handleToggle(task) {
    const currentStatus = optimistic[task.id] ?? task.status
    const nextStatus = currentStatus === 'done' ? 'todo' : 'done'
    setOptimistic((o) => ({ ...o, [task.id]: nextStatus }))
    onToggle?.(task.id, currentStatus)
  }

  return (
    <Card className="p-5 shadow-panel">
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-2 text-[13px] font-medium text-navy-900">
          Today's Tasks
          <span className="rounded-full bg-navy-900/[0.06] px-1.5 py-0.5 text-[10.5px] text-ink-500">{tasks.length}</span>
        </p>
        <button onClick={onViewAll} className="flex items-center gap-1 text-[11.5px] text-skyline-600 hover:underline">
          View All <ArrowRight size={11} />
        </button>
      </div>

      <ul className="mt-3.5 space-y-2.5">
        {visible.length === 0 && <li className="text-[12.5px] text-ink-500/70">Nothing on your list yet.</li>}
        {visible.map((t) => {
          const status = optimistic[t.id] ?? t.status
          const done = status === 'done'
          const label = dueLabel(t.due_date)
          return (
            <li key={t.id} className="flex items-center gap-2.5">
              <button
                onClick={() => handleToggle(t)}
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
                  done ? 'border-sage bg-sage' : 'border-navy-900/20 bg-white'
                }`}
              >
                {done && <span className="block h-1.5 w-2 -translate-y-px rotate-[-45deg] border-b-2 border-l-2 border-white" />}
              </button>
              <span className={`min-w-0 flex-1 truncate text-[12.5px] ${done ? 'text-ink-500/60 line-through' : 'text-ink-900'}`}>
                {t.title}
              </span>
              {done ? (
                <span className="shrink-0 rounded-full bg-sage/20 px-2 py-0.5 text-[10.5px] text-sage">Completed</span>
              ) : (
                label && <span className="shrink-0 text-[11px] text-ink-500">{label}</span>
              )}
            </li>
          )
        })}
      </ul>

      <button
        onClick={onAddTask}
        className="mt-3.5 flex items-center gap-1.5 text-[12px] text-navy-700 hover:text-navy-900"
      >
        <Plus size={13} /> Add New Task
      </button>
    </Card>
  )
}