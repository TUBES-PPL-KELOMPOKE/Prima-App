'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { documentService } from '@/services/index'
import { doctorService } from '@/services/medical.service'
import { useAuthStore } from '@/store/auth.store'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  FileCheck, Plus, Loader2, Download, Calendar,
  User, ClipboardList, MessageSquare, Clock, ChevronDown, ChevronUp,
} from 'lucide-react'
import { Document, Doctor } from '@/types'
import { cn } from '@/lib/utils'

const FORMAT_TYPE: Record<string, string> = {
  surat_sakit:   'Surat Keterangan Sakit',
  surat_rujukan: 'Surat Rujukan',
  surat_sehat:   'Surat Keterangan Sehat',
}

const STATUS_STYLE: Record<string, { label: string; cls: string }> = {
  disetujui: { label: 'Disetujui',          cls: 'bg-green-100 text-green-700' },
  diterima:  { label: 'Diterima',           cls: 'bg-green-100 text-green-700' },
  menunggu:  { label: 'Menunggu Verifikasi', cls: 'bg-orange-100 text-orange-700' },
  ditolak:   { label: 'Ditolak',            cls: 'bg-red-100 text-red-700' },
}

function getDownloadUrl(d: Document) {
  const base = (process.env.NEXT_PUBLIC_API_URL || 'https://backend-prima.vercel.app') + '/document/download'
  const t = d.type?.toLowerCase() || ''
  if (t.includes('sakit'))   return `${base}/sk/${d.id}`
  if (t.includes('rujukan')) return `${base}/sr/${d.id}`
  return `${base}/ss/${d.id}`
}

function fmt(dateStr?: string | null) {
  if (!dateStr) return null
  return new Date(String(dateStr)).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}

