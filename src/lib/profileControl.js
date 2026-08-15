import { supabase } from './supabase.js'
import { groqFetch, MODEL } from './groq.js'

const CORRECTION_SIGNAL = /\b(not|actually|correct|wrong|change|update|fix|i meant|i am|i'm|my|add|remove)\b/i

export function detectProfileCorrection(text) {
  return CORRECTION_SIGNAL.test(text)
}

const CORRECTION_PROMPT = `The student is correcting, updating, or adding to a fact about themselves —
e.g. their grade, graduation year, age, GPA, major, location, target schools, honors, or interests.
Identify exactly what they want changed and to what value.

There are two kinds of fields:

SCALAR fields (a single value that gets replaced): grade_level, enrollment_year, age, major, gpa,
sat_score, act_score, country, city

LIST fields (an item gets added to or removed from a list): target_schools, honors, interests

Field notes:
- "class of 2032", "graduating in 2032", "graduation year 2032" all map to field "enrollment_year"
  with value 2032 — there is no separate "graduation_year" field, use enrollment_year for all of these.
- "I'm 16", "I turned 17" map to field "age" with a numeric value.
- "I'm a junior" = grade_level 11, "I'm a senior" = grade_level 12, "sophomore" = 10, "freshman" = 9.
- "add Yale to my target schools", "I'm applying to MIT now" map to field "target_schools",
  fieldType "list", action "add", value "Yale" / "MIT".
- "remove Harvard from my target schools", "not applying to Harvard anymore" map to field
  "target_schools", fieldType "list", action "remove", value "Harvard".
- Same add/remove pattern applies to "honors" (awards, honors, recognitions) and "interests"
  (hobbies, subjects, activities they're interested in).

Respond with ONLY raw JSON, no markdown fences, no preamble. Schema:

{
  "found": boolean,
  "field": string | null,
  "fieldType": "scalar" | "list" | null,
  "action": "add" | "remove" | null,
  "value": string | number | null
}

For scalar fields, omit "action" (set it null). If the message isn't actually correcting or adding a
profile field, respond with exactly: {"found": false}`

export async function extractProfileCorrection(text) {
  const empty = { found: false }

  const res = await groqFetch({
    model: MODEL,
    messages: [
      { role: 'system', content: CORRECTION_PROMPT },
      { role: 'user', content: text },
    ],
    temperature: 0.1,
    max_tokens: 200,
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

const VALID_SCALAR_FIELDS = new Set([
  'grade_level', 'enrollment_year', 'age', 'major', 'gpa', 'sat_score', 'act_score', 'country', 'city',
])

const VALID_LIST_FIELDS = new Set(['target_schools', 'honors', 'interests'])

const NUMERIC_FIELDS = new Set(['grade_level', 'enrollment_year', 'age'])

export async function applyProfileCorrection(studentId, correction) {
  const { field, fieldType, action, value } = correction

  if (fieldType === 'list') {
    if (!VALID_LIST_FIELDS.has(field)) {
      throw new Error(`Invalid list field from extraction: ${field}`)
    }
    if (!value || typeof value !== 'string') {
      throw new Error(`Invalid list value from extraction: ${value}`)
    }

    const { data: current, error: fetchError } = await supabase
      .from('student_profile')
      .select(field)
      .eq('student_id', studentId)
      .maybeSingle()

    if (fetchError) throw fetchError

    const existingList = current?.[field] || []
    const normalizedValue = value.trim()

    let newList
    if (action === 'remove') {
      newList = existingList.filter((item) => item.toLowerCase() !== normalizedValue.toLowerCase())
    } else {
      const alreadyThere = existingList.some((item) => item.toLowerCase() === normalizedValue.toLowerCase())
      newList = alreadyThere ? existingList : [...existingList, normalizedValue]
    }

    const patch = { [field]: newList, updated_at: new Date().toISOString() }

    const { data, error } = await supabase
      .from('student_profile')
      .upsert({ student_id: studentId, ...patch }, { onConflict: 'student_id' })
      .select()

    if (error) throw error
    if (!data?.length) throw new Error('Profile list correction upsert returned no rows')

    return patch
  }

  // scalar path
  if (!VALID_SCALAR_FIELDS.has(field)) {
    throw new Error(`Invalid profile field from extraction: ${field}`)
  }

  const patch = {
    [field]: NUMERIC_FIELDS.has(field) ? parseInt(value, 10) : value,
    updated_at: new Date().toISOString(),
  }

  const { data, error } = await supabase
    .from('student_profile')
    .upsert({ student_id: studentId, ...patch }, { onConflict: 'student_id' })
    .select()

  if (error) throw error
  if (!data?.length) throw new Error('Profile correction upsert returned no rows')

  return patch
}