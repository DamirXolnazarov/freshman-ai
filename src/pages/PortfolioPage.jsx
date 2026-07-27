import { useState, useEffect } from 'react'
import { Trophy, Trash2, Pencil } from 'lucide-react'
import Sidebar from '../components/layout/Sidebar.jsx'
import Card from '../components/ui/Card.jsx'
import PortfolioEditOverlay from '../components/portfolio/PortfolioEditOverlay.jsx'
import { supabase } from '../lib/supabase.js'

const TAG_TONES = {
  Leadership: 'bg-navy-900/[0.06] text-navy-800',
  Technology: 'bg-skyline-300/25 text-skyline-700',
  Community: 'bg-sage/15 text-sage',
  Academic: 'bg-gold-500/15 text-gold-600',
  Arts: 'bg-[#4A3B6B]/12 text-[#4A3B6B]',
  Athletics: 'bg-dusty/25 text-[#8B5A5A]',
  Service: 'bg-ink-500/10 text-ink-700',
}

export default function PortfolioPage({ onNavigate, studentId }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTag, setActiveTag] = useState('All')
  const [editingItem, setEditingItem] = useState(null)

  useEffect(() => {
    if (!studentId) return
    async function load() {
      const { data } = await supabase
        .from('portfolio_items')
        .select('*')
        .eq('student_id', studentId)
        .order('created_at', { ascending: false })
      setItems(data || [])
      setLoading(false)
    }
    load()
  }, [studentId])

  async function handleDelete(id) {
    setItems((prev) => prev.filter((it) => it.id !== id))
    await supabase.from('portfolio_items').delete().eq('id', id)
  }

  async function handleSaveEdit(updated) {
    const { error } = await supabase.from('portfolio_items').update(updated).eq('id', editingItem.id)
    if (!error) {
      setItems((prev) => prev.map((it) => (it.id === editingItem.id ? { ...it, ...updated } : it)))
    }
    setEditingItem(null)
  }

  const allTags = ['All', ...new Set(items.flatMap((it) => it.tags || []))]
  const visibleItems = activeTag === 'All' ? items : items.filter((it) => it.tags?.includes(activeTag))

  return (
    <div className="flex h-screen bg-parchment-50">
      <Sidebar activePage="portfolio" onNavigate={onNavigate} />

      <main className="flex-1 min-w-0 overflow-y-auto px-8 py-7">
        <header>
          <h1 className="font-serif text-[24px] text-navy-900">Your Portfolio</h1>
          <p className="mt-1 text-[13.5px] text-ink-500">
            Every achievement, project, and role Freshman AI has structured from your conversations and documents.
          </p>
        </header>

        {!loading && items.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2">
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveTag(tag)}
                className={`rounded-full border px-3 py-1 text-[12.5px] transition-colors ${
                  activeTag === tag
                    ? 'border-navy-900 bg-navy-900 text-parchment-50'
                    : 'border-navy-900/12 text-ink-700 hover:bg-parchment-100'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}

        {loading && <p className="mt-8 text-[13.5px] text-ink-500">Loading your portfolio…</p>}

        {!loading && items.length === 0 && (
          <Card className="mt-6 p-8 text-center shadow-panel">
            <p className="mt-3 font-serif text-[17px] text-navy-900">Nothing here yet</p>
            <p className="mt-2 text-[13.5px] text-ink-500 max-w-md mx-auto">
              Tell Freshman AI about something you've built, led, or achieved in chat — or upload your
              resume — and it'll show up here, structured and ready for your applications.
            </p>
          </Card>
        )}

        {!loading && visibleItems.length > 0 && (
          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {visibleItems.map((item) => (
              <Card key={item.id} className="p-5 shadow-panel group relative">
                <div className="absolute right-4 top-4 flex items-center gap-2.5 opacity-0 transition-opacity group-hover:opacity-100">
                  <button onClick={() => setEditingItem(item)} className="text-ink-500/40 hover:text-gold-600" aria-label="Edit">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="text-ink-500/40 hover:text-[#8B5A5A]" aria-label="Remove">
                    <Trash2 size={14} />
                  </button>
                </div>

                <div className="flex items-start gap-2.5 pr-10">
                  <Trophy size={16} className="mt-0.5 shrink-0 text-gold-500" />
                  <p className="font-serif text-[15.5px] leading-snug text-navy-900">{item.title}</p>
                </div>

                <p className="mt-2.5 text-[13px] leading-relaxed text-ink-700">{item.summary}</p>

                {item.impact && (
                  <p className="mt-2 text-[12px] text-ink-500">
                    <span className="font-medium text-ink-700">Impact:</span> {item.impact}
                  </p>
                )}

                {item.skills?.length > 0 && (
                  <p className="mt-1 text-[12px] text-ink-500">
                    <span className="font-medium text-ink-700">Skills:</span> {item.skills.join(', ')}
                  </p>
                )}

                <div className="mt-3.5 flex flex-wrap gap-1.5">
                  {(item.tags || []).map((tag) => (
                    <span key={tag} className={`rounded-full px-2.5 py-0.5 text-[11px] ${TAG_TONES[tag] || 'bg-parchment-100 text-ink-700'}`}>
                      {tag}
                    </span>
                  ))}
                </div>

                <p className="mt-3.5 text-[11px] text-ink-500/70">
                  Added {new Date(item.created_at).toLocaleDateString()}
                  {item.source_message?.startsWith('Imported from') ? ` · ${item.source_message}` : ''}
                </p>
              </Card>
            ))}
          </div>
        )}
      </main>

      {editingItem && (
        <PortfolioEditOverlay
          item={editingItem}
          onSave={handleSaveEdit}
          onClose={() => setEditingItem(null)}
        />
      )}
    </div>
  )
}