import { supabase } from './supabase.js'

export async function requestEssayReview(studentId, essayId) {
  const { data, error } = await supabase
    .from('essay_reviews')
    .insert({ student_id: studentId, essay_id: essayId, status: 'requested' })
    .select('*')
    .single()
  if (error) throw error
  return data
}

export async function getEssayReview(essayId) {
  const { data, error } = await supabase
    .from('essay_reviews')
    .select('*')
    .eq('essay_id', essayId)
    .order('requested_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function getAllReviews(studentId) {
  const { data, error } = await supabase
    .from('essay_reviews')
    .select('*, essays(title, university)')
    .eq('student_id', studentId)
    .order('requested_at', { ascending: false })
  if (error) throw error
  return data
}