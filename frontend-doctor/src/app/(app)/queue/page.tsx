'use client'

import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queueService } from '@/services/queue.service'
import { useAuthStore } from '@/store/auth.store'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { Loader2, Users, Calendar, Clock, CheckCircle2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

const getStatusColor = (status: string) => {
  switch (status) {
    case 'menunggu': return 'bg-amber-100 text-amber-800 border-amber-200'
    case 'dipanggil': return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'selesai': return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'tidak_hadir': return 'bg-slate-100 text-slate-800 border-slate-200'
    case 'booked': return 'bg-amber-100 text-amber-800 border-amber-200'
    case 'cancelled': return 'bg-red-100 text-red-800 border-red-200'
    default: return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'booked': return 'Menunggu'
    case 'menunggu': return 'Menunggu'
    case 'dipanggil': return 'Sedang Dipanggil'
    case 'selesai': return 'Selesai'
    case 'tidak_hadir': return 'Tidak Hadir'
    case 'cancelled': return 'Dibatalkan'
    default: return status
  }
}

export default function QueuePage() {
  const { user } = useAuthStore()
  const queryClient = useQueryClient()
  const [filterStatus, setFilterStatus] = useState<string>('all')

  const { data, isLoading } = useQuery({
    queryKey: ['doctor-bookings', user?.id],
    queryFn: () => queueService.getAllBookings(user?.id!),
    enabled: !!user?.id
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => 
      queueService.updateQueueStatus(id, status),
    onSuccess: () => {
      toast.success('Status antrean berhasil diperbarui')
      queryClient.invalidateQueries({ queryKey: ['doctor-bookings', user?.id] })
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Gagal memperbarui status')
    }
  })

  const handleUpdateStatus = (id: string, newStatus: string) => {
    updateMutation.mutate({ id, status: newStatus })
  }

  const allBookings = data?.data || []
  
  // Filter out cancelled bookings unless we want to see them
  const activeBookings = allBookings.filter((b: any) => b.status !== 'cancelled')

  const filteredBookings = filterStatus === 'all' 
    ? activeBookings 
    : activeBookings.filter((b: any) => {
        // Handle mapping because 'booked' means 'menunggu' in queue context
        if (filterStatus === 'menunggu') return b.status === 'booked' || b.status === 'menunggu'
        return b.status === filterStatus
      })

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-blue-900 dark:text-blue-400">Antrean Pasien</h1>
          <p className="text-muted-foreground mt-1">Kelola status kehadiran dan antrean janji temu pasien Anda.</p>
        </div>
        
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            <SelectItem value="menunggu">Menunggu</SelectItem>
            <SelectItem value="dipanggil">Sedang Dipanggil</SelectItem>
            <SelectItem value="selesai">Selesai</SelectItem>
            <SelectItem value="tidak_hadir">Tidak Hadir</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="border-blue-100 shadow-md">
        <CardHeader className="bg-blue-50/50 border-b border-blue-100 rounded-t-xl">
          <CardTitle className="text-lg flex items-center gap-2 text-blue-800">
            <Users className="h-5 w-5" /> Daftar Riwayat & Antrean Pasien
          </CardTitle>
          <CardDescription>Menampilkan semua jadwal pasien tanpa dibatasi hari.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p className="text-lg">Tidak ada data antrean pasien.</p>
            </div>
          ) : (
            <div className="divide-y divide-blue-50">
              {filteredBookings.map((booking: any) => (
                <div key={booking.id} className="p-6 hover:bg-slate-50 transition-colors flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                  
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-bold text-blue-900 text-lg">
                        {booking.pasien_name || 'Pasien Tidak Diketahui'}
                      </h3>
                      <Badge variant="outline" className={`${getStatusColor(booking.status)}`}>
                        {getStatusLabel(booking.status)}
                      </Badge>
                    </div>
                    
                    <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                      <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1 rounded-full">
                        <Calendar className="h-4 w-4 text-blue-600" />
                        <span className="font-medium">{new Date(booking.appointment_date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1 rounded-full">
                        <Clock className="h-4 w-4 text-blue-600" />
                        <span className="font-medium">{booking.start_time.slice(0,5)} - {booking.end_time.slice(0,5)} WIB</span>
                      </div>
                    </div>

                    {booking.notes && (
                      <p className="text-sm text-slate-500 italic mt-2 border-l-2 border-blue-200 pl-3">
                        &quot;{booking.notes}&quot;
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
                    {(booking.status === 'booked' || booking.status === 'menunggu') && (
                      <Button 
                        size="sm" 
                        className="bg-blue-600 hover:bg-blue-700 flex-1 md:flex-none"
                        onClick={() => handleUpdateStatus(booking.id, 'dipanggil')}
                        disabled={updateMutation.isPending}
                      >
                        Panggil Pasien
                      </Button>
                    )}
                    {booking.status === 'dipanggil' && (
                      <Button 
                        size="sm" 
                        className="bg-blue-600 hover:bg-blue-700 flex-1 md:flex-none"
                        onClick={() => handleUpdateStatus(booking.id, 'selesai')}
                        disabled={updateMutation.isPending}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" /> Tandai Selesai
                      </Button>
                    )}
                    {booking.status !== 'selesai' && booking.status !== 'tidak_hadir' && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="text-slate-600 hover:bg-slate-100 flex-1 md:flex-none"
                        onClick={() => handleUpdateStatus(booking.id, 'tidak_hadir')}
                        disabled={updateMutation.isPending}
                      >
                        Tidak Hadir
                      </Button>
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
