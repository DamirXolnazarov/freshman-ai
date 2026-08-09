import { Sparkles, ShieldCheck, Search, MessageCircle, Lightbulb, ArrowRight, Send } from 'lucide-react'

export default function AskFreshmanAICard({ askInput, setAskInput, onSubmit, onChip, primaryGap, onNavigate }) {
  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-card border border-navy-900/8 bg-parchment-50 p-6 shadow-panel">
      <div
        className="pointer-events-none absolute inset-y-0 right-0 w-full"
        style={{
          backgroundImage: 'url(/castle-chat.png)',
          backgroundPosition: 'right bottom',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          opacity: 0.85,
        }}
      />

      <div className="relative z-10 flex h-full flex-col">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-2">
            <Sparkles size={18} className="mt-0.5 text-gold-500" />
            <div>
              <p className="font-serif text-[15px] font-semibold tracking-[0.08em] text-navy-900 uppercase">Freshman AI</p>
              <p className="mt-0.5 text-[12px] text-ink-500">Your personal admissions co-pilot</p>
            </div>
          </div>
          <ShieldCheck size={20} className="text-gold-400" strokeWidth={1.5} />
        </div>

        <form onSubmit={onSubmit} className="mt-4 flex items-center gap-2 rounded-control border border-navy-900/10 bg-white/85 px-3.5 py-2.5 backdrop-blur-sm">
          <Sparkles size={13} className="shrink-0 text-gold-400" />
          <input
            value={askInput}
            onChange={(e) => setAskInput(e.target.value)}
            placeholder="What should I work on today?"
            className="flex-1 bg-transparent text-[13px] text-ink-900 outline-none placeholder:text-ink-500/60"
          />
          <button type="submit" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-navy-900 text-parchment-50 transition-transform hover:scale-105">
            <Send size={13} strokeWidth={2} />
          </button>
        </form>

        <div className="mt-3 grid grid-cols-2 gap-2">
          {[
            { icon: 'profile', label: 'Review my profile', prompt: 'Can you review my profile and tell me where I stand?' },
            { icon: 'search', label: 'Find opportunities', prompt: 'Find opportunities that match my profile.' },
            { icon: 'sparkle', label: "What's my next step?", prompt: 'What should I focus on next?' },
            { icon: 'essay', label: 'Review my essay', prompt: 'Can you review my latest essay draft?' },
          ].map((chip) => (
            <button
              key={chip.label}
              onClick={() => onChip(chip.prompt)}
              className="flex items-center gap-1.5 rounded-control border border-navy-900/8 bg-white/70 px-2.5 py-2 text-left text-[11px] text-ink-900 transition-colors hover:bg-white"
            >
              <MessageCircle size={11} strokeWidth={1.75} className="shrink-0 text-gold-600" />
              <span className="leading-tight">{chip.label}</span>
            </button>
          ))}
        </div>

        <div className="mt-auto pt-3">
          {primaryGap ? (
            <button
              onClick={() => onNavigate?.(primaryGap.type === 'score' ? 'roadmap' : 'opportunities')}
              className="flex w-full items-start gap-2.5 rounded-control border border-navy-900/8 bg-white/75 p-3 text-left"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gold-400/25 text-gold-700">
                <Lightbulb size={13} strokeWidth={1.75} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[10px] font-medium tracking-[0.1em] text-gold-700 uppercase">Freshman Insight</span>
                <span className="mt-0.5 block text-[11.5px] leading-snug text-ink-700">{primaryGap.title}</span>
              </span>
              <ArrowRight size={12} className="mt-1 shrink-0 text-gold-600" />
            </button>
          ) : (
            <div className="rounded-control border border-dashed border-navy-900/10 bg-white/50 p-3 text-center">
              <p className="text-[11px] text-ink-500">Keep chatting so I can surface insights here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}