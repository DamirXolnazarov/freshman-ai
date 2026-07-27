import { useState, useEffect, useMemo } from 'react'
import Sidebar from '../components/layout/Sidebar.jsx'
import Card from '../components/ui/Card.jsx'
import FadeIn from '../components/ui/FadeIn.jsx'
import OpportunityCard from '../components/opportunities/OpportunityCard.jsx'
import { notify } from '../lib/toast.js'
import { supabase } from '../lib/supabase.js'
import {
  getOpportunities,
  getSavedOpportunities,
  saveOpportunity,
  unsaveOpportunity,
  scoreMatch,
} from '../lib/opportunities.js'

const TYPES = ['All', 'scholarship', 'competition', 'internship', 'summer_program', 'volunteering']
const TYPE_LABELS = {
  All: 'All',
  scholarship: 'Scholarships',
  competition: 'Competitions',
  internship: 'Internships',
  summer_program: 'Summer Programs',
  volunteering: 'Volunteering',
}

export default function OpportunitiesPage({ onNavigate, studentId }) {
  const [opportunities, setOpportunities] = useState([])
  const [saved, setSaved] = useState([])
  const [profile, setProfile] = useState(null)
  const [activeType, setActiveType] = useState('All')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!studentId) return
    async function load() {
      const [opps, savedOpps, { data: prof }] = await Promise.all([
        getOpportunities({}),
        getSavedOpportunities(studentId),
        supabase.from('student_profile').select('*').eq('student_id', studentId).maybeSingle(),
      ])
      setOpportunities(opps)
      setSaved(savedOpps)
      setProfile(prof)
      setLoading(false)
    }
    load()
  }, [studentId])

  const savedIds = useMemo(() => new Set(saved.map((s) => s.opportunity_id)), [saved])

  const ranked = useMemo(() => {
    return opportunities
      .filter((o) => activeType === 'All' || o.type === activeType)
      .map((o) => ({ ...o, matchScore: scoreMatch(o, profile) }))
      .sort((a, b) => b.matchScore - a.matchScore)
  }, [opportunities, activeType, profile])

  async function handleSave(opp) {
    try {
      const row = await saveOpportunity(studentId, opp.id)
      setSaved((prev) => [...prev, row])
      notify.success(`${opp.name} saved`)
    } catch (err) {
      notify.error("Couldn't save that — try again")
    }
  }

  async function handleRemove(opp) {
    const row = saved.find((s) => s.opportunity_id === opp.id)
    if (!row) return
    setSaved((prev) => prev.filter((s) => s.id !== row.id))
    await unsaveOpportunity(row.id)
  }

  const hasProfileSignal = profile?.major || profile?.interests?.length > 0

  return (
    <div className="flex h-screen bg-parchment-50">
      <Sidebar activePage="opportunities" onNavigate={onNavigate} />

      <main className="flex-1 min-w-0 overflow-y-auto px-8 py-7">
        <header>
          <h1 className="font-serif text-[24px] text-navy-900">Opportunities</h1>
          <p className="mt-1 text-[13.5px] text-ink-500">
            Scholarships, competitions, and programs — ranked by fit with your profile.
          </p>
        </header>

        {!loading && !hasProfileSignal && (
          <Card className="mt-5 p-4 shadow-panel bg-gold-500/[0.06] border border-gold-500/20">
            <p className="text-[12.5px] text-ink-700">
              Tell Freshman AI your intended major in chat and these matches will get a lot more specific.
            </p>
          </Card>
        )}

        <div className="mt-5 flex flex-wrap gap-1.5">
          {TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setActiveType(t)}
              className={`rounded-full border px-3 py-1 text-[12px] transition-colors ${
                activeType === t ? 'border-navy-900 bg-navy-900 text-parchment-50' : 'border-navy-900/12 text-ink-700'
              }`}
            >
              {TYPE_LABELS[t]}
            </button>
          ))}
        </div>

        {loading && <p className="mt-8 text-[13.5px] text-ink-500">Loading opportunities…</p>}

        {!loading && ranked.length === 0 && (
          <Card className="mt-6 p-10 text-center shadow-panel">
            <p className="font-serif text-[17px] text-navy-900">Nothing in this category yet</p>
          </Card>
        )}

        {!loading && ranked.length > 0 && (
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {ranked.map((opp, i) => (
              <FadeIn key={opp.id} index={i}>
                <OpportunityCard
                  opportunity={opp}
                  matchScore={hasProfileSignal ? opp.matchScore : null}
                  saved={savedIds.has(opp.id)}
                  onSave={() => handleSave(opp)}
                  onRemove={() => handleRemove(opp)}
                />
              </FadeIn>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}