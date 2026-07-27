const NOT_LIST = ['A chance calculator', 'A generic chatbot', 'A task manager', 'A gamified dashboard']

export default function LandingPositioning() {
  return (
    <section className="border-y border-navy-900/[0.06] bg-parchment-100/60 px-8 py-16 lg:px-16">
      <div className="mx-auto grid max-w-4xl grid-cols-1 gap-10 sm:grid-cols-2">
        <div>
          <p className="text-[12px] font-medium tracking-[0.14em] text-ink-500 uppercase">Freshman is not</p>
          <ul className="mt-4 space-y-2.5">
            {NOT_LIST.map((item) => (
              <li key={item} className="text-[15px] text-ink-500 line-through decoration-ink-500/30">
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-[12px] font-medium tracking-[0.14em] text-gold-600 uppercase">Freshman is</p>
          <p className="mt-4 font-serif text-[21px] leading-snug text-navy-900">
            A personalized admissions intelligence system — built to help you understand,
            document, and present your own journey.
          </p>
        </div>
      </div>
    </section>
  )
}
