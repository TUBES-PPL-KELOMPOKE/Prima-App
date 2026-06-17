import api from '@/lib/axios'

export const doctorService = {
  list: (params?: Record<string, unknown>) =>
    api.get('/doctors', { params }).then((r) => r.data),

  getById: (id: string) =>
    api.get(`/doctors/${id}`).then((r) => r.data),
}

export const scheduleService = {
  getByDoctor: (doctorId: string) =>
    api.get(`/schedules/doctor/${doctorId}`).then((r) => r.data),

  getAvailable: (doctorId: string, date: string) =>
    api.get(`/schedules/doctor/${doctorId}/available`, { params: { date } }).then((r) => r.data),

  createBooking: (data: Record<string, unknown>) =>
    api.post('/schedules/bookings', data).then((r) => r.data),

  getBooking: (id: string) =>
    api.get(`/schedules/bookings/${id}`).then((r) => r.data),

  listByUser: (userId: string, params?: Record<string, unknown>) =>
    api.get(`/schedules/user/${userId}/bookings`, { params }).then((r) => r.data),

  updateBooking: (id: string, data: Record<string, unknown>) =>
    api.patch(`/schedules/bookings/${id}`, data).then((r) => r.data),

  deleteBooking: (id: string) =>
    api.delete(`/schedules/bookings/${id}`).then((r) => r.data),
}

export const queueService = {
  getPosition: (bookingId: string) =>
    api.get(`/queue/${bookingId}`).then((r) => r.data),
}

export const consultationService = {
  create: (data: Record<string, unknown>) =>
    api.post('/consultations', data).then((r) => r.data),

  listByPasien: (pasienId: string, params?: Record<string, unknown>) =>
    api.get(`/consultations/pasien/${pasienId}`, { params }).then((r) => r.data),

  getById: (id: string) =>
    api.get(`/consultations/${id}`).then((r) => r.data),

  updateStatus: (id: string, status: string) =>
    api.patch(`/consultations/${id}/status`, { status }).then((r) => r.data),

  delete: (id: string) =>
    api.delete(`/consultations/${id}`).then((r) => r.data),

  getMessages: (id: string, params?: Record<string, unknown>) =>
    api.get(`/consultations/${id}/messages`, { params }).then((r) => r.data),

  sendMessage: (id: string, data: Record<string, unknown>) =>
    api.post(`/consultations/${id}/messages`, data).then((r) => r.data),

  markRead: (id: string, userId: string) =>
    api.patch(`/consultations/${id}/messages/read`, { user_id: userId }).then((r) => r.data),

  uploadFile: (id: string, file: File) => {
    const form = new FormData()
    form.append('file', file)
    return api.post(`/consultations/${id}/upload`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data)
  },
}
