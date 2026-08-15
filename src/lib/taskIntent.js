// Deliberately simple pattern matching, not a full NLP date parser —
// covers the common phrasings a student would actually type, fails safe
// (returns null) rather than guessing wrong on ambiguous input.
const DAY_NAMES = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']

export function parseTaskIntent(text) {
  const lower = text.toLowerCase()
  const taskVerbs = /\b(need to|have to|must|finish|complete|submit|due|deadline|remind me to|create a task|add a task)\b/
  if (!taskVerbs.test(lower)) return null

  const now = new Date()
  let dueDate = null

  if (/\btoday\b/.test(lower)) {
    dueDate = new Date(now)
  } else if (/\btomorrow\b/.test(lower)) {
    dueDate = new Date(now)
    dueDate.setDate(dueDate.getDate() + 1)
  } else if (/\bnext week\b/.test(lower)) {
    dueDate = new Date(now)
    dueDate.setDate(dueDate.getDate() + 7)
  } else {
    const dayMatch = DAY_NAMES.findIndex((d) => lower.includes(d))
    if (dayMatch !== -1) {
      dueDate = new Date(now)
      const diff = (dayMatch + 7 - now.getDay()) % 7 || 7
      dueDate.setDate(dueDate.getDate() + diff)
    }
  }

  if (!dueDate) return null

  // Strip trigger phrases, date phrases (including the leading "by"/"on"
  // that precedes them), and leading filler verbs — in that order, so
  // nothing dangling gets left behind in the stored title.
  const title = text
    .replace(/\b(remind me to|create a task:?|add a task:?|i need to|i have to|i must)\b/gi, '')
    .replace(/\b(by|on)\s+(today|tomorrow|next week|next\s+(sunday|monday|tuesday|wednesday|thursday|friday|saturday)|sunday|monday|tuesday|wednesday|thursday|friday|saturday)\b/gi, '')
    .replace(/\b(today|tomorrow|next week|next\s+(sunday|monday|tuesday|wednesday|thursday|friday|saturday))\b/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
    .slice(0, 80)

  return { title: title.charAt(0).toUpperCase() + title.slice(1) || 'New task', dueDate: dueDate.toISOString().slice(0, 10) }
}