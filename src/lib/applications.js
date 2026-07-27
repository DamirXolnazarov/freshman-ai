import { getSavedUniversities, updateSavedUniversity, checklistProgress, CHECKLIST_LABELS } from './universities.js'
import { getEssays } from './essays.js'

export async function getApplications(studentId) {
  const [saved, essays] = await Promise.all([
    getSavedUniversities(studentId),
    getEssays(studentId),
  ])

  return saved.map((s) => {
    const uni = s.universities
    const linkedEssays = essays.filter((e) => e.university === uni.name)
    const nextDeadline = pickNextDeadline(uni.deadlines)

    return {
      savedId: s.id,
      university: uni,
      category: s.category,
      checklist: s.checklist || {},
      progress: checklistProgress(s.checklist || {}),
      essays: linkedEssays,
      nextDeadline,
      daysUntil: nextDeadline ? daysUntil(nextDeadline.date) : null,
    }
  })
}

function pickNextDeadline(deadlines = []) {
  const today = new Date()
  const upcoming = deadlines
    .map((d) => ({ ...d, dateObj: new Date(d.date) }))
    .filter((d) => d.dateObj >= today)
    .sort((a, b) => a.dateObj - b.dateObj)
  return upcoming[0] || null
}

function daysUntil(dateStr) {
  const diff = new Date(dateStr) - new Date()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export async function toggleChecklistItem(savedId, currentChecklist, key) {
  const updated = { ...currentChecklist, [key]: !currentChecklist[key] }
  await updateSavedUniversity(savedId, { checklist: updated })
  return updated
}

export { CHECKLIST_LABELS }