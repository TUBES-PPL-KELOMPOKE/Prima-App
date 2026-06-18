'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/auth.store'
import { toast } from 'sonner'
import {
  LayoutDashboard, Users, Clock, MessageSquare,
  FileText, Pill, FileCheck, User,
  LogOut, ChevronRight, Syringe
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/queue', icon: Users, label: 'Antrean Pasien' },
  { href: '/schedule', icon: Clock, label: 'Jadwal Praktik' },
  { href: '/consultations', icon: MessageSquare, label: 'Konsultasi Chat' },
  { href: '/medical-records', icon: FileText, label: 'Rekam Medis' },
  { href: '/prescriptions', icon: Pill, label: 'E-Resep Obat' },
  { href: '/documents', icon: FileCheck, label: 'Verifikasi Dokumen' },
  { href: '/immunization', icon: Syringe, label: 'Imunisasi Pasien' },
  { href: '/profile', icon: User, label: 'Profil Saya' },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, clearAuth } = useAuthStore()

  const handleLogout = async () => {
    clearAuth()
    document.cookie = 'token=; path=/; max-age=0'
    router.push('/login')
    toast.success('Berhasil logout')
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-5 border-b flex flex-col items-center text-center gap-2">
        <img 
          src="/logoprim.png" 
          alt="PRIMA Logo" 
          className="h-15 w-auto object-contain" 
          onError={(e) => { e.currentTarget.style.display = 'none'; }} 
        />
        <div>
          <h1 className="text-xl font-bold text-blue-600 tracking-tight mt-1">Prima Dokter</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Portal Dokter & Nakes</p>
        </div>
      </div>

      {/* User */}
      <div className="p-4 border-b">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarImage src={user?.foto_profil_url} />
            <AvatarFallback className="bg-blue-100 text-blue-600 text-sm">
              {user?.name?.charAt(0)?.toUpperCase() || 'D'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">Dr. {user?.name || 'Dokter'}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
                active
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{label}</span>
              {active && <ChevronRight className="h-3 w-3 ml-auto" />}
            </Link>
          )
        })}
      </nav>

      <Separator />
      <div className="p-2">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Keluar
        </button>
      </div>
    </div>
  )

  return (
    <aside className="w-64 shrink-0 flex flex-col border-r bg-background h-screen sticky top-0 overflow-hidden">
      <SidebarContent />
    </aside>
  )
}
