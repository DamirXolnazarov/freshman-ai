import { useState } from 'react'
import { X, MessageSquare } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const CATEGORY_COLOR = {
  clarity: 'bg-skyline-300/40',
  voice: 'bg-gold-400/40',
  structure: 'bg-sage/40',
  grammar: 'bg-dusty/40',
}

// Splits the essay text around each comment's quoted phrase, so the
// quoted span can be highlighted inline while the rest of the essay
// reads normally — like margin notes in a real manuscript review.
function buildAnnotatedSegments(content, comments) {
  if (!comments?.length) return [{ text: content, comment: null }]

  let segments = [{ text: content, comment: null }]

  comments.forEach((c, idx) => {
    segments = segments.flatMap((seg) => {
      if (seg.comment || !seg.text.includes(c.quote)) return [seg]
      const [before, after] = seg.text.split(c.quote)
      return [
        { text: before, comment: null },
        { text: c.quote, comment: { ...c, index: idx } },
        { text: after, comment: null },
      ]
    })
  })

  return segments
}

export default function ReviewedEssayView({ essay, review, onClose }) {
  const [activeComment, setActiveComment] = useState(null)
  const segments = buildAnnotatedSegments(essay.content, review.comments)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-navy-950/50 backdrop-blur-md" onClick={onClose} />

      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 flex h-[88vh] w-full max-w-4xl overflow-hidden rounded-card bg-parchment-50 shadow-raised"
      >
        <div className="flex-1 overflow-y-auto px-10 py-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium tracking-[0.12em] text-gold-600 uppercase">Reviewed by {review.reviewer_name || 'Freshman Academy'}</p>
              <h2 className="mt-1 font-serif text-[22px] text-navy-900">{essay.title}</h2>
            </div>
            <button onClick={onClose} className="text-ink-500/60 hover:text-ink-900"><X size={20} /></button>
          </div>

          {review.overall_note && (
            <div className="mt-5 rounded-control border border-gold-500/25 bg-gold-500/[0.06] p-4">
              <p className="text-[11px] font-medium tracking-[0.1em] text-gold-700 uppercase">Overall</p>
              <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-800">{review.overall_note}</p>
            </div>
          )}

          <div className="mt-6 font-serif text-[16px] leading-[1.9] text-ink-900">
            {segments.map((seg, i) =>
              seg.comment ? (
                <span
                  key={i}
                  onClick={() => setActiveComment(seg.comment)}
                  className={`cursor-pointer rounded px-0.5 transition-colors ${CATEGORY_COLOR[seg.comment.category] || 'bg-gold-400/40'} ${
                    activeComment?.index === seg.comment.index ? 'ring-2 ring-navy-900/30' : ''
                  }`}
                >
                  {seg.text}
                </span>
              ) : (
                <span key={i}>{seg.text}</span>
              )
            )}
          </div>
        </div>

        <div className="w-[320px] shrink-0 overflow-y-auto border-l border-navy-900/[0.06] bg-white px-5 py-8">
          <p className="flex items-center gap-1.5 text-[11px] font-medium tracking-[0.1em] text-ink-500 uppercase">
            <MessageSquare size={12} /> Comments ({review.comments?.length || 0})
          </p>
          <AnimatePresence mode="wait">
            <motion.div key={activeComment?.index ?? 'all'} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 space-y-3">
              {(review.comments || []).map((c, i) => (
                <button
                  key={i}
                  onClick={() => setActiveComment({ ...c, index: i })}
                  className={`block w-full rounded-control border p-3 text-left transition-colors ${
                    activeComment?.index === i ? 'border-navy-900/20 bg-parchment-50' : 'border-navy-900/[0.06] hover:bg-parchment-50'
                  }`}
                >
                  <span className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-medium uppercase ${CATEGORY_COLOR[c.category] || 'bg-gold-400/40'}`}>
                    {c.category || 'note'}
                  </span>
                  <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-800">{c.note}</p>
                </button>
              ))}
              {(!review.comments || review.comments.length === 0) && (
                <p className="text-[12.5px] text-ink-500/70">No inline comments — see the overall note above.</p>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}