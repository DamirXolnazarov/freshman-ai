// Simple client-side cooldown — prevents rapid-fire spam (accidental
// double-sends, someone mashing enter) from burning through Groq's rate
// limit. Not a real quota system, just a sane guard against the most
// common failure mode.
const MIN_INTERVAL_MS = 1200
let lastCallAt = 0

export function canCallNow() {
  const now = Date.now()
  if (now - lastCallAt < MIN_INTERVAL_MS) return false
  lastCallAt = now
  return true
}

export function msUntilNextCall() {
  const remaining = MIN_INTERVAL_MS - (Date.now() - lastCallAt)
  return Math.max(0, remaining)
}