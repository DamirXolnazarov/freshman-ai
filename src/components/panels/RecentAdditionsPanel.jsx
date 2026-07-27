import { FolderPlus } from 'lucide-react'
import Card from '../ui/Card.jsx'

export default function RecentAdditionsPanel({ items = [] }) {
  return (
    <Card className="p-5 shadow-panel">
      <div className="flex items-center gap-1.5 text-[11.5px] font-medium tracking-[0.12em] text-ink-500 uppercase">
        <FolderPlus size={14} />
        Recent additions
      </div>

      {items.length === 0 ? (
        <p className="mt-3 text-[12.5px] text-ink-500/70">Nothing added yet.</p>
      ) : (
        <ul className="mt-3.5 space-y-3">
          {items.map((item, i) => (
            <li key={i} className="flex items-center justify-between gap-2">
              <p className="truncate text-[13px] text-ink-900">{item.title}</p>
              <span
                className={`shrink-0 text-[11px] ${
                  item.isNew ? 'text-gold-600 font-medium' : 'text-ink-500'
                }`}
              >
                {item.isNew ? 'New' : item.when}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}