import { supabase } from './supabase.js'
import { findBestMatch } from './fuzzyMatch.js'

const REMOVE_INTENT = /\b(remove|delete)\b.*\b(from (my )?portfolio|portfolio (item|entry))\b/i

export function detectRemoveIntent(text) {
  return REMOVE_INTENT.test(text)
}

export async function findMatchingPortfolioItem(studentId, text) {
  const { data: items } = await supabase.from('portfolio_items').select('id, title').eq('student_id', studentId)
  if (!items?.length) return null

  const result = findBestMatch(text, items, (i) => i.title)
  return result ? { ...result.match, confidence: result.confidence } : null
}

export async function deletePortfolioItem(id) {
  const { error } = await supabase.from('portfolio_items').delete().eq('id', id)
  if (error) throw error
}