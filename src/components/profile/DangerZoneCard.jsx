import { useState } from 'react'
import { LogOut, Trash2, AlertTriangle, X } from 'lucide-react'
import { supabase } from '../../lib/supabase.js'
import { notify } from '../../lib/toast.js'

export default function DangerZoneCard({ studentName }) {
  const [signingOut, setSigningOut] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const [deleting, setDeleting] = useState(false)

  async function handleSignOut() {
    setSigningOut(true)
    const { error } = await supabase.auth.signOut()
    if (error) {
      notify.error('Could not sign out — try again.')
      setSigningOut(false)
    }
    // App.jsx's onAuthStateChange listener handles the redirect to landing automatically
  }

  async function handleDeleteAccount() {
    setDeleting(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-account`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json',
        },
      })
      if (!res.ok) throw new Error('Delete failed')
      await supabase.auth.signOut()
    } catch {
      notify.error('Could not delete your account. Try again or contact support.')
      setDeleting(false)
    }
  }

  return (
    <>
      <div className="rounded-card border border-[#C6564A]/25 bg-[#C6564A]/[0.03] p-6 shadow-panel">
        <div className="flex items-center gap-2">
          <AlertTriangle size={16} className="text-[#C6564A]" strokeWidth={1.75} />
          <p className="text-[13px] font-medium text-[#9A3B2E]">Danger Zone</p>
        </div>
        <p className="mt-1 text-[12px] text-ink-500">Account-level actions. Some of these can't be undone.</p>

        <div className="mt-5 divide-y divide-navy-900/6">
          <div className="flex items-center justify-between py-3.5">
            <div>
              <p className="text-[13px] font-medium text-ink-900">Sign out</p>
              <p className="text-[11.5px] text-ink-500">End your session on this device.</p>
            </div>
            <button
              onClick={handleSignOut}
              disabled={signingOut}
              className="flex items-center gap-1.5 rounded-control border border-navy-900/12 bg-white px-3.5 py-2 text-[12.5px] font-medium text-ink-900 transition-colors hover:bg-parchment-100 disabled:opacity-50"
            >
              <LogOut size={13} strokeWidth={1.75} />
              {signingOut ? 'Signing out…' : 'Sign Out'}
            </button>
          </div>

          <div className="flex items-center justify-between py-3.5">
            <div>
              <p className="text-[13px] font-medium text-[#9A3B2E]">Delete account</p>
              <p className="text-[11.5px] text-ink-500">Permanently removes your profile, portfolio, and all saved data.</p>
            </div>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center gap-1.5 rounded-control border border-[#C6564A]/30 bg-white px-3.5 py-2 text-[12.5px] font-medium text-[#C6564A] transition-colors hover:bg-[#C6564A]/[0.06]"
            >
              <Trash2 size={13} strokeWidth={1.75} />
              Delete Account
            </button>
          </div>
        </div>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-card bg-white p-6 shadow-raised">
            <div className="flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#C6564A]/10 text-[#C6564A]">
                <AlertTriangle size={18} strokeWidth={1.75} />
              </div>
              <button onClick={() => setShowDeleteModal(false)} className="text-ink-500 hover:text-ink-900">
                <X size={16} />
              </button>
            </div>

            <p className="mt-4 font-serif text-[17px] text-navy-900">Delete your account?</p>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-500">
              This permanently deletes {studentName ? `${studentName}'s` : 'your'} profile, portfolio, essays, applications, and chat history. This cannot be undone.
            </p>

            <p className="mt-4 text-[11.5px] font-medium text-ink-700">Type <span className="font-semibold">delete</span> to confirm</p>
            <input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="delete"
              className="mt-1.5 w-full rounded-control border border-navy-900/12 bg-parchment-50 px-3 py-2 text-[13px] text-ink-900 outline-none focus:border-[#C6564A]/40"
            />

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                onClick={() => { setShowDeleteModal(false); setConfirmText('') }}
                className="rounded-control px-3.5 py-2 text-[12.5px] text-ink-500 hover:bg-navy-900/[0.04]"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={confirmText.toLowerCase() !== 'delete' || deleting}
                className="rounded-control bg-[#C6564A] px-4 py-2 text-[12.5px] font-medium text-white disabled:opacity-40"
              >
                {deleting ? 'Deleting…' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}