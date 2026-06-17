# API Documentation — Backend Prima

> Base URL: `/`  
> Semua response JSON menggunakan format: `{ success: true/false, message?, data? }`  
> Auth: JWT via header `Authorization: Bearer <token>` (kecuali endpoint publik)

---

## Daftar Isi

- [🔐 Auth & Users](#-auth--users)
- [👤 PASIEN](#-pasien)
- [🩺 DOKTER](#-dokter)
- [🛡️ ADMIN](#-admin)

---

# 🔐 Auth & Users

> Prefix: `/auth`

### POST `/auth/login`
Login untuk semua role (pasien, dokter, admin).

**Body:**
```json
{
  "email": "string (required)",
  "password": "string (required)"
}
```

**Response 200:**
```json
{
  "success": true,
  "message": "Login berhasil",
  "data": {
    "token": "jwt_token",
    "user": {
      "id": "uuid",
      "name": "string",
      "email": "string",
      "role": "pasien | dokter | admin",
      "status": "string"
    }
  }
}
```

---

### POST `/auth/logout`
Logout (invalidate sesi client-side).

**Response 200:**
```json
{ "success": true, "message": "Logout berhasil" }
```

---

### POST `/auth/register/pasien`
Registrasi akun pasien baru.

**Body:**
```json
{
  "name": "string (required)",
  "email": "string (required)",
  "password": "string (required)",
  "nama_panggilan": "string?",
  "foto_profil_url": "string?",
  "jenis_kelamin": "string?",
  "tanggal_lahir": "date?",
  "no_telepon": "string?",
  "alamat": "string?",
  "kota": "string?",
  "provinsi": "string?",
  "kode_pos": "string?",
  "nik": "string?",
  "golongan_darah": "string?",
  "rhesus": "string?",
  "tinggi_badan_cm": "number?",
  "berat_badan_kg": "number?",
  "riwayat_alergi": "string?",
  "riwayat_penyakit": "string?",
  "no_bpjs": "string?"
}
```

**Response 201:**
```json
{ "success": true, "message": "Registrasi pasien berhasil", "data": { ...user } }
```

---

### POST `/auth/register/doctor`
Registrasi akun dokter baru.

**Body:**
```json
{
  "name": "string (required)",
  "email": "string (required)",
  "password": "string (required)",
  "nomor_str": "string (required)",
  "nomor_sip": "string (required)",
  "spesialisasi": "string (required)",
  "nama_panggilan": "string?",
  "foto_profil_url": "string?",
  "jenis_kelamin": "string?",
  "tanggal_lahir": "date?",
  "no_telepon": "string?",
  "alamat": "string?",
  "kota": "string?",
  "provinsi": "string?",
  "kode_pos": "string?",
  "sub_spesialisasi": "string?",
  "pengalaman_tahun": "number?",
  "deskripsi_profil": "string?",
  "biaya_konsultasi": "number?",
  "nama_klinik": "string?",
  "alamat_klinik": "string?"
}
```

**Response 201:**
```json
{ "success": true, "message": "Registrasi dokter berhasil, menunggu verifikasi STR & SIP", "data": { ...user } }
```

---

### POST `/auth/register/admin`
Registrasi akun admin.

**Body:**
```json
{
  "name": "string (required)",
  "email": "string (required)",
  "password": "string (required)"
}
```

---

### GET `/auth/users`
List semua user dengan filter.

**Query Params:** `limit`, `offset`, `role`, `status`

**Response 200:**
```json
{ "success": true, "data": [ ...users ] }
```

---

### GET `/auth/users/:id`
Detail user by ID.

**Response 200:**
```json
{ "success": true, "data": { ...user } }
```

---

### PATCH `/auth/users/:id`
Update data umum user.

**Body:** field apapun yang ingin diupdate (name, email, dll)

---

### PATCH `/auth/users/:id/pasien`
Update profil khusus pasien.

**Body:** field profil pasien (nik, golongan_darah, riwayat_alergi, dll)

---

### PATCH `/auth/users/:id/doctor`
Update profil khusus dokter.

**Body:** field profil dokter (spesialisasi, biaya_konsultasi, dll)

---

### POST `/auth/users/:id/photo`
Upload foto profil user (multipart/form-data).

**Form:** `file` (image, max 2MB)

**Response 200:**
```json
{
  "success": true,
  "message": "Foto profil berhasil diupload",
  "data": {
    "id": "uuid",
    "role": "string",
    "foto_profil_url": "https://...",
    "public_id": "cloudinary_public_id"
  }
}
```

---

### DELETE `/auth/users/:id`
Soft delete user.

---

### DELETE `/auth/users/:id/permanent`
Hard delete user (permanen).

---

# 👤 PASIEN

Endpoint yang relevan untuk frontend role **Pasien**.

---

## 1. Profil & Akun

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | `/auth/login` | Login |
| POST | `/auth/logout` | Logout |
| POST | `/auth/register/pasien` | Daftar akun |
| GET | `/auth/users/:id` | Lihat profil sendiri |
| PATCH | `/auth/users/:id/pasien` | Update profil pasien |
| POST | `/auth/users/:id/photo` | Upload foto profil |

---

## 2. Cari Dokter

> Prefix: `/doctors`

### GET `/doctors`
List dokter dengan filter.

**Query Params:**
| Param | Tipe | Keterangan |
|-------|------|------------|
| nama | string | Filter nama dokter |
| spesialisasi | string | Filter spesialisasi |
| kota | string | Filter kota |
| rating_min | number | Filter rating minimum |
| tersedia | boolean | Filter dokter tersedia |
| limit | number | Jumlah data |
| offset | number | Pagination offset |

**Response 200:**
```json
{ "success": true, "data": [ ...doctors ] }
```

---

### GET `/doctors/:id`
Detail profil dokter.

**Response 200:**
```json
{ "success": true, "data": { ...doctorProfile } }
```

---

## 3. Jadwal & Booking

> Prefix: `/schedules`

### GET `/schedules/doctor/:doctor_id`
Lihat jadwal praktik dokter.

**Response 200:**
```json
{
  "success": true,
  "data": [
    { "id": "uuid", "doctor_id": "uuid", "day_of_week": 1, "start_time": "08:00", "end_time": "12:00" }
  ]
}
```

---

### GET `/schedules/doctor/:doctor_id/available`
Lihat jadwal tersedia dokter pada tanggal tertentu.

**Query Params:** `date` (format: `YYYY-MM-DD`, required)

**Response 200:**
```json
{
  "success": true,
  "data": {
    "doctor_id": "uuid",
    "date": "2026-06-16",
    "day_of_week": 1,
    "schedules": [ ...jadwalList ],
    "bookings": [ ...bookingList ]
  }
}
```

---

### POST `/schedules/bookings`
Buat booking janji temu.

**Body:**
```json
{
  "doctor_id": "uuid (required)",
  "pasien_id": "uuid (required)",
  "appointment_date": "YYYY-MM-DD (required)",
  "start_time": "HH:MM (required)",
  "end_time": "HH:MM (required)",
  "notes": "string?"
}
```

**Response 201:**
```json
{ "success": true, "message": "Booking berhasil dibuat", "data": { ...booking } }
```

---

### GET `/schedules/bookings/:id`
Detail booking.

**Response 200:**
```json
{ "success": true, "data": { ...booking } }
```

---

### GET `/schedules/user/:user_id/bookings`
List semua booking milik pasien.

**Query Params:** `date` (YYYY-MM-DD), `status`

**Response 200:**
```json
{ "success": true, "data": [ ...bookings ] }
```

---

### PATCH `/schedules/bookings/:id`
Update booking (misal: reschedule atau batalkan).

**Body:** `appointment_date?`, `start_time?`, `end_time?`, `notes?`, `status?`

---

### DELETE `/schedules/bookings/:id`
Hapus booking.

---

## 4. Antrian

> Prefix: `/queue`

### GET `/queue/:booking_id`
Lihat posisi antrian berdasarkan booking.

**Response 200:**
```json
{
  "success": true,
  "data": {
    "booking_id": "uuid",
    "nomor_antrian": 3,
    "status": "menunggu",
    "posisi": 1
  }
}
```

---

## 5. Konsultasi

> Prefix: `/consultations`

### POST `/consultations`
Buat room konsultasi baru dengan dokter.

**Body:**
```json
{
  "pasien_id": "uuid (required)",
  "doctor_id": "uuid (required)",
  "booking_id": "uuid?"
}
```

**Response 201:**
```json
{ "success": true, "message": "Room konsultasi berhasil dibuat", "data": { ...consultation } }
```

---

### GET `/consultations/pasien/:pasien_id`
List konsultasi milik pasien.

**Query Params:** `status` (aktif | selesai | dibatalkan), `limit`, `offset`

---

### GET `/consultations/:id`
Detail konsultasi.

---

### PATCH `/consultations/:id/status`
Update status konsultasi.

**Body:**
```json
{ "status": "aktif | selesai | dibatalkan (required)" }
```

---

### DELETE `/consultations/:id`
Hapus konsultasi (soft delete).

---

### POST `/consultations/:id/messages`
Kirim pesan dalam konsultasi.

**Body:**
```json
{
  "sender_id": "uuid (required)",
  "type": "text | file | image (required)",
  "message": "string (required jika type=text)",
  "file_url": "string? (jika type=file/image)"
}
```

**Response 201:**
```json
{ "success": true, "message": "Pesan terkirim", "data": { ...message } }
```

---

### GET `/consultations/:id/messages`
List pesan dalam konsultasi.

**Query Params:** `limit`, `offset`

---

### PATCH `/consultations/:id/messages/read`
Tandai pesan dibaca.

**Body:**
```json
{ "user_id": "uuid (required)" }
```

---

### POST `/consultations/:id/upload`
Upload file dalam chat konsultasi (multipart/form-data).

**Form:** `file` (max 2MB)

**Response 201:**
```json
{
  "success": true,
  "data": {
    "consultation_id": "uuid",
    "file_url": "https://...",
    "public_id": "string",
    "original_filename": "string",
    "mimetype": "string"
  }
}
```

---

## 6. Rekam Medis

> Prefix: `/medical`

### GET `/medical/pasien/:pasien_id`
List rekam medis pasien.

**Query Params:** `type`, `date_from`, `date_to`, `limit`, `offset`

**Response 200:**
```json
{ "success": true, "data": [ ...medicalRecords ] }
```

---

### GET `/medical/:id`
Detail rekam medis.

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "pasien_id": "uuid",
    "doctor_id": "uuid",
    "booking_id": "uuid?",
    "type": "string",
    "judul": "string",
    "deskripsi": "string?",
    "catatan_dokter": "string?",
    "attachment_url": "string?"
  }
}
```

---

## 7. Resep Obat

> Prefix: `/prescription`

### GET `/prescription/show/:id`
Detail resep obat (beserta item obat).

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "patient_id": "uuid",
    "doctor_id": "uuid",
    "booking_id": "uuid?",
    "notes": "string?",
    "patient_name": "string",
    "doctor_name": "string",
    "items": [
      {
        "id": "uuid",
        "medicine_name": "string",
        "dosage": "string",
        "frequency": "string",
        "duration": "string",
        "quantity": "number",
        "instructions": "string?"
      }
    ]
  }
}
```

---

### GET `/prescription/download/:id`
Download resep dalam format PDF.

**Response:** `application/pdf` binary

---

## 8. Dokumen Medis

> Prefix: `/document`

### GET `/document/show/:id`
Detail dokumen (Surat Keterangan / Rujukan / Sakit).

---

### GET `/document/show`
List semua dokumen.

---

### GET `/document/download/sk/:id`
Download Surat Keterangan (SK) sebagai PDF.

**Response:** `application/pdf`

---

### GET `/document/download/sr/:id`
Download Surat Rujukan (SR) sebagai PDF.

---

### GET `/document/download/ss/:id`
Download Surat Sakit (SS) sebagai PDF.

---

## 9. Imunisasi

> Prefix: `/immunization`

### GET `/immunization/show`
List semua data imunisasi.

### GET `/immunization/show/:id`
Detail imunisasi by ID.

---

## 10. Program Kesehatan

> Prefix: `/programs`

### GET `/programs`
List program kesehatan.

**Query Params:** `type` (vaksinasi | penyuluhan | pemeriksaan | olahraga), `status`, `limit`, `offset`

**Response 200:**
```json
{ "success": true, "data": [ ...programs ] }
```

---

### GET `/programs/:id`
Detail program kesehatan.

---

### POST `/programs/:id/register`
Daftar sebagai peserta program.

**Body:**
```json
{ "pasien_id": "uuid (required)" }
```

**Response 201:**
```json
{ "success": true, "message": "Berhasil mendaftar sebagai peserta", "data": { ...participant } }
```

---

### DELETE `/programs/:id/register/:pasien_id`
Batalkan pendaftaran program.

---

## 11. Ulasan Dokter

> Prefix: `/reviews`

### POST `/reviews`
Buat ulasan untuk dokter.

**Body:**
```json
{
  "pasien_id": "uuid (required)",
  "doctor_id": "uuid (required)",
  "booking_id": "uuid?",
  "rating": "number 1-5 (required)",
  "ulasan": "string (required)"
}
```

**Response 201:**
```json
{ "success": true, "data": { ...review, "sentimen": "positif | negatif | netral" } }
```

---

### GET `/reviews/pasien/:pasien_id`
List ulasan yang pernah dibuat pasien.

**Query Params:** `limit`, `offset`

---

### GET `/reviews/:id`
Detail ulasan.

---

## 12. Notifikasi

> Prefix: `/notifications`

### GET `/notifications/:user_id`
List notifikasi user.

**Query Params:** `is_read` (true/false), `type`, `limit`, `offset`

---

### GET `/notifications/detail/:id`
Detail notifikasi.

---

### PATCH `/notifications/:id/read`
Tandai 1 notifikasi sebagai dibaca.

---

### PATCH `/notifications/:user_id/read-all`
Tandai semua notifikasi sebagai dibaca.

---

### DELETE `/notifications/:id`
Hapus notifikasi.

---

## 13. Kalkulator Kesehatan

> Prefix: `/calculator`

### POST `/calculator/bmi`
Hitung BMI.

**Body:**
```json
{ "tinggi_cm": "number (required)", "berat_kg": "number (required)" }
```

**Response 200:**
```json
{
  "success": true,
  "data": { "bmi": 22.5, "kategori": "Normal", "tinggi_cm": 170, "berat_kg": 65 }
}
```

---

### POST `/calculator/bmr`
Hitung BMR / kalori harian.

**Body:**
```json
{
  "umur": "number (required)",
  "berat_kg": "number (required)",
  "tinggi_cm": "number (required)",
  "jenis_kelamin": "pria | wanita (required)",
  "aktifitas_fisik": "rendah | sedang | tinggi (required)"
}
```

---

### POST `/calculator/risk/diabetes`
Hitung risiko diabetes.

**Body:**
```json
{
  "umur": "number (required)",
  "berat_kg": "number (required)",
  "tinggi_cm": "number (required)",
  "gula_darah": "number (required)",
  "riwayat_keluarga": "boolean",
  "aktifitas_fisik": "rendah | sedang | tinggi (required)"
}
```

---

### POST `/calculator/risk/hipertensi`
Hitung risiko hipertensi.

**Body:**
```json
{
  "umur": "number (required)",
  "tekanan_sistolik": "number (required)",
  "tekanan_diastolik": "number (required)",
  "merokok": "boolean",
  "riwayat_keluarga": "boolean"
}
```

---

## 14. AI Kesehatan

> Prefix: `/ai/health`

### POST `/ai/health/symptoms`
Analisis gejala dengan AI.

**Body:**
```json
{
  "user_id": "uuid (required)",
  "gejala": ["string", "..."] ,
  "durasi": "string (required)",
  "suhu_tubuh": "number?",
  "keluhan_tambahan": "string?"
}
```

**Response 200:**
```json
{ "success": true, "data": { "analisis": "...", "rekomendasi": "..." } }
```

---

### POST `/ai/health/analyze`
Analisis data kesehatan (BMI, tekanan darah, dll).

**Body:**
```json
{
  "user_id": "uuid (required)",
  "tinggi_badan_cm": "number (required)",
  "berat_badan_kg": "number (required)",
  "tekanan_darah": "string?",
  "gula_darah": "number?",
  "kolesterol": "number?"
}
```

---

### POST `/ai/health/recommend-doctor`
Rekomendasi dokter berdasarkan gejala.

**Body:**
```json
{
  "user_id": "uuid (required)",
  "gejala": ["string", "..."],
  "durasi": "string?"
}
```

**Response 200:**
```json
{ "success": true, "data": { "rekomendasi_spesialisasi": "...", "dokter": [ ...doctors ] } }
```

---


# 🩺 DOKTER

Endpoint yang relevan untuk frontend role **Dokter**.

---

## 1. Profil & Akun

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | `/auth/login` | Login |
| POST | `/auth/logout` | Logout |
| GET | `/auth/users/:id` | Lihat profil sendiri |
| PATCH | `/auth/users/:id/doctor` | Update profil dokter |
| POST | `/auth/users/:id/photo` | Upload foto profil |

---

## 2. Kelola Jadwal Praktik

> Prefix: `/schedules`

### POST `/schedules`
Buat jadwal praktik baru.

**Body:**
```json
{
  "doctor_id": "uuid (required)",
  "day_of_week": "0-6 (required, 0=Minggu)",
  "start_time": "HH:MM (required)",
  "end_time": "HH:MM (required)"
}
```

**Response 201:**
```json
{ "success": true, "message": "Jadwal berhasil dibuat", "data": { ...schedule } }
```

---

### GET `/schedules/doctor/:doctor_id`
Lihat semua jadwal praktik sendiri.

---

### PATCH `/schedules/:id`
Update jadwal praktik.

**Body:** `day_of_week?`, `start_time?`, `end_time?`

---

### DELETE `/schedules/:id`
Hapus jadwal praktik.

---

## 3. Kelola Booking Pasien

### GET `/schedules/doctor/:doctor_id/bookings`
List booking yang masuk untuk dokter.

**Query Params:** `date` (YYYY-MM-DD), `status`

**Response 200:**
```json
{ "success": true, "data": [ ...bookings ] }
```

---

### GET `/schedules/bookings/:id`
Detail booking pasien.

---

### PATCH `/schedules/bookings/:id`
Update status booking (konfirmasi/tolak).

**Body:** `status?`, `notes?`

---

## 4. Antrian Pasien

> Prefix: `/queue`

### GET `/queue/doctor/:doctor_id/today`
Lihat antrian pasien hari ini.

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "booking_id": "uuid",
      "nomor_antrian": 1,
      "pasien_name": "string",
      "status": "menunggu | dipanggil | selesai | tidak_hadir",
      "start_time": "08:00"
    }
  ]
}
```

---

### PATCH `/queue/doctor/:doctor_id/next`
Panggil pasien berikutnya dalam antrian.

**Response 200:**
```json
{ "success": true, "data": { ...nextQueue } }
```

---

### PATCH `/queue/:booking_id/status`
Update status antrian pasien.

**Body:**
```json
{ "status": "menunggu | dipanggil | selesai | tidak_hadir (required)" }
```

---

## 5. Konsultasi

### GET `/consultations/doctor/:doctor_id`
List konsultasi yang diterima dokter.

**Query Params:** `status`, `limit`, `offset`

---

### GET `/consultations/:id`
Detail konsultasi.

---

### PATCH `/consultations/:id/status`
Update status konsultasi.

**Body:**
```json
{ "status": "aktif | selesai | dibatalkan (required)" }
```

---

### POST `/consultations/:id/messages`
Kirim pesan ke pasien dalam konsultasi.

**Body:**
```json
{
  "sender_id": "uuid (required)",
  "type": "text | file | image (required)",
  "message": "string (required jika type=text)"
}
```

---

### GET `/consultations/:id/messages`
List pesan dalam konsultasi.

---

### PATCH `/consultations/:id/messages/read`
Tandai pesan dibaca.

**Body:** `{ "user_id": "uuid" }`

---

### POST `/consultations/:id/upload`
Upload file/gambar dalam chat (multipart/form-data).

---

## 6. Rekam Medis

### POST `/medical`
Buat rekam medis baru untuk pasien.

**Body:**
```json
{
  "pasien_id": "uuid (required)",
  "doctor_id": "uuid (required)",
  "booking_id": "uuid?",
  "type": "string (required)",
  "judul": "string (required)",
  "deskripsi": "string?",
  "catatan_dokter": "string?",
  "attachment_url": "string?"
}
```

**Response 201:**
```json
{ "success": true, "message": "Rekam medis berhasil dibuat", "data": { ...medicalRecord } }
```

---

### GET `/medical/pasien/:pasien_id`
Lihat rekam medis pasien.

**Query Params:** `type`, `date_from`, `date_to`, `limit`, `offset`

---

### GET `/medical/:id`
Detail rekam medis.

---

### PATCH `/medical/:id`
Update rekam medis.

**Body:** `type?`, `judul?`, `deskripsi?`, `catatan_dokter?`, `attachment_url?`

---

### DELETE `/medical/:id`
Hapus rekam medis (soft delete).

---

## 7. Resep Obat

### POST `/prescription/create`
Buat resep obat.

**Body:**
```json
{
  "patient_id": "uuid (required)",
  "doctor_id": "uuid (required)",
  "booking_id": "uuid?",
  "notes": "string?"
}
```

---

### POST `/prescription/create/items`
Tambahkan item obat ke resep.

**Body:**
```json
{
  "prescription_id": "uuid (required)",
  "medicine_name": "string (required)",
  "dosage": "string (required)",
  "frequency": "string (required)",
  "duration": "string (required)",
  "quantity": "number (required)",
  "instructions": "string?"
}
```

---

### GET `/prescription/show/:id`
Detail resep beserta item obat.

---

### GET `/prescription/show/all`
List semua resep.

---

### PUT `/prescription/update/:id`
Update header resep.

**Body:** `patient_id?`, `doctor_id?`, `booking_id?`, `notes?`

---

### PUT `/prescription/update/items/:id`
Update item obat dalam resep.

**Body:** `medicine_name?`, `dosage?`, `frequency?`, `duration?`, `quantity?`, `instructions?`

---

### DELETE `/prescription/delete/:id`
Hapus resep.

---

### DELETE `/prescription/delete/items/:id`
Hapus item obat dari resep.

---

### GET `/prescription/download/:id`
Download resep sebagai PDF.

**Response:** `application/pdf`

---

## 8. Dokumen Medis

### POST `/document/create`
Buat dokumen medis (SK / SR / SS).

**Body:**
```json
{
  "pasien_id": "uuid",
  "doctor_id": "uuid",
  "type": "SK | SR | SS",
  "...field dokumen lainnya"
}
```

---

### GET `/document/show/:id`
Detail dokumen.

---

### PUT `/document/update/:id`
Update dokumen.

---

### DELETE `/document/delete/:id`
Hapus dokumen.

---

### GET `/document/download/sk/:id`
Download Surat Keterangan (PDF).

### GET `/document/download/sr/:id`
Download Surat Rujukan (PDF).

### GET `/document/download/ss/:id`
Download Surat Sakit (PDF).

---

## 9. Imunisasi

### POST `/immunization/create`
Catat data imunisasi.

**Body:** field imunisasi (pasien, jenis vaksin, tanggal, dll)

---

### PUT `/immunization/update/:id`
Update data imunisasi.

---

### DELETE `/immunization/delete/:id`
Hapus data imunisasi.

---

## 10. Program Kesehatan

### GET `/programs`
Lihat daftar program yang tersedia.

---

### GET `/programs/:id/participants`
Lihat list peserta program.

**Response 200:**
```json
{ "success": true, "data": [ ...participants ] }
```

---

### PATCH `/programs/:id/participants/:pasien_id`
Update status peserta program.

**Body:**
```json
{ "status": "menunggu | diterima | ditolak (required)" }
```

---

## 11. Ulasan Dokter

### GET `/reviews/doctor/:doctor_id`
Lihat semua ulasan yang diterima dokter.

**Query Params:** `sentiment`, `rating_min`, `limit`, `offset`

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "pasien_id": "uuid",
      "rating": 5,
      "ulasan": "string",
      "sentimen": "positif | negatif | netral"
    }
  ]
}
```

