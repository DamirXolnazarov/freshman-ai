import { MessageCircle, Brain, Layers, Link2, Compass, Rocket } from 'lucide-react'

const STEPS = [
  { label: 'Talk', icon: MessageCircle, copy: 'Describe what you did, in your own words.' },
  { label: 'Understand', icon: Brain, copy: 'Freshman reads it for leadership, skill, impact.' },
  { label: 'Structure', icon: Layers, copy: 'Vague experience becomes a clear portfolio entry.' },
  { label: 'Connect', icon: Link2, copy: 'Entries link to your roadmap and university goals.' },
  { label: 'Recommend', icon: Compass, copy: 'Freshman surfaces the gap worth closing next.' },
  { label: 'Act', icon: Rocket, copy: 'A task, an opportunity, or a next conversation.' },
]

export default function LandingCoreLoop() {
  return (
    <section id="loop" className="px-8 py-20 lg:px-16">
      <div className="mx-auto max-w-5xl">
        <p className="text-[12.5px] font-medium tracking-[0.16em] text-gold-600 uppercase text-center">How it works</p>
        <h2 className="mt-3 text-center font-serif text-[30px] text-navy-900">The conversation is the input.</h2>
        <p className="mx-auto mt-3 max-w-lg text-center text-[14.5px] text-ink-500">
          One loop repeats every time you talk to Freshman — it's how a scattered set of
          experiences becomes a coherent application.
        </p>

        <div className="mt-12 grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-6">
          {STEPS.map((step, i) => (
            <div key={step.label} className="relative text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-navy-900/12 bg-parchment-50 text-navy-900">
                <step.icon size={18} strokeWidth={1.75} />
              </div>
              <p className="mt-3 text-[13.5px] font-medium text-navy-900">
                {String(i + 1).padStart(2, '0')} · {step.label}
              </p>
              <p className="mt-1 text-[11.5px] leading-snug text-ink-500">{step.copy}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
