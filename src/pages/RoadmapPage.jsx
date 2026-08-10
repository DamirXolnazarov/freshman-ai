import { useState, useEffect } from 'react'
import { BookOpen, Sprout, ShieldCheck, Building2, Compass, Flag, Check } from 'lucide-react'
import Sidebar from '../components/layout/Sidebar.jsx'
import Card from '../components/ui/Card.jsx'
import JourneyPillars from '../components/dashboard/JourneyPillars.jsx'
import RoadmapPlayground from '../components/roadmap/RoadmapPlayground.jsx'
import { supabase } from '../lib/supabase.js'
import ChatBackground from '../components/chat/ChatBackground.jsx'
import { generateRoadmap } from '../lib/groq.js'

const STAGE_META = {
  'Academic': { icon: BookOpen, tone: 'navy' },
  'Personal Story': { icon: Sprout, tone: 'plum' },
  'Activities': { icon: ShieldCheck, tone: 'sage' },
  'University Strategy': { icon: Building2, tone: 'gold' },
  'Application Materials': { icon: Compass, tone: 'skyline' },
  'Submit & Beyond': { icon: Flag, tone: 'muted' },
}
const STAGE_ORDER = Object.keys(STAGE_META)

export default function RoadmapPage({ onNavigate, studentId, autoGenerate, onAutoGenerateHandled }) {
  const [steps, setSteps] = useState([])
  const [loading, setLoading] = useState(true)
  const [animating, setAnimating] = useState(false)
  const [pendingSteps, setPendingSteps] = useState(null)

  useEffect(() => {
    if (!studentId) return
    async function load() {
      const { data } = await supabase
        .from('roadmap_steps')
        .select('*')
        .eq('student_id', studentId)
        .order('order_index', { ascending: true })
      setSteps(data || [])
      setLoading(false)
    }
    load()
  }, [studentId])

  useEffect(() => {
    if (autoGenerate && !loading) {
      handleGenerate()
      onAutoGenerateHandled?.()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoGenerate, loading])

  async function handleGenerate() {
    setAnimating(true)

    const [{ data: profile }, { data: portfolioItems }] = await Promise.all([
      supabase.from('student_profile').select('*').eq('student_id', studentId).maybeSingle(),
      supabase.from('portfolio_items').select('*').eq('student_id', studentId),
    ])

    const { steps: generatedSteps } = await generateRoadmap(profile, portfolioItems)

    if (generatedSteps.length > 0) {
      await supabase.from('roadmap_steps').delete().eq('student_id', studentId)
      const rows = generatedSteps.map((s, i) => ({
        student_id: studentId,
        stage: s.stage,
        title: s.title,
        description: s.description,
        status: 'pending',
        order_index: i,
      }))
      const { data: inserted } = await supabase.from('roadmap_steps').insert(rows).select('*')
      setPendingSteps(inserted || [])
    } else {
      setPendingSteps([])
    }
    // reveal happens when the user clicks "Check it out"
  }

  function handleAnimationComplete() {
    setAnimating(false)
    if (pendingSteps) {
      setSteps(pendingSteps)
      setPendingSteps(null)
    }
  }

  async function toggleStatus(step) {
    const next = step.status === 'done' ? 'pending' : step.status === 'pending' ? 'in_progress' : 'done'
    setSteps((prev) => prev.map((s) => (s.id === step.id ? { ...s, status: next } : s)))
    await supabase.from('roadmap_steps').update({ status: next }).eq('id', step.id)
  }

  const pillars = STAGE_ORDER.map((stage) => {
    const stageSteps = steps.filter((s) => s.stage === stage)
    const progress = stageSteps.length
      ? Math.round((stageSteps.filter((s) => s.status === 'done').length / stageSteps.length) * 100)
      : 0
    return {
      label: stage,
      icon: STAGE_META[stage].icon,
      tone: STAGE_META[stage].tone,
      progress,
      detail: stageSteps.length ? `${stageSteps.length} steps` : 'No steps yet',
    }
  })

  const showPlayground = animating || steps.length === 0

  return (
     <div className="flex h-screen bg-parchment-50">
      <Sidebar activePage="roadmap" onNavigate={onNavigate} />
      <div className="relative flex h-full flex-1 flex-col min-w-0">
        <ChatBackground image="/picture2.png" />

        <main className="relative z-10 flex-1 min-w-0 overflow-y-auto px-8 py-7">
        <header>
          <h1 className="font-serif text-[24px] text-navy-900">Your Roadmap</h1>
          <p className="mt-1 text-[13.5px] text-ink-500">
            A personalized plan built from your profile and portfolio.
          </p>
        </header>

        {!loading && showPlayground && (
          <RoadmapPlayground
            active={animating}
            hasExistingRoadmap={steps.length > 0}
            onGenerateClick={handleGenerate}
            onComplete={handleAnimationComplete}
          />
        )}

        {!loading && !showPlayground && (
          <>
            <Card className="mt-6 p-6 shadow-panel animate-fade-up">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11.5px] font-medium tracking-[0.12em] text-ink-500 uppercase">Your journey</p>
                </div>
                <button
                  onClick={handleGenerate}
                  className="text-[12.5px] text-skyline-600 hover:underline"
                >
                  Regenerate roadmap
                </button>
              </div>
              <div className="mt-6">
                <JourneyPillars stages={pillars} />
              </div>
            </Card>

            <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
              {STAGE_ORDER.map((stage, idx) => {
                const stageSteps = steps.filter((s) => s.stage === stage)
                if (stageSteps.length === 0) return null
                const Icon = STAGE_META[stage].icon
                return (
                  <Card
                    key={stage}
                    className="p-5 shadow-panel animate-fade-up"
                    style={{ animationDelay: `${idx * 0.08}s`, animationFillMode: 'both' }}
                  >
                    <div className="flex items-center gap-2 text-[13px] font-medium text-navy-900">
                      <Icon size={16} />
                      {stage}
                    </div>
                    <ul className="mt-3.5 space-y-3">
                      {stageSteps.map((step) => (
                        <li key={step.id} className="flex items-start gap-3">
                          <button
                            onClick={() => toggleStatus(step)}
                            className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors ${
                              step.status === 'done'
                                ? 'border-sage bg-sage text-parchment-50'
                                : step.status === 'in_progress'
                                ? 'border-gold-500 bg-gold-500/15 text-gold-600'
                                : 'border-navy-900/15 text-transparent'
                            }`}
                          >
                            <Check size={11} strokeWidth={3} />
                          </button>
                          <div>
                            <p className={`text-[13.5px] ${step.status === 'done' ? 'text-ink-500 line-through' : 'text-ink-900'}`}>
                              {step.title}
                            </p>
                            <p className="mt-0.5 text-[12px] leading-snug text-ink-500">{step.description}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </Card>
                )
              })}
            </div>
          </>
        )}
      </main>
    </div>
    </div>
  )
}