import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, X, Sparkles, Trophy, Loader2 } from 'lucide-react'
import { polishPortfolioItem } from '../../lib/groq.js'

const ALL_TAGS = ['Leadership', 'Technology', 'Community', 'Academic', 'Arts', 'Athletics', 'Service']

const TAG_TONES = {
  Leadership: 'bg-navy-900/[0.06] text-navy-800',
  Technology: 'bg-skyline-300/25 text-skyline-700',
  Community: 'bg-sage/15 text-sage',
  Academic: 'bg-gold-500/15 text-gold-600',
  Arts: 'bg-[#4A3B6B]/12 text-[#4A3B6B]',
  Athletics: 'bg-dusty/25 text-[#8B5A5A]',
  Service: 'bg-ink-500/10 text-ink-700',
}

export default function PortfolioEditOverlay({ item, onSave, onClose }) {
  const [draft, setDraft] = useState({
    title: item.title || '',
    summary: item.summary || '',
    impact: item.impact || '',
    skills: (item.skills || []).join(', '),
    tags: item.tags || [],
  })
  const [saving, setSaving] = useState(false)
  const [polishing, setPolishing] = useState(false)
  const [isClosing, setIsClosing] = useState(false)

  function toggleTag(tag) {
    setDraft((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag) ? prev.tags.filter((t) => t !== tag) : [...prev.tags, tag],
    }))
  }

  async function handlePolish() {
    if (!draft.title.trim() || polishing) return
    setPolishing(true)
    const result = await polishPortfolioItem(draft)
    if (result) {
      setDraft((prev) => ({
        ...prev,
        title: result.title || prev.title,
        summary: result.summary || prev.summary,
        impact: result.impact || prev.impact,
      }))
    }
    setPolishing(false)
  }

  function handleClose() {
    setIsClosing(true)
    setTimeout(onClose, 220) // matches exit transition duration below
  }

  async function handleSave() {
    if (!draft.title.trim()) return
    setSaving(true)
    await onSave({
      title: draft.title.trim(),
      summary: draft.summary.trim(),
      impact: draft.impact.trim(),
      skills: draft.skills.split(',').map((s) => s.trim()).filter(Boolean),
      tags: draft.tags,
    })
    setSaving(false)
    handleClose()
  }

  const skillsList = draft.skills.split(',').map((s) => s.trim()).filter(Boolean)
  const previewKey = `${draft.title}|${draft.summary}|${draft.impact}` // re-triggers settle animation on change

  return (
    <AnimatePresence>
      {!isClosing && (
        <motion.div
          className="fixed inset-0 z-50 flex"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
        >
          <motion.div
            className="absolute inset-0 bg-navy-950/50 backdrop-blur-md"
            onClick={handleClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          />

          <div className="relative z-10 flex h-full w-full">
            <motion.div
              className="flex h-full w-full max-w-[440px] flex-col bg-parchment-50 px-7 py-8 shadow-raised overflow-y-auto"
              initial={{ x: -32, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -24, opacity: 0 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex items-center justify-between">
                <p className="text-[11.5px] font-medium tracking-[0.14em] text-ink-500 uppercase">Edit entry</p>
                <button onClick={handleClose} className="text-ink-500/60 hover:text-ink-900" aria-label="Close">
                  <X size={18} />
                </button>
              </div>

              <label className="mt-6 text-[11.5px] font-medium text-ink-500 uppercase tracking-wide">Title</label>
              <input
                value={draft.title}
                onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
                className="mt-1.5 rounded-control border border-navy-900/10 bg-white px-3.5 py-2.5 font-serif text-[15px] text-navy-900 outline-none transition-colors focus:border-gold-500"
              />

              <label className="mt-4 text-[11.5px] font-medium text-ink-500 uppercase tracking-wide">Summary</label>
              <textarea
                value={draft.summary}
                onChange={(e) => setDraft((d) => ({ ...d, summary: e.target.value }))}
                rows={3}
                className="mt-1.5 resize-none rounded-control border border-navy-900/10 bg-white px-3.5 py-2.5 text-[13.5px] leading-relaxed text-ink-700 outline-none transition-colors focus:border-gold-500"
              />

              <label className="mt-4 text-[11.5px] font-medium text-ink-500 uppercase tracking-wide">Impact</label>
              <input
                value={draft.impact}
                onChange={(e) => setDraft((d) => ({ ...d, impact: e.target.value }))}
                placeholder="e.g. 150 participants"
                className="mt-1.5 rounded-control border border-navy-900/10 bg-white px-3.5 py-2.5 text-[13.5px] text-ink-700 outline-none transition-colors focus:border-gold-500"
              />

              <label className="mt-4 text-[11.5px] font-medium text-ink-500 uppercase tracking-wide">Skills</label>
              <input
                value={draft.skills}
                onChange={(e) => setDraft((d) => ({ ...d, skills: e.target.value }))}
                placeholder="Comma separated"
                className="mt-1.5 rounded-control border border-navy-900/10 bg-white px-3.5 py-2.5 text-[13.5px] text-ink-700 outline-none transition-colors focus:border-gold-500"
              />

              <label className="mt-4 text-[11.5px] font-medium text-ink-500 uppercase tracking-wide">Category</label>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {ALL_TAGS.map((tag) => {
                  const active = draft.tags.includes(tag)
                  return (
                    <motion.button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      whileTap={{ scale: 0.94 }}
                      className={`rounded-full px-2.5 py-1 text-[11px] transition-colors ${
                        active ? TAG_TONES[tag] : 'bg-white text-ink-500/60 border border-navy-900/8 hover:text-ink-700'
                      }`}
                    >
                      {tag}
                    </motion.button>
                  )
                })}
              </div>

              <motion.button
                onClick={handlePolish}
                disabled={polishing || !draft.title.trim()}
                whileTap={{ scale: 0.98 }}
                className="mt-6 flex items-center justify-center gap-2 rounded-control border border-gold-500/40 bg-gold-500/[0.08] py-2.5 text-[13px] font-medium text-gold-700 transition-colors hover:bg-gold-500/[0.14] disabled:opacity-40"
              >
                {polishing ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                {polishing ? 'Polishing wording…' : 'Enhance wording with AI'}
              </motion.button>

              <div className="mt-auto flex items-center gap-2.5 pt-8">
                <motion.button
                  onClick={handleSave}
                  disabled={saving || !draft.title.trim()}
                  whileTap={{ scale: 0.98 }}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-control bg-navy-900 py-2.5 text-[13.5px] text-parchment-50 transition-colors hover:bg-navy-800 disabled:opacity-40"
                >
                  <Check size={14} /> Save changes
                </motion.button>
                <button
                  onClick={handleClose}
                  className="rounded-control border border-navy-900/12 px-4 py-2.5 text-[13.5px] text-ink-700 hover:bg-parchment-100"
                >
                  Cancel
                </button>
              </div>
            </motion.div>

            <motion.div
              className="hidden flex-1 items-center justify-center px-10 lg:flex"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.32, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.div
                key={previewKey}
                initial={{ opacity: 0.6, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                className="w-full max-w-sm rounded-card bg-white p-6 shadow-raised"
              >
                <div className="flex items-start gap-2.5">
                  <Trophy size={17} className="mt-0.5 shrink-0 text-gold-500" />
                  <p className="font-serif text-[17px] leading-snug text-navy-900">
                    {draft.title || 'Untitled entry'}
                  </p>
                </div>

                <p className="mt-3 text-[14px] leading-relaxed text-ink-700">
                  {draft.summary || 'Your summary will appear here as you type.'}
                </p>

                {draft.impact && (
                  <p className="mt-2.5 text-[12.5px] text-ink-500">
                    <span className="font-medium text-ink-700">Impact:</span> {draft.impact}
                  </p>
                )}

                {skillsList.length > 0 && (
                  <p className="mt-1 text-[12.5px] text-ink-500">
                    <span className="font-medium text-ink-700">Skills:</span> {skillsList.join(', ')}
                  </p>
                )}

                <div className="mt-4 flex flex-wrap gap-1.5">
                  <AnimatePresence>
                    {draft.tags.map((tag) => (
                      <motion.span
                        key={tag}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.15 }}
                        className={`rounded-full px-2.5 py-0.5 text-[11px] ${TAG_TONES[tag] || 'bg-parchment-100 text-ink-700'}`}
                      >
                        {tag}
                      </motion.span>
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}