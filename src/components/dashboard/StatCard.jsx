import Card from '../ui/Card.jsx'

export default function StatCard({ icon: Icon, iconBg, label, value, detail }) {
  return (
    <Card className="p-4 shadow-panel">
      <div className="flex items-center gap-2">
        <div className={`flex h-7 w-7 items-center justify-center rounded-control ${iconBg}`}>
          <Icon size={14} strokeWidth={1.75} />
        </div>
        <p className="text-[12px] text-ink-500">{label}</p>
      </div>
      <p className="mt-2.5 font-serif text-[26px] leading-none text-navy-900">{value}</p>
      {detail && <p className="mt-2 text-[11.5px] text-ink-500">{detail}</p>}
    </Card>
  )
}
