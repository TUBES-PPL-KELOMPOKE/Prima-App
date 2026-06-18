import api from '@/lib/axios'

export const prescriptionService = {
  getAllPrescriptions: () =>
    api.get('/prescription/show/all').then((r) => r.data),

  createPrescription: (data: { patient_id: string; doctor_id: string; booking_id?: string; notes?: string }) =>
    api.post('/prescription/create', data).then((r) => r.data),

  createPrescriptionItem: (data: { prescription_id: string; medicine_name: string; dosage: string; frequency: string; duration: string; quantity: string; instructions: string }) =>
    api.post('/prescription/create/items', data).then((r) => r.data),

  deletePrescription: (id: string) =>
    api.delete(`/prescription/delete/${id}`).then((r) => r.data),
    
  deletePrescriptionItem: (id: string) =>
    api.delete(`/prescription/delete/items/${id}`).then((r) => r.data),
}