---

### GET `/reviews/doctor/:doctor_id/insight`
Dapatkan AI insight/summary dari semua ulasan dokter.

**Response 200:**
```json
{
  "success": true,
  "data": {
    "total_ulasan": 10,
    "rata_rata_rating": 4.5,
    "insight_ai": "string"
  }
}
```

---

## 12. Notifikasi

Sama seperti pasien. Gunakan endpoint `/notifications/:user_id` dengan `user_id` dokter.

---


# 🛡️ ADMIN

Endpoint yang relevan untuk frontend role **Admin**.

---

## 1. Manajemen User

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | `/auth/register/admin` | Buat akun admin |
| POST | `/auth/login` | Login |
| GET | `/auth/users` | List semua user |
| GET | `/auth/users/:id` | Detail user |
| PATCH | `/auth/users/:id` | Update data user |
| DELETE | `/auth/users/:id` | Soft delete user |
| DELETE | `/auth/users/:id/permanent` | Hard delete user |

**List Users — Query Params:**
| Param | Tipe | Keterangan |
|-------|------|------------|
| role | string | Filter: pasien / dokter / admin |
| status | string | Filter status akun |
| limit | number | Jumlah data |
| offset | number | Pagination |

---

## 2. Kelola Program Kesehatan

### POST `/programs`
Buat program kesehatan baru.

