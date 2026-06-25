import {
  createMedicalRecordController,
  getMedicalRecordsByPasienController,
  getMedicalRecordDetailController,
  getMedicalRecordsByDoctorController,
  updateMedicalRecordController,
  deleteMedicalRecordController,
} from "../controllers/medical.controller.js";
import { sql } from "../../../config/db.js";
import cloudinary from "../../../config/cloudinary.js";
import crypto from "crypto";

export default async function medicalRecordsRoutes(app) {

  /**
   * POST /medical/upload
   * Upload dokumen medis oleh pasien (file + metadata dalam 1 request).
   * Multipart fields: file, judul, pasien_id, type (opsional)
   */
  app.post("/upload", async (req, reply) => {
    try {
      const parts = req.parts();
      const fields = {};
      let uploadResult = null;

      for await (const part of parts) {
        if (part.file) {
          // Ini adalah file field
          const buffer = await part.toBuffer();
          uploadResult = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              {
                resource_type: "auto",
                folder: "medical_documents",
                public_id: `${Date.now()}_${part.filename}`,
              },
              (error, result) => {
                if (error) reject(error);
                else resolve(result);
              }
            );
            stream.end(buffer);
          });
        } else {
          // Ini adalah text field
          fields[part.fieldname] = part.value;
        }
      }

      if (!uploadResult) {
        return reply.code(400).send({ success: false, message: "File tidak ditemukan dalam request" });
      }
      if (!fields.pasien_id || !fields.judul) {
        return reply.code(400).send({ success: false, message: "pasien_id dan judul wajib diisi" });
      }

      const id = crypto.randomUUID();
      const type = fields.type || "pemeriksaan";

      const result = await sql`
        INSERT INTO medical_records (
          id, pasien_id, doctor_id, booking_id,
          type, judul, deskripsi, catatan_dokter, attachment_url
        ) VALUES (
          ${id},
          ${fields.pasien_id},
          ${"PASIEN_UPLOAD"},
          ${null},
          ${type},
          ${fields.judul},
          ${null},
          ${null},
          ${uploadResult.secure_url}
        )
        RETURNING *;
      `;

      return reply.code(201).send({
        success: true,
        message: "Dokumen berhasil diupload",
        data: result[0],
        url: uploadResult.secure_url,
      });

    } catch (error) {
      console.error("[medical/upload] Error:", error);
      return reply.code(500).send({
        success: false,
        message: error?.message || "Upload gagal",
      });
    }
  });

  // Endpoint patch schema: pastikan doctor_id nullable di production DB
  app.post("/migrate-nullable", async (req, reply) => {
    try {
      await sql.unsafe(`
        DO $$
        BEGIN
          IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = 'medical_records'
              AND column_name = 'doctor_id' AND is_nullable = 'NO'
          ) THEN
            ALTER TABLE public.medical_records ALTER COLUMN doctor_id DROP NOT NULL;
          END IF;
          IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = 'medical_records'
              AND column_name = 'booking_id' AND is_nullable = 'NO'
          ) THEN
            ALTER TABLE public.medical_records ALTER COLUMN booking_id DROP NOT NULL;
          END IF;
        END $$;
      `);
      const cols = await sql`
        SELECT column_name, is_nullable FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'medical_records'
          AND column_name IN ('doctor_id', 'booking_id')
      `;
      return reply.send({ success: true, message: "Migration selesai", columns: cols });
    } catch (err) {
      return reply.code(500).send({ success: false, message: err.message });
    }
  });

  app.post("/", createMedicalRecordController);
  app.get("/pasien/:pasien_id", getMedicalRecordsByPasienController);
  app.get("/doctor/:doctor_id", getMedicalRecordsByDoctorController);
  app.get("/:id", getMedicalRecordDetailController);
  app.patch("/:id", updateMedicalRecordController);
  app.delete("/:id", deleteMedicalRecordController);
}
