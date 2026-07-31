import { Landmark, Trophy } from 'lucide-react'

export default function MentionMenu({ results, onSelect }) {
  if (results.length === 0) return null

  return (
    <div className="absolute bottom-full left-4 mb-2 w-64 overflow-hidden rounded-control border border-navy-900/10 bg-white shadow-raised">
      {results.map((r) => (
        <button
          key={`${r.type}-${r.id}`}
          onClick={() => onSelect(r)}
          className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-[12.5px] text-ink-900 hover:bg-parchment-100"
        >
          {r.type === 'university' ? (
            <Landmark size={13} className="shrink-0 text-skyline-600" />
          ) : (
            <Trophy size={13} className="shrink-0 text-gold-600" />
          )}
          <span className="min-w-0 truncate">{r.label}</span>
        </button>
      ))}
    </div>
  )
}