import { supabase } from './supabase.js'

export async function createReminder(studentId, fields) {
  const { data, error } = await supabase
    .from('reminders')
    .insert({ student_id: studentId, title: fields.title, event_date: fields.date, event_time: fields.time })
    .select('*')
    .single()
  if (error) throw error
  return data
}

export async function getReminders(studentId) {
  const { data, error } = await supabase
    .from('reminders')
    .select('*')
    .eq('student_id', studentId)
    .order('event_date', { ascending: true })
  if (error) throw error
  return data
}