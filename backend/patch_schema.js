// Script untuk patch schema database production di Vercel
// Menghapus NOT NULL constraint dari kolom doctor_id di tabel medical_records

import "./src/config/env.js";
import { sql } from "./src/config/db.js";

async function patchSchema() {
  try {
    console.log("Patching medical_records schema...");
    
    await sql`
      ALTER TABLE public.medical_records 
      ALTER COLUMN doctor_id DROP NOT NULL
    `;
    console.log("✅ doctor_id sekarang nullable");
    
    // Juga cek dan patch booking_id jika perlu
    await sql`
      ALTER TABLE public.medical_records 
      ALTER COLUMN booking_id DROP NOT NULL
    `;
    console.log("✅ booking_id sekarang nullable");

    // Verifikasi
    const check = await sql`
      SELECT column_name, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'medical_records' 
      AND column_name IN ('doctor_id', 'booking_id', 'pasien_id')
    `;
    console.log("Schema setelah patch:", check);
    process.exit(0);
  } catch (err) {
    // Error 42703 = column doesn't have that constraint (sudah nullable) → OK
    if (err.code === '42P16' || err.message?.includes('does not exist')) {
      console.log("Constraint tidak ada (sudah nullable):", err.message);
      process.exit(0);
    }
    console.error("Error:", err.message);
    process.exit(1);
  }
}

patchSchema();
