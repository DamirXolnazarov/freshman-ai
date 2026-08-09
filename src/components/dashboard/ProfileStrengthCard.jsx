import Card from '../ui/Card.jsx'

const LEVEL_COLOR = {
  Excellent: 'text-sage', Strong: 'text-sage', Good: 'text-gold-700',
  Fair: 'text-gold-700', 'In Progress': 'text-skyline-600', Weak: 'text-[#C6564A]',
}

export default function ProfileStrengthCard({ completeness, breakdown }) {
  const tag = completeness >= 80 ? 'Great Job!' : completeness >= 50 ? 'Keep Going' : 'Just Started'

  return (
    <Card className="p-5 shadow-panel">
      <div className="flex items-center justify-between">
        <p className="text-[13px] font-medium text-navy-900">Profile Strength</p>
        <span className="rounded-full bg-sage/20 px-2 py-0.5 text-[10.5px] text-sage">{tag}</span>
      </div>

      <p className="mt-2 font-serif text-[28px] text-navy-900">{completeness}%</p>
      <p className="text-[12px] text-ink-500">
        {completeness >= 80
          ? 'Your profile is strong! Keep building depth in your activities and essays.'
          : 'Fill out more of your profile so the AI can give sharper recommendations.'}
      </p>

      <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-navy-900/[0.08]">
        <div className="h-full rounded-full bg-sage transition-all" style={{ width: `${completeness}%` }} />
      </div>

      <ul className="mt-4 space-y-2">
        {breakdown.map((b) => (
          <li key={b.label} className="flex items-center justify-between text-[12px]">
            <span className="text-ink-700">{b.label}</span>
            <span className={`font-medium ${LEVEL_COLOR[b.level] || 'text-ink-500'}`}>{b.level}</span>
          </li>
        ))}
      </ul>
    </Card>
  )
}