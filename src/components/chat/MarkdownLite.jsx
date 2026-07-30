// Deliberately minimal — bold, line breaks, and simple bullet lines only.
// Not a full markdown parser; chat replies are short by design (1-3
// sentences), so this covers everything that could realistically appear.
export default function MarkdownLite({ text, className = '' }) {
  const lines = text.split('\n').filter((l) => l.trim() !== '')

  function renderInline(line) {
    const parts = line.split(/(\*\*[^*]+\*\*)/g)
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-semibold text-navy-900">{part.slice(2, -2)}</strong>
      }
      return <span key={i}>{part}</span>
    })
  }

  return (
    <div className={className}>
      {lines.map((line, i) => {
        const trimmed = line.trim()
        const isBullet = trimmed.startsWith('- ') || trimmed.startsWith('• ')
        if (isBullet) {
          return (
            <div key={i} className="flex gap-1.5 pl-0.5">
              <span className="text-gold-500">•</span>
              <span>{renderInline(trimmed.replace(/^[-•]\s*/, ''))}</span>
            </div>
          )
        }
        return <p key={i} className={i > 0 ? 'mt-1.5' : ''}>{renderInline(line)}</p>
      })}
    </div>
  )
}