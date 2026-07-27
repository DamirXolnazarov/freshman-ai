import { Search, Sprout, LayoutGrid, RefreshCw, FileEdit, Check } from 'lucide-react'
import Card from '../ui/Card.jsx'

const STEPS = [
  { key: 'analyzing', label: 'Analyzing', icon: Search },
  { key: 'impact', label: 'Understanding impact', icon: Sprout },
  { key: 'structuring', label: 'Structuring details', icon: LayoutGrid },
  { key: 'updating', label: 'Updating portfolio', icon: RefreshCw },
  { key: 'refining', label: 'Refining for applications', icon: FileEdit },
]

export default function ExtractionProgress({ currentIndex = 2 }) {
  return (
    <Card className="p-5 shadow-panel">
      <p className="text-[14px] text-ink-700">Adding to your portfolio…</p>
      <div className="mt-4 flex items-center">
        {STEPS.map((step, i) => {
          const state = i < currentIndex ? 'done' : i === currentIndex ? 'active' : 'pending'
          const Icon = step.icon
          return (
            <div key={step.key} className="flex flex-1 items-center last:flex-none">
              <div className="flex flex-col items-center gap-2">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full border transition-colors ${
                    state === 'done'
                      ? 'border-sage bg-sage/15 text-sage'
                      : state === 'active'
                      ? 'border-gold-500 bg-gold-500/15 text-gold-600'
                      : 'border-navy-900/12 bg-parchment-100 text-ink-500/50'
                  }`}
                >
                  {state === 'done' ? <Check size={15} /> : <Icon size={15} />}
                </div>
                <span
                  className={`w-20 text-center text-[10.5px] leading-tight ${
                    state === 'pending' ? 'text-ink-500/50' : 'text-ink-700'
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`mx-1 mb-5 h-px flex-1 ${
                    i < currentIndex ? 'bg-sage/40' : 'bg-navy-900/8'
                  }`}
                />
              )}
            </div>
          )
        })}
      </div>
    </Card>
  )
}
