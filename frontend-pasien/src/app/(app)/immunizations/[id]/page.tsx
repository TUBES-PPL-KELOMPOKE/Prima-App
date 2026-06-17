'use client'

import { useQuery } from '@tanstack/react-query'
import { useParams, useRouter } from 'next/navigation'
import { immunizationService } from '@/services/index'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

export default function ImmunizationDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const { data, isLoading } = useQuery({
    queryKey: ['immunization', id],
    queryFn: () => immunizationService.getById(id),
  })

  const item = data?.data

  if (isLoading) return <Skeleton className="h-64 w-full max-w-3xl" />
  if (!item) return <div className="text-center py-16 text-muted-foreground">Imunisasi tidak ditemukan</div>

  return (
    <div className="max-w-3xl space-y-4">
      <Button variant="ghost" onClick={() => router.back()} className="text-muted-foreground">← Kembali</Button>

      <Card>
        <CardHeader>
          <CardTitle>{(item.jenis_vaksin || 'Detail Imunisasi') as string}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            {Object.entries(item as Record<string, unknown>)
              .filter(([k, v]) => !['id'].includes(k) && v !== null && v !== undefined)
              .map(([k, v]) => (
                <div key={k} className="flex gap-2 py-1 border-b last:border-0">
                  <span className="text-muted-foreground capitalize min-w-[140px]">{k.replace(/_/g, ' ')}</span>
                  <span>{String(v)}</span>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