**Body:**
```json
{
  "nama": "string (required)",
  "type": "vaksinasi | penyuluhan | pemeriksaan | olahraga (required)",
  "tanggal_mulai": "YYYY-MM-DD (required)",
  "tanggal_selesai": "YYYY-MM-DD (required)",
  "kuota": "number (required)",
  "status": "aktif | nonaktif | selesai (required)",
  "deskripsi": "string?",
  "lokasi": "string?"
}
```

**Response 201:**
```json
{ "success": true, "message": "Program berhasil dibuat", "data": { ...program } }
```

---

### GET `/programs`
List semua program.

**Query Params:** `type`, `status`, `limit`, `offset`

---

### GET `/programs/:id`
Detail program.

---

### PATCH `/programs/:id`
Update program.

**Body:** `nama?`, `type?`, `tanggal_mulai?`, `tanggal_selesai?`, `kuota?`, `status?`, `deskripsi?`, `lokasi?`

---

### DELETE `/programs/:id`
Hapus program (soft delete).

---

### GET `/programs/:id/participants`
List peserta program.

---

### PATCH `/programs/:id/participants/:pasien_id`
Update status peserta (terima/tolak).

**Body:**
```json
{ "status": "menunggu | diterima | ditolak (required)" }
```

---

## 3. Laporan & Statistik

