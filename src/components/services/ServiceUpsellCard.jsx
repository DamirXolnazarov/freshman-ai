import { Sparkles } from 'lucide-react'
import Card from '../ui/Card.jsx'

const SERVICE_COPY = {
  essay_review: {
    title: 'Get your essay reviewed by a real advisor',
    body: "You've drafted this — a human pass can catch what AI polish can't: voice, nuance, whether the story actually lands.",
    cta: 'Request essay review',
  },
  roadmap_review: {
    title: 'Have an advisor sanity-check your roadmap',
    body: "Your AI-generated plan is solid — a 30-minute review with a real strategist can confirm it or sharpen it.",
    cta: 'Book a roadmap review',
  },
  sat_mentor: {
    title: 'Close the score gap with a real tutor',
    body: 'Your target schools want a higher range than where you are now — a mentor session can build a real plan to close it.',
    cta: 'Book SAT mentoring',
  },
}

export default function ServiceUpsellCard({ type, onRequest }) {
  const copy = SERVICE_COPY[type]
  if (!copy) return null

  return (
    <Card className="p-5 shadow-panel bg-gradient-to-br from-parchment-100 to-parchment-50 border border-gold-500/20 max-w-sm">
      <div className="flex items-center gap-1.5 text-[11px] font-medium tracking-[0.1em] text-gold-600 uppercase">
        <Sparkles size={12} /> Freshman Academy service
      </div>
      <p className="mt-2 font-serif text-[15.5px] text-navy-900">{copy.title}</p>
      <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-700">{copy.body}</p>
      <button onClick={onRequest} className="mt-3.5 rounded-control bg-navy-900 px-4 py-2 text-[12.5px] text-parchment-50 hover:bg-navy-800">
        {copy.cta}
      </button>
    </Card>
  )
}