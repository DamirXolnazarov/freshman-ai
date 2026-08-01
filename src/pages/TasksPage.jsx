import { useState, useEffect } from 'react'
import { Plus, Check, Trash2, CalendarDays } from 'lucide-react'
import Sidebar from '../components/layout/Sidebar.jsx'
import Card from '../components/ui/Card.jsx'
import { getTasks, createTask, deleteTask, toggleTaskStatus } from '../lib/tasks.js'
import { notify } from '../lib/toast.js'

export default function TasksPage({ onNavigate, studentId }) {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [newTitle, setNewTitle] = useState('')
  const [newDate, setNewDate] = useState('')

  useEffect(() => {
    if (!studentId) return
    getTasks(studentId)
      .then((data) => {
        setTasks(data || [])
        setLoading(false)
      })
      .catch((err) => {
        console.error('Failed to load tasks:', err)
        setLoading(false)
      })
  }, [studentId])

  function sortTasks(a, b) {
    if (!a.due_date && !b.due_date) return 0
    if (!a.due_date) return 1
    if (!b.due_date) return -1
    return new Date(a.due_date) - new Date(b.due_date)
  }

  async function handleAdd(e) {
    e.preventDefault()
    if (!newTitle.trim()) return
    try {
      const created = await createTask(studentId, { title: newTitle.trim(), due_date: newDate || null })
      setTasks((prev) => [...prev, created].sort(sortTasks))
      setNewTitle('')
      setNewDate('')
    } catch (err) {
      console.error('Failed to create task:', err)
      notify.error("Couldn't add that task")
    }
  }

  async function handleToggle(task) {
    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, status: task.status === 'done' ? 'todo' : 'done' } : t)))
    try {
      await toggleTaskStatus(task.id, task.status)
    } catch (err) {
      console.error('Failed to toggle task:', err)
    }
  }

  async function handleDelete(id) {
    setTasks((prev) => prev.filter((t) => t.id !== id))
    try {
      await deleteTask(id)
      notify.info('Task removed')
    } catch (err) {
      console.error('Failed to delete task:', err)
    }
  }

  const todo = tasks.filter((t) => t.status !== 'done')
  const done = tasks.filter((t) => t.status === 'done')

  return (
    <div className="flex h-screen bg-parchment-50">
      <Sidebar activePage="tasks" onNavigate={onNavigate} />

      <main className="flex-1 min-w-0 overflow-y-auto px-8 py-7">
        <header>
          <h1 className="font-serif text-[24px] text-navy-900">Tasks</h1>
          <p className="mt-1 text-[13.5px] text-ink-500">Anything you want to track, on your own terms.</p>
        </header>

        <Card className="mt-5 p-4 shadow-panel">
          <form onSubmit={handleAdd} className="flex items-center gap-2.5">
            <input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Add a task…"
              className="flex-1 rounded-control border border-navy-900/10 bg-white px-3.5 py-2 text-[13.5px] text-ink-900 outline-none focus:border-gold-500"
            />
            <input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="rounded-control border border-navy-900/10 bg-white px-3 py-2 text-[13px] text-ink-700 outline-none focus:border-gold-500"
            />
            <button
              type="submit"
              disabled={!newTitle.trim()}
              className="flex items-center gap-1.5 rounded-control bg-navy-900 px-4 py-2 text-[13px] text-parchment-50 hover:bg-navy-800 disabled:opacity-40"
            >
              <Plus size={14} /> Add
            </button>
          </form>
        </Card>

        {loading && <p className="mt-8 text-[13.5px] text-ink-500">Loading your tasks…</p>}

        {!loading && (
          <div className="mt-6 space-y-6">
            <div>
              <p className="text-[11.5px] font-medium tracking-[0.1em] text-ink-500 uppercase">
                To do <span className="text-ink-500/60">({todo.length})</span>
              </p>
              {todo.length === 0 ? (
                <p className="mt-2 text-[13px] text-ink-500/70">Nothing pending — add something above.</p>
              ) : (
                <div className="mt-3 space-y-2.5">
                  {todo.map((task) => (
                    <TaskRow key={task.id} task={task} onToggle={handleToggle} onDelete={handleDelete} />
                  ))}
                </div>
              )}
            </div>

            {done.length > 0 && (
              <div>
                <p className="text-[11.5px] font-medium tracking-[0.1em] text-ink-500 uppercase">
                  Done <span className="text-ink-500/60">({done.length})</span>
                </p>
                <div className="mt-3 space-y-2.5">
                  {done.map((task) => (
                    <TaskRow key={task.id} task={task} onToggle={handleToggle} onDelete={handleDelete} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

function TaskRow({ task, onToggle, onDelete }) {
  const isDone = task.status === 'done'
  return (
    <Card className="flex items-center gap-3 p-3.5 shadow-panel">
      <button
        onClick={() => onToggle(task)}
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors ${
          isDone ? 'border-sage bg-sage text-parchment-50' : 'border-navy-900/20 text-transparent'
        }`}
      >
        <Check size={11} strokeWidth={3} />
      </button>
      <div className="min-w-0 flex-1">
        <p className={`text-[13.5px] ${isDone ? 'text-ink-500 line-through' : 'text-ink-900'}`}>{task.title}</p>
        {task.due_date && (
          <p className="mt-0.5 flex items-center gap-1 text-[11.5px] text-ink-500">
            <CalendarDays size={11} /> {new Date(task.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
        )}
      </div>
      <button onClick={() => onDelete(task.id)} className="text-ink-500/40 hover:text-[#8B5A5A]" aria-label="Delete task">
        <Trash2 size={15} />
      </button>
    </Card>
  )
}