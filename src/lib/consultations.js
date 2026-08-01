import { supabase } from './supabase.js'

export async function requestConsultation(studentId, serviceType) {
  const { data, error } = await supabase
    .from('consultation_bookings')
    .insert({ student_id: studentId, service_type: serviceType, status: 'requested' })
    .select('*')
    .single()
  if (error) throw error
  return data
}