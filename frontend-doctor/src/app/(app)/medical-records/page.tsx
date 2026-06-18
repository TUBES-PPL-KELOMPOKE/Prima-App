'use client'

import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { medicalService } from '@/services/medical.service'
import { useAuthStore } from '@/store/auth.store'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Loader2, FileText, PlusCircle, User, Calendar } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export default function MedicalRecordsPage() {
  const { user } = useAuthStore()
  const queryClient = useQueryClient()
  const [openModal, setOpenModal] = useState(false)

  // Form states
  const [pasienId, setPasienId] = useState('')
  const [type, setType] = useState('konsultasi')
  const [judul, setJudul] = useState('')
  const [deskripsi, setDeskripsi] = useState('')
  const [catatanDokter, setCatatanDokter] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['medical_records', user?.id],
    queryFn: () => medicalService.getDoctorMedicalRecords(user?.id!),
    enabled: !!user?.id
  })

  const createMutation = useMutation({
    mutationFn: medicalService.createMedicalRecord,
    onSuccess: () => {
      toast.success('Rekam medis berhasil disimpan!')
      setOpenModal(false)
      setPasienId('')
      setJudul('')
      setDeskripsi('')
      setCatatanDokter('')
      queryClient.invalidateQueries({ queryKey: ['medical_records', user?.id] })
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Gagal menyimpan rekam medis')
    }
  })

  const handleSave = () => {
    if (!pasienId || !judul || !catatanDokter) {
      toast.error('ID Pasien, Judul, dan Catatan Dokter wajib diisi')
      return
    }
    createMutation.mutate({
      pasien_id: pasienId,
      doctor_id: user?.id!,
      type,
      judul,
      deskripsi,
      catatan_dokter: catatanDokter
    })
  }

  const records = data?.data || []

  return (
    <div className="p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-blue-900 dark:text-blue-400">Rekam Medis Pasien</h1>
          <p className="text-muted-foreground mt-1">Catat dan kelola histori pemeriksaan pasien Anda.</p>
        </div>
        
        <Dialog open={openModal} onOpenChange={setOpenModal}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <PlusCircle className="h-4 w-4 mr-2" /> Tambah Rekam Medis
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="text-blue-900">Buat Rekam Medis Baru</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">ID Pasien</label>
                <Input placeholder="Contoh: user-123" value={pasienId} onChange={e => setPasienId(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Tipe Layanan</label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Tipe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="konsultasi">Konsultasi</SelectItem>
                    <SelectItem value="pemeriksaan">Pemeriksaan</SelectItem>
                    <SelectItem value="resep">Resep Obat</SelectItem>
                    <SelectItem value="rujukan">Surat Rujukan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Judul Pemeriksaan</label>
                <Input placeholder="Contoh: Demam Berdarah Ringan" value={judul} onChange={e => setJudul(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Keluhan Pasien (Deskripsi)</label>
                <Textarea placeholder="Tuliskan keluhan pasien..." value={deskripsi} onChange={e => setDeskripsi(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Catatan & Diagnosis Dokter</label>
                <Textarea placeholder="Diagnosis dan saran pengobatan..." className="min-h-[100px] border-blue-200" value={catatanDokter} onChange={e => setCatatanDokter(e.target.value)} />
              </div>
              <Button className="w-full bg-blue-600 hover:bg-blue-700 mt-2" onClick={handleSave} disabled={createMutation.isPending}>
                {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Simpan ke Database'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-blue-100 shadow-md">
        <CardHeader className="bg-blue-50/50 border-b border-blue-100 rounded-t-xl">
          <CardTitle className="text-lg flex items-center gap-2 text-blue-800">
            <FileText className="h-5 w-5" /> Riwayat Pemeriksaan
          </CardTitle>
          <CardDescription>Daftar seluruh rekam medis yang telah Anda inputkan.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          ) : records.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p className="text-lg">Belum ada rekam medis yang tercatat.</p>
            </div>
          ) : (
            <div className="divide-y divide-blue-50">
              {records.map((rec: any) => (
                <div key={rec.id} className="p-6 hover:bg-slate-50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                    <div>
                      <h3 className="font-semibold text-lg text-blue-900">{rec.judul}</h3>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 mt-1">
                        <span className="flex items-center gap-1"><User className="h-4 w-4"/> Pasien ID: {rec.pasien_id?.slice(0,8)}</span>
                        <span className="flex items-center gap-1"><Calendar className="h-4 w-4"/> {new Date(rec.created_at).toLocaleDateString('id-ID')}</span>
                        <Badge variant="outline" className="uppercase text-[10px] bg-slate-100">{rec.type}</Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4 mt-4">
                    <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 text-sm">
                      <strong className="block text-slate-700 mb-1">Keluhan Pasien:</strong>
                      <p className="text-slate-600">{rec.deskripsi || '-'}</p>
                    </div>
                    <div className="bg-blue-50/50 rounded-lg p-3 border border-blue-100 text-sm">
                      <strong className="block text-blue-800 mb-1">Catatan & Diagnosis:</strong>
                      <p className="text-blue-700">{rec.catatan_dokter || '-'}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
