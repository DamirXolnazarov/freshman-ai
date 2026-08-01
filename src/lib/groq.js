const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'
const MODEL = 'llama-3.1-8b-instant'
const CURRENT_YEAR = new Date().getFullYear()

function buildSystemPrompt(studentName) {
  const nameLine = studentName
    ? `The student's name is ${studentName}. Use their first name naturally sometimes — when you greet
them, celebrate something, or ask a real question — the way a mentor who actually knows them would.
Don't force it into every message, and never use their full name repeatedly like a script.`
    : `You don't know the student's name yet. If it comes up naturally, remember it — otherwise don't ask
for it directly, just let it emerge from conversation.`

  return `You are Freshman AI, a college admissions advisor for Freshman Academy. You text like a smart,
direct human mentor — not like an AI assistant.

${nameLine}

STRICT RULES:
- 1-3 sentences per reply. Never more. No exceptions.
- Never use numbered lists, bullet points, or headers in chat. Ever.
- Never write "Freshman Year: 1. ... 2. ..." style plans. If a multi-step plan would help, say one
  sentence about it and tell them to ask you to "build my roadmap" — that's what the Roadmap page is for.
- No corporate/AI phrasing: never say "I'd be happy to," "Let's dive in," "Great question," "As an AI,"
  or similar filler. Just answer like a person would text a friend they're mentoring.
- Sound like you have opinions and instincts, not like you're reciting a guide.
- Never invent facts the student hasn't stated. If you can reasonably infer something (e.g. they're in
  11th grade, so they're likely applying on a normal timeline), say it back to confirm in one short
  line rather than assuming silently.
- If a student asks you to add something to their portfolio, don't say "I'll add it" — that's handled
  automatically. Just acknowledge naturally, e.g. "Nice — that's going straight into your portfolio."

Example of the right length and tone: "Got it — 9th grade, so you've got time. Best move right now
isn't SAT prep, it's finding one thing you actually care about and going deep on it. What are you into?"

Example of what NOT to do: any reply with numbered steps, multiple paragraphs, or a year-by-year plan.`
}

// Streams tokens via onToken(chunk). Resolves with the full text when done.
export async function chatWithAdvisorStream(history, onToken, studentName = null) {
  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: 'system', content: buildSystemPrompt(studentName) }, ...history],
      temperature: 0.6,
      max_tokens: 180,
      stream: true,
    }),
  })

  if (!res.ok || !res.body) {
    const errText = await res.text().catch(() => '')
    throw new Error(`Groq chat failed: ${res.status} ${errText}`)
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let full = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop()

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed.startsWith('data:')) continue
      const payload = trimmed.slice(5).trim()
      if (payload === '[DONE]') continue

      try {
        const json = JSON.parse(payload)
        const delta = json.choices?.[0]?.delta?.content
        if (delta) {
          full += delta
          onToken(delta)
        }
      } catch {
        // ignore malformed SSE fragments
      }
    }
  }

  return full
}

const EXTRACTION_SYSTEM_PROMPT = `You read a list of things a student has said to their college
advisor, across a conversation. Extract a cumulative snapshot of every fact EXPLICITLY stated in
these messages. Never guess or infer beyond what was actually said. If something was never
mentioned, use null or an empty array.

If the message is a greeting, small talk, or contains no genuine new information, return every
field as empty/null. Returning nothing is correct and expected for most casual messages — do not
invent an achievement, school, or fact to fill the schema.

These are the student's own words only — nothing from an advisor is included. Do not extract
anything that sounds like a suggestion, plan, or recommendation; only extract what the student
themselves claims about their own life, activities, stats, or goals.

Treat any acceptance, award, or accomplishment the student states as real, even if abbreviated or
unfamiliar to you (e.g. "accepted to YYGS") — don't require you to recognize the program by name.

Respond with ONLY raw JSON, no markdown fences, no preamble. Schema:

{
  "activities": [{ "title": string, "tags": string[], "summary": string, "impact": string, "skills": string[] }],
  "target_schools": string[],
  "honors": string[],
  "interests": string[],
  "major": string | null,
  "country": string | null,
  "city": string | null,
  "age": number | null,
  "grade_level": number | null,
  "gpa": string | null,
  "sat_score": string | null,
  "act_score": string | null
}

Tags for activities must be from: Leadership, Technology, Community, Academic, Arts, Athletics, Service.
Only include an activity if the student clearly describes doing it themselves — not a suggestion, not
a hypothetical, not something the advisor recommended.`

