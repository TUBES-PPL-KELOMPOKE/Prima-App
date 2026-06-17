export interface ApiResponse<T = unknown> {
  success: boolean
  message?: string
  data?: T
}

export interface User {
  id: string
  name: string
  email: string
  role: 'pasien' | 'dokter' | 'admin'
  status: string
  foto_profil_url?: string
}

export interface PasienProfile {
  id: string
  name: string
  email: string
  role: string
  status: string
  nama_panggilan?: string
  foto_profil_url?: string
  jenis_kelamin?: string
  tanggal_lahir?: string
  no_telepon?: string
  alamat?: string
  kota?: string
  provinsi?: string
  kode_pos?: string
  nik?: string
  golongan_darah?: string
  rhesus?: string
  tinggi_badan_cm?: number
  berat_badan_kg?: number
  riwayat_alergi?: string
  riwayat_penyakit?: string
  no_bpjs?: string
}

export interface Doctor {
  id: string
  name: string
  foto_profil_url?: string
  spesialisasi: string
  sub_spesialisasi?: string
  kota?: string
  rating?: number
  pengalaman_tahun?: number
  biaya_konsultasi?: number
  deskripsi_profil?: string
  nama_klinik?: string
  alamat_klinik?: string
  tersedia?: boolean
}

export interface Schedule {
  id: string
  doctor_id: string
  day_of_week: number
  start_time: string
  end_time: string
}

export interface Booking {
  id: string
  doctor_id: string
  pasien_id: string
  appointment_date: string
  start_time: string
  end_time: string
  notes?: string
  status?: string
  created_at?: string
}

export interface QueuePosition {
  booking_id: string
  nomor_antrian: number
  status: string
  posisi: number
}

export interface Consultation {
  id: string
  pasien_id: string
  doctor_id: string
  booking_id?: string
  status: 'aktif' | 'selesai' | 'dibatalkan'
  created_at?: string
  doctor?: Doctor
}

export interface Message {
  id: string
  consultation_id: string
  sender_id: string
  message?: string
  file_url?: string
  type: 'text' | 'file' | 'image'
  is_read?: boolean
  created_at?: string
}

export interface MedicalRecord {
  id: string
  pasien_id: string
  doctor_id: string
  booking_id?: string
  type: string
  judul: string
  deskripsi?: string
  catatan_dokter?: string
  attachment_url?: string
  created_at?: string
}

export interface PrescriptionItem {
  id: string
  prescription_id: string
  medicine_name: string
  dosage: string
  frequency: string
  duration: string
  quantity: number
  instructions?: string
}

export interface Prescription {
  id: string
  patient_id: string
  doctor_id: string
  booking_id?: string
  notes?: string
  patient_name?: string
  doctor_name?: string
  items: PrescriptionItem[]
  created_at?: string
}

export interface Document {
  id: string
  pasien_id?: string
  doctor_id?: string
  type?: string
  created_at?: string
  [key: string]: unknown
}

export interface Immunization {
  id: string
  pasien_id?: string
  jenis_vaksin?: string
  tanggal?: string
  lokasi?: string
  [key: string]: unknown
}

export interface Program {
  id: string
  nama: string
  type: 'vaksinasi' | 'penyuluhan' | 'pemeriksaan' | 'olahraga'
  tanggal_mulai: string
  tanggal_selesai: string
  kuota: number
  status: 'aktif' | 'nonaktif' | 'selesai'
  deskripsi?: string
  lokasi?: string
}

export interface Review {
  id: string
  pasien_id: string
  doctor_id: string
  booking_id?: string
  rating: number
  ulasan: string
  sentimen?: string
  created_at?: string
}

export interface Notification {
  id: string
  user_id: string
  type?: string
  title?: string
  message?: string
  is_read: boolean
  created_at?: string
}
