'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Stethoscope, Calendar, MessageSquare, User, Bot } from 'lucide-react'
import { cn } from '@/lib/utils'

const items = [
  { href: '/home', icon: Home, label: 'Beranda' },
  { href: '/doctors', icon: Stethoscope, label: 'Dokter' },
  { href: '/chatbot', icon: Bot, label: 'AI Chat' },
  { href: '/consultations', icon: MessageSquare, label: 'Konsultasi' },
  { href: '/profile', icon: User, label: 'Profil' },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800 safe-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {items.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-colors min-w-[56px]',
                active ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
              )}
            >
              <Icon className={cn('h-5 w-5', active && 'fill-blue-100')} />
              <span className={cn('text-[10px] font-medium', active ? 'text-blue-600' : 'text-gray-400')}>
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
