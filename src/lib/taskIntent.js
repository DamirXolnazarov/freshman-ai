// Deliberately simple pattern matching, not a full NLP date parser —
// covers the common phrasings a student would actually type, fails safe
// (returns null) rather than guessing wrong on ambiguous input.
const DAY_NAMES = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']

export function parseTaskIntent(text) {
  const lower = text.toLowerCase()
  const taskVerbs = /\b(need to|have to|must|finish|complete|submit|due|deadline)\b/
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

  // crude title extraction: strip filler words, keep the rest
  const title = text
    .replace(/\b(i need to|i have to|i must|today|tomorrow|next week|next monday|next tuesday|next wednesday|next thursday|next friday|next saturday|next sunday)\b/gi, '')
    .trim()
    .replace(/^(finish|complete|submit)\s+/i, (m) => m)
    .slice(0, 80)

  return { title: title.charAt(0).toUpperCase() + title.slice(1) || 'New task', dueDate: dueDate.toISOString().slice(0, 10) }
}