'use client'

import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { scheduleService } from '@/services/schedule.service'
import { useAuthStore } from '@/store/auth.store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { Loader2, Trash2, PlusCircle, Clock } from 'lucide-react'

const DAYS = [
  'Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'
]

export default function SchedulePage() {
  const { user } = useAuthStore()
  const queryClient = useQueryClient()

  const [day, setDay] = useState<string>('1')
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('14:00')

  const { data, isLoading } = useQuery({
    queryKey: ['schedules', user?.id],
    queryFn: () => scheduleService.getDoctorSchedules(user?.id!),
    enabled: !!user?.id
  })

  const createMutation = useMutation({
    mutationFn: scheduleService.createSchedule,
    onSuccess: () => {
      toast.success('Jadwal berhasil ditambahkan!')
      queryClient.invalidateQueries({ queryKey: ['schedules', user?.id] })
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Gagal menambahkan jadwal')
    }
  })

  const deleteMutation = useMutation({
    mutationFn: scheduleService.deleteSchedule,
    onSuccess: () => {
      toast.success('Jadwal berhasil dihapus!')
      queryClient.invalidateQueries({ queryKey: ['schedules', user?.id] })
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Gagal menghapus jadwal')
    }
  })

  const handleAdd = () => {
    if (!user?.id) return
    if (!startTime || !endTime) {
      toast.error('Jam mulai dan jam selesai harus diisi')
      return
    }
    createMutation.mutate({
      doctor_id: user.id,
      day_of_week: parseInt(day),
      start_time: startTime,
      end_time: endTime
    })
  }

  const schedules = data?.data || []

  return (
    <div className="p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-blue-900 dark:text-blue-400">Jadwal Praktik</h1>
        <p className="text-muted-foreground mt-1">Kelola hari dan jam operasional layanan Anda.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-[300px_1fr]">
        <Card className="h-fit border-blue-100 shadow-md">
          <CardHeader className="bg-blue-50/50 border-b border-blue-100 rounded-t-xl pb-4">
            <CardTitle className="text-lg flex items-center gap-2 text-blue-800">
              <PlusCircle className="h-5 w-5" /> Tambah Jadwal
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Hari Praktik</label>
              <Select value={day} onValueChange={setDay}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Hari" />
                </SelectTrigger>
                <SelectContent>
                  {DAYS.map((d, i) => (
                    <SelectItem key={i} value={i.toString()}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Jam Mulai</label>
                <Input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Jam Selesai</label>
                <Input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} />
              </div>
            </div>

            <Button 
              className="w-full bg-blue-600 hover:bg-blue-700 mt-2" 
              onClick={handleAdd}
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Simpan Jadwal'}
            </Button>
          </CardContent>
        </Card>

        <Card className="border-blue-100 shadow-md">
          <CardHeader className="bg-blue-50/50 border-b border-blue-100 rounded-t-xl pb-4">
            <CardTitle className="text-lg flex items-center gap-2 text-blue-800">
              <Clock className="h-5 w-5" /> Daftar Jadwal Aktif
            </CardTitle>
            <CardDescription>
              Jadwal yang terdaftar di bawah ini akan muncul di aplikasi pasien.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              </div>
            ) : schedules.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground bg-slate-50 rounded-lg border border-dashed">
                <Clock className="h-10 w-10 mx-auto mb-3 opacity-20" />
                <p>Belum ada jadwal praktik yang didaftarkan.</p>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {schedules.map((sch: any) => (
                  <div key={sch.id} className="flex flex-col p-4 rounded-xl border border-blue-100 bg-white shadow-sm hover:shadow-md transition-all relative group">
                    <div className="font-bold text-blue-900 mb-1">{DAYS[sch.day_of_week]}</div>
                    <div className="text-sm text-slate-600 font-medium">
                      {sch.start_time.slice(0, 5)} - {sch.end_time.slice(0, 5)}
                    </div>
                    
                    <Button 
                      variant="destructive" 
                      size="icon" 
                      className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => {
                        if (confirm('Hapus jadwal ini?')) {
                          deleteMutation.mutate(sch.id)
                        }
                      }}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
