import { useState } from 'react'
import { Pencil, RotateCcw } from 'lucide-react'
import FreshmanCrest from '../ui/FreshmanCrest.jsx'

export function UserMessage({ children, time, onEdit, onRetry }) {
  const [hover, setHover] = useState(false)

  return (
    <div className="flex justify-end" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <div className="max-w-[55%]">
        <div className="rounded-[24px] bg-navy-900 px-5 py-3 text-[14.5px] leading-relaxed text-parchment-50 shadow-panel">
          {children}
        </div>
        <div className="mt-1 flex items-center justify-end gap-3">
          {hover && (
            <>
              {onEdit && <button onClick={onEdit} className="flex items-center gap-1 text-[11px] text-ink-500 hover:text-navy-900"><Pencil size={11} /> Edit</button>}
              {onRetry && <button onClick={onRetry} className="flex items-center gap-1 text-[11px] text-ink-500 hover:text-navy-900"><RotateCcw size={11} /> Retry</button>}
            </>
          )}
          {time && <p className="text-[11px] text-ink-500/70">{time}</p>}
        </div>
      </div>
    </div>
  )
}

export function AIMessage({ children, showAvatar = true }) {
  return (
    <div className="flex gap-3">
      {showAvatar ? (
        <div className="mt-0.5 shrink-0">
          <FreshmanCrest size={26} />
        </div>
      ) : (
        <div className="w-[26px] shrink-0" />
      )}
      <div className="max-w-[720px] flex-1">
        {showAvatar && <p className="mb-2 text-[12.5px] font-medium tracking-wide text-gold-600">Freshman AI</p>}
        {children}
      </div>
    </div>
  )
}