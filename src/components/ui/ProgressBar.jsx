import { motion } from 'motion/react'

// Smooth spring-based fill instead of CSS width transitions (which
// animate linearly and look mechanical). Drop-in replacement anywhere
// a percentage bar is used — Dashboard, Roadmap, Applications.
export default function ProgressBar({ value = 0, className = '', trackClassName = '', fillClassName = '' }) {
  return (
    <div className={`h-1.5 w-full overflow-hidden rounded-full bg-navy-900/[0.06] ${trackClassName} ${className}`}>
      <motion.div
        className={`h-full rounded-full bg-gradient-to-r from-skyline-500 to-gold-400 ${fillClassName}`}
        initial={{ width: 0 }}
        animate={{ width: `${Math.max(0, Math.min(100, value))}%` }}
        transition={{ type: 'spring', stiffness: 90, damping: 18 }}
      />
    </div>
  )
}