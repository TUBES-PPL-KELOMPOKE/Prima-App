'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { programService } from '@/services/index'
import { useAuthStore } from '@/store/auth.store'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ChevronLeft, CalendarDays, MapPin, Users } from 'lucide-react'

export default function ProgramDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const user = useAuthStore(s => s.user)
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['program', id],
    queryFn: () => programService.getById(id),
  })

  const { mutate: register, isPending: registering } = useMutation({
    mutationFn: () => programService.register(id, user!.id),
    onSuccess: () => { toast.success('Berhasil mendaftar!'); qc.invalidateQueries({ queryKey: ['program', id] }) },
    onError: (e: unknown) => toast.error((e as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Gagal mendaftar'),
  })
  const { mutate: cancel, isPending: cancelling } = useMutation({
    mutationFn: () => programService.cancel(id, user!.id),
    onSuccess: () => { toast.success('Pendaftaran dibatalkan'); qc.invalidateQueries({ queryKey: ['program', id] }) },
    onError: () => toast.error('Gagal membatalkan'),
  })

  const p = data?.data
  if (isLoading) return <div className="p-4 space-y-3"><Skeleton className="h-40 rounded-2xl" /><Skeleton className="h-32 rounded-2xl" /></div>
  if (!p) return <p className="text-center py-16 text-sm text-gray-400">Program tidak ditemukan</p>

  return (
    <div className="pb-4">
      <div className="px-4 py-3 flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950">
        <button onClick={() => router.back()} className="p-1 -ml-1"><ChevronLeft className="h-5 w-5 text-gray-500" /></button>
        <span className="font-bold text-base flex-1 truncate">{p.nama}</span>
        <Badge className="shrink-0">{p.type}</Badge>
      </div>

      <div className="px-4 pt-4 space-y-3">
        {p.deskripsi && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{p.deskripsi}</p>
          </div>
        )}

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <CalendarDays className="h-4 w-4 text-blue-500 shrink-0" />
            <span className="text-gray-600 dark:text-gray-400">{p.tanggal_mulai} — {p.tanggal_selesai}</span>
          </div>
          {p.lokasi && (
            <div className="flex items-center gap-3 text-sm">
              <MapPin className="h-4 w-4 text-red-400 shrink-0" />
              <span className="text-gray-600 dark:text-gray-400">{p.lokasi}</span>
            </div>
          )}
          <div className="flex items-center gap-3 text-sm">
            <Users className="h-4 w-4 text-green-500 shrink-0" />
            <span className="text-gray-600 dark:text-gray-400">Peserta: <b>{p.participants_count || 0}</b> / {p.kuota}</span>
          </div>
        </div>

        {p.status === 'aktif' && (
          <div className="grid grid-cols-2 gap-2">
            <Button className="rounded-xl h-11" onClick={() => register()} disabled={registering}>
              {registering ? 'Mendaftar...' : 'Daftar Program'}
            </Button>
            <Button variant="outline" className="rounded-xl h-11" onClick={() => cancel()} disabled={cancelling}>
              {cancelling ? '...' : 'Batalkan Daftar'}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
