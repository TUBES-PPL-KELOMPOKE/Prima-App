'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Users } from 'lucide-react'

const statusColor: Record<string, string> = {
  menunggu: 'bg-yellow-100 text-yellow-700',
  dipanggil: 'bg-blue-100 text-blue-700',
  selesai: 'bg-green-100 text-green-700',
  tidak_hadir: 'bg-red-100 text-red-700',
}

export default function QueuePage() {
  const router = useRouter()
  const [sisaAntrian, setSisaAntrian] = useState(10)

  useEffect(() => {
    // DUMMY REALTIME LOGIC
    // Mengurangi antrian setiap 5 detik
    const interval = setInterval(() => {
      setSisaAntrian((prev) => Math.max(0, prev - 1))
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const nomorAntrian = 12
  const estimasiWaktu = sisaAntrian * 10
  const status = sisaAntrian === 0 ? "dipanggil" : "menunggu"

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <Button variant="ghost" onClick={() => router.back()} className="text-muted-foreground">← Kembali</Button>

      <Card>
        <CardHeader className="text-center">
          <CardTitle>Nomor Antrian</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4 pb-6">
          <div className="w-28 h-28 rounded-full bg-blue-600 flex items-center justify-center">
            <span className="text-4xl font-bold text-white">
              {nomorAntrian}
            </span>
          </div>

          <Badge className={statusColor[status] || 'bg-gray-100 text-gray-700'} variant="outline">
            {status.replace('_', ' ')}
          </Badge>

          {sisaAntrian > 0 && (
            <div className="text-center">
              <div className="flex items-center gap-2 justify-center text-muted-foreground">
                <Users className="h-4 w-4" />
                <span className="text-sm">{sisaAntrian} orang di depan Anda</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">Estimasi waktu: ± {estimasiWaktu} menit</p>
            </div>
          )}

          {sisaAntrian === 0 && (
            <p className="text-green-600 font-medium text-sm mt-2">Anda giliran berikutnya!</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