> Prefix: `/reports`

### GET `/reports/users`
Laporan data pengguna.

**Query Params:** `date_from`, `date_to`, `role`

**Response 200:**
```json
{
  "success": true,
  "data": {
    "total": 100,
    "pasien": 80,
    "dokter": 15,
    "admin": 5,
    "users": [ ...userList ]
  }
}
```

---

### GET `/reports/appointments`
Laporan janji temu / booking.

**Query Params:** `date_from`, `date_to`, `status`, `doctor_id`

---

### GET `/reports/consultations`
Laporan konsultasi.

**Query Params:** `date_from`, `date_to`, `status`

---

### GET `/reports/medical-records`
Laporan rekam medis.

**Query Params:** `date_from`, `date_to`, `type`

---

### GET `/reports/revenue`
Laporan pendapatan dokter.

**Query Params:** `date_from`, `date_to`, `doctor_id`

---

### GET `/reports/export/pdf`
Export laporan ke PDF.

**Query Params:**
| Param | Tipe | Keterangan |
|-------|------|------------|
| type | string | Jenis laporan: users / appointments / consultations / medical-records / revenue |
| date_from | string | Tanggal mulai (YYYY-MM-DD) |
| date_to | string | Tanggal selesai (YYYY-MM-DD) |

**Response:** `application/pdf`

