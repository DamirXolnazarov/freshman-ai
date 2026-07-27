import { useState, useEffect, useMemo } from 'react'
import { Search } from 'lucide-react'
import Sidebar from '../components/layout/Sidebar.jsx'
import UniversityCard from '../components/universities/UniversityCard.jsx'
import { notify } from '../lib/toast.js'
import {
  searchUniversities,
  getSavedUniversities,
  saveUniversity,
  updateSavedUniversity,
  removeSavedUniversity,
} from '../lib/universities.js'

const COUNTRIES = ['All', 'United States', 'United Kingdom', 'Canada']

export default function UniversitiesPage({ onNavigate, studentId }) {
  const [all, setAll] = useState([])
  const [saved, setSaved] = useState([])
  const [query, setQuery] = useState('')
  const [country, setCountry] = useState('All')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [allUnis, savedUnis] = await Promise.all([
        searchUniversities({}),
        studentId ? getSavedUniversities(studentId) : Promise.resolve([]),
      ])
      setAll(allUnis)
      setSaved(savedUnis)
      setLoading(false)
    }
    load()
  }, [studentId])

  const savedIds = useMemo(() => new Set(saved.map((s) => s.university_id)), [saved])

  const filtered = all.filter((u) => {
    const matchesCountry = country === 'All' || u.country === country
    const matchesQuery = !query.trim() || u.name.toLowerCase().includes(query.trim().toLowerCase())
    return matchesCountry && matchesQuery
  })

  async function handleSave(uni) {
    try {
      const row = await saveUniversity(studentId, uni.id, 'target')
      setSaved((prev) => [row, ...prev])
      notify.success(`${uni.name} added to your list`)
    } catch (err) {
      console.error('Failed to save university:', err.message, err)
      notify.error(`Couldn't save ${err.message.includes('row-level') ? '— check your account setup' : 'that university'}`)
    }
  }

  async function handleCategoryChange(savedRow, category) {
    setSaved((prev) => prev.map((s) => (s.id === savedRow.id ? { ...s, category } : s)))
    await updateSavedUniversity(savedRow.id, { category })
  }

  async function handleRemove(savedRow) {
    setSaved((prev) => prev.filter((s) => s.id !== savedRow.id))
    await removeSavedUniversity(savedRow.id)
    notify.info(`${savedRow.universities?.name || 'University'} removed`)
  }

  const grouped = { reach: [], target: [], likely: [] }
  saved.forEach((s) => grouped[s.category]?.push(s))

  return (
    <div className="flex h-screen bg-parchment-50">
      <Sidebar activePage="universities" onNavigate={onNavigate} />

      <main className="flex-1 min-w-0 overflow-y-auto px-8 py-7">
        <header>
          <h1 className="font-serif text-[24px] text-navy-900">Universities</h1>
          <p className="mt-1 text-[13.5px] text-ink-500">
            Research, save, and track requirements for the schools you're considering.
          </p>
        </header>

        {saved.length > 0 && (
          <section className="mt-6">
            <p className="text-[11.5px] font-medium tracking-[0.1em] text-ink-500 uppercase">Your list</p>
            <div className="mt-3 grid grid-cols-1 gap-4 lg:grid-cols-3">
              {['reach', 'target', 'likely'].map((cat) => (
                <div key={cat}>
                  <p className="mb-2 text-[12.5px] font-medium capitalize text-navy-900">
                    {cat} <span className="text-ink-500">({grouped[cat].length})</span>
                  </p>
                  <div className="space-y-3">
                    {grouped[cat].map((s) => (
                      <UniversityCard
                        key={s.id}
                        uni={s.universities}
                        saved
                        category={s.category}
                        onCategoryChange={(c) => handleCategoryChange(s, c)}
                        onRemove={() => handleRemove(s)}
                      />
                    ))}
                    {grouped[cat].length === 0 && (
                      <p className="text-[12px] text-ink-500/60">No schools here yet.</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="mt-8">
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-[11.5px] font-medium tracking-[0.1em] text-ink-500 uppercase">Explore</p>
            <div className="flex items-center gap-2 rounded-control border border-navy-900/10 bg-parchment-50 px-3.5 py-2 text-ink-500">
              <Search size={15} strokeWidth={1.75} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search universities…"
                className="w-56 bg-transparent text-[13px] outline-none placeholder:text-ink-500/60"
              />
            </div>
            <div className="flex gap-1.5">
              {COUNTRIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setCountry(c)}
                  className={`rounded-full border px-3 py-1 text-[12px] transition-colors ${
                    country === c ? 'border-navy-900 bg-navy-900 text-parchment-50' : 'border-navy-900/12 text-ink-700'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <p className="mt-6 text-[13.5px] text-ink-500">Loading universities…</p>
          ) : (
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((u) => (
                <UniversityCard
                  key={u.id}
                  uni={u}
                  saved={savedIds.has(u.id)}
                  category="target"
                  onSave={() => handleSave(u)}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}