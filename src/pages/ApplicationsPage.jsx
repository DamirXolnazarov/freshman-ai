import { useState, useEffect } from 'react'
import Sidebar from '../components/layout/Sidebar.jsx'
import Card from '../components/ui/Card.jsx'
import FadeIn from '../components/ui/FadeIn.jsx'
import ApplicationCard from '../components/applications/ApplicationCard.jsx'
import OpportunityApplicationCard from '../components/opportunities/OpportunityApplicationCard.jsx'
import ApplicationsChart from '../components/dashboard/ApplicationsChart.jsx'
import EssayEditorOverlay from '../components/essays/EssayEditorOverlay.jsx'
import { getApplications, toggleChecklistItem } from '../lib/applications.js'
import { getOpportunityApplications, toggleOpportunityChecklistItem } from '../lib/opportunities.js'

export default function ApplicationsPage({ onNavigate, studentId }) {
  const [applications, setApplications] = useState([])
  const [oppApplications, setOppApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeEssay, setActiveEssay] = useState(null)

  useEffect(() => {
    if (!studentId) return
    Promise.all([getApplications(studentId), getOpportunityApplications(studentId)]).then(([apps, opps]) => {
      const sortedApps = [...apps].sort((a, b) => {
        if (a.daysUntil == null) return 1
        if (b.daysUntil == null) return -1
        return a.daysUntil - b.daysUntil
      })
      const sortedOpps = [...opps].sort((a, b) => {
        if (a.daysUntil == null) return 1
        if (b.daysUntil == null) return -1
        return a.daysUntil - b.daysUntil
      })
      setApplications(sortedApps)
      setOppApplications(sortedOpps)
      setLoading(false)
    })
  }, [studentId])

  async function handleToggle(app, key) {
    setApplications((prev) =>
      prev.map((a) =>
        a.savedId === app.savedId ? { ...a, checklist: { ...a.checklist, [key]: !a.checklist[key] } } : a
      )
    )
    const updated = await toggleChecklistItem(app.savedId, app.checklist, key)
    setApplications((prev) => prev.map((a) => (a.savedId === app.savedId ? { ...a, checklist: updated } : a)))
  }

  async function handleOppToggle(app, key) {
    setOppApplications((prev) =>
      prev.map((a) =>
        a.savedId === app.savedId ? { ...a, checklist: { ...a.checklist, [key]: !a.checklist[key] } } : a
      )
    )
    const updated = await toggleOpportunityChecklistItem(app.savedId, app.checklist, key)
    setOppApplications((prev) => prev.map((a) => (a.savedId === app.savedId ? { ...a, checklist: updated } : a)))
  }

  const submitted = applications.filter((a) => a.checklist.submitted).length
  const inProgress = applications.length - submitted

  const oppSubmitted = oppApplications.filter((a) => a.checklist.submitted).length
  const oppInProgress = oppApplications.length - oppSubmitted

  return (
    <div className="flex h-screen bg-parchment-50">
      <Sidebar activePage="applications" onNavigate={onNavigate} />

      <main className="flex-1 min-w-0 overflow-y-auto px-8 py-7">
        <header>
          <h1 className="font-serif text-[24px] text-navy-900">Applications</h1>
          <p className="mt-1 text-[13.5px] text-ink-500">
            Every school and opportunity you're tracking, sorted by what's due soonest.
          </p>
        </header>

        {loading && <p className="mt-8 text-[13.5px] text-ink-500">Loading your applications…</p>}

        {/* University applications */}
        {!loading && (
          <section className="mt-6">
            <p className="text-[11.5px] font-medium tracking-[0.1em] text-ink-500 uppercase">University applications</p>

            {applications.length > 0 && (
              <div className="mt-3 flex gap-3">
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

            {applications.length === 0 ? (
              <Card className="mt-3 p-8 text-center shadow-panel">
                <p className="text-[13.5px] text-ink-500">
                  Save a university first — your checklist starts as soon as you do.
                </p>
              </Card>
            ) : (
              <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
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
            )}
          </section>
        )}

        {/* Opportunity applications — deliberately separate section, different data shape */}
        {!loading && (
          <section className="mt-9">
            <p className="text-[11.5px] font-medium tracking-[0.1em] text-ink-500 uppercase">Opportunity applications</p>

            {oppApplications.length > 0 && (
              <div className="mt-3 flex gap-3">
                <Card className="flex-1 p-4 shadow-panel">
                  <p className="text-[11px] text-ink-500 uppercase tracking-wide">Total tracked</p>
                  <p className="mt-1 font-serif text-[22px] text-navy-900">{oppApplications.length}</p>
                </Card>
                <Card className="flex-1 p-4 shadow-panel">
                  <p className="text-[11px] text-ink-500 uppercase tracking-wide">In progress</p>
                  <p className="mt-1 font-serif text-[22px] text-gold-600">{oppInProgress}</p>
                </Card>
                <Card className="flex-1 p-4 shadow-panel">
                  <p className="text-[11px] text-ink-500 uppercase tracking-wide">Submitted</p>
                  <p className="mt-1 font-serif text-[22px] text-sage">{oppSubmitted}</p>
                </Card>
              </div>
            )}

            {oppApplications.length === 0 ? (
              <Card className="mt-3 p-8 text-center shadow-panel">
                <p className="text-[13.5px] text-ink-500">
                  Save a scholarship, competition, or program from Opportunities to start tracking it here.
                </p>
              </Card>
            ) : (
              <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
                {oppApplications.map((app, i) => (
                  <FadeIn key={app.savedId} index={i}>
                    <OpportunityApplicationCard
                      application={app}
                      onToggleChecklist={(key) => handleOppToggle(app, key)}
                    />
                  </FadeIn>
                ))}
              </div>
            )}
          </section>
        )}
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