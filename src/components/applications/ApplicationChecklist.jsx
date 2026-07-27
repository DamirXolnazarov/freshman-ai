import { Check } from 'lucide-react'
import { CHECKLIST_LABELS as DEFAULT_LABELS } from '../../lib/applications.js'
import { celebrateSubmission } from '../../lib/celebrate.js'
import { notify } from '../../lib/toast.js'

export default function ApplicationChecklist({ checklist, onToggle, labels = DEFAULT_LABELS, submittedKey = 'submitted' }) {
  return (
    <ul className="space-y-1.5">
      {Object.entries(labels).map(([key, label]) => {
        const done = !!checklist[key]
        return (
          <li key={key}>
            <button
              onClick={() => {
                onToggle(key)
                if (key === submittedKey && !checklist[submittedKey]) {
                  celebrateSubmission()
                  notify.success('Submitted 🎓')
                }
              }}
              className="flex w-full items-center gap-2.5 rounded-control px-1.5 py-1 text-left hover:bg-navy-900/[0.03] transition-colors"
            >
              <span
                className={`flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full border transition-colors ${
                  done ? 'border-sage bg-sage text-parchment-50' : 'border-navy-900/20 text-transparent'
                }`}
              >
                <Check size={10} strokeWidth={3} />
              </span>
              <span className={`text-[12.5px] ${done ? 'text-ink-500 line-through' : 'text-ink-900'}`}>
                {label}
              </span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}