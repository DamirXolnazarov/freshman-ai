import { useState } from 'react'
import Sidebar from '../components/layout/Sidebar.jsx'
import Card from '../components/ui/Card.jsx'
import CalendlyEmbed from '../components/services/CalendlyEmbed.jsx'
import { requestConsultation } from '../lib/consultations.js'

const SERVICES = [
  { key: 'essay_review', label: 'Essay Review', detail: 'A real advisor reads and annotates your draft' },
  { key: 'roadmap_review', label: 'Roadmap Review', detail: 'Sanity-check your AI-generated plan with a strategist' },
  { key: 'sat_mentor', label: 'SAT Mentoring', detail: 'Build a real plan to close your score gap' },
  { key: 'general', label: 'General Consultation', detail: 'Anything else on your mind' },
]

export default function ConsultationPage({ onNavigate, studentId, studentName, studentEmail }) {
  const [selected, setSelected] = useState('general')

  async function handleServiceSelect(key) {
    setSelected(key)
    await requestConsultation(studentId, key)
  }

  return (
    <div className="flex h-screen bg-parchment-50">
      <Sidebar activePage="consultation" onNavigate={onNavigate} />

      <main className="flex-1 min-w-0 overflow-y-auto px-9 py-8">
        <header>
          <h1 className="font-serif text-[24px] text-navy-900">Talk to a Real Advisor</h1>
          <p className="mt-1 text-[13.5px] text-ink-500">AI gets you 90% of the way — a human session covers the rest.</p>
        </header>

        <div className="mt-6 grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
          {SERVICES.map((s) => (
            <button
              key={s.key}
              onClick={() => handleServiceSelect(s.key)}
              className={`rounded-card border p-4 text-left transition-colors ${
                selected === s.key ? 'border-navy-900 bg-navy-900 text-parchment-50' : 'border-navy-900/10 bg-white hover:bg-parchment-100'
              }`}
            >
              <p className="text-[13.5px] font-medium">{s.label}</p>
              <p className={`mt-1 text-[11.5px] ${selected === s.key ? 'text-parchment-100/70' : 'text-ink-500'}`}>{s.detail}</p>
            </button>
          ))}
        </div>

        <Card className="mt-6 p-6 shadow-panel">
          <CalendlyEmbed prefillName={studentName} prefillEmail={studentEmail} />
        </Card>
      </main>
    </div>
  )
}