'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import { toast } from 'sonner'
import { consultationService, doctorService } from '@/services/medical.service'
import { useAuthStore } from '@/store/auth.store'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { MessageSquare, Plus, ChevronRight } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useState } from 'react'
import { Consultation, Doctor } from '@/types'
import { cn } from '@/lib/utils'

const statusColor: Record<string, string> = {
  aktif:      'bg-green-100 text-green-700',
  selesai:    'bg-gray-100 text-gray-600',
  dibatalkan: 'bg-red-100 text-red-700',
}

export default function ConsultationsPage() {
  const user = useAuthStore(s => s.user)
  const qc = useQueryClient()
  const [open, setOpen] = useState(false)
  const [selectedDoctor, setSelectedDoctor] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['consultations', user?.id],
    queryFn: () => consultationService.listByPasien(user!.id),
    enabled: !!user?.id,
  })
  const { data: doctorsData } = useQuery({
    queryKey: ['doctors'],
    queryFn: () => doctorService.list(),
  })

  const { mutate: create, isPending } = useMutation({
    mutationFn: () => consultationService.create({ pasien_id: user!.id, doctor_id: selectedDoctor }),
    onSuccess: () => {
      toast.success('Konsultasi berhasil dibuat')
      qc.invalidateQueries({ queryKey: ['consultations'] })
      setOpen(false)
      setSelectedDoctor('')
    },
    onError: () => toast.error('Gagal membuat konsultasi'),
  })

  const consultations: Consultation[] = data?.data || []
  const doctors: Doctor[] = doctorsData?.data || []

  return (
    <div>
      <div className="flex items-center justify-end mb-6">
        <Button className="rounded-full px-5" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4 mr-1.5" />Konsultasi Baru
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Pilih Dokter</DialogTitle></DialogHeader>
          <Select onValueChange={v => setSelectedDoctor(String(v || ''))}>
            <SelectTrigger className="rounded-xl"><SelectValue placeholder="Pilih dokter..." /></SelectTrigger>
            <SelectContent>
              {doctors.map(d => (
                <SelectItem key={d.id} value={d.id}>{d.name} — {d.spesialisasi}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button className="w-full rounded-xl" onClick={() => create()} disabled={!selectedDoctor || isPending}>
            {isPending ? 'Membuat...' : 'Mulai Konsultasi'}
          </Button>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-18 rounded-2xl" />)
          : consultations.length === 0
            ? (
              <div className="text-center py-16">
                <MessageSquare className="h-12 w-12 mx-auto mb-3 text-gray-200" />
                <p className="text-sm text-gray-400">Belum ada konsultasi</p>
              </div>
            )
            : consultations.map(c => (
              <Link key={c.id} href={`/consultations/${c.id}`}>
                <div className={cn(
                  'bg-white dark:bg-gray-900 rounded-2xl border p-4 flex items-center gap-3 active:bg-gray-50',
                  c.status === 'aktif' ? 'border-green-100 dark:border-green-900/30' : 'border-gray-100 dark:border-gray-800'
                )}>
                  <div className={cn('p-3 rounded-xl shrink-0', c.status === 'aktif' ? 'bg-green-50' : 'bg-gray-50 dark:bg-gray-800')}>
                    <MessageSquare className={cn('h-5 w-5', c.status === 'aktif' ? 'text-green-600' : 'text-gray-400')} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">
                      {c.doctor_name ? `Dr. ${c.doctor_name}` : `Konsultasi #${c.id?.slice(0, 8)}`}
                    </p>
                    <p className="text-xs text-gray-400">
                      {c.created_at ? new Date(c.created_at).toLocaleDateString('id-ID') : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Badge className={`text-[10px] ${statusColor[c.status] || ''}`} variant="outline">{c.status}</Badge>
                    <ChevronRight className="h-4 w-4 text-gray-300" />
                  </div>
                </div>
              </Link>
            ))
        }
      </div>
    </div>
  )
}
