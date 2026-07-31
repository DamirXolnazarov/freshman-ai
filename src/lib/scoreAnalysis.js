// Detects when a student states/updates a test score, and produces a
// concrete analysis against their saved target schools' actual ranges —
// reusing the same range-parsing logic as gapDetection.js so the two
// stay consistent.
function parseRange(rangeStr) {
  if (!rangeStr) return null
  const match = rangeStr.match(/(\d+)\s*-\s*(\d+)/)
  if (!match) return null
  return { min: parseInt(match[1], 10), max: parseInt(match[2], 10) }
}

const SCORE_MENTION = /\b(sat|act)\b.*?\b(\d{2,4})\b|\b(\d{3,4})\b.*?\bsat\b|\b(\d{2})\b.*?\bact\b/i

export function detectScoreMention(text) {
  const lower = text.toLowerCase()
  const isSat = /\bsat\b/.test(lower)
  const isAct = /\bact\b/.test(lower)
  if (!isSat && !isAct) return null

  const numbers = text.match(/\d{2,4}/g)
  if (!numbers) return null

  const score = parseInt(
    numbers.find((n) => (isSat ? n.length >= 3 : n.length === 2)) || numbers[0],
    10
  )
  if (!score) return null
  if (isSat && (score < 400 || score > 1600)) return null
  if (isAct && (score < 1 || score > 36)) return null

  return { type: isSat ? 'SAT' : 'ACT', score }
}

export function analyzeScore(scoreInfo, savedUniversities = []) {
  const { type, score } = scoreInfo
  const rangeKey = type === 'SAT' ? 'sat_range' : 'act_range'

  const comparisons = savedUniversities
    .map((s) => {
      const uni = s.universities
      if (!uni?.[rangeKey]) return null
      const range = parseRange(uni[rangeKey])
      if (!range) return null
      const status = score < range.min ? 'below' : score > range.max ? 'above' : 'within'
      return { name: uni.name, range: uni[rangeKey], status }
    })
    .filter(Boolean)

  const below = comparisons.filter((c) => c.status === 'below')
  const within = comparisons.filter((c) => c.status === 'within')

  let headline
  if (comparisons.length === 0) {
    headline = 'Save a target school to see how this score compares.'
  } else if (below.length === 0) {
    headline = `Right in range for all ${comparisons.length} of your saved schools.`
  } else {
    headline = `Below range for ${below.length} of ${comparisons.length} saved schools.`
  }

  return { type, score, comparisons, within: within.length, below: below.length, headline }
}