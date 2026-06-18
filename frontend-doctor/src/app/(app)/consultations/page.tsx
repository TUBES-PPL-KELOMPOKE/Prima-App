'use client'

import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { consultationService } from '@/services/consultation.service'
import { useAuthStore } from '@/store/auth.store'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, MessageSquare, Clock, User } from 'lucide-react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'

export default function ConsultationsPage() {
  const { user } = useAuthStore()

  const { data, isLoading } = useQuery({
    queryKey: ['consultations', user?.id],
    queryFn: () => consultationService.getDoctorConsultations(user?.id!),
    enabled: !!user?.id
  })

  const consultations = data?.data || []

  return (
    <div className="p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-blue-900 dark:text-blue-400">Konsultasi Live Chat</h1>
        <p className="text-muted-foreground mt-1">Kelola sesi chat Anda dengan pasien.</p>
      </div>

      <Card className="border-blue-100 shadow-md">
        <CardHeader className="bg-blue-50/50 border-b border-blue-100 rounded-t-xl">
          <CardTitle className="text-lg flex items-center gap-2 text-blue-800">
            <MessageSquare className="h-5 w-5" /> Daftar Ruang Konsultasi
          </CardTitle>
          <CardDescription>
            Pilih pasien untuk memulai atau melanjutkan chat.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          ) : consultations.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p className="text-lg">Belum ada sesi konsultasi saat ini.</p>
            </div>
          ) : (
            <div className="divide-y divide-blue-50">
              {consultations.map((c: any) => (
                <div key={c.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-6 hover:bg-slate-50 transition-colors">
                  <div className="space-y-1 mb-4 sm:mb-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-lg text-blue-900">{c.pasien_name || 'Pasien Anonim'}</span>
                      <Badge variant={c.status === 'aktif' ? 'default' : 'secondary'} className={c.status === 'aktif' ? 'bg-blue-500 hover:bg-blue-600' : ''}>
                        {c.status === 'aktif' ? 'Aktif' : 'Selesai'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                      <span className="flex items-center gap-1"><User className="h-4 w-4"/> Topik: {c.topik}</span>
                      <span className="flex items-center gap-1"><Clock className="h-4 w-4"/> {new Date(c.created_at).toLocaleDateString('id-ID')}</span>
                    </div>
                  </div>
                  
                  <Link href={`/consultations/${c.id}`}>
                    <Button variant={c.status === 'aktif' ? 'default' : 'outline'} className={c.status === 'aktif' ? 'bg-blue-600 hover:bg-blue-700' : ''}>
                      {c.status === 'aktif' ? 'Buka Chat' : 'Lihat Riwayat'}
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
