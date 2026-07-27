import { supabase } from './supabase.js'

export async function signInWithGoogle() {
  await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin },
  })
}

export async function signOut() {
  await supabase.auth.signOut()
}

// Atomic: creates the student row only if one doesn't already exist for
// this auth_id, otherwise returns the existing one. Avoids the
// select-then-insert race that was creating a fresh row on every reload.
export async function ensureStudentRow(authUser) {
  const { data, error } = await supabase
    .from('students')
    .upsert(
      {
        auth_id: authUser.id,
        name: authUser.user_metadata?.full_name || authUser.email,
      },
      { onConflict: 'auth_id', ignoreDuplicates: false }
    )
    .select('id')
    .single()

  if (error) {
    console.error('ensureStudentRow failed:', error.message, error)
    throw error
  }

  // seed a profile row if this is genuinely the first time (harmless if it already exists)
  await supabase.from('student_profile').upsert({ student_id: data.id }, { onConflict: 'student_id' })

  return data.id
}