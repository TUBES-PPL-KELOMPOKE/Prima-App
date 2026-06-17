'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Pill, Download, Calendar, User, ChevronRight, FileText } from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'
import { prescriptionService } from '@/services/index'

export default function PrescriptionsPage() {
  const user = useAuthStore(s => s.user)

  const { data, isLoading } = useQuery({
    queryKey: ['prescriptions', user?.id],
    queryFn: () => prescriptionService.listByPasien(user!.id),
    enabled: !!user?.id,
  })

  const prescriptions = Array.isArray(data?.data) ? data.data : []

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://backend-prima.vercel.app'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-blue-900 dark:text-blue-400">Resep Obat</h1>
        <p className="text-muted-foreground mt-1">Daftar resep obat dari dokter Anda.</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-44 rounded-2xl" />
          ))}
        </div>
      ) : prescriptions.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
          <Pill className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p className="text-sm text-gray-500">Belum ada resep obat</p>
        </div>
      ) : (
        <div className="space-y-4">
          {prescriptions.map((rx: any) => {
            const items: any[] = rx.items ?? []
            const previewItems = items.slice(0, 2)
            const extraCount = items.length - previewItems.length
            const prescDate = rx.prescription_date
              ? new Date(rx.prescription_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
              : rx.created_at
              ? new Date(rx.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
              : '—'

            return (
              <div
                key={rx.id}
                className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 hover:shadow-md hover:border-blue-100 dark:hover:border-blue-900 transition-all"
              >
                {/* Header row */}
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-xl shrink-0">
                      <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white text-sm">
                        {rx.doctor_name ? `Dr. ${rx.doctor_name}` : `Resep #${rx.id?.slice(0, 8)}`}
                      </p>
                      <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {prescDate}
                        </span>
                        {rx.doctor_name && (
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            Dr. {rx.doctor_name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <Badge className="shrink-0 bg-blue-50 text-blue-700 hover:bg-blue-100 border-none text-xs">
                    {items.length} Obat
                  </Badge>
                </div>

                {/* Drug preview chips */}
                {previewItems.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {previewItems.map((item: any) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg px-3 py-1.5"
                      >
                        <Pill className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{item.medicine_name}</span>
                        <span className="text-xs text-gray-400">·</span>
                        <span className="text-xs text-gray-400">{item.dosage}</span>
                        <Badge variant="secondary" className="ml-1 text-xs px-1.5 py-0 h-4">{item.quantity} pcs</Badge>
                      </div>
                    ))}
                    {extraCount > 0 && (
                      <div className="flex items-center bg-gray-50 dark:bg-gray-800 border border-dashed border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5">
                        <span className="text-xs text-gray-400">+{extraCount} obat lainnya</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Notes snippet */}
                {rx.notes && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2 mb-3 line-clamp-1">
                    📋 {rx.notes}
                  </p>
                )}

                {/* Footer actions */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-50 dark:border-gray-800">
                  <Link href={`/prescriptions/${rx.id}`}>
                    <button className="flex items-center gap-1 text-xs text-blue-600 hover:underline font-medium">
                      Lihat Detail <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </Link>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs px-3 text-blue-600 border-blue-200 hover:bg-blue-50 dark:border-blue-800 dark:hover:bg-blue-900/30"
                    onClick={() => window.open(`${baseUrl}/prescription/download/${rx.id}`, '_blank')}
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Unduh PDF
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
