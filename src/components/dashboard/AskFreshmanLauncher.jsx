import { useState } from 'react'
import { Sparkles, X } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import AskFreshmanPanel from './AskFreshmanPanel.jsx'

// Same AskFreshmanPanel content as before, just tucked behind a floating
// launcher instead of a permanent sidebar column — the quick-chat feature
// isn't lost, it just doesn't cost space until someone actually wants it.
export default function AskFreshmanLauncher({ onOpenChat }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <motion.button
        onClick={() => setOpen(true)}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-7 right-7 z-40 flex h-13 w-13 items-center justify-center rounded-full bg-navy-900 text-parchment-50 shadow-raised transition-colors hover:bg-navy-800"
        style={{ height: 52, width: 52 }}
        aria-label="Ask Freshman AI"
      >
        <Sparkles size={20} strokeWidth={1.75} className="text-gold-400" />
      </motion.button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-navy-950/20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <motion.div
              className="fixed bottom-24 right-7 z-50 w-[340px]"
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.97 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="relative">
                <button
                  onClick={() => setOpen(false)}
                  className="absolute -top-2.5 -right-2.5 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-navy-900 text-parchment-50 shadow-panel"
                  aria-label="Close"
                >
                  <X size={13} />
                </button>
                <AskFreshmanPanel onOpenChat={onOpenChat} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}