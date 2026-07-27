import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import Card from '../ui/Card.jsx'

const COLORS = {
  'Not started': '#C7C2B4',
  'In progress': '#D2AF6B',
  'Submitted': '#8CA089',
}

export default function ApplicationsChart({ applications = [] }) {
  const notStarted = applications.filter((a) => a.progress === 0).length
  const submitted = applications.filter((a) => a.checklist.submitted).length
  const inProgress = applications.length - notStarted - submitted

  const data = [
    { name: 'Not started', value: notStarted },
    { name: 'In progress', value: inProgress },
    { name: 'Submitted', value: submitted },
  ].filter((d) => d.value > 0)

  if (applications.length === 0) {
    return (
      <Card className="p-5 shadow-panel flex items-center justify-center">
        <p className="text-[12.5px] text-ink-500">Save a university to see this chart.</p>
      </Card>
    )
  }

  return (
    <Card className="p-5 shadow-panel">
      <p className="text-[11.5px] font-medium tracking-[0.1em] text-ink-500 uppercase">Application status</p>
      <div className="mt-2 flex items-center gap-4">
        <div style={{ width: 100, height: 100 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie data={data} dataKey="value" innerRadius={28} outerRadius={44} paddingAngle={3}>
                {data.map((entry) => (
                  <Cell key={entry.name} fill={COLORS[entry.name]} stroke="none" />
                ))}
              </Pie>
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid rgba(23,30,44,0.08)' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <ul className="space-y-1.5">
          {data.map((d) => (
            <li key={d.name} className="flex items-center gap-2 text-[12px] text-ink-700">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: COLORS[d.name] }} />
              {d.name} <span className="text-ink-500">({d.value})</span>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  )
}