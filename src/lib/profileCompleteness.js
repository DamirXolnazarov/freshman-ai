export function classOfFromEnrollment(enrollmentYear) {
  if (!enrollmentYear) return null
  return enrollmentYear + 4
}

export function computeCompleteness(profile, portfolioCount = 0) {
  if (!profile) return 0
  const checks = [
    profile.target_schools?.length > 0,
    profile.honors?.length > 0,
    profile.interests?.length > 0,
    !!profile.gpa,
    !!profile.sat_score,
    !!profile.act_score,
    !!profile.enrollment_year,
    portfolioCount > 0,
  ]
  const filled = checks.filter(Boolean).length
  return Math.round((filled / checks.length) * 100)
}

// Minimum bar for a *meaningfully specific* roadmap — not full completeness,
// just enough that the AI isn't generating generic filler.
export function roadmapReadinessGaps(profile, portfolioCount = 0) {
  const gaps = []
  if (!profile?.target_schools?.length) gaps.push({ key: 'target_schools', label: 'a target school or two' })
  if (!profile?.major && !profile?.interests?.length) gaps.push({ key: 'major', label: 'your intended major or field' })
  if (!profile?.grade_level && !profile?.enrollment_year) gaps.push({ key: 'grade_level', label: 'what grade you\'re in' })
  if (portfolioCount === 0) gaps.push({ key: 'activities', label: 'at least one activity or project' })
  return gaps
}