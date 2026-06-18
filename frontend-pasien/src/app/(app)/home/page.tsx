'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth.store'
import { doctorService, scheduleService, consultationService } from '@/services/medical.service'
import { programService } from '@/services/index'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Stethoscope, Calendar, MessageSquare, FileText, Pill,
  FileCheck, Syringe, Calculator, Brain, Search,
  Star, ChevronRight, Zap, Heart,
} from 'lucide-react'
import { Doctor, Booking, Consultation, Program } from '@/types'
import { cn } from '@/lib/utils'

const services = [
  { href: '/doctors',         icon: Stethoscope,   label: 'Cari Dokter',  color: 'bg-blue-50 text-blue-600' },
  { href: '/bookings',        icon: Calendar,      label: 'Booking',      color: 'bg-green-50 text-green-600' },
  { href: '/consultations',   icon: MessageSquare, label: 'Konsultasi',   color: 'bg-purple-50 text-purple-600' },
  { href: '/medical-records', icon: FileText,      label: 'Rekam Medis',  color: 'bg-orange-50 text-orange-600' },
  { href: '/prescriptions',   icon: Pill,          label: 'Resep Obat',   color: 'bg-red-50 text-red-600' },
  { href: '/documents',       icon: FileCheck,     label: 'Dokumen',      color: 'bg-teal-50 text-teal-600' },
  { href: '/immunizations',   icon: Syringe,       label: 'Imunisasi',    color: 'bg-lime-50 text-lime-600' },
  { href: '/health-calculator', icon: Calculator, label: 'Kalkulator',   color: 'bg-yellow-50 text-yellow-600' },
]

const bookingStatusColor: Record<string, string> = {
  confirmed: 'bg-green-100 text-green-700',
  pending:   'bg-yellow-100 text-yellow-700',
  cancelled: 'bg-red-100 text-red-700',
  completed: 'bg-gray-100 text-gray-600',
}

