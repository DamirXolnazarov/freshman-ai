import { ArrowRight } from 'lucide-react'

const TONE = {
  navy:    { bg: 'bg-[#5B8DEF]/12', text: 'text-[#3F6FD1]', ring: 'group-hover:ring-[#5B8DEF]/25' },
  gold:    { bg: 'bg-[#E8C077]/20', text: 'text-[#B8873E]', ring: 'group-hover:ring-[#E8C077]/30' },
  skyline: { bg: 'bg-[#5FB5D6]/16', text: 'text-[#2F7E9E]', ring: 'group-hover:ring-[#5FB5D6]/25' },
  sage:    { bg: 'bg-[#7FBF8F]/18', text: 'text-[#3F8452]', ring: 'group-hover:ring-[#7FBF8F]/25' },
  plum:    { bg: 'bg-[#8B6F9E]/16', text: 'text-[#6E5480]', ring: 'group-hover:ring-[#8B6F9E]/25' },
  dusty:   { bg: 'bg-[#C6564A]/14', text: 'text-[#B14A3F]', ring: 'group-hover:ring-[#C6564A]/25' },
}

export default function CategoryCard({ icon: Icon, label, value, detail, tone = 'navy', onClick, actionLabel }) {
  const t = TONE[tone] || TONE.navy

  return (
    <button
      onClick={onClick}
      className={`group relative flex flex-col items-start rounded-card border border-navy-900/6 bg-white p-4 text-left shadow-panel ring-1 ring-transparent transition-all hover:-translate-y-0.5 hover:shadow-md ${t.ring}`}
    >
      <span className={`flex h-9 w-9 items-center justify-center rounded-full ${t.bg} ${t.text}`}>
        <Icon size={17} strokeWidth={1.75} />
      </span>

      <p className="mt-3 font-serif text-[26px] leading-none text-navy-900">{value}</p>
      <p className="mt-1.5 text-[12.5px] font-medium text-ink-900">{label}</p>
      <p className="text-[10.5px] text-ink-500">{detail}</p>

      <span className={`mt-2.5 flex items-center gap-1 text-[11px] font-medium ${t.text} opacity-0 transition-opacity group-hover:opacity-100`}>
        {actionLabel || `View ${label}`} <ArrowRight size={10} />
      </span>
    </button>
  )
}