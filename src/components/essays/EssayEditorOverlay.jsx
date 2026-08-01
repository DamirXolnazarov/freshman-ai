import { useState } from 'react'
import { X, Trash2, Sparkles, Loader2, Save } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { requestEssayReview, getEssayReview } from '../../lib/essayReviews.js'
import { CheckCircle2, Clock } from 'lucide-react'
import { updateEssay, deleteEssay, wordCount } from '../../lib/essays.js'
import { polishEssay } from '../../lib/groq.js'

export default function EssayEditorOverlay({ essay, onClose, onSaved, onDeleted }) {
  const [draft, setDraft] = useState({
    title: essay.title || '',
    university: essay.university || '',
    prompt: essay.prompt || '',
    content: essay.content || '',
  })
  const [saving, setSaving] = useState(false)
  const [review, setReview] = useState(null)
const [requestingReview, setRequestingReview] = useState(false)
  const [polishing, setPolishing] = useState(false)
  const [isClosing, setIsClosing] = useState(false)

  function handleClose() {
    setIsClosing(true)
    setTimeout(onClose, 200)
  }
  useEffect(() => {
  if (essay.id) {
    getEssayReview(essay.id).then(setReview)
  }
}, [essay.id])

  async function handlePolish() {
    if (!draft.content.trim() || polishing) return
    setPolishing(true)
    const improved = await polishEssay(draft.content)
    setDraft((prev) => ({ ...prev, content: improved }))
    setPolishing(false)
  }

  async function handleSave() {
    setSaving(true)
    const updated = await updateEssay(essay.id, draft)
    setSaving(false)
    onSaved?.(updated)
    handleClose()
  }

  async function handleDelete() {
    if (!confirm(`Delete "${draft.title || 'this essay'}"? This can't be undone.`)) return
    await deleteEssay(essay.id)
    onDeleted?.(essay.id)
    handleClose()
  }

  async function handleRequestReview() {
  setRequestingReview(true)
  const created = await requestEssayReview(essay.studentId || essay.student_id, essay.id)
  setReview(created)
  setRequestingReview(false)
}

  const words = wordCount(draft.content)

  return (
    <AnimatePresence>
      {!isClosing && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="absolute inset-0 bg-navy-950/50 backdrop-blur-md"
            onClick={handleClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 flex h-[85vh] w-full max-w-2xl flex-col rounded-card bg-parchment-50 shadow-raised"
          >
            <div className="flex items-center justify-between border-b border-navy-900/[0.06] px-6 py-4">
              <input
                value={draft.title}
                onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
                placeholder="Essay title"
                className="flex-1 bg-transparent font-serif text-[18px] text-navy-900 outline-none"
              />
              <button onClick={handleClose} className="ml-3 text-ink-500/60 hover:text-ink-900" aria-label="Close">
                <X size={20} />
              </button>
            </div>

            <div className="flex gap-3 border-b border-navy-900/[0.06] px-6 py-3">
              <input
                value={draft.university}
                onChange={(e) => setDraft((d) => ({ ...d, university: e.target.value }))}
                placeholder="University (e.g. Stanford University)"
                className="flex-1 rounded-control border border-navy-900/10 bg-white px-3 py-1.5 text-[12.5px] text-ink-700 outline-none focus:border-gold-500"
              />
              <input
                value={draft.prompt}
                onChange={(e) => setDraft((d) => ({ ...d, prompt: e.target.value }))}
                placeholder="Prompt (optional)"
                className="flex-[2] rounded-control border border-navy-900/10 bg-white px-3 py-1.5 text-[12.5px] text-ink-700 outline-none focus:border-gold-500"
              />
            </div>

            <textarea
              value={draft.content}
              onChange={(e) => setDraft((d) => ({ ...d, content: e.target.value }))}
              placeholder="Start writing…"
              className="flex-1 resize-none bg-transparent px-6 py-5 text-[14.5px] leading-relaxed text-ink-900 outline-none"
            />

            <div className="flex items-center justify-between border-t border-navy-900/[0.06] px-6 py-3.5">
              <div className="flex items-center gap-3">
                <span className="text-[12px] text-ink-500">{words} words</span>
                <button
                  onClick={handlePolish}
                  disabled={polishing || !draft.content.trim()}
                  className="flex items-center gap-1.5 rounded-control border border-gold-500/40 bg-gold-500/[0.08] px-3 py-1.5 text-[12px] font-medium text-gold-700 transition-colors hover:bg-gold-500/[0.14] disabled:opacity-40"
                >
                  {polishing ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                  {polishing ? 'Polishing…' : 'Polish with AI'}
                </button>
              </div>

              {essay.id && (
  review ? (
    <div className="flex items-center gap-1.5 text-[12px] text-ink-500">
      {review.status === 'completed' ? (
        <><CheckCircle2 size={13} className="text-sage" /> Review ready</>
      ) : (
        <><Clock size={13} className="text-gold-500" /> Review in progress</>
      )}
    </div>
  ) : (
    words >= 150 && (
      <button
        onClick={handleRequestReview}
        disabled={requestingReview}
        className="flex items-center gap-1.5 rounded-control border border-gold-500/40 bg-gold-500/[0.08] px-3 py-1.5 text-[12px] font-medium text-gold-700 hover:bg-gold-500/[0.14] disabled:opacity-50"
      >
        {requestingReview ? 'Requesting…' : 'Request human review'}
      </button>
    )
  )
)}

              <div className="flex items-center gap-2">
                <button onClick={handleDelete} className="text-ink-500/50 hover:text-[#8B5A5A]" aria-label="Delete essay">
                  <Trash2 size={16} />
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-1.5 rounded-control bg-navy-900 px-4 py-2 text-[13px] text-parchment-50 transition-colors hover:bg-navy-800 disabled:opacity-50"
                >
                  <Save size={13} /> Save
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}