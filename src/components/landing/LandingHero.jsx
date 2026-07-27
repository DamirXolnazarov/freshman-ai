import Button from '../ui/Button.jsx'
import Card from '../ui/Card.jsx'
import FreshmanCrest from '../ui/FreshmanCrest.jsx'
import HeroCrestForge from './HeroCrestForge.jsx'

export default function LandingHero({ onGetStarted }) {
  return (
    <section id="product" className="grid grid-cols-1 items-center gap-14 px-8 pb-20 pt-16 lg:grid-cols-2 lg:px-16">
      <div>
        <HeroCrestForge size={64} />
        <p className="mt-5 text-[12.5px] font-medium tracking-[0.16em] text-gold-600 uppercase">Freshman Academy</p>
        <h1 className="mt-4 font-serif text-[44px] leading-[1.08] text-navy-900 lg:text-[52px]">
          Here We Forge<br />Freshman.
        </h1>
        <p className="mt-5 max-w-md text-[16px] leading-relaxed text-ink-700">
          A conversational admissions companion. Talk about what you've built — Freshman turns it
          into a structured portfolio, a personalized roadmap, and a clearer path to the
          universities you're aiming for.
        </p>
        <div className="mt-8 flex items-center gap-3">
          <Button variant="primary" onClick={onGetStarted}>Start your journey</Button>
          <Button variant="ghost">See how it works</Button>
        </div>
        <p className="mt-6 text-[12.5px] text-ink-500">No credit card. Built for students, not spreadsheets.</p>
      </div>

      <Card className="relative shadow-raised p-5">
        <div className="flex items-center gap-2.5 border-b border-navy-900/[0.06] pb-4">
          <FreshmanCrest size={26} />
          <div>
            <p className="text-[13px] font-medium text-navy-900">Freshman AI</p>
            <p className="text-[11px] text-ink-500">Your admissions co-pilot</p>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          <div className="ml-auto max-w-[80%] rounded-card rounded-tr-sm bg-navy-900 px-4 py-2.5 text-[13.5px] text-parchment-50">
            I've been running a math club at my school for two years.
          </div>
          <div className="max-w-[85%] rounded-card rounded-tl-sm bg-parchment-100 px-4 py-2.5 text-[13.5px] leading-relaxed text-ink-700">
            Two years of leadership and teaching — that's worth documenting. Founder or member?
          </div>
          <div className="ml-auto max-w-[80%] rounded-card rounded-tr-sm bg-navy-900 px-4 py-2.5 text-[13.5px] text-parchment-50">
            Founder. I started it myself.
          </div>
          <div className="rounded-control border border-gold-500/30 bg-gold-500/[0.06] p-3.5">
            <p className="text-[12px] font-medium tracking-wide text-gold-600 uppercase">Portfolio insight</p>
            <p className="mt-1.5 font-serif text-[14.5px] text-navy-900">Math Club — Founder</p>
            <p className="mt-0.5 text-[12px] text-ink-500">Leadership · Teaching · Initiative</p>
          </div>
        </div>
      </Card>
    </section>
  )
}