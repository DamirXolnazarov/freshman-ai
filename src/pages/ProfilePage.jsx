import { useState, useEffect } from 'react'
import { Save, Plus } from 'lucide-react'
import Sidebar from '../components/layout/Sidebar.jsx'
import Card from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import TagListEditor from '../components/profile/TagListEditor.jsx'
import { notify } from '../lib/toast.js'
import DangerZoneCard from '../components/profile/DangerZoneCard.jsx'
import { supabase } from '../lib/supabase.js'
import { enrollmentYearFromGrade } from '../lib/groq.js'

const ACTIVITY_TAGS = ['Leadership', 'Technology', 'Community', 'Academic', 'Arts', 'Athletics', 'Service']

export default function ProfilePage({ onNavigate, studentId }) {
  const [studentName, setStudentName] = useState('')
  const [profile, setProfile] = useState(null)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  const [activityDraft, setActivityDraft] = useState({ title: '', summary: '', impact: '', tags: [] })
  const [addingActivity, setAddingActivity] = useState(false)

  useEffect(() => {
    if (!studentId) return
    async function load() {
      try {
        const [{ data: student }, { data: prof }] = await Promise.all([
          supabase.from('students').select('name').eq('id', studentId).single(),
          supabase.from('student_profile').select('*').eq('student_id', studentId).maybeSingle(),
        ])
        setStudentName(student?.name || '')
        setProfile(
          prof || {
            target_schools: [], honors: [], interests: [], education_history: [],
            major: '', country: '', city: '', age: null, grade_level: null,
            gpa: '', sat_score: '', act_score: '', enrollment_year: null,
          }
        )
      } catch (err) {
        console.error('Failed to load profile:', err)
        setProfile({
          target_schools: [], honors: [], interests: [], education_history: [],
          major: '', country: '', city: '', age: null, grade_level: null,
          gpa: '', sat_score: '', act_score: '', enrollment_year: null,
        })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [studentId])

  function updateField(key, value) {
    setProfile((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSave() {
    setSaving(true)
    const { error } = await supabase
      .from('student_profile')
      .update({ ...profile, updated_at: new Date().toISOString() })
      .eq('student_id', studentId)
    setSaving(false)
    if (error) {
      console.error('Failed to save profile:', error)
      notify.error("Couldn't save your profile — try again")
    } else {
      notify.success('Profile updated')
    }
  }

  async function handleSaveName() {
    const { error } = await supabase.from('students').update({ name: studentName }).eq('id', studentId)
    if (!error) notify.success('Name updated')
  }

  function toggleActivityTag(tag) {
    setActivityDraft((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag) ? prev.tags.filter((t) => t !== tag) : [...prev.tags, tag],
    }))
  }

  async function handleAddActivity() {
    if (!activityDraft.title.trim()) return
    setAddingActivity(true)
    const { error } = await supabase.from('portfolio_items').insert({
      student_id: studentId,
      title: activityDraft.title.trim(),
      summary: activityDraft.summary.trim(),
      impact: activityDraft.impact.trim(),
      tags: activityDraft.tags,
      skills: [],
      source_message: 'Added manually via Profile',
    })
    setAddingActivity(false)
    if (error) {
      console.error('Failed to add activity:', error)
      notify.error("Couldn't add that activity")
    } else {
      notify.success(`${activityDraft.title} added to your portfolio`)
      setActivityDraft({ title: '', summary: '', impact: '', tags: [] })
    }
  }

  if (loading || !profile) {
    return (
      <div className="flex h-screen bg-parchment-50">
        <Sidebar activePage="profile" onNavigate={onNavigate} />
        <main className="flex-1 overflow-y-auto px-8 py-7">
          <p className="text-[13.5px] text-ink-500">Loading your profile…</p>
        </main>
      </div>
    )
  }

  const derivedClassOf = profile.enrollment_year
    ? profile.enrollment_year + 4
    : (() => {
        const y = enrollmentYearFromGrade(profile.grade_level)
        return y ? y + 4 : null
      })()

  return (
    <div className="flex h-screen bg-parchment-50">
      <Sidebar activePage="profile" onNavigate={onNavigate} />

      <main className="flex-1 min-w-0 overflow-y-auto px-8 py-7">
        <header>
          <h1 className="font-serif text-[24px] text-navy-900">Your Profile</h1>
          <p className="mt-1 text-[13.5px] text-ink-500">
            Everything Freshman AI knows about you — edit anything directly, or just keep chatting.
          </p>
        </header>

        <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
          <Card className="p-5 shadow-panel">
            <p className="text-[11.5px] font-medium tracking-[0.1em] text-ink-500 uppercase">Basics</p>

            <div className="mt-3.5 space-y-3.5">
              <div>
                <label className="text-[11.5px] font-medium text-ink-500 uppercase tracking-wide">Name</label>
                <input
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  onBlur={handleSaveName}
                  className="mt-1.5 w-full rounded-control border border-navy-900/10 bg-white px-3 py-2 text-[13px] text-ink-900 outline-none focus:border-gold-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11.5px] font-medium text-ink-500 uppercase tracking-wide">Grade level</label>
                  <select
                    value={profile.grade_level || ''}
                    onChange={(e) => updateField('grade_level', e.target.value ? parseInt(e.target.value, 10) : null)}
                    className="mt-1.5 w-full rounded-control border border-navy-900/10 bg-white px-3 py-2 text-[13px] text-ink-900 outline-none focus:border-gold-500"
                  >
                    <option value="">Not set</option>
                    <option value="9">9th grade</option>
                    <option value="10">10th grade</option>
                    <option value="11">11th grade</option>
                    <option value="12">12th grade</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11.5px] font-medium text-ink-500 uppercase tracking-wide">Age</label>
                  <input
                    type="number"
                    value={profile.age || ''}
                    onChange={(e) => updateField('age', e.target.value ? parseInt(e.target.value, 10) : null)}
                    className="mt-1.5 w-full rounded-control border border-navy-900/10 bg-white px-3 py-2 text-[13px] text-ink-900 outline-none focus:border-gold-500"
                  />
                </div>
              </div>

              {derivedClassOf && (
                <p className="text-[12px] text-ink-500">Estimated class of <span className="font-medium text-ink-900">{derivedClassOf}</span></p>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11.5px] font-medium text-ink-500 uppercase tracking-wide">Country</label>
                  <input
                    value={profile.country || ''}
                    onChange={(e) => updateField('country', e.target.value)}
                    className="mt-1.5 w-full rounded-control border border-navy-900/10 bg-white px-3 py-2 text-[13px] text-ink-900 outline-none focus:border-gold-500"
                  />
                </div>
                <div>
                  <label className="text-[11.5px] font-medium text-ink-500 uppercase tracking-wide">City</label>
                  <input
                    value={profile.city || ''}
                    onChange={(e) => updateField('city', e.target.value)}
                    className="mt-1.5 w-full rounded-control border border-navy-900/10 bg-white px-3 py-2 text-[13px] text-ink-900 outline-none focus:border-gold-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11.5px] font-medium text-ink-500 uppercase tracking-wide">Intended major</label>
                <input
                  value={profile.major || ''}
                  onChange={(e) => updateField('major', e.target.value)}
                  placeholder="e.g. Computer Science"
                  className="mt-1.5 w-full rounded-control border border-navy-900/10 bg-white px-3 py-2 text-[13px] text-ink-900 outline-none focus:border-gold-500"
                />
              </div>
            </div>
          </Card>

          <Card className="p-5 shadow-panel">
            <p className="text-[11.5px] font-medium tracking-[0.1em] text-ink-500 uppercase">Test scores</p>
            <div className="mt-3.5 grid grid-cols-3 gap-3">
              <div>
                <label className="text-[11.5px] font-medium text-ink-500 uppercase tracking-wide">GPA</label>
                <input
                  value={profile.gpa || ''}
                  onChange={(e) => updateField('gpa', e.target.value)}
                  placeholder="e.g. 3.9"
                  className="mt-1.5 w-full rounded-control border border-navy-900/10 bg-white px-3 py-2 text-[13px] text-ink-900 outline-none focus:border-gold-500"
                />
              </div>
              <div>
                <label className="text-[11.5px] font-medium text-ink-500 uppercase tracking-wide">SAT</label>
                <input
                  value={profile.sat_score || ''}
                  onChange={(e) => updateField('sat_score', e.target.value)}
                  placeholder="e.g. 1480"
                  className="mt-1.5 w-full rounded-control border border-navy-900/10 bg-white px-3 py-2 text-[13px] text-ink-900 outline-none focus:border-gold-500"
                />
              </div>
              <div>
                <label className="text-[11.5px] font-medium text-ink-500 uppercase tracking-wide">ACT</label>
                <input
                  value={profile.act_score || ''}
                  onChange={(e) => updateField('act_score', e.target.value)}
                  placeholder="e.g. 32"
                  className="mt-1.5 w-full rounded-control border border-navy-900/10 bg-white px-3 py-2 text-[13px] text-ink-900 outline-none focus:border-gold-500"
                />
              </div>
            </div>

            <div className="mt-5">
              <TagListEditor
                label="Target schools"
                values={profile.target_schools || []}
                onChange={(v) => updateField('target_schools', v)}
                placeholder="Type a school, press enter"
              />
            </div>

            <div className="mt-4">
              <TagListEditor
                label="Awards & honors"
                values={profile.honors || []}
                onChange={(v) => updateField('honors', v)}
                placeholder="Type an award, press enter"
              />
            </div>

            <div className="mt-4">
              <TagListEditor
                label="Interests"
                values={profile.interests || []}
                onChange={(v) => updateField('interests', v)}
                placeholder="Type an interest, press enter"
              />
            </div>
          </Card>
        </div>

        <div className="mt-4 flex justify-end">
          <Button variant="primary" onClick={handleSave} disabled={saving} className="flex items-center gap-1.5">
            <Save size={14} /> {saving ? 'Saving…' : 'Save profile'}
          </Button>
        </div>

        <Card className="mt-6 p-5 shadow-panel">
          <p className="text-[11.5px] font-medium tracking-[0.1em] text-ink-500 uppercase">Add an activity or extracurricular</p>
          <div className="mt-3.5 space-y-3">
            <input
              value={activityDraft.title}
              onChange={(e) => setActivityDraft((d) => ({ ...d, title: e.target.value }))}
              placeholder="e.g. Founder, Robotics Club"
              className="w-full rounded-control border border-navy-900/10 bg-white px-3.5 py-2.5 font-serif text-[14.5px] text-navy-900 outline-none focus:border-gold-500"
            />
            <textarea
              value={activityDraft.summary}
              onChange={(e) => setActivityDraft((d) => ({ ...d, summary: e.target.value }))}
              placeholder="Briefly describe what you did"
              rows={2}
              className="w-full resize-none rounded-control border border-navy-900/10 bg-white px-3.5 py-2 text-[13px] text-ink-700 outline-none focus:border-gold-500"
            />
            <input
              value={activityDraft.impact}
              onChange={(e) => setActivityDraft((d) => ({ ...d, impact: e.target.value }))}
              placeholder="Impact, if any (e.g. 50 members recruited)"
              className="w-full rounded-control border border-navy-900/10 bg-white px-3.5 py-2 text-[13px] text-ink-700 outline-none focus:border-gold-500"
            />
            <div className="flex flex-wrap gap-1.5">
              {ACTIVITY_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleActivityTag(tag)}
                  className={`rounded-full px-2.5 py-1 text-[11px] transition-colors ${
                    activityDraft.tags.includes(tag) ? 'bg-navy-900 text-parchment-50' : 'bg-parchment-100 text-ink-700 hover:bg-parchment-200'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={handleAddActivity}
              disabled={addingActivity || !activityDraft.title.trim()}
              className="flex items-center gap-1.5"
            >
              <Plus size={14} /> {addingActivity ? 'Adding…' : 'Add to portfolio'}
            </Button>
          </div>
        </Card>
        <br />
        <DangerZoneCard studentName={studentName} />
      </main>


    </div>
  )
}