import { supabase } from './supabase.js'
import { groqFetch, MODEL } from './groq.js'

const CORRECTION_SIGNAL = /\b(not|actually|correct|wrong|change|update|fix|i meant|i am|i'm)\b/i

export function detectProfileCorrection(text) {
  return CORRECTION_SIGNAL.test(text)
}

const CORRECTION_PROMPT = `The student is correcting or updating a fact about themselves — e.g. their
grade, graduation year, GPA, major, target school, or a similar profile field. Identify exactly what
they want changed and to what value.

Only these fields are valid: grade_level (9-12), enrollment_year (4-digit year they start college),
major (string), gpa (string), sat_score (string), act_score (string), country (string), city (string).

Respond with ONLY raw JSON, no markdown fences, no preamble. Schema:

{ "found": boolean, "field": string | null, "value": string | number | null }

If the message isn't actually correcting a profile field, respond with exactly: {"found": false}`

export async function extractProfileCorrection(text) {
  const empty = { found: false }

  const res = await groqFetch({
    model: MODEL,
    messages: [
      { role: 'system', content: CORRECTION_PROMPT },
      { role: 'user', content: text },
    ],
    temperature: 0.1,
    max_tokens: 150,
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

const NUMERIC_FIELDS = new Set(['grade_level', 'enrollment_year'])

export async function applyProfileCorrection(studentId, field, value) {
  const patch = { [field]: NUMERIC_FIELDS.has(field) ? parseInt(value, 10) : value, updated_at: new Date().toISOString() }
  const { error } = await supabase.from('student_profile').update(patch).eq('student_id', studentId)
  if (error) throw error
  return patch
}