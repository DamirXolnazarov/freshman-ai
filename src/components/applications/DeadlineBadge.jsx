export default function DeadlineBadge({ daysUntil, label }) {
  if (daysUntil == null) {
    return (
      <span className="rounded-full bg-ink-500/10 px-2.5 py-1 text-[11px] text-ink-500">
        No upcoming deadline
      </span>
    )
  }

  const tone =
    daysUntil <= 14
      ? 'bg-dusty/25 text-[#8B5A5A]'
      : daysUntil <= 45
      ? 'bg-gold-500/15 text-gold-600'
      : 'bg-sage/15 text-sage'

  return (
    <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${tone}`}>
      {label} in {daysUntil} {daysUntil === 1 ? 'day' : 'days'}
    </span>
  )
}