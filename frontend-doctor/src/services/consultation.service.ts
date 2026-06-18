import api from '@/lib/axios'

export const consultationService = {
  getDoctorConsultations: (doctorId: string) =>
    api.get(`/consultations/doctor/${doctorId}`).then((r) => r.data),

  getConsultationDetail: (id: string) =>
    api.get(`/consultations/${id}`).then((r) => r.data),

  getMessages: (consultationId: string) =>
    api.get(`/consultations/${consultationId}/messages`).then((r) => r.data),

  sendMessage: (consultationId: string, data: { sender_id: string; message: string; type?: string; file_url?: string }) =>
    api.post(`/consultations/${consultationId}/messages`, data).then((r) => r.data),

  updateStatus: (consultationId: string, status: string) =>
    api.patch(`/consultations/${consultationId}/status`, { status }).then((r) => r.data),
}
