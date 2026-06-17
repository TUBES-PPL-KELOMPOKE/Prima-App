import { AxiosRequestConfig } from 'axios'

// In-memory dummy state for stateful operations
let mockMessages = [
  { id: 'm1', sender_id: 'doc-1', message: 'Halo, ada yang bisa saya bantu? Keluhannya apa?', type: 'text', created_at: new Date(Date.now() - 60000).toISOString() }
]

let mockBookings = [
  { id: 'b1', doctor_name: 'Dr. Budi Santoso', doctor_spesialisasi: 'Poli Umum', appointment_date: '2026-06-18', start_time: '10:00:00', status: 'booked' }
]

let mockConsultations = [
  { id: 'c1', doctor_name: 'Dr. Budi Santoso', topik: 'Sakit Kepala Pusing', status: 'aktif', created_at: new Date().toISOString() }
]

export const getDummyData = (config: AxiosRequestConfig, error?: any) => {
  const url = config.url || ''
  const method = config.method?.toLowerCase() || 'get'
  const data = config.data ? (typeof config.data === 'string' ? JSON.parse(config.data) : config.data) : {}

  console.warn(`[DUMMY FALLBACK ACTIVATED] ${method.toUpperCase()} ${url} failed. Returning dummy data.`)

  // Doctors
  if (url.includes('/doctors') && method === 'get') {
    return {
      success: true,
      data: [
        { id: 'doc-1', name: 'Dr. Budi Santoso', spesialisasi: 'Poli Umum', pengalaman: '5 Tahun', rating: '4.8', biaya: 50000, image_url: 'https://ui-avatars.com/api/?name=Budi+Santoso' },
        { id: 'doc-2', name: 'Dr. Andi', spesialisasi: 'Poli Gigi', pengalaman: '3 Tahun', rating: '4.5', biaya: 75000, image_url: 'https://ui-avatars.com/api/?name=Andi' }
      ]
    }
  }

  // Bookings / Schedules
  if (url.includes('/schedules/user') && url.includes('/bookings')) {
    return { success: true, data: mockBookings }
  }
  if (url.includes('/schedules/bookings') && method === 'post') {
    const newBooking = { id: 'b' + Date.now(), doctor_name: 'Dr. Dummy', doctor_spesialisasi: 'Poli Dummy', appointment_date: data.appointment_date, start_time: data.start_time, status: 'booked' }
    mockBookings.unshift(newBooking)
    return { success: true, data: newBooking }
  }

  // Consultations
  if (url.includes('/consultations/pasien')) {
    return { success: true, data: mockConsultations }
  }
  if (url.includes('/consultations') && method === 'post' && !url.includes('messages') && !url.includes('upload')) {
    const newConsult = { id: 'c' + Date.now(), doctor_name: 'Dr. Dummy', topik: data.topik || 'Konsultasi Baru', status: 'aktif', created_at: new Date().toISOString() }
    mockConsultations.unshift(newConsult)
    return { success: true, data: newConsult }
  }

  // Messages
  if (url.includes('/messages') && method === 'get') {
    return { success: true, data: [...mockMessages] } // return copy to trigger React re-render properly
  }
  if (url.includes('/messages') && method === 'post') {
    const newMsg = {
      id: 'm' + Date.now(),
      sender_id: data.sender_id,
      message: data.message,
      type: data.type || 'text',
      file_url: data.file_url,
      created_at: new Date().toISOString()
    }
    mockMessages.push(newMsg)
    
    // Auto-reply bot (optional coolness)
    if (data.sender_id !== 'doc-1') {
      setTimeout(() => {
        mockMessages.push({
          id: 'm' + Date.now() + 1,
          sender_id: 'doc-1',
          message: 'Baik, saya catat. Ada keluhan lain?',
          type: 'text',
          created_at: new Date().toISOString()
        })
      }, 2000)
    }
    
    return { success: true, data: newMsg }
  }

  // Generic fallback for any other endpoints (Prescriptions, Programs, etc)
  if (url.includes('/medical') || url.includes('/upload')) {
    throw error; // explicitly throw so it doesn't hit generic fallback and break UI array expectations
  }
  if (url.includes('/prescriptions') || url.includes('/prescription')) {
    return { success: true, data: [ { id: 'rx1', nama_obat: 'Paracetamol 500mg', dosis: '3x1', status: 'aktif' } ] }
  }
  if (url.includes('/programs')) {
    return { success: true, data: [ { id: 'pg1', nama_program: 'Diet Sehat', deskripsi: 'Program penurunan berat badan 30 hari', progress: 50 } ] }
  }
  if (url.includes('/documents') || url.includes('/document')) {
    throw error;
  }

  // Final Generic fallback
  return { success: true, data: { id: 'dummy-id', status: 'success', message: 'Fallback dummy data' } }
}
