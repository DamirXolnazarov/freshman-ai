import Card from '../ui/Card.jsx'
import { ArrowRight, Clock } from 'lucide-react'

export default function ChatContextSidebar({
  memoryFacts,
  todaysFocus,
  suggestedOpportunity,
  upcomingDeadlines,
  roadmapChanges,
  completeness,
  onNavigate,
}) {
  return (
    <aside className="hidden xl:flex w-[320px] shrink-0 flex-col gap-4 overflow-y-auto border-l border-navy-900/[0.06] px-5 py-6">
      <Card className="p-4 shadow-panel">
        <p className="text-[11px] font-medium tracking-[0.1em] text-ink-500 uppercase">Recently learned</p>
        <ul className="mt-2.5 space-y-1.5">
          {memoryFacts.length === 0 && <li className="text-[12px] text-ink-500/70">Nothing yet.</li>}
          {memoryFacts.map((f, i) => (
            <li key={i} className="flex items-start gap-1.5 text-[12.5px] text-ink-700">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-gold-500" /> {f}
            </li>
          ))}
        </ul>
      </Card>

      {todaysFocus.length > 0 && (
        <Card className="p-4 shadow-panel">
          <p className="text-[11px] font-medium tracking-[0.1em] text-ink-500 uppercase">Today's focus</p>
          <ul className="mt-2.5 space-y-2">
            {todaysFocus.map((f, i) => (
              <li key={i} className="flex items-center justify-between text-[12.5px]">
                <span className="text-ink-900">{f.label}</span>
                <span className="flex items-center gap-1 text-ink-500"><Clock size={11} /> {f.minutes} min</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {suggestedOpportunity && (
        <Card className="p-4 shadow-panel bg-gradient-to-br from-parchment-100 to-parchment-50">
          <p className="text-[11px] font-medium tracking-[0.1em] text-gold-600 uppercase">Suggested opportunity</p>
          <p className="mt-1.5 font-serif text-[15px] text-navy-900">{suggestedOpportunity.name}</p>
          <p className="mt-1 text-[11.5px] text-ink-500">{suggestedOpportunity.matchScore}% match</p>
          <button onClick={() => onNavigate('opportunities')} className="mt-2 flex items-center gap-1 text-[12px] text-skyline-600 hover:underline">
            View <ArrowRight size={11} />
          </button>
        </Card>
      )}

      {upcomingDeadlines.length > 0 && (
        <Card className="p-4 shadow-panel">
          <p className="text-[11px] font-medium tracking-[0.1em] text-ink-500 uppercase">Upcoming deadlines</p>
          <ul className="mt-2.5 space-y-2">
            {upcomingDeadlines.map((d, i) => (
              <li key={i} className="flex items-center justify-between text-[12.5px]">
                <span className="text-ink-900">{d.title}</span>
                <span className="text-ink-500">{d.when}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {roadmapChanges.length > 0 && (
        <Card className="p-4 shadow-panel">
          <p className="text-[11px] font-medium tracking-[0.1em] text-ink-500 uppercase">Recent roadmap changes</p>
          <ul className="mt-2.5 space-y-2">
            {roadmapChanges.map((c, i) => (
              <li key={i} className="flex items-center justify-between text-[12.5px]">
                <span className="text-ink-900">{c.title}</span>
                <span className="text-sage">{c.status}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <button onClick={() => onNavigate('profile')} className="flex items-center gap-3 rounded-card border border-navy-900/[0.06] bg-white p-4 text-left shadow-panel">
        <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full" style={{ background: `conic-gradient(#152449 ${completeness}%, rgba(23,30,44,0.08) ${completeness}%)` }}>
          <div className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-white text-[11px] font-medium text-navy-900">{completeness}%</div>
        </div>
        <div>
          <p className="text-[12.5px] font-medium text-navy-900">Profile completion</p>
          <p className="text-[11px] text-ink-500">Tap to view</p>
        </div>
      </button>
    </aside>
  )
}