// Distinct from task intent: a reminder is a dated note with no checklist
// and no "done/todo" semantics — it's meant to show on the Calendar as a
// one-off event, not be checked off like a task.
const DAY_NAMES = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']

export function parseReminderIntent(text) {
  const lower = text.toLowerCase()
  if (!/\b(remind me|reminder|don't forget|don't let me forget)\b/.test(lower)) return null

  const now = new Date()
  let date = null

  if (/\btoday\b/.test(lower)) date = new Date(now)
  else if (/\btomorrow\b/.test(lower)) {
    date = new Date(now)
    date.setDate(date.getDate() + 1)
  } else {
    const dayMatch = DAY_NAMES.findIndex((d) => lower.includes(d))
    if (dayMatch !== -1) {
      date = new Date(now)
      const diff = (dayMatch + 7 - now.getDay()) % 7 || 7
      date.setDate(date.getDate() + diff)
    }
  }
  if (!date) return null

  const timeMatch = lower.match(/\b(\d{1,2})\s*(am|pm)\b/)
  const time = timeMatch ? `${timeMatch[1]}${timeMatch[2].toUpperCase()}` : null

  const title = text
    .replace(/\b(remind me to|remind me|reminder to|reminder|don't forget to|don't let me forget|today|tomorrow|at \d{1,2}\s*(am|pm))\b/gi, '')
    .trim()
    .slice(0, 80)

  return {
    title: (title.charAt(0).toUpperCase() + title.slice(1)) || 'Reminder',
    date: date.toISOString().slice(0, 10),
    time,
  }
}