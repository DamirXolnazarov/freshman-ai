import { Landmark, ArrowRight } from 'lucide-react'
import Card from '../../ui/Card.jsx'
import ProgressBar from '../../ui/ProgressBar.jsx'
import { checklistProgress } from '../../../lib/universities.js'

const CATEGORY_TONE = {
  reach: 'bg-dusty/20 text-[#8B5A5A]',
  target: 'bg-gold-500/15 text-gold-600',
  likely: 'bg-sage/15 text-sage',
}

export default function UniversitySnapshotCard({ savedUniversity, onView }) {
  const uni = savedUniversity.universities
  const progress = checklistProgress(savedUniversity.checklist || {})

  return (
    <Card className="p-4 shadow-panel max-w-sm">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2 text-[12px] font-medium text-skyline-600">
          <Landmark size={14} strokeWidth={2} /> {uni.name}
        </div>
        <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${CATEGORY_TONE[savedUniversity.category]}`}>
          {savedUniversity.category}
        </span>
      </div>
      <div className="mt-2.5 flex items-center justify-between text-[11.5px] text-ink-500">
        <span>Application progress</span>
        <span className="text-ink-900">{progress}%</span>
      </div>
      <ProgressBar value={progress} className="mt-1" />
      <button onClick={onView} className="mt-2.5 flex items-center gap-1 text-[12px] text-skyline-600 hover:underline">
        View University <ArrowRight size={11} />
      </button>
    </Card>
  )
}