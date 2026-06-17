'use client'

import { useQuery } from '@tanstack/react-query'
import { useParams, useRouter } from 'next/navigation'
import { documentService } from '@/services/index'
import { useAuthStore } from '@/store/auth.store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Download } from 'lucide-react'

export default function DocumentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const token = useAuthStore((s) => s.token)
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

  const { data, isLoading } = useQuery({
    queryKey: ['document', id],
    queryFn: () => documentService.getById(id),
  })

  const doc = data?.data
  const download = (type: 'sk' | 'sr' | 'ss') => {
    window.open(`${baseUrl}/document/download/${type}/${id}?token=${token}`, '_blank')
  }

  if (isLoading) return <Skeleton className="h-64 w-full max-w-3xl" />
  if (!doc) return <div className="text-center py-16 text-muted-foreground">Dokumen tidak ditemukan</div>

  return (
    <div className="max-w-3xl space-y-4">
      <Button variant="ghost" onClick={() => router.back()} className="text-muted-foreground">← Kembali</Button>

      <Card>
        <CardHeader>
          <CardTitle>Detail Dokumen</CardTitle>
          <p className="text-xs text-muted-foreground">ID: {id}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-2 text-sm">
            {Object.entries(doc).filter(([k]) => !['id', 'created_at', 'updated_at', 'deleted_at'].includes(k)).map(([k, v]) => (
              v ? (
                <div key={k} className="flex gap-2 py-1 border-b last:border-0">
                  <span className="text-muted-foreground capitalize min-w-[120px]">{k.replace(/_/g, ' ')}</span>
                  <span>{String(v)}</span>
                </div>
              ) : null
            ))}
          </div>

          <div>
            <p className="text-sm font-medium mb-2">Download Dokumen</p>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => download('sk')}>
                <Download className="h-3.5 w-3.5 mr-1" />Surat Keterangan
              </Button>
              <Button size="sm" variant="outline" onClick={() => download('sr')}>
                <Download className="h-3.5 w-3.5 mr-1" />Surat Rujukan
              </Button>
              <Button size="sm" variant="outline" onClick={() => download('ss')}>
                <Download className="h-3.5 w-3.5 mr-1" />Surat Sakit
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
