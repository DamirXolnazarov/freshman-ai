import { supabase } from './supabase.js'

export async function getOpportunities({ type = 'All' } = {}) {
  let q = supabase.from('opportunities').select('*').order('deadline', { ascending: true })
  if (type !== 'All') q = q.eq('type', type)
  const { data, error } = await q
  if (error) throw error
  return data
}

export async function getSavedOpportunities(studentId) {
  const { data, error } = await supabase
    .from('saved_opportunities')
    .select('*, opportunities(*)')
    .eq('student_id', studentId)
  if (error) throw error
  return data
}

export async function saveOpportunity(studentId, opportunityId) {
  const { data, error } = await supabase
    .from('saved_opportunities')
    .insert({ student_id: studentId, opportunity_id: opportunityId })
    .select('*, opportunities(*)')
    .single()
  if (error) throw error
  return data
}

export async function updateOpportunityStatus(id, status) {
  const { error } = await supabase.from('saved_opportunities').update({ status }).eq('id', id)
  if (error) throw error
}

export async function unsaveOpportunity(id) {
  const { error } = await supabase.from('saved_opportunities').delete().eq('id', id)
  if (error) throw error
}

// Scores each opportunity against the student's profile instead of hard
// filtering — a partial match (right major, wrong grade) still surfaces,
// just lower, rather than disappearing entirely.
export function scoreMatch(opportunity, profile) {
  if (!profile) return 50

  let score = 40
  const studentInterests = [profile.major, ...(profile.interests || [])].filter(Boolean).map((s) => s.toLowerCase())

  if (opportunity.majors?.length === 0) {
    score += 10
  } else if (studentInterests.length > 0) {
    const matches = opportunity.majors.filter((m) =>
      studentInterests.some((si) => m.toLowerCase().includes(si) || si.includes(m.toLowerCase()))
    )
    score += matches.length > 0 ? 35 : -15
  }

  if (opportunity.grade_levels?.length === 0 || (profile.grade_level && opportunity.grade_levels?.includes(profile.grade_level))) {
    score += 15
  } else if (profile.grade_level) {
    score -= 10
  }

  if (opportunity.countries?.length === 0) {
    score += 5
  } else if (profile.country && opportunity.countries?.includes(profile.country)) {
    score += 10
  } else if (profile.country) {
    score -= 5
  }

  return Math.max(5, Math.min(99, score))
}

export function daysUntilDeadline(dateStr) {
  if (!dateStr) return null
  const diff = new Date(dateStr) - new Date()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

// Deliberately minimal and universal — a scholarship might have no essay,
// a competition might have no recommendations. Only track what's true for
// every opportunity type: did you look at it, did you start, did you submit.
export const OPPORTUNITY_CHECKLIST_LABELS = {
  researched: 'Researched requirements',
  started: 'Application started',
  submitted: 'Submitted',
}

function opportunityChecklistProgress(checklist = {}) {
  const keys = Object.keys(OPPORTUNITY_CHECKLIST_LABELS)
  const done = keys.filter((k) => checklist[k]).length
  return Math.round((done / keys.length) * 100)
}

export async function getOpportunityApplications(studentId) {
  const saved = await getSavedOpportunities(studentId)

  return saved.map((s) => {
    const opp = s.opportunities
    return {
      savedId: s.id,
      opportunity: opp,
      checklist: s.checklist || {},
      progress: opportunityChecklistProgress(s.checklist || {}),
      daysUntil: daysUntilDeadline(opp.deadline),
    }
  })
}

export async function toggleOpportunityChecklistItem(savedId, currentChecklist, key) {
  const updated = { ...currentChecklist, [key]: !currentChecklist[key] }
  const { error } = await supabase.from('saved_opportunities').update({ checklist: updated }).eq('id', savedId)
  if (error) throw error
  return updated
}