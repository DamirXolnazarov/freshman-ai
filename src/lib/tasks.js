import { supabase } from './supabase.js'

export async function getTasks(studentId) {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('student_id', studentId)
    .order('due_date', { ascending: true, nullsFirst: false })
  if (error) throw error
  return data
}

export async function createTask(studentId, fields) {
  const { data, error } = await supabase
    .from('tasks')
    .insert({
      student_id: studentId,
      title: fields.title,
      notes: fields.notes || '',
      due_date: fields.due_date || null,
    })
    .select('*')
    .single()
  if (error) throw error
  return data
}

export async function updateTask(id, patch) {
  const { data, error } = await supabase.from('tasks').update(patch).eq('id', id).select('*').single()
  if (error) throw error
  return data
}

export async function deleteTask(id) {
  const { error } = await supabase.from('tasks').delete().eq('id', id)
  if (error) throw error
}

export async function toggleTaskStatus(id, currentStatus) {
  return updateTask(id, { status: currentStatus === 'done' ? 'todo' : 'done' })
}