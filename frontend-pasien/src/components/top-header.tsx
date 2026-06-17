'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuthStore } from '@/store/auth.store'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

const pageTitles: Record<string, string> = {
  '/home': 'Beranda',
  '/doctors': 'Cari Dokter',
  '/chatbot': 'AI Chatbot',
  '/consultations': 'Konsultasi',
  '/bookings': 'Booking',
  '/medical-records': 'Rekam Medis',
  '/prescriptions': 'Resep Obat',
  '/documents': 'Dokumen',
  '/immunizations': 'Imunisasi',
  '/programs': 'Program Kesehatan',
  '/health-calculator': 'Kalkulator Kesehatan',
  '/ai-health': 'AI Kesehatan',
  '/profile': 'Profil Saya',
}

function getPageTitle(pathname: string): string {
  if (pageTitles[pathname]) return pageTitles[pathname]
  for (const [path, title] of Object.entries(pageTitles)) {
    if (pathname.startsWith(path + '/')) return title
  }
  return 'PRIMA'
}

export function TopHeader() {
  const { user } = useAuthStore()
  const pathname = usePathname()
  const title = getPageTitle(pathname)

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-gray-950/90 backdrop-blur border-b border-gray-100 dark:border-gray-800">
      <div className="flex items-center justify-between px-6 lg:px-8 h-16">
        <div>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h1>
          <p className="text-xs text-muted-foreground hidden sm:block">
            Selamat datang, {user?.name?.split(' ')[0] || 'Pasien'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/profile" className="flex items-center gap-3 pl-3 border-l border-gray-200 dark:border-gray-800">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-900 dark:text-white leading-none">{user?.name || 'Pasien'}</p>
              <p className="text-xs text-muted-foreground mt-1 truncate max-w-[160px]">{user?.email}</p>
            </div>
            <Avatar className="h-9 w-9">
              <AvatarImage src={user?.foto_profil_url} />
              <AvatarFallback className="bg-blue-100 text-blue-600 text-sm font-bold">
                {user?.name?.charAt(0)?.toUpperCase() || 'P'}
              </AvatarFallback>
            </Avatar>
          </Link>
        </div>
      </div>
    </header>
  )
}
