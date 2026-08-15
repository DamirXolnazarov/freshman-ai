import { supabase } from './supabase.js'
import { findBestMatch } from './fuzzyMatch.js'

const REMOVE_TASK_INTENT = /\b(remove|delete|cancel)\b.*\btask\b/i
const CREATE_TASK_EXPLICIT = /\bcreate a task\b|\badd a task\b/i
const COMPLETE_TASK_INTENT = /\bi (just )?(finished|completed|did|checked off)\b|\bmark(ed)?\b.*\b(done|complete)\b|\bcheck(ed)?\s+off\b|\bdone with\b/i
const UNCOMPLETE_TASK_INTENT = /\b(reopen|undo|not done|mark.*(incomplete|undone|todo)|un-?complete)\b/i
const CREATION_LANGUAGE = /\bremind me\b|\bneed to\b|\bhave to\b|\bwant to\b|\bgoing to\b|\bcreate a task\b|\badd a task\b/i

export function detectRemoveTaskIntent(text) {
  return REMOVE_TASK_INTENT.test(text)
}

export function detectExplicitCreateTaskIntent(text) {
  return CREATE_TASK_EXPLICIT.test(text)
}

export function detectCompleteTaskIntent(text) {
  if (CREATION_LANGUAGE.test(text)) return false
  return COMPLETE_TASK_INTENT.test(text) && !UNCOMPLETE_TASK_INTENT.test(text)
}

export function detectUncompleteTaskIntent(text) {
  return UNCOMPLETE_TASK_INTENT.test(text)
}

export async function findMatchingTask(studentId, text) {
  const { data: tasks } = await supabase.from('tasks').select('id, title').eq('student_id', studentId).eq('status', 'todo')
  if (!tasks?.length) return null

  const result = findBestMatch(text, tasks, (t) => t.title)
  return result ? { ...result.match, confidence: result.confidence } : null
}

// Same fuzzy-match pattern as findMatchingTask, but scoped to a specific
// status — used for completing a 'todo' task or reopening a 'done' one.
export async function findMatchingTaskByStatus(studentId, text, status) {
  const { data: tasks } = await supabase.from('tasks').select('id, title').eq('student_id', studentId).eq('status', status)
  if (!tasks?.length) return null

  const result = findBestMatch(text, tasks, (t) => t.title)
  return result ? { ...result.match, confidence: result.confidence } : null
}

export async function deleteTaskById(id) {
  const { error } = await supabase.from('tasks').delete().eq('id', id)
  if (error) throw error
}