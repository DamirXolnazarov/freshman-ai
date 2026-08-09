import { useState, useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import LandingPage from './pages/LandingPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import ChatPage from './pages/ChatPage.jsx'
import RoadmapPage from './pages/RoadmapPage.jsx'
import PortfolioPage from './pages/PortfolioPage.jsx'
import UniversitiesPage from './pages/UniversitiesPage.jsx'
import EssaysPage from './pages/EssaysPage.jsx'
import ApplicationsPage from './pages/ApplicationsPage.jsx'
import CommandPalette from './components/CommandPalette.jsx'
import OpportunitiesPage from './pages/OpportunitiesPage.jsx'
import { useCommandPalette } from './hooks/useCommandPalette.js'
import { supabase } from './lib/supabase.js'
import TasksPage from './pages/TasksPage.jsx'
import CalendarPage from './pages/CalendarPage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import { ensureStudentRow } from './lib/auth.js'

export default function App() {
  const [page, setPage] = useState('landing')
  const [studentId, setStudentId] = useState(null)
  const [authUser, setAuthUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [roadmapAutoGenerate, setRoadmapAutoGenerate] = useState(false)
  const [pendingChatPrefill, setPendingChatPrefill] = useState(null)
  const palette = useCommandPalette()

  useEffect(() => {
    async function init() {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setAuthUser(session.user)
        const id = await ensureStudentRow(session.user)
        setStudentId(id)
        setPage((p) => (p === 'landing' ? 'chat' : p))
      }
      setAuthLoading(false)
    }
    init()

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setAuthUser(session.user)
        const id = await ensureStudentRow(session.user)
        setStudentId(id)
        setPage((p) => (p === 'landing' ? 'chat' : p))
      } else {
        setAuthUser(null)
        setStudentId(null)
        setPage('landing')
      }
    })

    return () => sub.subscription.unsubscribe()
  }, [])

  function handleNavigate(target, options) {
    if (target === 'roadmap' && options?.autoGenerate) {
      setRoadmapAutoGenerate(true)
    }
    if (target === 'chat' && options?.prefill) {
      setPendingChatPrefill({ text: options.prefill, autoSend: !!options.autoSend })
    }
    setPage(target)
  }

  if (authLoading) {
    return <div className="flex h-screen items-center justify-center bg-parchment-50 text-navy-900">Loading…</div>
  }

  if (page === 'landing' || !studentId) {
    return (
      <>
        <Toaster position="bottom-right" />
        <LandingPage />
      </>
    )
  }

  const initialName = authUser?.user_metadata?.full_name || authUser?.email

  return (
    <>
      <Toaster position="bottom-right" />
      <CommandPalette
        open={palette.open}
        onClose={() => palette.setOpen(false)}
        onNavigate={handleNavigate}
        studentId={studentId}
      />
      {page === 'dashboard' && <DashboardPage onNavigate={handleNavigate} studentId={studentId} />}
      {page === 'chat' && (
        <ChatPage
          onNavigate={handleNavigate}
          studentId={studentId}
          initialName={initialName}
          pendingPrefill={pendingChatPrefill}
          onPrefillHandled={() => setPendingChatPrefill(null)}
        />
      )}
      {page === 'roadmap' && (
        <RoadmapPage
          onNavigate={handleNavigate}
          studentId={studentId}
          autoGenerate={roadmapAutoGenerate}
          onAutoGenerateHandled={() => setRoadmapAutoGenerate(false)}
        />
      )}
      {page === 'portfolio' && <PortfolioPage onNavigate={handleNavigate} studentId={studentId} />}
      {page === 'universities' && <UniversitiesPage onNavigate={handleNavigate} studentId={studentId} />}
      {page === 'essays' && <EssaysPage onNavigate={handleNavigate} studentId={studentId} />}
      {page === 'applications' && <ApplicationsPage onNavigate={handleNavigate} studentId={studentId} />}
      {page === 'opportunities' && <OpportunitiesPage onNavigate={handleNavigate} studentId={studentId} />}
      {page === 'tasks' && <TasksPage onNavigate={handleNavigate} studentId={studentId} />}
      {page === 'calendar' && <CalendarPage onNavigate={handleNavigate} studentId={studentId} />}
      {page === 'profile' && <ProfilePage onNavigate={handleNavigate} studentId={studentId} />}
    </>
  )
}