---

### GET `/reports/export/csv`
Export laporan ke CSV.

**Query Params:** sama seperti export PDF

**Response:** `text/csv`

---

## 4. Kelola Dokter

### GET `/doctors`
List semua dokter + filter.

### GET `/doctors/:id`
Detail dokter.

### PATCH `/auth/users/:id/doctor`
Update profil dokter (verifikasi STR/SIP, ubah status, dll).

---

## 5. Semua Rekam Medis

### GET `/medical/pasien/:pasien_id`
Lihat rekam medis milik pasien tertentu.

### GET `/medical/:id`
Detail rekam medis.

### PATCH `/medical/:id`
Update rekam medis.

### DELETE `/medical/:id`
Hapus rekam medis (soft delete).

---

## 6. Semua Resep

### GET `/prescription/show/all`
List semua resep di sistem.

### GET `/prescription/show/:id`
Detail resep.

### DELETE `/prescription/delete/:id`
Hapus resep.

---

## 7. Semua Dokumen

### GET `/document/show`
List semua dokumen medis.

### GET `/document/show/:id`
Detail dokumen.

### DELETE `/document/delete/:id`
Hapus dokumen.

---

## 8. Imunisasi

### GET `/immunization/show`
List semua data imunisasi.

### POST `/immunization/create`
Buat data imunisasi.

