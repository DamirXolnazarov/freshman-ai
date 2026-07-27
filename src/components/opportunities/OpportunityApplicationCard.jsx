import Card from '../ui/Card.jsx'
import DeadlineBadge from '../applications/DeadlineBadge.jsx'
import ApplicationChecklist from '../applications/ApplicationChecklist.jsx'
import { OPPORTUNITY_CHECKLIST_LABELS } from '../../lib/opportunities.js'

const TYPE_TONES = {
  scholarship: 'bg-gold-500/15 text-gold-600',
  competition: 'bg-skyline-300/25 text-skyline-700',
  internship: 'bg-sage/15 text-sage',
  summer_program: 'bg-[#4A3B6B]/12 text-[#4A3B6B]',
  volunteering: 'bg-dusty/25 text-[#8B5A5A]',
}

export default function OpportunityApplicationCard({ application, onToggleChecklist }) {
  const { opportunity, checklist, progress, daysUntil } = application

  return (
    <Card className="p-5 shadow-panel">
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${TYPE_TONES[opportunity.type] || ''}`}>
            {opportunity.type.replace('_', ' ')}
          </span>
          <p className="mt-2 font-serif text-[16px] text-navy-900">{opportunity.name}</p>
          <p className="mt-0.5 text-[12px] text-ink-500">{opportunity.organizer}</p>
        </div>
        <DeadlineBadge daysUntil={daysUntil} label="Deadline" />
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between text-[11.5px] text-ink-500">
          <span>Progress</span>
          <span>{progress}%</span>
        </div>
        <div className="mt-1 h-1.5 w-full rounded-full bg-navy-900/[0.06]">
          <div
            className="h-1.5 rounded-full bg-gradient-to-r from-gold-500 to-sage transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="mt-4">
        <ApplicationChecklist
          checklist={checklist}
          onToggle={onToggleChecklist}
          labels={OPPORTUNITY_CHECKLIST_LABELS}
        />
      </div>

      <p className="mt-3.5 text-[11px] italic text-ink-500/70">
        Reminder: not every opportunity requires essays or recommendations — check {opportunity.organizer}'s own requirements on the official page.
      </p>
    </Card>
  )
}