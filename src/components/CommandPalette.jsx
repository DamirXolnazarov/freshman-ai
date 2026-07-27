import { useState, useEffect } from 'react'
import { Command } from 'cmdk'
import { LayoutDashboard, Sparkles, Map, Landmark, FolderOpen, PenLine, FileStack, Search } from 'lucide-react'
import { searchUniversities } from '../lib/universities.js'
import { supabase } from '../lib/supabase.js'

const PAGES = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'chat', label: 'Chat with Freshman AI', icon: Sparkles },
  { key: 'roadmap', label: 'Roadmap', icon: Map },
  { key: 'universities', label: 'Universities', icon: Landmark },
  { key: 'portfolio', label: 'Portfolio', icon: FolderOpen },
]

export default function CommandPalette({ open, onClose, onNavigate, studentId }) {
  const [query, setQuery] = useState('')
  const [universities, setUniversities] = useState([])
  const [portfolioItems, setPortfolioItems] = useState([])

  useEffect(() => {
    if (!open || query.trim().length < 2) return
    const timeout = setTimeout(async () => {
      const [unis, { data: items }] = await Promise.all([
        searchUniversities({ query }),
        supabase
          .from('portfolio_items')
          .select('id, title')
          .eq('student_id', studentId)
          .ilike('title', `%${query}%`)
          .limit(5),
      ])
      setUniversities(unis.slice(0, 5))
      setPortfolioItems(items || [])
    }, 200)
    return () => clearTimeout(timeout)
  }, [query, open, studentId])

  function go(page) {
    onNavigate(page)
    onClose()
    setQuery('')
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center bg-navy-950/50 backdrop-blur-sm pt-[15vh]"
      onClick={onClose}
    >
      <Command
        className="w-full max-w-lg overflow-hidden rounded-card border border-navy-900/10 bg-parchment-50 shadow-raised"
        onClick={(e) => e.stopPropagation()}
        loop
      >
        <div className="flex items-center gap-2.5 border-b border-navy-900/[0.06] px-4 py-3">
          <Search size={16} className="text-ink-500/60" />
          <Command.Input
            value={query}
            onValueChange={setQuery}
            autoFocus
            placeholder="Jump to a page, university, or portfolio item…"
            className="flex-1 bg-transparent text-[14px] text-ink-900 outline-none placeholder:text-ink-500/50"
          />
          <kbd className="rounded border border-navy-900/15 px-1.5 py-0.5 text-[10px] text-ink-500">esc</kbd>
        </div>

        <Command.List className="max-h-80 overflow-y-auto p-2">
          <Command.Empty className="px-3 py-6 text-center text-[13px] text-ink-500">
            Nothing found.
          </Command.Empty>

          <Command.Group heading="Pages" className="text-[11px] text-ink-500/70 px-2 pt-1.5 [&_[cmdk-group-heading]]:mb-1">
            {PAGES.map((p) => (
              <Command.Item
                key={p.key}
                onSelect={() => go(p.key)}
                className="flex items-center gap-2.5 rounded-control px-2.5 py-2 text-[13.5px] text-ink-900 aria-selected:bg-navy-900 aria-selected:text-parchment-50 cursor-pointer"
              >
                <p.icon size={15} strokeWidth={1.75} />
                {p.label}
              </Command.Item>
            ))}
          </Command.Group>

          {universities.length > 0 && (
            <Command.Group heading="Universities" className="text-[11px] text-ink-500/70 px-2 pt-3 [&_[cmdk-group-heading]]:mb-1">
              {universities.map((u) => (
                <Command.Item
                  key={u.id}
                  onSelect={() => go('universities')}
                  className="flex items-center gap-2.5 rounded-control px-2.5 py-2 text-[13.5px] text-ink-900 aria-selected:bg-navy-900 aria-selected:text-parchment-50 cursor-pointer"
                >
                  <Landmark size={15} strokeWidth={1.75} />
                  {u.name}
                </Command.Item>
              ))}
            </Command.Group>
          )}

          {portfolioItems.length > 0 && (
            <Command.Group heading="Portfolio" className="text-[11px] text-ink-500/70 px-2 pt-3 [&_[cmdk-group-heading]]:mb-1">
              {portfolioItems.map((item) => (
                <Command.Item
                  key={item.id}
                  onSelect={() => go('portfolio')}
                  className="flex items-center gap-2.5 rounded-control px-2.5 py-2 text-[13.5px] text-ink-900 aria-selected:bg-navy-900 aria-selected:text-parchment-50 cursor-pointer"
                >
                  <FolderOpen size={15} strokeWidth={1.75} />
                  {item.title}
                </Command.Item>
              ))}
            </Command.Group>
          )}
        </Command.List>
      </Command>
    </div>
  )
}