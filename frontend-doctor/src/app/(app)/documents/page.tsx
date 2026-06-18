'use client'

import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { documentService } from '@/services/document.service'
import { useAuthStore } from '@/store/auth.store'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Loader2, FileText, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

const statusColor: Record<string, string> = {
  menunggu: 'bg-amber-100 text-amber-700 hover:bg-amber-100',
  disetujui: 'bg-green-100 text-green-700 hover:bg-green-100',
  ditolak: 'bg-red-100 text-red-700 hover:bg-red-100',
}

export default function DocumentsPage() {
  const { user } = useAuthStore()
  const queryClient = useQueryClient()
  const [selectedDoc, setSelectedDoc] = useState<any>(null)
  const [catatanDokter, setCatatanDokter] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['documents'],
    queryFn: () => documentService.getAllDocuments(),
  })

  const updateMutation = useMutation({
    mutationFn: (vars: { id: string; payload: any }) => documentService.updateDocument(vars.id, vars.payload),
    onSuccess: () => {
      toast.success('Status dokumen berhasil diubah!')
      setSelectedDoc(null)
      setCatatanDokter('')
      queryClient.invalidateQueries({ queryKey: ['documents'] })
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Gagal mengubah status dokumen')
    }
  })

  const handleApproveReject = (status: string) => {
    if (!selectedDoc) return
    const payload = {
      ...selectedDoc,
      status,
      catatan_dokter: catatanDokter,
      doctor_id: user?.id,
      verified_at: new Date().toISOString()
    }
    updateMutation.mutate({ id: selectedDoc.id, payload })
  }

  const documents = data?.data || []

  return (
    <div className="p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-blue-900 dark:text-blue-400">Persetujuan Dokumen</h1>
        <p className="text-muted-foreground mt-1">Review dan berikan persetujuan untuk surat keterangan kesehatan pasien.</p>
      </div>

      <Card className="border-blue-100 shadow-md">
        <CardHeader className="bg-blue-50/50 border-b border-blue-100 rounded-t-xl">
          <CardTitle className="text-lg flex items-center gap-2 text-blue-800">
            <FileText className="h-5 w-5" /> Daftar Pengajuan Dokumen
          </CardTitle>
          <CardDescription>Pilih dokumen yang ingin di-review.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p className="text-lg">Belum ada pengajuan dokumen pasien.</p>
            </div>
          ) : (
            <div className="divide-y divide-blue-50">
              {documents.map((doc: any) => (
                <div key={doc.id} className="p-6 hover:bg-slate-50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-lg text-blue-900 capitalize">{doc.type.replace('_', ' ')}</h3>
                      <Badge variant="outline" className={statusColor[doc.status] || ''}>
                        {doc.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-slate-500 space-y-1">
                      <p><strong>Pasien ID:</strong> {doc.pasien_id?.slice(0,8)}</p>
                      <p><strong>Keperluan:</strong> {doc.keperluan || '-'}</p>
                      <p><strong>Catatan Pasien:</strong> {doc.catatan || '-'}</p>
                      {doc.catatan_dokter && <p className="text-blue-700"><strong>Catatan Dokter:</strong> {doc.catatan_dokter}</p>}
                    </div>
                  </div>
                  
                  {doc.status === 'menunggu' && (
                    <Button 
                      className="bg-blue-600 hover:bg-blue-700 whitespace-nowrap"
                      onClick={() => setSelectedDoc(doc)}
                    >
                      Review Pengajuan
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedDoc} onOpenChange={(open) => !open && setSelectedDoc(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-blue-900 capitalize">Review {selectedDoc?.type?.replace('_', ' ')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="bg-amber-50 text-amber-800 p-3 rounded-lg flex gap-2 text-sm">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <p>Pastikan Anda telah memeriksa pasien sebelum menyetujui surat keterangan ini.</p>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Catatan Dokter (Wajib)</label>
              <Textarea 
                placeholder="Misal: Disarankan istirahat 3 hari, tekanan darah normal..." 
                className="min-h-[100px] border-blue-200" 
                value={catatanDokter} 
                onChange={e => setCatatanDokter(e.target.value)} 
              />
            </div>
            
            <div className="flex gap-3 pt-2">
              <Button 
                variant="outline" 
                className="flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                onClick={() => handleApproveReject('ditolak')}
                disabled={!catatanDokter.trim() || updateMutation.isPending}
              >
                <XCircle className="h-4 w-4 mr-2" /> Tolak
              </Button>
              <Button 
                className="flex-1 bg-green-600 hover:bg-green-700"
                onClick={() => handleApproveReject('disetujui')}
                disabled={!catatanDokter.trim() || updateMutation.isPending}
              >
                {updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <><CheckCircle className="h-4 w-4 mr-2" /> Setujui Dokumen</>}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
