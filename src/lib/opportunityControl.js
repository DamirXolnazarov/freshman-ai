import { supabase } from './supabase.js'
import { findBestMatch } from './fuzzyMatch.js'
import { getOpportunities, saveOpportunity, unsaveOpportunity, getSavedOpportunities } from './opportunities.js'

const REMOVE_OPP_INTENT = /\b(remove|delete|unsave)\b.*\b(from (my )?opportunities|opportunity)\b/i
const SAVE_OPP_INTENT = /\bsave\b.*\bopportunity\b|\badd\b.*\bopportunity\b/i

export function detectRemoveOpportunityIntent(text) {
  return REMOVE_OPP_INTENT.test(text)
}
export function detectSaveOpportunityIntent(text) {
  return SAVE_OPP_INTENT.test(text)
}

export async function findMatchingSavedOpportunity(studentId, text) {
  const saved = await getSavedOpportunities(studentId)
  if (!saved.length) return null
  const result = findBestMatch(text, saved, (s) => s.opportunities?.name || '')
  return result ? { savedId: result.match.id, name: result.match.opportunities?.name, confidence: result.confidence } : null
}

export async function findMatchingOpportunity(text) {
  const all = await getOpportunities({})
  if (!all.length) return null
  const result = findBestMatch(text, all, (o) => o.name)
  return result ? { ...result.match, confidence: result.confidence } : null
}

export async function removeSavedOpportunity(savedId) {
  await unsaveOpportunity(savedId)
}

export async function addOpportunity(studentId, opportunityId) {
  return saveOpportunity(studentId, opportunityId)
}