import api from '@/lib/axios'

export const queueService = {
  getAllBookings: (doctorId: string) =>
    api.get(`/schedules/doctor/${doctorId}/bookings`).then((r) => r.data),

  updateQueueStatus: (bookingId: string, status: string) =>
    api.patch(`/queue/${bookingId}/status`, { status }).then((r) => r.data),
}
