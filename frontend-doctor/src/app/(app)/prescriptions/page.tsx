'use client'

import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { prescriptionService } from '@/services/prescription.service'
import { useAuthStore } from '@/store/auth.store'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Loader2, Pill, PlusCircle, Trash2, ArrowRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export default function PrescriptionsPage() {
  const { user } = useAuthStore()
  const queryClient = useQueryClient()
  
  const [openModal, setOpenModal] = useState(false)
  const [pasienId, setPasienId] = useState('')
  const [notes, setNotes] = useState('')
  
  // State for items
  const [items, setItems] = useState<any[]>([])
  const [medName, setMedName] = useState('')
  const [dosage, setDosage] = useState('')
  const [frequency, setFrequency] = useState('')
  const [qty, setQty] = useState('')
  const [instructions, setInstructions] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['prescriptions'],
    queryFn: () => prescriptionService.getAllPrescriptions(),
  })

  // Combine create prescription & items
  const createMutation = useMutation({
    mutationFn: async () => {
      // 1. Create parent prescription
      const res = await prescriptionService.createPrescription({
        patient_id: pasienId,
        doctor_id: user?.id!,
        notes
      })
      const presId = res.data?.id || res.id

      // 2. Add all items
      for (const item of items) {
        await prescriptionService.createPrescriptionItem({
          prescription_id: presId,
          ...item,
          duration: '1 Minggu' // default
        })
      }
      return presId
    },
    onSuccess: () => {
      toast.success('E-Resep berhasil diterbitkan!')
      setOpenModal(false)
      setPasienId('')
      setNotes('')
      setItems([])
      queryClient.invalidateQueries({ queryKey: ['prescriptions'] })
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Gagal menerbitkan resep')
    }
  })

  const addItem = () => {
    if (!medName || !dosage || !frequency || !qty) {
      toast.error('Semua kolom obat wajib diisi')
      return
    }
    setItems([...items, { medicine_name: medName, dosage, frequency, quantity: qty, instructions }])
    setMedName('')
    setDosage('')
    setFrequency('')
    setQty('')
    setInstructions('')
  }

  const removeItem = (idx: number) => {
    setItems(items.filter((_, i) => i !== idx))
  }

  // Filter resep yang dibuat oleh dokter ini
  const allPrescriptions = data?.data || data || []
  const myPrescriptions = Array.isArray(allPrescriptions) 
    ? allPrescriptions.filter((p: any) => p.doctor_id === user?.id) 
    : []

  return (
    <div className="p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-blue-900 dark:text-blue-400">E-Resep Obat</h1>
          <p className="text-muted-foreground mt-1">Terbitkan resep obat digital untuk pasien Anda.</p>
        </div>
        
        <Dialog open={openModal} onOpenChange={setOpenModal}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <PlusCircle className="h-4 w-4 mr-2" /> Buat Resep Baru
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-blue-900">Form E-Resep Baru</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 pt-4">
              <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <h3 className="font-semibold text-slate-700">Data Umum</h3>
                <div className="space-y-2">
                  <label className="text-sm font-medium">ID Pasien</label>
                  <Input placeholder="Contoh: user-123" value={pasienId} onChange={e => setPasienId(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Catatan Tambahan Resep</label>
                  <Textarea placeholder="Misal: Harap tebus di apotek terdekat..." value={notes} onChange={e => setNotes(e.target.value)} />
                </div>
              </div>

              <div className="space-y-4 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                <h3 className="font-semibold text-blue-800 flex items-center gap-2"><Pill className="h-4 w-4"/> Tambah Daftar Obat</h3>
                <div className="grid grid-cols-2 gap-3">
                  <Input placeholder="Nama Obat (Cth: Paracetamol)" value={medName} onChange={e => setMedName(e.target.value)} />
                  <Input placeholder="Dosis (Cth: 500mg)" value={dosage} onChange={e => setDosage(e.target.value)} />
                  <Input placeholder="Frekuensi (Cth: 3x1)" value={frequency} onChange={e => setFrequency(e.target.value)} />
                  <Input placeholder="Jumlah (Cth: 10 Tablet)" value={qty} onChange={e => setQty(e.target.value)} />
                  <Input placeholder="Instruksi (Cth: Sesudah makan)" className="col-span-2" value={instructions} onChange={e => setInstructions(e.target.value)} />
                </div>
                <Button variant="outline" className="w-full text-blue-700 border-blue-200 hover:bg-blue-100" onClick={addItem}>
                  + Masukkan ke Daftar
                </Button>
              </div>

              {items.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Daftar Obat yang Diberikan ({items.length}):</label>
                  <ul className="space-y-2">
                    {items.map((it, idx) => (
                      <li key={idx} className="flex items-center justify-between bg-white p-3 rounded border border-slate-200 text-sm shadow-sm">
                        <div>
                          <strong className="text-blue-900 block">{it.medicine_name} - {it.dosage}</strong>
                          <span className="text-slate-500">{it.frequency} | Qty: {it.quantity} | {it.instructions}</span>
                        </div>
                        <Button variant="ghost" size="icon" className="text-red-500 h-8 w-8 hover:bg-red-50" onClick={() => removeItem(idx)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700 mt-2" 
                onClick={() => createMutation.mutate()} 
                disabled={createMutation.isPending || items.length === 0 || !pasienId}
              >
                {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Terbitkan Resep'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-blue-100 shadow-md">
        <CardHeader className="bg-blue-50/50 border-b border-blue-100 rounded-t-xl">
          <CardTitle className="text-lg flex items-center gap-2 text-blue-800">
            <Pill className="h-5 w-5" /> Riwayat Resep Obat
          </CardTitle>
          <CardDescription>Resep obat yang pernah Anda terbitkan.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          ) : myPrescriptions.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Pill className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p className="text-lg">Anda belum pernah menerbitkan e-resep.</p>
            </div>
          ) : (
            <div className="divide-y divide-blue-50">
              {myPrescriptions.map((pres: any) => (
                <div key={pres.id} className="p-6 hover:bg-slate-50 transition-colors">
                  <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4">
                    <div>
                      <h3 className="font-bold text-blue-900 flex items-center gap-2">
                        Resep #{pres.id.slice(0,6)}
                        <Badge variant="outline" className="bg-blue-50">Valid</Badge>
                      </h3>
                      <p className="text-sm text-slate-500 mt-1">Pasien ID: {pres.patient_id?.slice(0,8)}</p>
                      {pres.notes && <p className="text-sm text-slate-600 mt-2 italic">&quot;{pres.notes}&quot;</p>}
                    </div>
                  </div>
                  
                  {pres.items && pres.items.length > 0 && (
                    <div className="bg-white border border-slate-100 rounded-lg overflow-hidden">
                      <div className="bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-500 border-b">DAFTAR OBAT</div>
                      <div className="divide-y divide-slate-100">
                        {pres.items.map((item: any) => (
                          <div key={item.id} className="px-4 py-3 flex justify-between items-center text-sm">
                            <div>
                              <p className="font-semibold text-slate-800">{item.medicine_name} <span className="text-slate-400 font-normal">({item.dosage})</span></p>
                              <p className="text-slate-500 mt-0.5"><ArrowRight className="inline h-3 w-3 mr-1"/>{item.frequency} - {item.instructions}</p>
                            </div>
                            <div className="font-medium text-blue-700 bg-blue-50 px-3 py-1 rounded-full">
                              Qty: {item.quantity}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
