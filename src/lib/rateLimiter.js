const MIN_INTERVAL_MS = 3000

let lastCallAt = 0

export function canCallNow() {
  const now = Date.now()
  if (now - lastCallAt < MIN_INTERVAL_MS) return false
  lastCallAt = now
  return true
}

export function msUntilNextCall() {
  return Math.max(0, MIN_INTERVAL_MS - (Date.now() - lastCallAt))
}