export default function HomePage() {
  const user = useAuthStore((s) => s.user)
  const router = useRouter()
  const [searchText, setSearchText] = useState('')

  const { data: doctorsData } = useQuery({
    queryKey: ['doctors-home'],
    queryFn: () => doctorService.list({ limit: 8 }),
    retry: false,
  })

  const { data: bookingsData } = useQuery({
    queryKey: ['bookings-home', user?.id],
    queryFn: () => scheduleService.listByUser(user!.id, { limit: 3 }),
    enabled: !!user?.id,
    retry: false,
  })

  const { data: consultData } = useQuery({
    queryKey: ['consultations-home', user?.id],
    queryFn: () => consultationService.listByPasien(user!.id, { status: 'aktif', limit: 3 }),
    enabled: !!user?.id,
    retry: false,
  })

  const { data: programsData } = useQuery({
    queryKey: ['programs-home'],
    queryFn: () => programService.list({ status: 'aktif', limit: 4 }),
    retry: false,
  })

  const doctors: Doctor[]           = doctorsData?.data || []
  const bookings: Booking[]         = bookingsData?.data || []
  const consultations: Consultation[] = consultData?.data || []
  const programs: Program[]         = programsData?.data || []

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchText.trim()) router.push(`/doctors?nama=${encodeURIComponent(searchText.trim())}`)
  }

  const firstName = user?.name?.split(' ')[0] || 'Pasien'

  return (
    <div className="space-y-8 -m-6 lg:-m-8">

      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-600 px-8 py-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
          <div className="flex-1 max-w-2xl">
            <p className="text-blue-100 text-sm">Halo, {firstName} 👋</p>
            <h1 className="text-white text-3xl font-bold mt-1">Selamat datang di PRIMA</h1>
            <p className="text-blue-200 text-sm mt-1">Partner Kesehatan Digital Anda</p>

            <form onSubmit={handleSearch} className="mt-6 relative max-w-xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                className="pl-12 bg-white/95 border-0 rounded-xl h-12 text-sm placeholder:text-gray-400 focus-visible:ring-0"
                placeholder="Cari dokter, spesialisasi, atau layanan..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </form>
          </div>
          <div className="hidden lg:flex shrink-0 w-48 h-48 bg-white/10 rounded-3xl items-center justify-center backdrop-blur-sm">
            <Heart className="h-24 w-24 text-white/80" />
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-8 pb-8">

        {/* Banner + AI */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 flex items-center justify-between gap-6">
            <div>
              <p className="font-bold text-lg text-gray-800 dark:text-white leading-snug">
                Konsultasi dokter, booking & rekam medis{' '}
                <span className="text-blue-600">semua dalam satu aplikasi.</span>
              </p>
              <div className="flex gap-3 mt-5">
                <Link href="/doctors" className={cn(buttonVariants({ variant: 'default' }), "rounded-full px-5")}>
                  Cari Dokter
                </Link>
                <Link href="/consultations" className={cn(buttonVariants({ variant: 'outline' }), "rounded-full px-5")}>
                  Konsultasi
                </Link>
              </div>
            </div>
            <div className="shrink-0 w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center">
              <Heart className="h-10 w-10 text-blue-500" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl p-6 text-white flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-white/20 p-2 rounded-lg">
                  <Brain className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-bold">AI Kesehatan PRIMA</p>
                  <p className="text-sm text-blue-100">Powered by Artificial Intelligence</p>
                </div>
                <Zap className="h-6 w-6 text-yellow-300 ml-auto" />
              </div>
              <p className="text-sm text-blue-100">
                Ceritakan keluhan Anda dan biarkan AI PRIMA menganalisis gejala dan merekomendasikan dokter yang tepat.
              </p>
            </div>
            <Link href="/ai-health" className={cn(buttonVariants({ variant: 'default' }), "mt-4 bg-white text-blue-600 hover:bg-blue-50 rounded-full px-5 font-semibold w-max")}>
              Analisis Sekarang
            </Link>
          </div>
        </div>

        {/* Layanan */}
        <section>
          <h2 className="text-base font-bold text-gray-800 dark:text-white mb-4">Layanan Kesehatan</h2>
          <div className="grid grid-cols-4 lg:grid-cols-8 gap-3">
            {services.map(({ href, icon: Icon, label, color }) => (
              <Link key={href} href={href}>
                <div className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:shadow-md hover:border-blue-100 transition-all">
                  <div className={cn('p-3 rounded-xl', color)}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-medium text-center leading-tight text-gray-600 dark:text-gray-400">
                    {label}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Dokter Populer */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-800 dark:text-white">Dokter Populer</h2>
            <Link href="/doctors" className="text-sm text-blue-600 flex items-center gap-1 hover:underline">
              Lihat Semua <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          {doctors.length === 0 ? (
            <p className="text-sm text-gray-400 py-8 text-center">Memuat dokter...</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {doctors.map((doc) => (
                <Link key={doc.id} href={`/doctors/${doc.id}`}>
                  <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 hover:shadow-md hover:border-blue-100 transition-all h-full">
                    <Avatar className="h-14 w-14 mx-auto mb-3">
                      <AvatarImage src={doc.foto_profil_url} />
                      <AvatarFallback className="bg-blue-100 text-blue-600 font-bold text-lg">
                        {doc.name?.charAt(0)?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <p className="text-sm font-semibold text-center text-gray-800 dark:text-white leading-tight line-clamp-1">
                      {doc.name}
                    </p>
                    <p className="text-xs text-center text-gray-400 mt-1 line-clamp-1">{doc.spesialisasi}</p>
                    {doc.rating && (
                      <div className="flex items-center justify-center gap-1 mt-2">
                        <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs font-medium text-gray-600">{doc.rating}</span>
                      </div>
                    )}
                    <div className="mt-3 text-center">
                      <span className="text-xs text-blue-600 font-medium">Lihat Profil →</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Booking + Konsultasi */}
        {(bookings.length > 0 || consultations.length > 0) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {bookings.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-bold text-gray-800 dark:text-white">Booking Terdekat</h2>
                  <Link href="/bookings" className="text-sm text-blue-600 flex items-center gap-1 hover:underline">
                    Semua <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
                <div className="space-y-3">
                  {bookings.map((b) => (
                    <Link key={b.id} href={`/bookings/${b.id}`}>
                      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 flex items-center gap-4 hover:shadow-sm transition-shadow">
                        <div className="bg-blue-50 p-3 rounded-xl">
                          <Calendar className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800 dark:text-white">{b.appointment_date}</p>
                          <p className="text-xs text-gray-400">{b.start_time} – {b.end_time}</p>
                        </div>
                        {b.status && (
                          <Badge className={cn('text-xs', bookingStatusColor[b.status] || 'bg-gray-100 text-gray-600')} variant="outline">
                            {b.status}
                          </Badge>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {consultations.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-bold text-gray-800 dark:text-white">Konsultasi Aktif</h2>
                  <Link href="/consultations" className="text-sm text-blue-600 flex items-center gap-1 hover:underline">
                    Semua <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
                <div className="space-y-3">
                  {consultations.map((c) => (
                    <Link key={c.id} href={`/consultations/${c.id}`}>
                      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-green-100 dark:border-green-900/30 p-4 flex items-center gap-4 hover:shadow-sm transition-shadow">
                        <div className="bg-green-50 p-3 rounded-xl">
                          <MessageSquare className="h-5 w-5 text-green-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800 dark:text-white">
                            Konsultasi #{c.id?.slice(0, 8)}
                          </p>
                          <p className="text-xs text-green-500 font-medium">● Aktif</p>
                        </div>
                        <Button size="sm" className="rounded-full px-4 bg-green-600 hover:bg-green-700">
                          Lanjutkan
                        </Button>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {/* Program Kesehatan */}
        {programs.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-gray-800 dark:text-white">Program Kesehatan</h2>
              <Link href="/programs" className="text-sm text-blue-600 flex items-center gap-1 hover:underline">
                Semua <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {programs.map((p) => (
                <Link key={p.id} href={`/programs/${p.id}`}>
                  <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 flex items-center gap-4 hover:shadow-sm transition-shadow">
                    <div className="bg-pink-50 p-3 rounded-xl shrink-0">
                      <Heart className="h-5 w-5 text-pink-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 dark:text-white line-clamp-1">{p.nama}</p>
                      <p className="text-xs text-gray-400">{p.tanggal_mulai} — {p.tanggal_selesai}</p>
                    </div>
                    <Badge className="text-xs bg-pink-50 text-pink-600 shrink-0" variant="outline">{p.type}</Badge>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  )
}
