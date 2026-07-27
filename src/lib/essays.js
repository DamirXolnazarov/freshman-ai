import { supabase } from './supabase.js'

export async function getEssays(studentId) {
  const { data, error } = await supabase
    .from('essays')
    .select('*')
    .eq('student_id', studentId)
    .order('updated_at', { ascending: false })
  if (error) throw error
  return data
}

export async function createEssay(studentId, fields = {}) {
  const { data, error } = await supabase
    .from('essays')
    .insert({
      student_id: studentId,
      title: fields.title || 'Untitled essay',
      university: fields.university || '',
      prompt: fields.prompt || '',
      content: fields.content || '',
    })
    .select('*')
    .single()
  if (error) throw error
  return data
}

export async function updateEssay(id, patch) {
  const { data, error } = await supabase
    .from('essays')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('*')
    .single()
  if (error) throw error
  return data
}

export async function deleteEssay(id) {
  const { error } = await supabase.from('essays').delete().eq('id', id)
  if (error) throw error
}

export function wordCount(text = '') {
  return text.trim() ? text.trim().split(/\s+/).length : 0
}