import { useEffect, useRef } from 'react'

// Loads Calendly's own widget script once, reuses it across mounts.
// Replace CALENDLY_URL with your real scheduling link once set up —
// this is a placeholder so the integration point is ready immediately.
const CALENDLY_URL = 'https://calendly.com/freshman-academy/consultation'

export default function CalendlyEmbed({ prefillName, prefillEmail }) {
  const containerRef = useRef(null)

  useEffect(() => {
    const existingScript = document.querySelector('script[src="https://assets.calendly.com/assets/external/widget.js"]')
    if (!existingScript) {
      const script = document.createElement('script')
      script.src = 'https://assets.calendly.com/assets/external/widget.js'
      script.async = true
      document.body.appendChild(script)
    }
  }, [])

  const url = new URL(CALENDLY_URL)
  if (prefillName) url.searchParams.set('name', prefillName)
  if (prefillEmail) url.searchParams.set('email', prefillEmail)

  return (
    <div
      ref={containerRef}
      className="calendly-inline-widget rounded-card overflow-hidden"
      data-url={url.toString()}
      style={{ minWidth: '320px', height: '650px' }}
    />
  )
}