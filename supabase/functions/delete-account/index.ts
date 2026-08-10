import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async (req) => {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) return new Response('Unauthorized', { status: 401 })

  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const token = authHeader.replace('Bearer ', '')
  const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token)
  if (userError || !user) return new Response('Unauthorized', { status: 401 })

  // your students table stores auth_id, not the auth user id directly —
  // find the student row so we can cascade-delete their data first
  const { data: student } = await supabaseAdmin
    .from('students')
    .select('id')
    .eq('auth_id', user.id)
    .single()

  if (student) {
    // delete in dependency order — adjust table list to match your actual schema
    await supabaseAdmin.from('chat_messages').delete().eq('student_id', student.id)
    await supabaseAdmin.from('portfolio_items').delete().eq('student_id', student.id)
    await supabaseAdmin.from('tasks').delete().eq('student_id', student.id)
    await supabaseAdmin.from('roadmap_steps').delete().eq('student_id', student.id)
    await supabaseAdmin.from('student_profile').delete().eq('student_id', student.id)
    await supabaseAdmin.from('students').delete().eq('id', student.id)
  }

  const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id)
  if (deleteError) return new Response('Failed to delete auth user', { status: 500 })

  return new Response('OK', { status: 200 })
})