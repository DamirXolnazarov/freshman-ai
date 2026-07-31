// Placeholder mapping until the Freshman Academy YouTube channel is wired
// with real video IDs. Add entries as videos go live — matching is by
// simple keyword overlap against the student's message, deliberately
// conservative so it only suggests when there's a real topical match.
export const FRESHMAN_VIDEOS = [
  // { keywords: ['personal statement', 'common app essay'], videoId: 'XXXXXXXXXXX', title: 'How to write your Common App essay' },
  // { keywords: ['sat', 'test prep'], videoId: 'XXXXXXXXXXX', title: 'SAT prep strategy' },
]

export function findRelevantVideo(text) {
  const lower = text.toLowerCase()
  return FRESHMAN_VIDEOS.find((v) => v.keywords.some((k) => lower.includes(k))) || null
}