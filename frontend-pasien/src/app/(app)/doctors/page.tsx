'use client'

import { Suspense, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { doctorService } from '@/services/medical.service'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Star, MapPin, Search, ChevronRight } from 'lucide-react'
import { Doctor } from '@/types'

function DoctorList() {
  const sp = useSearchParams()
  const [search, setSearch] = useState(sp.get('nama') || '')
  const [spesialisasi, setSpesialisasi] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['doctors', search, spesialisasi],
    queryFn: () => doctorService.list({
      ...(search && { nama: search }),
      ...(spesialisasi && { spesialisasi }),
    }),
  })
  const doctors: Doctor[] = data?.data || []

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input placeholder="Cari nama dokter..." className="pl-9 rounded-xl h-10 text-sm" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Input placeholder="Filter spesialisasi..." className="rounded-xl h-10 text-sm sm:max-w-xs" value={spesialisasi} onChange={e => setSpesialisasi(e.target.value)} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-[72px] rounded-2xl" />)
          : doctors.length === 0
            ? <p className="text-center py-12 text-sm text-gray-400">Tidak ada dokter ditemukan</p>
            : doctors.map(doc => (
              <Link key={doc.id} href={`/doctors/${doc.id}`}>
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 flex items-center gap-4 hover:shadow-md hover:border-blue-100 transition-all h-full">
                  <Avatar className="h-12 w-12 shrink-0">
                    <AvatarImage src={doc.foto_profil_url} />
                    <AvatarFallback className="bg-blue-100 text-blue-600 font-bold text-sm">
                      {doc.name?.charAt(0)?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{doc.name}</p>
                    <Badge variant="secondary" className="text-[10px] h-4 px-1.5 mt-0.5 rounded-full">{doc.spesialisasi}</Badge>
                    <div className="flex items-center gap-3 mt-0.5">
                      {doc.kota && <span className="flex items-center gap-0.5 text-[10px] text-gray-400"><MapPin className="h-2.5 w-2.5" />{doc.kota}</span>}
                      {doc.rating && <span className="flex items-center gap-0.5 text-[10px] text-yellow-500"><Star className="h-2.5 w-2.5 fill-yellow-400" />{doc.rating}</span>}
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-300 shrink-0" />
                </div>
              </Link>
            ))
        }
      </div>
    </>
  )
}

export default function DoctorsPage() {
  return (
    <div>
      <Suspense fallback={<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">{Array.from({length:6}).map((_,i)=><Skeleton key={i} className="h-[88px] rounded-2xl"/>)}</div>}>
        <DoctorList />
      </Suspense>
    </div>
  )
}
