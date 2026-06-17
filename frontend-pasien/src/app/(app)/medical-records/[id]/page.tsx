'use client'

import { useQuery } from '@tanstack/react-query'
import { useParams, useRouter } from 'next/navigation'
import { medicalRecordService } from '@/services/index'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ChevronLeft, Paperclip, FileText, Calendar, Activity } from 'lucide-react'

export default function MedicalRecordDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { data, isLoading } = useQuery({
    queryKey: ['medical-record', id],
    queryFn: () => medicalRecordService.getById(id),
  })
  const r = data?.data

  if (isLoading) return <div className="p-4 space-y-3"><Skeleton className="h-32 rounded-2xl" /><Skeleton className="h-40 rounded-2xl" /></div>
  if (!r) return <p className="text-center py-16 text-sm text-gray-400">Rekam medis tidak ditemukan</p>

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950 pb-8">
      <div className="bg-gradient-to-br from-violet-600 to-blue-600 px-4 py-6 pb-12 rounded-b-[2.5rem] text-white shadow-lg relative">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors backdrop-blur-md">
            <ChevronLeft className="h-5 w-5 text-white" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-xl truncate">{r.judul}</h1>
            {r.type && <span className="inline-block mt-1 text-xs font-medium bg-white/20 px-2.5 py-1 rounded-lg backdrop-blur-md">{r.type}</span>}
          </div>
        </div>
      </div>

      <div className="-mt-6 px-6 space-y-4 relative z-10">
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-50 dark:border-gray-800/50">
            <Calendar className="h-4 w-4 text-violet-500" />
            <p className="text-sm font-medium text-gray-500">
              {r.created_at ? new Date(r.created_at).toLocaleDateString('id-ID', { dateStyle: 'full' }) : ''}
            </p>
          </div>

          {r.deskripsi && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4 text-violet-500" />
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Deskripsi</p>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed bg-gray-50/50 dark:bg-gray-800/20 p-4 rounded-2xl">{r.deskripsi}</p>
            </div>
          )}

          {r.catatan_dokter && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="h-4 w-4 text-orange-500" />
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Catatan Dokter</p>
              </div>
              <div className="bg-orange-50 dark:bg-orange-950/20 p-4 rounded-2xl border border-orange-100 dark:border-orange-900/30">
                <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">{r.catatan_dokter}</p>
              </div>
            </div>
          )}

          {r.attachment_url && (
            <a href={r.attachment_url} target="_blank" rel="noreferrer"
              className="flex items-center justify-center gap-2 w-full bg-violet-50 hover:bg-violet-100 dark:bg-violet-900/30 dark:hover:bg-violet-900/50 transition-colors rounded-2xl border border-violet-100 dark:border-violet-800/50 p-4 text-violet-700 dark:text-violet-300 text-sm font-bold mt-2 group">
              <Paperclip className="h-4 w-4 group-hover:-rotate-12 transition-transform" /> Lihat Dokumen Lampiran
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