**Body:** field imunisasi (pasien_id, jenis_vaksin, tanggal, lokasi, dll)

### PUT `/immunization/update/:id`
Update data imunisasi.

### DELETE `/immunization/delete/:id`
Hapus data imunisasi.

---

## 9. Ulasan

### GET `/reviews/doctor/:doctor_id`
Lihat ulasan untuk dokter tertentu.

### GET `/reviews/:id`
Detail ulasan.

---

## 10. Notifikasi

Admin dapat memantau notifikasi semua user:

### GET `/notifications/:user_id`
List notifikasi user tertentu.

### DELETE `/notifications/:id`
Hapus notifikasi.

---

## 11. Antrian

### GET `/queue/doctor/:doctor_id/today`
Monitor antrian dokter hari ini.

### GET `/queue/:booking_id`
Cek posisi antrian.

---

# 📋 Ringkasan Endpoint per Role

| Fitur | Pasien | Dokter | Admin |
|-------|--------|--------|-------|
| Auth (login/register/logout) | ✅ | ✅ | ✅ |
| Profil | ✅ | ✅ | ✅ |
| Cari dokter | ✅ | - | ✅ |
| Jadwal praktik | Lihat | CRUD | - |
| Booking | CRUD | Lihat/Update | - |
| Antrian | Lihat posisi | Kelola | Monitor |
| Konsultasi | CRUD + Chat | CRUD + Chat | - |
| Rekam medis | Lihat | CRUD | CRUD |
| Resep obat | Lihat + Download | CRUD | Lihat |
| Dokumen medis | Download | CRUD | CRUD |
| Imunisasi | Lihat | CRUD | CRUD |
| Program kesehatan | Lihat + Daftar | Lihat peserta | CRUD |
| Ulasan dokter | Buat + Lihat | Lihat + Insight | Lihat |
| Notifikasi | ✅ | ✅ | ✅ |
| Kalkulator kesehatan | ✅ | - | - |
| AI Kesehatan | ✅ | - | - |
| Laporan & Export | - | - | ✅ |
