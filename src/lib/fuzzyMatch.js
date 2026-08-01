// Lightweight fuzzy match: scores by how many words overlap between the
// student's message and each candidate title, normalized by title length.
// Good enough for "remove the robotics thing" -> "Robotics Club Founder"
// without needing a real fuzzy-search dependency for this scale of data.
function normalize(str) {
  return str.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(Boolean)
}

export function findBestMatch(text, candidates, getLabel) {
  const textWords = new Set(normalize(text))
  if (textWords.size === 0) return null

  let best = null
  let bestScore = 0

  for (const candidate of candidates) {
    const label = getLabel(candidate)
    const labelWords = normalize(label)
    if (labelWords.length === 0) continue

    const overlap = labelWords.filter((w) => textWords.has(w)).length
    const score = overlap / labelWords.length

    if (score > bestScore) {
      bestScore = score
      best = candidate
    }
  }

  // require at least a meaningful partial match — otherwise "delete" or
  // "task" alone could weakly match anything
  if (bestScore < 0.3) return null
  return { match: best, confidence: bestScore }
}