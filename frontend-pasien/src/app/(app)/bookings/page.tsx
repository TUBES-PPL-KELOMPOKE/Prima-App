'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { scheduleService } from '@/services/medical.service'
import { useAuthStore } from '@/store/auth.store'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Calendar, Clock, Plus, ChevronRight } from 'lucide-react'
import { Booking } from '@/types'

const statusColor: Record<string, string> = {
  pending:   'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  completed: 'bg-gray-100 text-gray-600',
}

export default function BookingsPage() {
  const user = useAuthStore(s => s.user)
  const { data, isLoading } = useQuery({
    queryKey: ['bookings', user?.id],
    queryFn: () => scheduleService.listByUser(user!.id),
    enabled: !!user?.id,
  })
  const bookings: Booking[] = data?.data || []

  return (
    <div>
      <div className="flex items-center justify-end mb-6">
        <Link href="/bookings/create">
          <Button className="rounded-full px-5">
            <Plus className="h-4 w-4 mr-1.5" />Buat Booking
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)
          : bookings.length === 0
            ? (
              <div className="text-center py-16">
                <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-200" />
                <p className="text-sm text-gray-400">Belum ada booking</p>
                <Link href="/bookings/create">
                  <Button className="mt-4 rounded-full text-sm" size="sm">Buat Booking Sekarang</Button>
                </Link>
              </div>
            )
            : bookings.map(b => (
              <Link key={b.id} href={`/bookings/${b.id}`}>
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 flex items-center gap-3 active:bg-gray-50">
                  <div className="bg-blue-50 p-3 rounded-xl shrink-0">
                    <Calendar className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800">{(b as any).doctor_nama || (b as any).doctor_name || (b as any).doctor?.name || `Booking #${b.id?.slice(0, 8)}`}</p>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500">
                      <span>{b.appointment_date ? new Date(b.appointment_date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : ''}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{b.start_time}–{b.end_time}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {b.status && (
                      <Badge className={`text-[10px] ${statusColor[b.status] || 'bg-gray-100 text-gray-600'}`} variant="outline">
                        {b.status}
                      </Badge>
                    )}
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
