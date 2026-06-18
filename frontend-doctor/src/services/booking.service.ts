import api from '@/lib/axios'

export const bookingService = {
  listByDoctor: (doctorId: string) =>
    api.get(`/bookings/doctor/${doctorId}`).then((r) => r.data),

  updateStatus: (id: string, status: string) =>
    api.patch(`/bookings/${id}/status`, { status }).then((r) => r.data),
}
