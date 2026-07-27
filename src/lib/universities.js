import { supabase } from './supabase.js'

export async function searchUniversities({ query = '', country = 'All' } = {}) {
  let q = supabase.from('universities').select('*').order('name', { ascending: true })
  if (country !== 'All') q = q.eq('country', country)
  if (query.trim()) q = q.ilike('name', `%${query.trim()}%`)
  const { data, error } = await q
  if (error) throw error
  return data
}

export async function getSavedUniversities(studentId) {
  const { data, error } = await supabase
    .from('saved_universities')
    .select('*, universities(*)')
    .eq('student_id', studentId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function saveUniversity(studentId, universityId, category = 'target') {
  const { data, error } = await supabase
    .from('saved_universities')
    .insert({ student_id: studentId, university_id: universityId, category })
    .select('*, universities(*)')
    .single()
  if (error) throw error
  return data
}

export async function updateSavedUniversity(id, patch) {
  const { error } = await supabase.from('saved_universities').update(patch).eq('id', id)
  if (error) throw error
}

export async function removeSavedUniversity(id) {
  const { error } = await supabase.from('saved_universities').delete().eq('id', id)
  if (error) throw error
}

export const CHECKLIST_LABELS = {
  research: 'Research',
  list: 'Added to list',
  application: 'Application started',
  essay: 'Personal essay',
  supplements: 'Supplements',
  recommendations: 'Recommendations',
  financial_aid: 'Financial aid',
  submitted: 'Submitted',
}

export function checklistProgress(checklist = {}) {
  const keys = Object.keys(CHECKLIST_LABELS)
  const done = keys.filter((k) => checklist[k]).length
  return Math.round((done / keys.length) * 100)
}