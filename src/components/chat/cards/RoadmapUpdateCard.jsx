import { Map, ArrowRight } from 'lucide-react'
import Card from '../../ui/Card.jsx'
import ProgressBar from '../../ui/ProgressBar.jsx'

export default function RoadmapUpdateCard({ progress, onOpenRoadmap }) {
  return (
    <Card className="p-4 shadow-panel max-w-sm">
      <div className="flex items-center gap-2 text-[12px] font-medium text-gold-600">
        <Map size={14} strokeWidth={2} /> Roadmap Updated
      </div>
      <div className="mt-2.5 flex items-center justify-between text-[11.5px] text-ink-500">
        <span>Progress</span>
        <span className="text-ink-900">{progress}%</span>
      </div>
      <ProgressBar value={progress} className="mt-1" />
      <button onClick={onOpenRoadmap} className="mt-2.5 flex items-center gap-1 text-[12px] text-skyline-600 hover:underline">
        Open Roadmap <ArrowRight size={11} />
      </button>
    </Card>
  )
}