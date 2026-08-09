import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { ArrowRight } from 'lucide-react'
import Card from '../ui/Card.jsx'

const SLICE_COLOR = { inProgress: '#5B8DEF', planned: '#E8C077', submitted: '#7FBF8F', completed: '#152449' }

export default function ApplicationOverviewCard({ counts, onViewAll }) {
  const { inProgress = 0, planned = 0, submitted = 0, completed = 0 } = counts
  const total = inProgress + planned + submitted + completed
  const data = [
    { key: 'inProgress', label: 'In Progress', value: inProgress },
    { key: 'planned', label: 'Planned', value: planned },
    { key: 'submitted', label: 'Submitted', value: submitted },
    { key: 'completed', label: 'Completed', value: completed },
  ]
  const nonZero = data.filter((d) => d.value > 0)

  return (
    <Card className="p-5 shadow-panel">
      <div className="flex items-center justify-between">
        <p className="text-[13px] font-medium text-navy-900">Application Overview</p>
        <button onClick={onViewAll} className="flex items-center gap-1 text-[11.5px] text-skyline-600 hover:underline">
          View All <ArrowRight size={11} />
        </button>
      </div>

      <div className="mt-2 flex items-center gap-4">
        <div className="relative h-28 w-28 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={nonZero.length ? nonZero : [{ key: 'empty', label: '', value: 1 }]}
                dataKey="value"
                innerRadius={38}
                outerRadius={54}
                paddingAngle={nonZero.length > 1 ? 3 : 0}
                stroke="none"
              >
                {(nonZero.length ? nonZero : [{ key: 'empty' }]).map((d) => (
                  <Cell key={d.key} fill={nonZero.length ? SLICE_COLOR[d.key] : '#152449' + '1A'} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-serif text-[22px] text-navy-900">{total}</span>
            <span className="text-[10px] text-ink-500">Applications</span>
          </div>
        </div>

        <ul className="min-w-0 flex-1 space-y-1.5">
          {data.map((d) => (
            <li key={d.key} className="flex items-center justify-between text-[12px]">
              <span className="flex items-center gap-1.5 text-ink-700">
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: SLICE_COLOR[d.key] }} />
                {d.label}
              </span>
              <span className="font-medium text-ink-900">{d.value}</span>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  )
}