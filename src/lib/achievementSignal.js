// Cheap, local pre-filter — runs before any Groq call. If a message
// doesn't plausibly describe an achievement, activity, or accomplishment,
// there is nothing to extract, so we never even ask the model. This is
// what actually stops hallucination: a small model asked "did they
// mention an achievement?" on the word "hello" will sometimes just
// invent one rather than say no. Not asking is the fix.
const ACHIEVEMENT_KEYWORDS = [
  'won', 'award', 'founded', 'founder', 'built', 'build', 'led', 'lead', 'organized',
  'organize', 'competition', 'olympiad', 'member', 'president', 'captain', 'internship',
  'volunteer', 'published', 'publish', 'created', 'create', 'launched', 'launch',
  'certified', 'certificate', 'ranked', 'rank', 'place', 'medal', 'scholarship',
  'accepted', 'admitted', 'participated', 'participate', 'club', 'team', 'project',
  'hackathon', 'research', 'internship', 'startup', 'company', 'nonprofit', 'raised',
  'first place', 'runner-up', 'finalist', 'qualified', 'selected', 'elected',
]

const SMALL_TALK = /^(hi|hey|hello|yo|sup|thanks|thank you|ok|okay|cool|nice|great|good|sure|yes|no|yep|nope|lol|haha|bye|goodnight|good morning|good night|how are you|what's up|whats up)\b/i

export function isSmallTalk(text) {
  const trimmed = text.trim()
  if (trimmed.split(/\s+/).length <= 3) {
    return SMALL_TALK.test(trimmed) || trimmed.length < 12
  }
  return SMALL_TALK.test(trimmed)
}

export function mayContainAchievement(text) {
  if (isSmallTalk(text)) return false
  const lower = text.toLowerCase()
  return ACHIEVEMENT_KEYWORDS.some((k) => lower.includes(k))
}