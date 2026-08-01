import { supabase } from './supabase.js'
import { findBestMatch } from './fuzzyMatch.js'

const REMOVE_TASK_INTENT = /\b(remove|delete|cancel)\b.*\btask\b/i
const CREATE_TASK_EXPLICIT = /\bcreate a task\b|\badd a task\b/i

export function detectRemoveTaskIntent(text) {
  return REMOVE_TASK_INTENT.test(text)
}

export function detectExplicitCreateTaskIntent(text) {
  return CREATE_TASK_EXPLICIT.test(text)
}

export async function findMatchingTask(studentId, text) {
  const { data: tasks } = await supabase.from('tasks').select('id, title').eq('student_id', studentId).eq('status', 'todo')
  if (!tasks?.length) return null

  const result = findBestMatch(text, tasks, (t) => t.title)
  return result ? { ...result.match, confidence: result.confidence } : null
}

export async function deleteTaskById(id) {
  const { error } = await supabase.from('tasks').delete().eq('id', id)
  if (error) throw error
}