export async function extractProfileUpdate(conversationHistory) {
  const empty = {
    activities: [], target_schools: [], honors: [], interests: [],
    major: null, country: null, city: null, age: null, grade_level: null,
    gpa: null, sat_score: null, act_score: null,
  }

  const studentOnly = conversationHistory
    .filter((m) => m.role === 'user')
    .map((m) => `- ${m.content}`)
    .join('\n')

  if (!studentOnly.trim()) return empty

  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${GROQ_API_KEY}` },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: EXTRACTION_SYSTEM_PROMPT },
        { role: 'user', content: studentOnly },
      ],
      temperature: 0.1,
      max_tokens: 600,
    }),
  })

  if (!res.ok) return empty

  const data = await res.json()
  const raw = data.choices[0].message.content.trim()

  try {
    const clean = raw.replace(/```json|```/g, '').trim()
    return { ...empty, ...JSON.parse(clean) }
  } catch {
    return empty
  }
}

const EXPLICIT_ADD_PROMPT = `The student just explicitly asked to add something to their portfolio.
Look at their recent messages and find the most recent achievement, activity, acceptance, award, or
accomplishment they mentioned — even if it's just a short phrase like "I got accepted to YYGS" or an
acronym you don't fully recognize. Treat any acceptance, award, or accomplishment they state as real
and portfolio-worthy, even with minimal detail — don't require it to be spelled out in full.

Respond with ONLY raw JSON, no markdown fences, no preamble. Schema:

{
  "found": boolean,
  "title": string,
  "tags": string[],
  "summary": string,
  "impact": string,
  "skills": string[]
}

If truly nothing achievement-like appears in their recent messages, respond with exactly: {"found": false}`

export async function extractExplicitPortfolioRequest(recentUserMessages) {
  const empty = { found: false }
  const context = recentUserMessages.slice(-6).map((m) => `- ${m}`).join('\n')
  if (!context.trim()) return empty

  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${GROQ_API_KEY}` },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: EXPLICIT_ADD_PROMPT },
        { role: 'user', content: context },
      ],
      temperature: 0.2,
      max_tokens: 300,
    }),
  })

  if (!res.ok) return empty

  const data = await res.json()
  const raw = data.choices[0].message.content.trim()

  try {
    const clean = raw.replace(/```json|```/g, '').trim()
    return JSON.parse(clean)
  } catch {
    return empty
  }
}

const DOCUMENT_EXTRACTION_PROMPT = `You analyze the raw text of a student's resume or LinkedIn profile
export for Freshman Academy. Extract everything genuinely present — do not invent anything not in
the text.

CRITICAL DISTINCTION: schools/universities the student has ATTENDED or currently attends (their
education history — high school, current lyceum, etc.) are NOT target schools. Only include a school
in "target_schools" if the resume explicitly frames it as a goal, application, or aspiration
(e.g. "Applying to:", "Target schools:", "Dream school:"). Attended schools go in "education_history"
instead. When in doubt, treat a school as education history, not a target.

Respond with ONLY raw JSON, no markdown fences, no preamble. Schema:

{
  "activities": [{ "title": string, "tags": string[], "summary": string, "impact": string, "skills": string[] }],
  "education_history": [{ "school": string, "level": string }],
  "target_schools": string[],
  "honors": string[],
  "interests": string[],
  "major": string | null,
  "country": string | null,
  "city": string | null,
  "gpa": string | null,
  "sat_score": string | null,
  "act_score": string | null
}

Tags for activities must be from: Leadership, Technology, Community, Academic, Arts, Athletics, Service.
Include EVERY distinct role, project, internship, award, or leadership position found as a separate
activity — resumes often list several. "impact" should capture any quantifiable detail, else "".`

