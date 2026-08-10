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
  // work / employment language — was missing entirely, so job mentions
  // like "I was a senior software engineer at X" never got flagged
  'worked', 'work', 'working', 'job', 'position', 'employed', 'employee',
  'engineer', 'developer', 'designer', 'analyst', 'manager', 'intern',
  'freelance', 'contractor', 'consultant', 'senior', 'junior', 'lead engineer',
]

const SMALL_TALK = /^(hi|hey|hello|yo|sup|thanks|thank you|ok|okay|cool|nice|great|good|sure|yes|no|yep|nope|lol|haha|bye|goodnight|good morning|good night|how are you|what's up|whats up)\b/i

// Short confirmations that should be treated as "yes, add the pending
// suggestion" rather than as a normal chat message. Deliberately does
// NOT require the word "portfolio" — that's the whole bug.
const AFFIRM_ADD = /^(add it|add that|add this|yes,?( please)?( add it)?|do it|please add( it)?|confirm|yep,?( add it)?|sure,?( add it)?|go ahead)\.?$/i

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

export function isAffirmAdd(text) {
  return AFFIRM_ADD.test(text.trim())
}