function DocPreviewCard({ d }: { d: Document }) {
  const [expanded, setExpanded] = useState(false)

  const status  = (d.status as string)?.toLowerCase() || 'menunggu'
  const sStyle  = STATUS_STYLE[status] || { label: d.status as string, cls: 'bg-gray-100 text-gray-600' }
  const isApproved = ['disetujui', 'diterima'].includes(status)
  const typeLabel  = FORMAT_TYPE[d.type as string] || d.type || 'Dokumen'

  const keperluan      = d.keperluan as string | undefined
  const catatan        = d.catatan as string | undefined
  const catatanDokter  = d.catatan_dokter as string | undefined
  const berlakuDari    = d.berlaku_dari as string | undefined
  const berlakuSampai  = d.berlaku_sampai as string | undefined
  const verifiedAt     = d.verified_at as string | undefined

  return (
    <div className={cn(
      'rounded-2xl border transition-all overflow-hidden',
      isApproved
        ? 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 hover:border-teal-200 hover:shadow-md'
        : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 hover:border-orange-200 hover:shadow-sm',
    )}>
      {/* ── Stripe top ── */}
      <div className={cn('h-1 w-full', isApproved ? 'bg-teal-500' : 'bg-orange-400')} />

      <div className="p-5">
        {/* ── Header ── */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-start gap-3">
            <div className={cn('p-3 rounded-xl shrink-0', isApproved ? 'bg-teal-50 dark:bg-teal-900/30' : 'bg-orange-50 dark:bg-orange-900/20')}>
              <FileCheck className={cn('h-5 w-5', isApproved ? 'text-teal-600' : 'text-orange-500')} />
            </div>
            <div>
              <p className="font-semibold text-sm text-gray-900 dark:text-white">{typeLabel}</p>
              <p className="text-xs text-gray-400 mt-0.5">#{d.id?.slice(0, 8)} · {fmt(d.created_at as string)}</p>
            </div>
          </div>
          <Badge className={cn('shrink-0 border-none text-xs', sStyle.cls)}>
            {sStyle.label}
          </Badge>
        </div>

        {/* ── Inline preview: always visible ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm mb-3">
          {keperluan && (
            <div className="flex items-start gap-2">
              <ClipboardList className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-gray-400 leading-none mb-0.5">Keperluan</p>
                <p className="text-gray-700 dark:text-gray-300 font-medium">{keperluan}</p>
              </div>
            </div>
          )}
          {catatan && (
            <div className="flex items-start gap-2">
              <MessageSquare className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-gray-400 leading-none mb-0.5">Catatan Pasien</p>
                <p className="text-gray-700 dark:text-gray-300">{catatan}</p>
              </div>
            </div>
          )}
        </div>

        {/* ── Expandable detail ── */}
        {(catatanDokter || berlakuDari || berlakuSampai || verifiedAt) && (
          <>
            <button
              onClick={() => setExpanded(v => !v)}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors mt-1 mb-2"
            >
              {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              {expanded ? 'Sembunyikan' : 'Lihat detail selengkapnya'}
            </button>

            {expanded && (
              <div className="rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-4 space-y-3 mb-3">
                {catatanDokter && (
                  <div className="flex items-start gap-2">
                    <User className="h-4 w-4 text-teal-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">Catatan Dokter</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300 italic">"{catatanDokter}"</p>
                    </div>
                  </div>
                )}
                {(berlakuDari || berlakuSampai) && (
                  <div className="flex items-start gap-2">
                    <Calendar className="h-4 w-4 text-teal-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">Masa Berlaku</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {fmt(berlakuDari)} — {fmt(berlakuSampai)}
                      </p>
                    </div>
                  </div>
                )}
                {verifiedAt && (
                  <div className="flex items-start gap-2">
                    <Clock className="h-4 w-4 text-teal-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">Diverifikasi pada</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{fmt(verifiedAt)}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* ── Footer: download only if approved ── */}
        {isApproved && (
          <div className="pt-3 border-t border-gray-50 dark:border-gray-800 flex justify-end">
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs px-3 text-teal-600 border-teal-200 hover:bg-teal-50 dark:border-teal-800 dark:hover:bg-teal-900/30"
              onClick={() => window.open(getDownloadUrl(d), '_blank')}
            >
              <Download className="h-3 w-3 mr-1" />
              Unduh PDF
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function DocumentsPage() {
  const qc   = useQueryClient()
  const user = useAuthStore((s) => s.user)
  const [open, setOpen] = useState(false)

  const [doctorId,  setDoctorId]  = useState('')
  const [type,      setType]      = useState('surat_sakit')
  const [keperluan, setKeperluan] = useState('')
  const [catatan,   setCatatan]   = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['documents'],
    queryFn:  documentService.list,
  })

  const { data: doctorData } = useQuery({
    queryKey: ['doctors'],
    queryFn:  () => doctorService.list(),
  })

  const { mutate: createDoc, isPending } = useMutation({
    mutationFn: () => documentService.create({
      pasien_id:      user?.id,
      doctor_id:      doctorId,
      type,
      keperluan:      keperluan || null,
      catatan:        catatan   || null,
      catatan_dokter: null,
      status:         'menunggu',
      berlaku_dari:   null,
      berlaku_sampai: null,
    }),
    onSuccess: () => {
      toast.success('Dokumen berhasil diajukan')
      setOpen(false)
      setDoctorId('')
      setKeperluan('')
      setCatatan('')
      qc.invalidateQueries({ queryKey: ['documents'] })
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || err.message || 'Gagal mengajukan dokumen'
      toast.error(msg)
    },
  })

  const docs: Document[]   = Array.isArray(data?.data)       ? data.data       : []
  const doctors: Doctor[]  = Array.isArray(doctorData?.data) ? doctorData.data : []

  // filter only current user's docs
  const myDocs = user?.id ? docs.filter(d => d.pasien_id === user.id) : docs

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!doctorId || !type) return toast.error('Lengkapi form terlebih dahulu')
    createDoc()
  }

  return (
    <div className="space-y-6">
      {/* ── Page header ── */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-teal-900 dark:text-teal-400">Dokumen Medis</h1>
          <p className="text-muted-foreground mt-1 text-sm">Surat keterangan dan dokumen resmi dari dokter Anda.</p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button size="sm" className="gap-2 rounded-xl" />}>
            <Plus className="h-4 w-4" /> Ajukan Dokumen
          </DialogTrigger>
          <DialogContent className="sm:max-w-md rounded-2xl">
            <DialogHeader>
              <DialogTitle>Ajukan Dokumen Baru</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-2">
              <div className="space-y-2">
                <Label>Pilih Dokter</Label>
                <Select value={doctorId} onValueChange={setDoctorId}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Pilih dokter penanggung jawab" />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors.map(d => (
                      <SelectItem key={d.id} value={d.id}>{d.name} ({d.spesialisasi})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Jenis Dokumen</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Pilih jenis dokumen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="surat_sakit">Surat Keterangan Sakit</SelectItem>
                    <SelectItem value="surat_rujukan">Surat Rujukan</SelectItem>
                    <SelectItem value="surat_sehat">Surat Keterangan Sehat</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Keperluan</Label>
                <Input
                  placeholder="Contoh: Izin Kerja, Rujukan RS..."
                  className="rounded-xl"
                  value={keperluan}
                  onChange={e => setKeperluan(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Catatan untuk Dokter (Opsional)</Label>
                <Textarea
                  placeholder="Keluhan atau catatan tambahan..."
                  className="rounded-xl"
                  rows={3}
                  value={catatan}
                  onChange={e => setCatatan(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full rounded-xl mt-2" disabled={isPending}>
                {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Ajukan Sekarang
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* ── Content ── */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-2xl" />)}
        </div>
      ) : myDocs.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
          <FileCheck className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p className="text-sm text-gray-500">Belum ada dokumen medis</p>
        </div>
      ) : (
        <div className="space-y-4">
          {myDocs.map(d => <DocPreviewCard key={d.id} d={d} />)}
        </div>
      )}
    </div>
  )
}
