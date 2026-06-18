import api from '@/lib/axios'

export const scheduleService = {
  getDoctorSchedules: (doctorId: string) =>
    api.get(`/schedules/doctor/${doctorId}`).then((r) => r.data),

  createSchedule: (data: { doctor_id: string; day_of_week: number; start_time: string; end_time: string }) =>
    api.post('/schedules', data).then((r) => r.data),

  deleteSchedule: (id: string) =>
    api.delete(`/schedules/${id}`).then((r) => r.data),
}
