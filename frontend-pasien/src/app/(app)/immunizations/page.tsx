'use client'

import { useQuery } from '@tanstack/react-query'
import { immunizationService } from '@/services/index'
import { useAuthStore } from '@/store/auth.store'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Syringe, Calendar, User, MapPin } from 'lucide-react'

export default function ImmunizationsPage() {
  const user = useAuthStore(s => s.user)

  const { data, isLoading } = useQuery({
    queryKey: ['immunizations', user?.id],
    queryFn: () => immunizationService.listByPasien(user!.id),
    enabled: !!user?.id,
  })

  const immunizations = Array.isArray(data?.data) ? data.data : []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-teal-900 dark:text-teal-400">Riwayat Imunisasi</h1>
        {user?.name && (
          <p className="text-sm text-teal-700 dark:text-teal-300">Pasien: {user.name}</p>
        )}
        <p className="text-muted-foreground mt-1">Daftar riwayat imunisasi dan vaksinasi yang telah Anda terima.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-xl" />)
        ) : immunizations.length === 0 ? (
          <div className="col-span-full text-center py-16 bg-white dark:bg-gray-900 rounded-2xl border border-dashed border-gray-200">
            <Syringe className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm text-gray-500">Belum ada riwayat imunisasi yang tercatat</p>
          </div>
        ) : (
          immunizations.map((rec: any) => (
            <div key={rec.id} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 flex flex-col justify-between hover:shadow-md transition-all hover:border-teal-100 h-full">
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="bg-teal-50 dark:bg-teal-900/30 p-3 rounded-xl text-teal-600">
                    <Syringe className="h-6 w-6" />
                  </div>
                  <Badge className="bg-teal-100 text-teal-700 hover:bg-teal-200 border-none">
                    Dosis {rec.dosis_ke}
                  </Badge>
                </div>
                
                <h3 className="font-semibold text-lg text-teal-900 truncate">{rec.nama_vaksin}</h3>
                <p className="text-sm text-teal-600/80 font-medium mb-3">{rec.jenis_vaksin || 'Umum'}</p>

                <div className="space-y-2 text-sm text-gray-500 mt-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 shrink-0 text-teal-500" />
                    <span className="truncate">{new Date(rec.tanggal_vaksin).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  </div>
                  {rec.doctor_name && (
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 shrink-0 text-teal-500" />
                      <span className="truncate">Dr. {rec.doctor_name}</span>
                    </div>
                  )}
                  {rec.lokasi && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 shrink-0 text-rose-400" />
                      <span className="truncate">{rec.lokasi}</span>
                    </div>
                  )}
                </div>
              </div>
              
              {(rec.catatan || rec.tanggal_berikutnya) && (
                <div className="mt-4 pt-4 border-t border-gray-50 space-y-3">
                  {rec.catatan && (
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Catatan</p>
                      <p className="text-sm text-gray-600 line-clamp-2">{rec.catatan}</p>
                    </div>
                  )}
                  {rec.tanggal_berikutnya && (
                    <div className="bg-amber-50 rounded-lg p-2.5 text-xs text-amber-800 flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5 shrink-0" />
                      <span>Berikutnya: <strong>{new Date(rec.tanggal_berikutnya).toLocaleDateString('id-ID')}</strong></span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
