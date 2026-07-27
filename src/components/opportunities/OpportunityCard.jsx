import { ExternalLink, Bookmark, BookmarkCheck } from 'lucide-react'
import Card from '../ui/Card.jsx'
import DeadlineBadge from '../applications/DeadlineBadge.jsx'
import { daysUntilDeadline } from '../../lib/opportunities.js'

const TYPE_LABELS = {
  scholarship: 'Scholarship',
  competition: 'Competition',
  internship: 'Internship',
  summer_program: 'Summer Program',
  volunteering: 'Volunteering',
}

const TYPE_TONES = {
  scholarship: 'bg-gold-500/15 text-gold-600',
  competition: 'bg-skyline-300/25 text-skyline-700',
  internship: 'bg-sage/15 text-sage',
  summer_program: 'bg-[#4A3B6B]/12 text-[#4A3B6B]',
  volunteering: 'bg-dusty/25 text-[#8B5A5A]',
}

export default function OpportunityCard({ opportunity, matchScore, saved, onSave, onRemove }) {
  return (
    <Card className="p-5 shadow-panel">
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${TYPE_TONES[opportunity.type]}`}>
            {TYPE_LABELS[opportunity.type]}
          </span>
          <p className="mt-2 font-serif text-[15.5px] leading-snug text-navy-900">{opportunity.name}</p>
          <p className="mt-0.5 text-[12px] text-ink-500">{opportunity.organizer}</p>
        </div>
        {matchScore != null && (
          <div className="shrink-0 text-right">
            <p className="font-serif text-[17px] text-gold-600">{matchScore}%</p>
            <p className="text-[10px] text-ink-500">match</p>
          </div>
        )}
      </div>

      <p className="mt-3 text-[12.5px] leading-relaxed text-ink-700">{opportunity.description}</p>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <DeadlineBadge daysUntil={daysUntilDeadline(opportunity.deadline)} label="Deadline" />
        {opportunity.award && (
          <span className="rounded-full bg-navy-900/[0.06] px-2.5 py-1 text-[11px] text-navy-800">
            {opportunity.award}
          </span>
        )}
      </div>

      <div className="mt-3.5 flex items-center justify-between"><a
        
          href={opportunity.source_url}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1 text-[11.5px] text-skyline-600 hover:underline"
        >
          <ExternalLink size={11} /> View official page
        </a>
        <button
          onClick={saved ? onRemove : onSave}
          className={`flex items-center gap-1.5 text-[12px] ${saved ? 'text-gold-600' : 'text-navy-900/50 hover:text-gold-600'}`}
        >
          {saved ? <BookmarkCheck size={15} /> : <Bookmark size={15} />}
          {saved ? 'Saved' : 'Save'}
        </button>
      </div>
    </Card>
  )
}