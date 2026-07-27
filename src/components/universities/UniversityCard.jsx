import { ExternalLink, MapPin, Bookmark } from 'lucide-react'
import Card from '../ui/Card.jsx'

const CATEGORY_TONE = {
  reach: 'bg-dusty/20 text-[#8B5A5A]',
  target: 'bg-gold-500/15 text-gold-600',
  likely: 'bg-sage/15 text-sage',
}

export default function UniversityCard({ uni, saved, category, onSave, onCategoryChange, onRemove }) {
  return (
    <Card className="p-5 shadow-panel">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-serif text-[16px] text-navy-900">{uni.name}</p>
          <p className="mt-0.5 flex items-center gap-1 text-[12px] text-ink-500">
            <MapPin size={11} /> {uni.city ? `${uni.city}, ` : ''}{uni.country}
          </p>
        </div>
        {saved ? (
          <select
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
            className={`rounded-full border-none px-2.5 py-1 text-[11px] font-medium ${CATEGORY_TONE[category]}`}
          >
            <option value="reach">Reach</option>
            <option value="target">Target</option>
            <option value="likely">Likely</option>
          </select>
        ) : (
          <button onClick={onSave} className="text-navy-900/40 hover:text-gold-600" aria-label="Save">
            <Bookmark size={17} strokeWidth={1.75} />
          </button>
        )}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-[12px] text-ink-700">
        {uni.acceptance_rate != null && <p>Acceptance: <span className="text-ink-900">{uni.acceptance_rate}%</span></p>}
        {uni.sat_range && <p>SAT: <span className="text-ink-900">{uni.sat_range}</span></p>}
        {uni.act_range && <p>ACT: <span className="text-ink-900">{uni.act_range}</span></p>}
        {uni.ielts_min && <p>IELTS min: <span className="text-ink-900">{uni.ielts_min}</span></p>}
        <p>Testing: <span className="text-ink-900">{uni.test_policy}</span></p>
        {uni.application_platform && <p>Platform: <span className="text-ink-900">{uni.application_platform}</span></p>}
      </div>

      {uni.deadlines?.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {uni.deadlines.map((d) => (
            <span key={d.label} className="rounded-full bg-navy-900/[0.06] px-2.5 py-0.5 text-[11px] text-navy-800">
              {d.label}: {new Date(d.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          ))}
        </div>
      )}

      {uni.notes && <p className="mt-3 text-[12px] italic text-ink-500">{uni.notes}</p>}

      <div className="mt-3 flex items-center justify-between"> <a
        
          href={uni.source_url}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1 text-[11.5px] text-skyline-600 hover:underline"
        >
          <ExternalLink size={11} /> Verify on source
        </a>
        {saved && (
          <button onClick={onRemove} className="text-[11.5px] text-ink-500/60 hover:text-[#8B5A5A]">
            Remove
          </button>
        )}
      </div>
    </Card>
  )
}