export async function extractProfileFromDocument(documentText) {
  const empty = {
    activities: [], education_history: [], target_schools: [], honors: [], interests: [],
    major: null, country: null, city: null, gpa: null, sat_score: null, act_score: null,
  }

  const trimmed = documentText.slice(0, 12000)

  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${GROQ_API_KEY}` },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: DOCUMENT_EXTRACTION_PROMPT },
        { role: 'user', content: trimmed },
      ],
      temperature: 0.1,
      max_tokens: 1200,
    }),
  })

  if (!res.ok) return empty

  const data = await res.json()
  const raw = data.choices[0].message.content.trim()

  try {
    const clean = raw.replace(/```json|```/g, '').trim()
    return { ...empty, ...JSON.parse(clean) }
  } catch {
    return empty
  }
}

export function enrollmentYearFromGrade(gradeLevel) {
  if (!gradeLevel || gradeLevel < 9 || gradeLevel > 12) return null
  const yearsToGraduation = 12 - gradeLevel
  return CURRENT_YEAR + yearsToGraduation + 1
}

const ROADMAP_STAGES = [
  'Academic',
  'Personal Story',
  'Activities',
  'University Strategy',
  'Application Materials',
  'Submit & Beyond',
]

const ROADMAP_SYSTEM_PROMPT = `You are an expert US/international college admissions strategist for
Freshman Academy. You'll receive a student's full profile (schools targeted, major, stats, activities,
demographics) as JSON. Generate a concrete, personalized roadmap of next steps.

Reason specifically about THIS student's actual gaps relative to their stated target schools and major
— e.g. a CS applicant to Harvard with no technical projects needs different advice than one with three.
Never give generic advice like "work hard" or "be yourself." If "detected_gaps" are provided in the input, prioritize steps that directly close those specific gaps — reference them concretely rather than repeating generic advice. Every step must be a specific, actionable
task tied to a real gap or opportunity in their profile.

Respond with ONLY raw JSON, no markdown fences, no preamble. Schema:

{
  "steps": [
    {
      "stage": one of ${JSON.stringify(ROADMAP_STAGES)},
      "title": string,
      "description": string
    }
  ]
}

Produce 2-4 steps per stage, 12-20 steps total, ordered by priority within each stage.`

export async function generateRoadmap(profile, portfolioItems, gaps = []) {
  const payload = {
    profile: {
      target_schools: profile?.target_schools || [],
      major: profile?.major || null,
      honors: profile?.honors || [],
      interests: profile?.interests || [],
      country: profile?.country || null,
      grade_level: profile?.grade_level || null,
      gpa: profile?.gpa || null,
      sat_score: profile?.sat_score || null,
      act_score: profile?.act_score || null,
    },
    activities: (portfolioItems || []).map((p) => ({
      title: p.title, tags: p.tags, summary: p.summary, impact: p.impact,
    })),
    detected_gaps: gaps.map((g) => ({ title: g.title, description: g.description, severity: g.severity })),
  }

  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${GROQ_API_KEY}` },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: ROADMAP_SYSTEM_PROMPT },
        { role: 'user', content: JSON.stringify(payload) },
      ],
      temperature: 0.4,
      max_tokens: 2000,
    }),
  })

  if (!res.ok) return { steps: [] }

  const data = await res.json()
  const raw = data.choices[0].message.content.trim()

  try {
    const clean = raw.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(clean)
    return { steps: parsed.steps || [] }
  } catch {
    return { steps: [] }
  }
}

const ESSAY_POLISH_PROMPT = `You improve the prose of a college application essay draft for Freshman
Academy. Keep the student's authentic voice, structure, and every fact/story exactly as written —
never invent new details or experiences. Tighten weak sentences, fix flow, and strengthen word choice
where it genuinely helps, without making it sound like someone else wrote it.

Respond with ONLY the improved essay text, no preamble, no markdown, no quotation marks around it.`

export async function polishEssay(content) {
  if (!content.trim()) return content

  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${GROQ_API_KEY}` },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: ESSAY_POLISH_PROMPT },
        { role: 'user', content },
      ],
      temperature: 0.5,
      max_tokens: 1500,
    }),
  })

  if (!res.ok) return content

  const data = await res.json()
  return data.choices[0].message.content.trim()
}

const POLISH_SYSTEM_PROMPT = `You improve the wording of a single college-application portfolio entry
for Freshman Academy. Keep all facts exactly as given — never invent new details, numbers, or claims.
Make the summary sound more specific, active, and admissions-ready (strong verbs, concrete outcomes),
while staying true to what was written.

Respond with ONLY raw JSON, no markdown fences, no preamble. Schema:

{ "title": string, "summary": string, "impact": string }`

export async function polishPortfolioItem(draft) {
  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${GROQ_API_KEY}` },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: POLISH_SYSTEM_PROMPT },
        { role: 'user', content: JSON.stringify({ title: draft.title, summary: draft.summary, impact: draft.impact }) },
      ],
      temperature: 0.5,
      max_tokens: 300,
    }),
  })

  if (!res.ok) return null

  const data = await res.json()
  const raw = data.choices[0].message.content.trim()

  try {
    const clean = raw.replace(/```json|```/g, '').trim()
    return JSON.parse(clean)
  } catch {
    return null
  }
}

const REMOVE_INTENT_PROMPT = `The student just asked to remove, delete, or take back something from their
portfolio — often because they said it was a mistake, exaggeration, or fake (e.g. "remove YYGS, it was fake",
"delete that startup thing", "take out the debate club one"). Identify which portfolio item title they mean,
matching loosely against the titles provided.

Respond with ONLY raw JSON, no markdown fences, no preamble. Schema:

{ "found": boolean, "matched_title": string }

If you can't confidently match their message to one of the provided titles, respond with exactly: {"found": false}`

export async function extractRemovalIntent(text, existingTitles) {
  const empty = { found: false }
  if (!existingTitles.length) return empty

  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${GROQ_API_KEY}` },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: REMOVE_INTENT_PROMPT },
        { role: 'user', content: `Message: "${text}"\n\nExisting portfolio titles:\n${existingTitles.map(t => `- ${t}`).join('\n')}` },
      ],
      temperature: 0.1,
      max_tokens: 150,
    }),
  })

  if (!res.ok) return empty
  const data = await res.json()
  const raw = data.choices[0].message.content.trim()

  try {
    const clean = raw.replace(/```json|```/g, '').trim()
    return JSON.parse(clean)
  } catch {
    return empty
  }
}