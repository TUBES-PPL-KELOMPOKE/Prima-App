'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { consultationService } from '@/services/consultation.service'
import { useAuthStore } from '@/store/auth.store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Send, ArrowLeft, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const statusColor: Record<string, string> = {
  aktif: 'bg-green-100 text-green-700',
  selesai: 'bg-slate-100 text-slate-700',
  dibatalkan: 'bg-red-100 text-red-700',
}

export default function ConsultationDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const qc = useQueryClient()
  const [text, setText] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  const { data: consultData, isLoading: loadingConsult } = useQuery({
    queryKey: ['consultation', id],
    queryFn: () => consultationService.getConsultationDetail(id),
  })

  const { data: msgData, isLoading: loadingMsgs } = useQuery({
    queryKey: ['messages', id],
    queryFn: () => consultationService.getMessages(id),
    refetchInterval: 5_000,
  })

  const { mutate: sendMsg, isPending } = useMutation({
    mutationFn: () => consultationService.sendMessage(id, {
      sender_id: user!.id,
      type: 'text',
      message: text.trim(),
    }),
    onSuccess: () => {
      setText('')
      qc.invalidateQueries({ queryKey: ['messages', id] })
    },
    onError: (err: any) => {
      toast.error('Gagal mengirim pesan')
    },
  })

  const { mutate: endConsultation, isPending: isEnding } = useMutation({
    mutationFn: () => consultationService.updateStatus(id, 'selesai'),
    onSuccess: () => {
      toast.success('Konsultasi berhasil diakhiri')
      qc.invalidateQueries({ queryKey: ['consultation', id] })
    },
    onError: () => toast.error('Gagal mengakhiri konsultasi'),
  })

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [msgData])

  const consultation = consultData?.data || null
  const messages = msgData?.data || []

  if (loadingConsult) return <Skeleton className="h-[600px] w-full" />

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-white rounded-xl border border-blue-100 shadow-sm overflow-hidden animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-blue-50 bg-blue-50/30">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="hover:bg-blue-100">
          <ArrowLeft className="h-5 w-5 text-blue-700" />
        </Button>
        <div className="flex-1">
          <p className="font-bold text-blue-900">{consultation?.pasien_name || 'Pasien Anonim'}</p>
          <p className="text-xs text-slate-500">Topik: {consultation?.topik}</p>
        </div>
        
        {consultation?.status === 'aktif' && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              if (confirm('Akhiri sesi konsultasi ini?')) endConsultation()
            }}
            disabled={isEnding}
            className="border-red-200 text-red-600 hover:bg-red-50"
          >
            <CheckCircle2 className="h-4 w-4 mr-1" /> Akhiri Konsultasi
          </Button>
        )}
        
        {consultation?.status && (
          <Badge className={cn('ml-2', statusColor[consultation.status] || '')} variant="outline">
            {consultation.status}
          </Badge>
        )}
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 bg-slate-50/50 p-4">
        {loadingMsgs ? (
          <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 w-1/2" />)}</div>
        ) : messages.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground text-sm">Belum ada pesan. Ucapkan salam ke pasien Anda!</div>
        ) : (
          <div className="space-y-4 pb-4">
            {messages.map((msg: any) => {
              const isMe = msg.sender_id === user?.id
              return (
                <div key={msg.id} className={cn('flex gap-3', isMe ? 'flex-row-reverse' : 'flex-row')}>
                  {!isMe && (
                    <Avatar className="h-8 w-8 mt-1 shrink-0 border border-blue-100">
                      <AvatarFallback className="text-xs bg-blue-100 text-blue-700">P</AvatarFallback>
                    </Avatar>
                  )}
                  <div className={cn(
                    'max-w-[75%] px-4 py-2.5 text-sm shadow-sm',
                    isMe 
                      ? 'bg-blue-600 text-white rounded-2xl rounded-tr-sm' 
                      : 'bg-white border border-slate-100 text-slate-800 rounded-2xl rounded-tl-sm'
                  )}>
                    {msg.type === 'image' && msg.file_url && (
                      <img src={msg.file_url} alt="attachment" className="max-w-full rounded-lg mb-2 border" />
                    )}
                    {msg.type === 'file' && msg.file_url && (
                      <a href={msg.file_url} target="_blank" rel="noreferrer" className="underline text-xs flex items-center gap-1 mb-1 opacity-90">
                        📎 Lampiran File
                      </a>
                    )}
                    {msg.type === 'text' && msg.message && <p className="leading-relaxed">{msg.message}</p>}
                    <p className={cn("text-[10px] mt-1 text-right", isMe ? "text-blue-100" : "text-slate-400")}>
                      {msg.created_at ? new Date(msg.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : ''}
                    </p>
                  </div>
                </div>
              )
            })}
            <div ref={bottomRef} />
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      {consultation?.status === 'aktif' ? (
        <div className="p-3 bg-white border-t border-blue-50 flex items-center gap-2">
          <Input
            placeholder="Ketik balasan untuk pasien..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && text.trim() && sendMsg()}
            className="flex-1 border-blue-100 focus-visible:ring-blue-500 rounded-full bg-slate-50"
          />
          <Button 
            size="icon" 
            disabled={!text.trim() || isPending} 
            onClick={() => sendMsg()}
            className="rounded-full bg-blue-600 hover:bg-blue-700 h-10 w-10 shrink-0"
          >
            <Send className="h-4 w-4 ml-0.5" />
          </Button>
        </div>
      ) : (
        <div className="p-3 bg-slate-50 border-t text-center text-sm text-slate-500 italic">
          Sesi konsultasi ini telah diakhiri.
        </div>
      )}
    </div>
  )
}
