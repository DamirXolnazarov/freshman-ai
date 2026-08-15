import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// Every table with a student_id FK pointing at students.id must be listed here,
// in any order (no cross-dependencies between these), before students itself.
const TABLES_TO_CLEAR = [
  'chat_messages',
  'portfolio_items',
  'tasks',
  'roadmap_steps',
  'essays',
  'applications',
  'calendar_events',
  'reminders',
  'saved_universities',
  'saved_opportunities',
  'opportunity_applications',
  'student_profile',
]

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    return new Response('Unauthorized', { status: 401, headers: corsHeaders })
  }

  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const token = authHeader.replace('Bearer ', '')
  const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token)
  if (userError || !user) {
    return new Response('Unauthorized', { status: 401, headers: corsHeaders })
  }

  try {
    const { data: student } = await supabaseAdmin
      .from('students')
      .select('id')
      .eq('auth_id', user.id)
      .single()

    if (student) {
      for (const table of TABLES_TO_CLEAR) {
        const { error } = await supabaseAdmin.from(table).delete().eq('student_id', student.id)
        if (error) {
          // A table missing entirely (schema mismatch) shouldn't hard-fail the
          // whole deletion — but a real constraint/permission error should.
          console.error(`Failed clearing ${table}:`, error.message)
          if (error.code !== '42P01') { // 42P01 = table does not exist
            return new Response(`Failed to clear ${table}: ${error.message}`, { status: 500, headers: corsHeaders })
          }
        }
      }

      const { error: studentDeleteError } = await supabaseAdmin.from('students').delete().eq('id', student.id)
      if (studentDeleteError) {
        console.error('Failed to delete student row:', studentDeleteError.message)
        return new Response(`Failed to delete student row: ${studentDeleteError.message}`, { status: 500, headers: corsHeaders })
      }
    }

    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id)
    if (deleteError) {
      console.error('Failed to delete auth user:', deleteError.message)
      return new Response(`Failed to delete auth user: ${deleteError.message}`, { status: 500, headers: corsHeaders })
    }

    return new Response('OK', { status: 200, headers: corsHeaders })
  } catch (err) {
    console.error('delete-account error:', err)
    return new Response('Internal error', { status: 500, headers: corsHeaders })
  }
})