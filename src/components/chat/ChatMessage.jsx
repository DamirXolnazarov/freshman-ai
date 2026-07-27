import FreshmanCrest from '../ui/FreshmanCrest.jsx'

export function UserMessage({ children, time }) {
  return (
    <div className="flex justify-end animate-fade-up">
      <div className="max-w-[70%]">
        <div className="rounded-card rounded-tr-md bg-navy-900 px-5 py-3.5 text-[14.5px] leading-relaxed text-parchment-50 shadow-panel">
          {children}
        </div>
        {time && <p className="mt-1.5 text-right text-[11px] text-ink-500/70">{time}</p>}
      </div>
    </div>
  )
}

export function AIMessage({ children, showAvatar = true }) {
  return (
    <div className="flex gap-3 animate-fade-up">
      {showAvatar ? (
        <div className="mt-0.5 shrink-0">
          <FreshmanCrest size={26} />
        </div>
      ) : (
        <div className="w-[26px] shrink-0" />
      )}
      <div className="max-w-[78%]">
        {showAvatar && (
          <p className="mb-1.5 text-[12.5px] font-medium tracking-wide text-gold-600">Freshman AI</p>
        )}
        {children}
      </div>
    </div>
  )
}
