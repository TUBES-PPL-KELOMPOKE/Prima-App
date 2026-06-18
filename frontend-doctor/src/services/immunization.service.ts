import api from '@/lib/axios'

export const immunizationService = {
  getDoctorImmunizations: (doctorId: string) =>
    api.get(`/immunization/doctor/${doctorId}`).then((r) => r.data),

  createImmunization: (data: { 
    pasien_id: string; 
    doctor_id: string; 
    nama_vaksin: string; 
    jenis_vaksin: string; 
    dosis_ke: number; 
    tanggal_vaksin: string;
    lokasi: string;
    catatan: string;
    tanggal_berikutnya: string;
  }) =>
    api.post('/immunization/create', data).then((r) => r.data),
}
