'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { scheduleService } from '@/services/medical.service'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Calendar, Clock, FileText } from 'lucide-react'

const statusColor: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  completed: 'bg-gray-100 text-gray-700',
}

export default function BookingDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['booking', id],
    queryFn: () => scheduleService.getBooking(id),
  })

  const { mutate: cancel, isPending } = useMutation({
    mutationFn: () => scheduleService.deleteBooking(id),
    onSuccess: () => {
      toast.success('Booking dibatalkan')
      qc.invalidateQueries({ queryKey: ['bookings'] })
      router.push('/bookings')
    },
    onError: () => toast.error('Gagal membatalkan booking'),
  })

  const booking = data?.data

  if (isLoading) return <Skeleton className="h-64 w-full max-w-3xl" />
  if (!booking) return <div className="text-center py-16 text-muted-foreground">Booking tidak ditemukan</div>

  return (
    <div className="max-w-3xl space-y-4">
      <Button variant="ghost" onClick={() => router.back()} className="text-muted-foreground">← Kembali</Button>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Detail Booking</CardTitle>
            {booking.status && (
              <Badge className={statusColor[booking.status] || 'bg-gray-100 text-gray-700'} variant="outline">
                {booking.status}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900">
              <Calendar className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-xs text-muted-foreground">Tanggal</p>
                <p className="font-medium">{booking.appointment_date}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900">
              <Clock className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-xs text-muted-foreground">Waktu</p>
                <p className="font-medium">{booking.start_time} - {booking.end_time}</p>
              </div>
            </div>
            {booking.notes && (
              <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900">
                <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">Catatan</p>
                  <p className="text-sm">{booking.notes}</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => router.push(`/queue/${id}`)}
              className="flex-1"
            >
              Lihat Antrian
            </Button>
            {booking.status !== 'cancelled' && booking.status !== 'completed' && (
              <Button
                variant="destructive"
                onClick={() => cancel()}
                disabled={isPending}
                className="flex-1"
              >
                {isPending ? 'Membatalkan...' : 'Batalkan'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
