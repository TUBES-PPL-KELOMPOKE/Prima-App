import api from '@/lib/axios'

export const medicalService = {
  getDoctorMedicalRecords: (doctorId: string) =>
    api.get(`/medical/doctor/${doctorId}`).then((r) => r.data),

  getPasienMedicalRecords: (pasienId: string) =>
    api.get(`/medical/pasien/${pasienId}`).then((r) => r.data),

  createMedicalRecord: (data: { pasien_id: string; doctor_id: string; type: string; judul: string; deskripsi: string; catatan_dokter: string }) =>
    api.post('/medical', data).then((r) => r.data),

  updateMedicalRecord: (id: string, data: any) =>
    api.patch(`/medical/${id}`, data).then((r) => r.data),
}
