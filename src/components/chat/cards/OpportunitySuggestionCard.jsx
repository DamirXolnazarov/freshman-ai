import { Sparkles, ArrowRight } from 'lucide-react'
import Card from '../../ui/Card.jsx'

export default function OpportunitySuggestionCard({ opportunity, matchScore, onSave, onView }) {
  return (
    <Card className="p-4 shadow-panel max-w-sm">
      <div className="flex items-center gap-2 text-[12px] font-medium text-sage">
        <Sparkles size={14} strokeWidth={2} /> New Opportunity
      </div>
      <p className="mt-1.5 font-serif text-[15px] text-navy-900">{opportunity.name}</p>
      <div className="mt-2 flex flex-wrap items-center gap-2 text-[11.5px]">
        {matchScore != null && (
          <span className="rounded-full bg-gold-500/15 px-2.5 py-0.5 font-medium text-gold-700">{matchScore}% match</span>
        )}
        {opportunity.deadline && (
          <span className="text-ink-500">Deadline {new Date(opportunity.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
        )}
      </div>
      <div className="mt-3 flex items-center gap-2">
        <button onClick={onSave} className="rounded-control bg-navy-900 px-3 py-1.5 text-[12px] text-parchment-50 hover:bg-navy-800">Save</button>
        <button onClick={onView} className="flex items-center gap-1 text-[12px] text-skyline-600 hover:underline">
          View <ArrowRight size={11} />
        </button>
      </div>
    </Card>
  )
}