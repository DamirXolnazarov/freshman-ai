import { useState, useEffect } from 'react'
import { Plus, PenLine } from 'lucide-react'
import Sidebar from '../components/layout/Sidebar.jsx'
import Card from '../components/ui/Card.jsx'
import ReviewedEssayView from '../components/essays/ReviewedEssayView.jsx'
import { getEssayReview } from '../lib/essayReviews.js'
import EssayEditorOverlay from '../components/essays/EssayEditorOverlay.jsx'
import { getEssays, createEssay, wordCount } from '../lib/essays.js'

export default function EssaysPage({ onNavigate, studentId }) {
  const [essays, setEssays] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeEssay, setActiveEssay] = useState(null)
  const [viewingReview, setViewingReview] = useState(null)

async function handleOpenReview(essay) {
  const review = await getEssayReview(essay.id)
  if (review?.status === 'completed') {
    setViewingReview({ essay, review })
  }
}

// in each essay Card, add a small badge if reviewed (requires loading review status per card,
// or simplest: fetch review status alongside essays in one query join if you want it eager-loaded)

  useEffect(() => {
    if (!studentId) return
    getEssays(studentId).then((data) => {
      setEssays(data)
      setLoading(false)
    })
  }, [studentId])

  async function handleNew() {
    const created = await createEssay(studentId, { title: 'Untitled essay' })
    setEssays((prev) => [created, ...prev])
    setActiveEssay(created)
  }

  function handleSaved(updated) {
    setEssays((prev) => prev.map((e) => (e.id === updated.id ? updated : e)))
  }

  function handleDeleted(id) {
    setEssays((prev) => prev.filter((e) => e.id !== id))
  }

  return (
    <div className="flex h-screen bg-parchment-50">
      <Sidebar activePage="essays" onNavigate={onNavigate} />

      <main className="flex-1 min-w-0 overflow-y-auto px-8 py-7">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="font-serif text-[24px] text-navy-900">Essays &amp; Drafts</h1>
            <p className="mt-1 text-[13.5px] text-ink-500">
              Match a title to the university it's for so it links up on your Applications page.
            </p>
          </div>
          <button
            onClick={handleNew}
            className="flex items-center gap-1.5 rounded-control bg-navy-900 px-4 py-2 text-[13px] text-parchment-50 hover:bg-navy-800"
          >
            <Plus size={14} /> New essay
          </button>
        </header>

        {loading && <p className="mt-8 text-[13.5px] text-ink-500">Loading your essays…</p>}

        {!loading && essays.length === 0 && (
          <Card className="mt-6 p-10 text-center shadow-panel">
            <PenLine size={20} className="mx-auto text-gold-500" />
            <p className="mt-3 font-serif text-[17px] text-navy-900">No drafts yet</p>
            <p className="mt-2 text-[13.5px] text-ink-500 max-w-sm mx-auto">
              Start a new essay and set the university it's for — it'll automatically show up on that
              school's application card.
            </p>
          </Card>
        )}

        {!loading && essays.length > 0 && (
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {essays.map((essay) => (
              <Card
                key={essay.id}
                onClick={() => setActiveEssay(essay)}
                className="cursor-pointer p-5 shadow-panel transition-shadow hover:shadow-raised"
              >
                <p className="font-serif text-[15.5px] text-navy-900">{essay.title || 'Untitled essay'}</p>
                {essay.university && (
                  <p className="mt-1 text-[12px] text-gold-600">{essay.university}</p>
                )}
                <p className="mt-2.5 line-clamp-3 text-[12.5px] leading-relaxed text-ink-700">
                  {essay.content?.trim() || 'Empty draft.'}
                </p>
                <p className="mt-3 text-[11px] text-ink-500/70">
                  {wordCount(essay.content)} words · {new Date(essay.updated_at).toLocaleDateString()}
                </p>
              </Card>
            ))}
          </div>
        )}
      </main>

      {activeEssay && (
        <EssayEditorOverlay
          essay={activeEssay}
          onClose={() => setActiveEssay(null)}
          onSaved={handleSaved}
          onDeleted={handleDeleted}
        />
      )}
    </div>
  )
}