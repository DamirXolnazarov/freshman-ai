import { useState, useEffect } from 'react'
import FreshmanCrest from '../ui/FreshmanCrest.jsx'

const STATUSES = [
  'Understanding your profile…',
  'Connecting achievements…',
  'Reviewing universities…',
  'Finding scholarships…',
  'Checking deadlines…',
  'Organizing your portfolio…',
  'Planning your roadmap…',
]

export default function ThinkingStatus() {
  const [index, setIndex] = useState(() => Math.floor(Math.random() * STATUSES.length))

  useEffect(() => {
    const interval = setInterval(() => setIndex((i) => (i + 1) % STATUSES.length), 1400)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex items-center gap-2.5">
      <div className="animate-pulse opacity-60">
        <FreshmanCrest size={18} />
      </div>
      <p className="text-[13px] italic text-ink-500">{STATUSES[index]}</p>
    </div>
  )
}