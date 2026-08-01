import { getSavedUniversities } from './universities.js'
import { getOpportunityApplications } from './opportunities.js'
import { getTasks } from './tasks.js'
import { getReminders } from './reminders.js'

export async function getCalendarEvents(studentId) {
  const [savedUnisResult, oppAppsResult, tasksResult, remindersResult] = await Promise.allSettled([
    getSavedUniversities(studentId),
    getOpportunityApplications(studentId),
    getTasks(studentId),
    getReminders(studentId),
  ])

  const savedUnis = savedUnisResult.status === 'fulfilled' ? savedUnisResult.value : []
  const oppApplications = oppAppsResult.status === 'fulfilled' ? oppAppsResult.value : []
  const taskList = tasksResult.status === 'fulfilled' ? tasksResult.value : []
  const reminderList = remindersResult.status === 'fulfilled' ? remindersResult.value : []

  const events = []

  savedUnis.forEach((s) => {
    const uni = s.universities
    if (!uni) return
    ;(uni.deadlines || []).forEach((d) => {
      events.push({ id: `uni-${uni.id}-${d.label}`, date: d.date, title: `${uni.name} — ${d.label}`, type: 'university' })
    })
  })

  oppApplications.forEach((app) => {
    if (!app.opportunity?.deadline) return
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

export function eventsForMonth(events, year, month) {
  return events.filter((e) => {
    const d = new Date(e.date)
    return d.getFullYear() === year && d.getMonth() === month
  })
}

export function eventsForDay(events, dateObj) {
  const key = dateObj.toISOString().slice(0, 10)
  return events.filter((e) => e.date === key)
}