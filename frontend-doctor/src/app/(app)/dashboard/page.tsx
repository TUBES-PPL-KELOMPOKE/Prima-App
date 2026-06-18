'use client'

import { useAuthStore } from '@/store/auth.store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, FileText, Pill, Clock } from 'lucide-react'

export default function DashboardPage() {
  const { user } = useAuthStore()

  return (
    <div className="p-6 space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard Dokter</h1>
        <p className="text-muted-foreground mt-1">Selamat bertugas, Dr. {user?.name}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-blue-100 bg-blue-50/50 dark:bg-blue-950/20 dark:border-blue-900">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-blue-800 dark:text-blue-300">Antrean Hari Ini</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">-</div>
            <p className="text-xs text-blue-600/80 mt-1">Pasien menunggu</p>
          </CardContent>
        </Card>

        <Card className="border-blue-100 bg-blue-50/50 dark:bg-blue-950/20 dark:border-blue-900">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-blue-800 dark:text-blue-300">Jadwal Anda</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">09:00</div>
            <p className="text-xs text-blue-600/80 mt-1">Hingga 14:00</p>
          </CardContent>
        </Card>

        <Card className="border-purple-100 bg-purple-50/50 dark:bg-purple-950/20 dark:border-purple-900">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-purple-800 dark:text-purple-300">Rekam Medis</CardTitle>
            <FileText className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">Cek</div>
            <p className="text-xs text-purple-600/80 mt-1">Verifikasi mandiri</p>
          </CardContent>
        </Card>

        <Card className="border-orange-100 bg-orange-50/50 dark:bg-orange-950/20 dark:border-orange-900">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-orange-800 dark:text-orange-300">E-Resep</CardTitle>
            <Pill className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">Buat</div>
            <p className="text-xs text-orange-600/80 mt-1">Resep otomatis</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
