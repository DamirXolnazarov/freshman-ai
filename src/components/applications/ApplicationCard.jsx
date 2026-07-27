import { PenLine } from 'lucide-react'
import Card from '../ui/Card.jsx'
import DeadlineBadge from './DeadlineBadge.jsx'
import ApplicationChecklist from './ApplicationChecklist.jsx'

export default function ApplicationCard({ application, onToggleChecklist, onOpenEssay }) {
  const { university, checklist, progress, essays, nextDeadline, daysUntil } = application

  return (
    <Card className="p-5 shadow-panel">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-serif text-[16px] text-navy-900">{university.name}</p>
          <p className="mt-0.5 text-[12px] text-ink-500">{university.city}, {university.country}</p>
        </div>
        <DeadlineBadge daysUntil={daysUntil} label={nextDeadline?.label || 'Deadline'} />
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between text-[11.5px] text-ink-500">
          <span>Application progress</span>
          <span>{progress}%</span>
        </div>
        <div className="mt-1 h-1.5 w-full rounded-full bg-navy-900/[0.06]">
          <div
            className="h-1.5 rounded-full bg-gradient-to-r from-skyline-500 to-sage transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="mt-4">
        <ApplicationChecklist checklist={checklist} onToggle={onToggleChecklist} />
      </div>

      <div className="mt-4 border-t border-navy-900/[0.06] pt-3.5">
        <p className="text-[11px] font-medium tracking-[0.1em] text-ink-500 uppercase">Essays for this school</p>
        {essays.length === 0 ? (
          <p className="mt-1.5 text-[12px] text-ink-500/70">No drafts linked yet.</p>
        ) : (
          <ul className="mt-1.5 space-y-1">
            {essays.map((essay) => (
              <li key={essay.id}>
                <button
                  onClick={() => onOpenEssay(essay)}
                  className="flex items-center gap-1.5 text-[12.5px] text-skyline-600 hover:underline"
                >
                  <PenLine size={12} /> {essay.title}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Card>
  )
}