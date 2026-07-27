import { useState, useEffect } from 'react'
import Sidebar from '../components/layout/Sidebar.jsx'
import Card from '../components/ui/Card.jsx'
import FadeIn from '../components/ui/FadeIn.jsx'
import ApplicationCard from '../components/applications/ApplicationCard.jsx'
import ApplicationsChart from '../components/dashboard/ApplicationsChart.jsx'
import EssayEditorOverlay from '../components/essays/EssayEditorOverlay.jsx'
import { getApplications, toggleChecklistItem } from '../lib/applications.js'

export default function ApplicationsPage({ onNavigate, studentId }) {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeEssay, setActiveEssay] = useState(null)

  useEffect(() => {
    if (!studentId) return
    getApplications(studentId).then((data) => {
      const sorted = [...data].sort((a, b) => {
        if (a.daysUntil == null) return 1
        if (b.daysUntil == null) return -1
        return a.daysUntil - b.daysUntil
      })
      setApplications(sorted)
      setLoading(false)
    })
  }, [studentId])

  async function handleToggle(app, key) {
    setApplications((prev) =>
      prev.map((a) =>
        a.savedId === app.savedId
          ? { ...a, checklist: { ...a.checklist, [key]: !a.checklist[key] } }
          : a
      )
    )
    const updated = await toggleChecklistItem(app.savedId, app.checklist, key)
    setApplications((prev) =>
      prev.map((a) => (a.savedId === app.savedId ? { ...a, checklist: updated } : a))
    )
  }

  const submitted = applications.filter((a) => a.checklist.submitted).length
  const inProgress = applications.length - submitted

  return (
    <div className="flex h-screen bg-parchment-50">
      <Sidebar activePage="applications" onNavigate={onNavigate} />

      <main className="flex-1 min-w-0 overflow-y-auto px-8 py-7">
        <header>
          <h1 className="font-serif text-[24px] text-navy-900">Applications</h1>
          <p className="mt-1 text-[13.5px] text-ink-500">
            Every saved school, one checklist, sorted by what's due soonest.
          </p>
        </header>

        {!loading && applications.length > 0 && (
          <div className="mt-5 flex gap-3">
            <Card className="flex-1 p-4 shadow-panel">
              <p className="text-[11px] text-ink-500 uppercase tracking-wide">Total schools</p>
              <p className="mt-1 font-serif text-[22px] text-navy-900">{applications.length}</p>
            </Card>
            <Card className="flex-1 p-4 shadow-panel">
              <p className="text-[11px] text-ink-500 uppercase tracking-wide">In progress</p>
              <p className="mt-1 font-serif text-[22px] text-gold-600">{inProgress}</p>
            </Card>
            <Card className="flex-1 p-4 shadow-panel">
              <p className="text-[11px] text-ink-500 uppercase tracking-wide">Submitted</p>
              <p className="mt-1 font-serif text-[22px] text-sage">{submitted}</p>
            </Card>
            <div className="flex-1">
              <ApplicationsChart applications={applications} />
            </div>
          </div>
        )}

        {loading && <p className="mt-8 text-[13.5px] text-ink-500">Loading your applications…</p>}

        {!loading && applications.length === 0 && (
          <Card className="mt-6 p-10 text-center shadow-panel">
            <p className="font-serif text-[17px] text-navy-900">No applications yet</p>
            <p className="mt-2 max-w-sm mx-auto text-[13.5px] text-ink-500">
              Save a university first — your application checklist starts as soon as you do.
            </p>
          </Card>
        )}

        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {applications.map((app, i) => (
            <FadeIn key={app.savedId} index={i}>
              <ApplicationCard
                application={app}
                onToggleChecklist={(key) => handleToggle(app, key)}
                onOpenEssay={(essay) => setActiveEssay(essay)}
              />
            </FadeIn>
          ))}
        </div>
      </main>

      {activeEssay && (
        <EssayEditorOverlay
          essay={activeEssay}
          onClose={() => setActiveEssay(null)}
          onSaved={() => setActiveEssay(null)}
          onDeleted={() => setActiveEssay(null)}
        />
      )}
    </div>
  )
}