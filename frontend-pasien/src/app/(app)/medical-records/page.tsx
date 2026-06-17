'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { medicalRecordService } from '@/services/index'
import api from '@/lib/axios'
import { useAuthStore } from '@/store/auth.store'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { FileText, ChevronRight, UploadCloud, Plus } from 'lucide-react'
import { MedicalRecord } from '@/types'
import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { Label } from '@/components/ui/label'

export default function MedicalRecordsPage() {
  const user = useAuthStore(s => s.user)
  const { data, isLoading } = useQuery({
    queryKey: ['medical-records', user?.id],
    queryFn: () => medicalRecordService.listByPasien(user!.id),
    enabled: !!user?.id,
  })
  const records: MedicalRecord[] = Array.isArray(data?.data) ? data.data : []

  const [isUploading, setIsUploading] = useState(false)
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [judul, setJudul] = useState('')

  const handleUpload = async () => {
    if (!uploadFile || !judul) return toast.error('Harap isi judul dan pilih file')
    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', uploadFile)
      
      const res = await api.post('/upload/pdf', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      }).then(r => r.data)

      if (res.url || res.success) { // dummy returns { success: true, data: { id: ... } }
        await api.post('/medical', {
          pasien_id: user?.id,
          judul: judul,
          type: 'pemeriksaan',
          attachment_url: res.url || '#'
        })
        toast.success('Dokumen berhasil diupload!')
        setUploadFile(null)
        setJudul('')
        window.location.reload()
      } else {
        throw new Error('Gagal upload ke server')
      }
    } catch (e) {
      toast.error('Terjadi kesalahan saat upload')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="pb-8 min-h-screen bg-gray-50/50 dark:bg-gray-950">
      <div className="px-6 py-8 bg-gradient-to-br from-violet-600 to-blue-600 text-white rounded-b-3xl shadow-lg mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-1">Rekam Medis</h1>
            <p className="text-violet-100 text-sm">Riwayat kesehatan dan dokumen Anda</p>
          </div>
          
          <Dialog>
            <DialogTrigger render={<Button className="bg-white text-violet-600 hover:bg-violet-50 rounded-xl" />}>
              <Plus className="h-4 w-4 mr-2" />
              Upload
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] rounded-2xl">
              <DialogHeader>
                <DialogTitle>Upload Dokumen Medis</DialogTitle>
                <DialogDescription>
                  Tambahkan dokumen hasil lab, rontgen, atau surat dokter Anda.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="judul">Judul Dokumen</Label>
                  <Input id="judul" value={judul} onChange={e => setJudul(e.target.value)} placeholder="Contoh: Hasil Lab Darah" className="rounded-xl" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="file">File Dokumen (PDF/JPG)</Label>
                  <Input id="file" type="file" onChange={e => setUploadFile(e.target.files?.[0] || null)} className="rounded-xl file:text-violet-600 file:font-semibold" />
                </div>
              </div>
              <Button onClick={handleUpload} disabled={isUploading} className="w-full bg-violet-600 hover:bg-violet-700 rounded-xl">
                {isUploading ? 'Mengupload...' : 'Simpan Dokumen'}
              </Button>
            </DialogContent>
          </Dialog>

        </div>
      </div>
      <div className="px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)
          : records.length === 0
            ? <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-3xl border border-dashed border-gray-200 dark:border-gray-800"><FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" /><p className="text-sm text-gray-500">Belum ada rekam medis</p></div>
            : records.map(r => (
              <Link key={r.id} href={`/medical-records/${r.id}`}>
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 flex items-center gap-4 hover:shadow-md transition-all hover:border-violet-100 group">
                  <div className="bg-violet-50 dark:bg-violet-900/30 p-3.5 rounded-2xl shrink-0 group-hover:scale-110 transition-transform">
                    <FileText className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-semibold text-gray-900 dark:text-white truncate mb-0.5">{r.judul}</p>
                    <p className="text-sm text-gray-500">{r.created_at ? new Date(r.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    {r.type && <Badge variant="secondary" className="bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300">{r.type}</Badge>}
                    <div className="bg-gray-50 dark:bg-gray-800 p-1.5 rounded-full group-hover:bg-violet-50 dark:group-hover:bg-violet-900/50 transition-colors">
                      <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-violet-600" />
                    </div>
                  </div>
                </div>
              </Link>
            ))
        }
      </div>
    </div>
  )
}
