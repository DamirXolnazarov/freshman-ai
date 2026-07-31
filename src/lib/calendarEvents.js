import { getReminders } from './reminders.js'

// add inside getCalendarEvents, alongside the existing Promise.all:
// (full updated function below — replace the existing one)
export async function getCalendarEvents(studentId) {
  const [savedUnis, oppApplications, taskList, reminderList] = await Promise.all([
    getSavedUniversities(studentId),
    getOpportunityApplications(studentId),
    getTasks(studentId),
    getReminders(studentId),
  ])

  const events = []

  savedUnis.forEach((s) => {
    const uni = s.universities
    if (!uni) return
    ;(uni.deadlines || []).forEach((d) => {
      events.push({ id: `uni-${uni.id}-${d.label}`, date: d.date, title: `${uni.name} — ${d.label}`, type: 'university' })
    })
  })

  oppApplications.forEach((app) => {
    if (!app.opportunity.deadline) return
    events.push({ id: `opp-${app.opportunity.id}`, date: app.opportunity.deadline, title: app.opportunity.name, type: 'opportunity' })
  })

  taskList.forEach((t) => {
    if (!t.due_date) return
    events.push({ id: `task-${t.id}`, date: t.due_date, title: t.title, type: 'task', done: t.status === 'done' })
  })

  reminderList.forEach((r) => {
    events.push({ id: `reminder-${r.id}`, date: r.event_date, title: r.event_time ? `${r.title} · ${r.event_time}` : r.title, type: 'reminder' })
  })

  return events
}