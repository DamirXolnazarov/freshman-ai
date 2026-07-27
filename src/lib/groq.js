const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'
const MODEL = 'llama-3.1-8b-instant'
const CURRENT_YEAR = new Date().getFullYear()

const SYSTEM_PROMPT = `You are Freshman AI, a warm but sharp college admissions advisor for Freshman Academy.
Talk like a real mentor: specific, encouraging, never generic. 2-4 sentences unless asked for more.

Never invent facts the student hasn't stated. But when you can reasonably infer something practical
(e.g. they're in 11th grade, so they'd likely apply and enroll on a normal timeline), say it back to
confirm rather than assuming silently — e.g. "So you'd be applying this fall, aiming to start next
year — does that sound right?" This makes your understanding visible and correctable.`

// Streams tokens via onToken(chunk). Resolves with the full text when done.
export async function chatWithAdvisorStream(history, onToken) {
  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...history],
      temperature: 0.5,
      max_tokens: 400,
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

const EXTRACTION_SYSTEM_PROMPT = `You analyze a FULL conversation between Freshman AI and a student.
Extract a cumulative snapshot of every fact the student has explicitly stated across all their
messages so far. Never guess or infer beyond what was actually said. If something was never
mentioned, use null or an empty array.

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
Only include an activity if it's a genuine achievement/project/leadership role, not a passing mention.`

export async function extractProfileUpdate(conversationHistory) {
  const empty = {
    activities: [], target_schools: [], honors: [], interests: [],
    major: null, country: null, city: null, age: null, grade_level: null,
    gpa: null, sat_score: null, act_score: null,
  }

  const transcript = conversationHistory
    .map((m) => `${m.role === 'user' ? 'Student' : 'Advisor'}: ${m.content}`)
    .join('\n')

  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${GROQ_API_KEY}` },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: EXTRACTION_SYSTEM_PROMPT },
        { role: 'user', content: transcript },
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
  "education_history": [{ "school": string, "level": string }],  // level e.g. "High School", "Lyceum"
  "target_schools": string[],   // ONLY explicit application/aspiration targets, never attended schools
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
Never give generic advice like "work hard" or "be yourself." Every step must be a specific, actionable
task tied to a real gap or opportunity in their profile.

Respond with ONLY raw JSON, no markdown fences, no preamble. Schema:

{
  "steps": [
    {
      "stage": one of ${JSON.stringify(ROADMAP_STAGES)},
      "title": string,          // short, e.g. "Find a CS research program"
      "description": string     // 1-2 sentences, specific to this student's profile
    }
  ]
}

Produce 2-4 steps per stage, 12-20 steps total, ordered by priority within each stage.`

export async function generateRoadmap(profile, portfolioItems) {
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