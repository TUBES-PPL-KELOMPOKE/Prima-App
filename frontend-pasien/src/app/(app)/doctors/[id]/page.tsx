'use client'

import { useQuery } from '@tanstack/react-query'
import { useParams, useRouter } from 'next/navigation'
import { doctorService } from '@/services/medical.service'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { MapPin, Star, Clock, ChevronLeft, Building2, DollarSign } from 'lucide-react'

export default function DoctorDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const { data, isLoading } = useQuery({
    queryKey: ['doctor', id],
    queryFn: () => doctorService.getById(id),
  })
  const doc = data?.data

  if (isLoading) return (
    <div className="p-4 space-y-4">
      <Skeleton className="h-40 rounded-2xl" />
      <Skeleton className="h-32 rounded-2xl" />
    </div>
  )
  if (!doc) return <p className="text-center py-16 text-sm text-gray-400">Dokter tidak ditemukan</p>

  return (
    <div className="pb-4">
      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-600 to-cyan-600 px-4 pt-3 pb-10">
        <button onClick={() => router.back()} className="mb-4 bg-white/20 p-1.5 rounded-full">
          <ChevronLeft className="h-5 w-5 text-white" />
        </button>
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20 border-4 border-white/30">
            <AvatarImage src={doc.foto_profil_url} />
            <AvatarFallback className="text-2xl bg-white/20 text-white font-bold">
              {doc.name?.charAt(0)?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-white font-bold text-lg leading-tight">{doc.name}</h1>
            <Badge className="bg-white/20 text-white border-0 text-xs mt-1">{doc.spesialisasi}</Badge>
            <div className="flex items-center gap-3 mt-1.5">
              {doc.rating && (
                <span className="flex items-center gap-1 text-xs text-yellow-300">
                  <Star className="h-3 w-3 fill-yellow-300" />{doc.rating}
                </span>
              )}
              {doc.pengalaman_tahun && (
                <span className="flex items-center gap-1 text-xs text-blue-100">
                  <Clock className="h-3 w-3" />{doc.pengalaman_tahun} thn
                </span>
              )}
              {doc.kota && (
                <span className="flex items-center gap-1 text-xs text-blue-100">
                  <MapPin className="h-3 w-3" />{doc.kota}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-4 -mt-5 space-y-3">
        {/* Info card */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 space-y-3">
          {doc.deskripsi_profil && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Tentang Dokter</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{doc.deskripsi_profil}</p>
            </div>
          )}
          {doc.biaya_konsultasi && (
            <div className="flex items-center gap-2 py-2 border-t border-gray-50 dark:border-gray-800">
              <DollarSign className="h-4 w-4 text-green-500" />
              <span className="text-sm font-semibold text-green-600">
                Rp {Number(doc.biaya_konsultasi).toLocaleString('id-ID')}
              </span>
              <span className="text-xs text-gray-400">/ konsultasi</span>
            </div>
          )}
          {doc.nama_klinik && (
            <div className="flex items-center gap-2 py-2 border-t border-gray-50 dark:border-gray-800">
              <Building2 className="h-4 w-4 text-gray-400 shrink-0" />
              <div>
                <p className="text-sm font-medium">{doc.nama_klinik}</p>
                {doc.alamat_klinik && <p className="text-xs text-gray-400">{doc.alamat_klinik}</p>}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            className="rounded-xl h-11"
            onClick={() => router.push(`/bookings/create?doctor_id=${doc.id}&doctor_name=${encodeURIComponent(doc.name)}`)}
          >
            Buat Booking
          </Button>
          <Button
            className="rounded-xl h-11"
            onClick={() => router.push('/consultations')}
          >
            Konsultasi
          </Button>
        </div>
      </div>
    </div>
  )
}
