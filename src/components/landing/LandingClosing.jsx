import FreshmanCrest from '../ui/FreshmanCrest.jsx'
import Button from '../ui/Button.jsx'

export default function LandingClosing({ onGetStarted }) {
  return (
    <>
      <section className="px-8 py-24 text-center lg:px-16">
        <p className="font-serif text-[22px] italic leading-relaxed text-navy-900">
          "The mind is not a vessel to be filled, but a fire to be kindled."
        </p>
        <p className="mt-2 text-[12px] tracking-[0.14em] text-gold-600 uppercase">— Plutarch</p>
        <h2 className="mx-auto mt-8 max-w-lg font-serif text-[28px] text-navy-900">
          Your journey deserves more than a form.
        </h2>
        <Button variant="primary" className="mt-6" onClick={onGetStarted}>
          Start your journey
        </Button>
      </section>

      <footer className="border-t border-navy-900/[0.06] bg-navy-950 px-8 py-10 text-parchment-100/60 lg:px-16">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-2.5">
            <FreshmanCrest size={22} />
            <span className="font-serif text-[14px] text-parchment-50">Freshman Academy</span>
          </div>
          <p className="text-[12px]">© {new Date().getFullYear()} Freshman Academy. Built for students, not spreadsheets.</p>
        </div>
      </footer>
    </>
  )
}
