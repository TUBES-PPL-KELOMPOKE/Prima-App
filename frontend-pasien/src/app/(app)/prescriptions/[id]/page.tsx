'use client'

import { useQuery } from '@tanstack/react-query'
import { useParams, useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth.store'
import { prescriptionService } from '@/services/index'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Download, Pill } from 'lucide-react'
import { Prescription } from '@/types'

export default function PrescriptionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const token = useAuthStore((s) => s.token)

  const { data, isLoading } = useQuery({
    queryKey: ['prescription', id],
    queryFn: () => prescriptionService.getById(id),
  })

  const rx: Prescription | null = data?.data || null

  const handleDownload = () => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://backend-prima.vercel.app'
    window.open(`${baseUrl}/prescription/download/${id}`, '_blank')
  }

  if (isLoading) return <Skeleton className="h-64 w-full max-w-3xl" />
  if (!rx) return <div className="text-center py-16 text-muted-foreground">Resep tidak ditemukan</div>

  return (
    <div className="max-w-3xl space-y-4">
      <Button variant="ghost" onClick={() => router.back()} className="text-muted-foreground">← Kembali</Button>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Resep #{id?.slice(0, 8)}</CardTitle>
            <Button size="sm" variant="outline" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-1" />Cetak / PDF
            </Button>
          </div>
          <div className="text-sm text-muted-foreground space-y-0.5">
            {rx.patient_name && <p>Pasien: <span className="text-foreground">{rx.patient_name}</span></p>}
            {rx.doctor_name && <p>Dokter: <span className="text-foreground">{rx.doctor_name}</span></p>}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {rx.notes && (
            <div className="text-sm bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Catatan</p>
              <p>{rx.notes}</p>
            </div>
          )}
          <div>
            <p className="text-sm font-medium mb-2">Daftar Obat</p>
            <div className="space-y-2">
              {rx.items?.map((item) => (
                <div key={item.id} className="border rounded-lg p-3 space-y-1">
                  <div className="flex items-center gap-2">
                    <Pill className="h-4 w-4 text-blue-600 shrink-0" />
                    <p className="font-medium text-sm">{item.medicine_name}</p>
                    <Badge variant="secondary" className="ml-auto text-xs">{item.quantity} pcs</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-xs text-muted-foreground pl-6">
                    <span>Dosis: {item.dosage}</span>
                    <span>Frekuensi: {item.frequency}</span>
                    <span>Durasi: {item.duration}</span>
                    {item.instructions && <span className="col-span-2">Instruksi: {item.instructions}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
