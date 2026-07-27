import { Sparkles, FolderOpen, Map, Landmark, PenLine, Users } from 'lucide-react'
import Card from '../ui/Card.jsx'

const FEATURES = [
  { icon: Sparkles, title: 'Chat', copy: 'A calm, intelligent conversation that remembers your story — not a support widget.' },
  { icon: FolderOpen, title: 'Portfolio', copy: 'Every project, award, and role structured automatically, in your own voice.' },
  { icon: Map, title: 'Roadmap', copy: "Six pillars of a strong application, and exactly what's still unfinished." },
  { icon: Landmark, title: 'Universities', copy: 'Research, compare, and track requirements without losing the plot.' },
  { icon: PenLine, title: 'Essays', copy: 'Turn a real conversation into a personal statement worth reading.' },
  { icon: Users, title: 'Human handoff', copy: 'When it matters, talk to a real advisor — Freshman never pretends to replace one.' },
]

export default function LandingFeatures() {
  return (
    <section id="features" className="border-y border-navy-900/[0.06] bg-parchment-100/60 px-8 py-20 lg:px-16">
      <div className="mx-auto max-w-5xl">
        <p className="text-[12.5px] font-medium tracking-[0.16em] text-gold-600 uppercase text-center">Inside Freshman</p>
        <h2 className="mt-3 text-center font-serif text-[30px] text-navy-900">One system, not six apps stitched together.</h2>

        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <Card key={f.title} className="p-6 shadow-panel">
              <div className="flex h-10 w-10 items-center justify-center rounded-control bg-navy-900 text-parchment-50">
                <f.icon size={17} strokeWidth={1.75} />
              </div>
              <p className="mt-4 font-serif text-[17px] text-navy-900">{f.title}</p>
              <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-500">{f.copy}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
