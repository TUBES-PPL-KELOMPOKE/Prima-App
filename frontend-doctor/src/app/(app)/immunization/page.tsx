'use client'

import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { immunizationService } from '@/services/immunization.service'
import { useAuthStore } from '@/store/auth.store'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Loader2, PlusCircle, User, Calendar, Syringe, MapPin } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export default function ImmunizationPage() {
  const { user } = useAuthStore()
  const queryClient = useQueryClient()
  const [openModal, setOpenModal] = useState(false)

  // Form states
  const [pasienId, setPasienId] = useState('')
  const [namaVaksin, setNamaVaksin] = useState('')
  const [jenisVaksin, setJenisVaksin] = useState('')
  const [dosisKe, setDosisKe] = useState<number>(1)
  const [tanggalVaksin, setTanggalVaksin] = useState('')
  const [lokasi, setLokasi] = useState('Klinik PRIMA')
  const [catatan, setCatatan] = useState('')
  const [tanggalBerikutnya, setTanggalBerikutnya] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['immunizations', user?.id],
    queryFn: () => immunizationService.getDoctorImmunizations(user?.id!),
    enabled: !!user?.id
  })

  const createMutation = useMutation({
    mutationFn: immunizationService.createImmunization,
    onSuccess: () => {
      toast.success('Data imunisasi berhasil disimpan!')
      setOpenModal(false)
      setPasienId('')
      setNamaVaksin('')
      setJenisVaksin('')
      setDosisKe(1)
      setTanggalVaksin('')
      setCatatan('')
      setTanggalBerikutnya('')
      queryClient.invalidateQueries({ queryKey: ['immunizations', user?.id] })
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Gagal menyimpan imunisasi')
    }
  })

  const handleSave = () => {
    if (!pasienId || !namaVaksin || !tanggalVaksin) {
      toast.error('ID Pasien, Nama Vaksin, dan Tanggal Vaksin wajib diisi')
      return
    }
    createMutation.mutate({
      pasien_id: pasienId,
      doctor_id: user?.id!,
      nama_vaksin: namaVaksin,
      jenis_vaksin: jenisVaksin || 'Umum',
      dosis_ke: Number(dosisKe),
      tanggal_vaksin: tanggalVaksin,
      lokasi: lokasi,
      catatan: catatan,
      tanggal_berikutnya: tanggalBerikutnya || ''
    })
  }

  const immunizations = data?.data || []

  return (
    <div className="p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-blue-900 dark:text-blue-400">Imunisasi Pasien</h1>
          <p className="text-muted-foreground mt-1">Catat dan kelola pemberian vaksin/imunisasi pasien Anda.</p>
        </div>
        
        <Dialog open={openModal} onOpenChange={setOpenModal}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 shadow-md">
              <PlusCircle className="h-4 w-4 mr-2" /> Tambah Imunisasi
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-blue-900 flex items-center gap-2">
                <Syringe className="h-5 w-5 text-blue-600" /> Catat Imunisasi Baru
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">ID Pasien *</label>
                <Input placeholder="Contoh: user-123" value={pasienId} onChange={e => setPasienId(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nama Vaksin *</label>
                  <Input placeholder="Misal: Sinovac" value={namaVaksin} onChange={e => setNamaVaksin(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Jenis Vaksin</label>
                  <Input placeholder="Misal: COVID-19" value={jenisVaksin} onChange={e => setJenisVaksin(e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Dosis Ke</label>
                  <Input type="number" min="1" value={dosisKe} onChange={e => setDosisKe(parseInt(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tanggal Vaksinasi *</label>
                  <Input type="date" value={tanggalVaksin} onChange={e => setTanggalVaksin(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Lokasi</label>
                <Input value={lokasi} onChange={e => setLokasi(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Catatan / Reaksi KIPI</label>
                <Textarea placeholder="Observasi medis pasca vaksinasi..." value={catatan} onChange={e => setCatatan(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Jadwal Vaksin Berikutnya (Opsional)</label>
                <Input type="date" value={tanggalBerikutnya} onChange={e => setTanggalBerikutnya(e.target.value)} />
              </div>
              <Button className="w-full bg-blue-600 hover:bg-blue-700 mt-4" onClick={handleSave} disabled={createMutation.isPending}>
                {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Simpan Data Vaksin'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-blue-100 shadow-md">
        <CardHeader className="bg-blue-50/50 border-b border-blue-100 rounded-t-xl">
          <CardTitle className="text-lg flex items-center gap-2 text-blue-800">
            <Syringe className="h-5 w-5" /> Daftar Riwayat Imunisasi
          </CardTitle>
          <CardDescription>Menampilkan semua data vaksinasi yang telah Anda berikan.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          ) : immunizations.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Syringe className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p className="text-lg">Belum ada riwayat imunisasi yang tercatat.</p>
            </div>
          ) : (
            <div className="divide-y divide-blue-50">
              {immunizations.map((rec: any) => (
                <div key={rec.id} className="p-6 hover:bg-slate-50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                    <div>
                      <h3 className="font-semibold text-lg text-blue-900 flex items-center gap-2">
                        {rec.nama_vaksin}
                        <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200">Dosis {rec.dosis_ke}</Badge>
                      </h3>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 mt-2">
                        <span className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-md"><User className="h-4 w-4 text-slate-400"/> Pasien ID: {rec.pasien_id?.slice(0,8)}</span>
                        <span className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-md"><Calendar className="h-4 w-4 text-blue-500"/> {new Date(rec.tanggal_vaksin).toLocaleDateString('id-ID')}</span>
                        {rec.lokasi && <span className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-md"><MapPin className="h-4 w-4 text-rose-400"/> {rec.lokasi}</span>}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4 mt-4">
                    {rec.catatan && (
                      <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 text-sm">
                        <strong className="block text-slate-700 mb-1">Catatan Medis / KIPI:</strong>
                        <p className="text-slate-600">{rec.catatan}</p>
                      </div>
                    )}
                    {rec.tanggal_berikutnya && (
                      <div className="bg-amber-50/50 rounded-lg p-3 border border-amber-100 text-sm">
                        <strong className="block text-amber-800 mb-1">Jadwal Vaksin Berikutnya:</strong>
                        <p className="text-amber-700 font-medium flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {new Date(rec.tanggal_berikutnya).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                      </div>
                    )}
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
