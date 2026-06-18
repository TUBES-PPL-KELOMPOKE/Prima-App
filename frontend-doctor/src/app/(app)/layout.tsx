'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Sidebar } from '@/components/sidebar'
import { TopHeader } from '@/components/top-header'
import { useAuthStore } from '@/store/auth.store'

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const { token, user } = useAuthStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      if (!token || !user) {
        router.push('/login')
      } else if (user.role !== 'doctor' || user.id.includes('dummy')) {
        // If not doctor or is a dummy account from previous fallback, force logout
        useAuthStore.getState().clearAuth()
        document.cookie = 'token=; path=/; max-age=0'
        router.push('/login')
      }
    }
  }, [mounted, token, user, router])

  if (!mounted || !token || user?.role !== 'doctor') {
    return null
  }

  return (
    <div className="flex h-screen bg-gray-50/50 dark:bg-gray-950/50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopHeader />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
