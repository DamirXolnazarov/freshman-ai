// Pure function: no network calls, no side effects. Takes what's already
// loaded (profile, portfolio, saved universities) and reasons over real
// numbers to produce specific, named gaps — not generic advice.

function parseRange(rangeStr) {
  // handles "1400-1550" style strings from universities.sat_range/act_range
  if (!rangeStr) return null
  const match = rangeStr.match(/(\d+)\s*-\s*(\d+)/)
  if (!match) return null
  return { min: parseInt(match[1], 10), max: parseInt(match[2], 10) }
}

const STEM_KEYWORDS = ['computer science', 'engineering', 'cs', 'data science', 'math', 'physics', 'biology', 'chemistry']

function isStemMajor(major) {
  if (!major) return false
  const lower = major.toLowerCase()
  return STEM_KEYWORDS.some((k) => lower.includes(k))
}

export function computeGaps(profile, portfolioItems = [], savedUniversities = [], programData = []) {
  const gaps = []
  const studentSat = profile?.sat_score ? parseInt(profile.sat_score, 10) : null
  const studentAct = profile?.act_score ? parseInt(profile.act_score, 10) : null

  async function checkProgramGap(supabase, uni, major) {
  if (!major) return null
  const { data } = await supabase
    .from('university_programs')
    .select('*')
    .eq('university_id', uni.id)
    .ilike('major', `%${major}%`)
    .maybeSingle()
  return data || null
}



  // --- Score gaps, per target school ---
  savedUniversities.forEach((s) => {
    const uni = s.universities
    if (!uni) return

    if (studentSat && uni.sat_range) {
      const range = parseRange(uni.sat_range)
      if (range && studentSat < range.min) {
        gaps.push({
          key: `sat-${uni.id}`,
          severity: range.min - studentSat > 100 ? 'high' : 'medium',
          title: `SAT below ${uni.name}'s typical range`,
          description: `${uni.name} admits typically score ${uni.sat_range}. Your current ${studentSat} is below that — SAT prep or a retake would close this gap.`,
          type: 'score',
        })
      }
    }

    if (!studentSat && studentAct && uni.act_range) {
      const range = parseRange(uni.act_range)
      if (range && studentAct < range.min) {
        gaps.push({
          key: `act-${uni.id}`,
          severity: range.min - studentAct > 3 ? 'high' : 'medium',
          title: `ACT below ${uni.name}'s typical range`,
          description: `${uni.name} admits typically score ${uni.act_range}. Your current ${studentAct} is below that.`,
          type: 'score',
        })
      }
    }
  })

  // --- Activity depth vs stated major ---
  if (profile?.major && isStemMajor(profile.major)) {
    const hasTechnicalActivity = portfolioItems.some((p) =>
      (p.tags || []).includes('Technology') || (p.tags || []).includes('Academic')
    )
    if (!hasTechnicalActivity) {
      gaps.push({
        key: 'no-technical-activity',
        severity: 'high',
        title: `No technical project for a ${profile.major} applicant`,
        description: `You're targeting ${profile.major}, but your portfolio has no research, project, or technical activity yet — this is one of the first things admissions officers look for.`,
        type: 'activity',
      })
    }
  }

  // --- Program-specific admit rate, when we actually have verified data ---
  if (profile?.major) {
    savedUniversities.forEach((s) => {
      const uni = s.universities
      if (!uni) return
      const program = programData.find(
        (p) => p.university_id === uni.id && p.major.toLowerCase().includes(profile.major.toLowerCase())
      )
      if (program?.admit_rate != null) {
        gaps.push({
          key: `program-rate-${uni.id}`,
          severity: program.admit_rate < 10 ? 'high' : program.admit_rate < 20 ? 'medium' : 'low',
          title: `${profile.major} at ${uni.name} admits at ${program.admit_rate}%`,
          description: `This program is more selective than ${uni.name}'s overall admit rate — worth treating it as a reach unless your activities and stats are well above their general range.`,
          type: 'program',
        })
      }
    })
  }

  // --- Thin portfolio overall ---
  
  if (portfolioItems.length < 3 && (profile?.target_schools?.length || 0) > 0) {
    gaps.push({
      key: 'thin-portfolio',
      severity: portfolioItems.length === 0 ? 'high' : 'medium',
      title: portfolioItems.length === 0 ? 'No activities in your portfolio yet' : 'Portfolio is still thin',
      description: `Only ${portfolioItems.length} ${portfolioItems.length === 1 ? 'activity is' : 'activities are'} documented. Competitive applicants to your target schools typically show 4-6 substantial activities.`,
      type: 'activity',
    })
  }

  // --- No honors/awards ---
  if ((profile?.honors?.length || 0) === 0 && (profile?.target_schools?.length || 0) > 0) {
    gaps.push({
      key: 'no-honors',
      severity: 'low',
      title: 'No honors or awards yet',
      description: 'A competition win or academic honor would meaningfully strengthen your applications — worth checking Opportunities for something in your field.',
      type: 'honors',
    })
  }

  const order = { high: 0, medium: 1, low: 2 }
  return gaps.sort((a, b) => order[a.severity] - order[b.severity])
}

export function topGap(gaps) {
  return gaps[0] || null
}