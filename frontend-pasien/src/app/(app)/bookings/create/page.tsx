'use client'

import { Suspense, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { doctorService, scheduleService } from '@/services/medical.service'
import { useAuthStore } from '@/store/auth.store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ChevronLeft, ChevronRight, Search, Star, MapPin, Check } from 'lucide-react'
import { Doctor, Schedule } from '@/types'

const schema = z.object({
  appointment_date: z.string().min(1, 'Tanggal wajib diisi'),
  start_time: z.string().regex(/^\d{2}:\d{2}$/, 'Format HH:MM'),
  end_time: z.string().regex(/^\d{2}:\d{2}$/, 'Format HH:MM'),
  notes: z.string().optional(),
})
type FormData = z.infer<typeof schema>

const DAY_NAMES = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']

function CreateBookingFlow() {
  const router = useRouter()
  const user = useAuthStore(s => s.user)

  // Step 1: pilih dokter, Step 2: isi jadwal
  const [step, setStep] = useState<1 | 2>(1)
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)
  const [search, setSearch] = useState('')
  const [selectedDate, setSelectedDate] = useState('')

  const { data: doctorsData, isLoading: loadingDoctors } = useQuery({
    queryKey: ['doctors-booking', search],
    queryFn: () => doctorService.list({ ...(search && { nama: search }) }),
  })

  const { data: availableData } = useQuery({
    queryKey: ['available', selectedDoctor?.id, selectedDate],
    queryFn: () => scheduleService.getAvailable(selectedDoctor!.id, selectedDate),
    enabled: !!selectedDoctor && !!selectedDate,
  })

  const { data: doctorSchedules } = useQuery({
    queryKey: ['schedules', selectedDoctor?.id],
    queryFn: () => scheduleService.getByDoctor(selectedDoctor!.id),
    enabled: !!selectedDoctor,
  })

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const { mutate, isPending } = useMutation({
    mutationFn: (d: FormData) => scheduleService.createBooking({
      doctor_id: selectedDoctor!.id,
      pasien_id: user!.id,
      ...d,
    }),
    onSuccess: () => {
      toast.success('Booking berhasil dibuat!')
      router.push('/bookings')
    },
    onError: (e: unknown) => {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg || 'Gagal membuat booking')
    },
  })

  const doctors: Doctor[] = doctorsData?.data || []
  const schedules: Schedule[] = availableData?.data?.schedules || []
  
  // Handle both { data: [...] } and { data: { schedules: [...] } }
  const allSchedules: Schedule[] = Array.isArray(doctorSchedules?.data) 
    ? doctorSchedules.data 
    : doctorSchedules?.data?.schedules || []
  const isLoadingSchedules = useQuery({
    queryKey: ['schedules', selectedDoctor?.id],
    queryFn: () => scheduleService.getByDoctor(selectedDoctor!.id),
    enabled: !!selectedDoctor,
  }).isLoading

  // ── STEP 1: Pilih Dokter ─────────────────────────────────────────
  if (step === 1) return (
    <div className="pb-4">
      <div className="px-4 py-3 flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950">
        <button onClick={() => router.back()} className="p-1 -ml-1">
          <ChevronLeft className="h-5 w-5 text-gray-500" />
        </button>
        <span className="font-bold text-base">Pilih Dokter</span>
      </div>

      <div className="px-4 pt-3">
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Cari nama atau spesialisasi..."
            className="pl-9 rounded-xl h-10 text-sm"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          {loadingDoctors
            ? Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-[72px] rounded-2xl" />)
            : doctors.map(doc => (
              <button
                key={doc.id}
                className="w-full bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-3 flex items-center gap-3 active:bg-gray-50 text-left"
                onClick={() => { setSelectedDoctor(doc); setStep(2) }}
              >
                <Avatar className="h-12 w-12 shrink-0">
                  <AvatarImage src={doc.foto_profil_url} />
                  <AvatarFallback className="bg-blue-100 text-blue-600 font-bold text-sm">
                    {doc.name?.charAt(0)?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{doc.name}</p>
                  <Badge variant="secondary" className="text-[10px] h-4 px-1.5 mt-0.5 rounded-full">{doc.spesialisasi}</Badge>
                  <div className="flex items-center gap-3 mt-0.5">
                    {doc.kota && <span className="flex items-center gap-0.5 text-[10px] text-gray-400"><MapPin className="h-2.5 w-2.5" />{doc.kota}</span>}
                    {doc.rating && <span className="flex items-center gap-0.5 text-[10px] text-yellow-500"><Star className="h-2.5 w-2.5 fill-yellow-400" />{doc.rating}</span>}
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-300 shrink-0" />
              </button>
            ))
          }
        </div>
      </div>
    </div>
  )

  // ── STEP 2: Isi Jadwal ────────────────────────────────────────────
  return (
    <div className="pb-4">
      <div className="px-4 py-3 flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950">
        <button onClick={() => setStep(1)} className="p-1 -ml-1">
          <ChevronLeft className="h-5 w-5 text-gray-500" />
        </button>
        <span className="font-bold text-base">Atur Jadwal</span>
      </div>

      {/* Dokter terpilih */}
      <div className="mx-4 mt-3 bg-blue-50 dark:bg-blue-950/20 rounded-2xl p-3 flex items-center gap-3">
        <Avatar className="h-10 w-10 shrink-0">
          <AvatarImage src={selectedDoctor?.foto_profil_url} />
          <AvatarFallback className="bg-blue-100 text-blue-600 font-bold text-sm">
            {selectedDoctor?.name?.charAt(0)?.toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate">{selectedDoctor?.name}</p>
          <p className="text-xs text-blue-500">{selectedDoctor?.spesialisasi}</p>
        </div>
        <Check className="h-4 w-4 text-blue-600 shrink-0" />
      </div>

      {/* Jadwal Praktik Rutin */}
      {isLoadingSchedules ? (
        <div className="mx-4 mt-3 p-3 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl">
          <p className="text-xs text-gray-500 flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></span>
            Sedang mengambil jadwal dokter...
          </p>
        </div>
      ) : allSchedules.length > 0 ? (
        <div className="mx-4 mt-3 p-3 bg-orange-50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/30 rounded-2xl">
          <p className="text-xs font-semibold text-orange-800 dark:text-orange-300 mb-1">Jadwal Praktik Rutin Dokter:</p>
          <div className="flex flex-col gap-1">
            {allSchedules.map(s => (
              <div key={s.id} className="text-xs text-orange-700 dark:text-orange-400 flex justify-between">
                <span>Hari {DAY_NAMES[s.day_of_week]}</span>
                <span>{s.start_time.slice(0, 5)} - {s.end_time.slice(0, 5)}</span>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-orange-600/70 mt-2">Pastikan memilih tanggal yang sesuai dengan hari di atas.</p>
        </div>
      ) : (
        <div className="mx-4 mt-3 p-3 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-2xl">
          <p className="text-xs text-red-600 dark:text-red-400">Dokter ini belum memiliki jadwal praktik rutin.</p>
        </div>
      )}

      <form onSubmit={handleSubmit(d => mutate(d))} className="px-4 pt-3 space-y-4">
        {/* Tanggal */}
        <div className="space-y-1">
          <Label className="text-xs text-gray-500">Tanggal Kunjungan</Label>
          <Input
            type="date"
            className="h-10 rounded-xl text-sm"
            min={new Date().toISOString().split('T')[0]}
            {...register('appointment_date')}
            onChange={e => { register('appointment_date').onChange(e); setSelectedDate(e.target.value) }}
          />
          {errors.appointment_date && <p className="text-xs text-red-500">{errors.appointment_date.message}</p>}
        </div>

        {/* Jadwal tersedia */}
        {schedules.length > 0 && (
          <div>
            <p className="text-xs text-gray-400 mb-2">Jadwal tersedia — ketuk untuk mengisi otomatis:</p>
            <div className="flex flex-wrap gap-2">
              {schedules.map(s => {
                const start = s.start_time.slice(0, 5)
                const end = s.end_time.slice(0, 5)
                const active = watch('start_time') === start && watch('end_time') === end
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => { setValue('start_time', start); setValue('end_time', end) }}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${active ? 'bg-blue-600 text-white border-blue-600' : 'hover:bg-blue-50 hover:border-blue-300'}`}
                  >
                    {DAY_NAMES[s.day_of_week]} {start}–{end}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Jam */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs text-gray-500">Jam Mulai</Label>
            <Input type="time" className="h-10 rounded-xl text-sm" {...register('start_time')} />
            {errors.start_time && <p className="text-xs text-red-500">{errors.start_time.message}</p>}
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-gray-500">Jam Selesai</Label>
            <Input type="time" className="h-10 rounded-xl text-sm" {...register('end_time')} />
            {errors.end_time && <p className="text-xs text-red-500">{errors.end_time.message}</p>}
          </div>
        </div>

        {/* Catatan */}
        <div className="space-y-1">
          <Label className="text-xs text-gray-500">Catatan / Keluhan (opsional)</Label>
          <Textarea placeholder="Tuliskan keluhan Anda..." className="rounded-xl text-sm" rows={3} {...register('notes')} />
        </div>

        <Button type="submit" className="w-full rounded-xl h-11" disabled={isPending}>
          {isPending ? 'Memproses...' : 'Konfirmasi Booking'}
        </Button>
      </form>
    </div>
  )
}

export default function CreateBookingPage() {
  return (
    <Suspense fallback={<div className="p-4 space-y-2"><Skeleton className="h-14 rounded-2xl" />{Array.from({length:4}).map((_,i)=><Skeleton key={i} className="h-[72px] rounded-2xl"/>)}</div>}>
      <CreateBookingFlow />
    </Suspense>
  )
}
