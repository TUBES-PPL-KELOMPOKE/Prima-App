'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { programService } from '@/services/index'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Heart, ChevronRight, CalendarDays } from 'lucide-react'
import { Program } from '@/types'

const typeColor: Record<string, string> = {
  vaksinasi:   'bg-blue-50 text-blue-600',
  penyuluhan:  'bg-green-50 text-green-600',
  pemeriksaan: 'bg-orange-50 text-orange-600',
  olahraga:    'bg-pink-50 text-pink-600',
}

export default function ProgramsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['programs'],
    queryFn: () => programService.list({ status: 'aktif' }),
  })
  const programs: Program[] = data?.data || []

  return (
    <div className="pb-4">
      <div className="px-4 py-3 font-bold text-base border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950">Program Kesehatan</div>
      <div className="px-4 pt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)
          : programs.length === 0
            ? <div className="text-center py-16"><Heart className="h-12 w-12 mx-auto mb-3 text-gray-200" /><p className="text-sm text-gray-400">Belum ada program aktif</p></div>
            : programs.map(p => (
              <Link key={p.id} href={`/programs/${p.id}`}>
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 active:bg-gray-50 flex flex-col justify-between h-full hover:shadow-md transition-all">
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <p className="text-base font-semibold">{p.nama}</p>
                      <Badge className={`text-[10px] shrink-0 ${typeColor[p.type] || ''}`} variant="outline">{p.type}</Badge>
                    </div>
                    {p.deskripsi && <p className="text-sm text-gray-500 line-clamp-2 mb-4">{p.deskripsi}</p>}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-400 mt-auto pt-3 border-t border-gray-50 dark:border-gray-800">
                    <CalendarDays className="h-4 w-4" />
                    <span className="font-medium text-gray-500">{p.tanggal_mulai}</span>
                    <ChevronRight className="h-4 w-4 ml-auto text-gray-300" />
                  </div>
                </div>
              </Link>
            ))
        }
      </div>
    </div>
  )
}
