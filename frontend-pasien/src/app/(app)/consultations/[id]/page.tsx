'use client'

import { useEffect, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { consultationService } from '@/services/medical.service'
import { useAuthStore } from '@/store/auth.store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Send, Paperclip, Image } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Message, Consultation } from '@/types'

const statusColor: Record<string, string> = {
  aktif: 'bg-green-100 text-green-700',
  selesai: 'bg-gray-100 text-gray-700',
  dibatalkan: 'bg-red-100 text-red-700',
}

export default function ConsultationDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const qc = useQueryClient()
  const [text, setText] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const imageRef = useRef<HTMLInputElement>(null)

  const { data: consultData, isLoading: loadingConsult, isError: isErrorConsult, error: errorConsult } = useQuery({
    queryKey: ['consultation', id],
    queryFn: () => consultationService.getById(id),
  })

  const { data: msgData, isLoading: loadingMsgs, isError: isErrorMsgs, error: errorMsgs } = useQuery({
    queryKey: ['messages', id],
    queryFn: () => consultationService.getMessages(id, { limit: 100 }),
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
      const errMsg = err.response?.data?.message || err.message || 'Gagal mengirim pesan'
      toast.error(errMsg)
      console.error('Send message error:', err.response?.data || err)
    },
  })

  const { mutate: uploadFile } = useMutation({
    mutationFn: (file: File) => consultationService.uploadFile(id, file),
    onSuccess: (res) => {
      const isImage = res.data?.mimetype?.startsWith('image/')
      consultationService.sendMessage(id, {
        sender_id: user!.id,
        type: isImage ? 'image' : 'file',
        file_url: res.data?.file_url,
        message: res.data?.original_filename,
      }).then(() => qc.invalidateQueries({ queryKey: ['messages', id] }))
    },
    onError: () => toast.error('Gagal upload file'),
  })

  useEffect(() => {
    if (msgData?.data && user) {
      consultationService.markRead(id, user.id).catch(() => {})
    }
  }, [msgData, id, user])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [msgData])

  const consultation: Consultation | null = consultData?.data || null
  const messages: Message[] = msgData?.data || []

  if (loadingConsult) return <Skeleton className="h-[600px] w-full" />
  if (isErrorConsult) return <div className="p-4 text-red-500 text-center mt-10">Error memuat konsultasi: {(errorConsult as any)?.response?.data?.message || errorConsult?.message}</div>

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-4xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center gap-3 pb-3 border-b mb-3">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>←</Button>
        <div className="flex-1">
          <p className="font-medium">Konsultasi #{id?.slice(0, 8)}</p>
        </div>
        {consultation?.status && (
          <Badge className={statusColor[consultation.status] || ''} variant="outline">
            {consultation.status}
          </Badge>
        )}
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1">
        {loadingMsgs ? (
          <div className="space-y-3 p-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
        ) : isErrorMsgs ? (
          <div className="text-center py-16 text-red-500 text-sm">
            Error memuat pesan: {(errorMsgs as any)?.response?.data?.message || errorMsgs?.message}
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground text-sm">Belum ada pesan. Mulai konsultasi!</div>
        ) : (
          <div className="space-y-3 p-2">
            {messages.map((msg) => {
              const isMe = msg.sender_id === user?.id
              return (
                <div key={msg.id} className={cn('flex gap-2', isMe ? 'flex-row-reverse' : 'flex-row')}>
                  {!isMe && (
                    <Avatar className="h-7 w-7 mt-1 shrink-0">
                      <AvatarFallback className="text-xs bg-blue-100 text-blue-600">D</AvatarFallback>
                    </Avatar>
                  )}
                  <div className={cn(
                    'max-w-[75%] rounded-2xl px-3 py-2 text-sm',
                    isMe ? 'bg-blue-600 text-white rounded-tr-sm' : 'bg-gray-100 dark:bg-gray-800 rounded-tl-sm'
                  )}>
                    {msg.type === 'image' && msg.file_url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={msg.file_url} alt="img" className="max-w-[200px] rounded-lg mb-1" />
                    )}
                    {msg.type === 'file' && msg.file_url && (
                      <a href={msg.file_url} target="_blank" rel="noreferrer" className="underline text-xs">
                        📎 {msg.message || 'File'}
                      </a>
                    )}
                    {msg.type === 'text' && msg.message && <p>{msg.message}</p>}
                    <p className="text-xs mt-0.5 opacity-60">
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
      {consultation?.status === 'aktif' && (
        <div className="flex items-center gap-2 pt-3 border-t mt-3">
          <button onClick={() => imageRef.current?.click()} className="text-muted-foreground hover:text-foreground p-1">
            <Image className="h-5 w-5" />
          </button>
          <button onClick={() => fileRef.current?.click()} className="text-muted-foreground hover:text-foreground p-1">
            <Paperclip className="h-5 w-5" />
          </button>
          <Input
            placeholder="Tulis pesan..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && text.trim() && sendMsg()}
            className="flex-1"
          />
          <Button size="icon" disabled={!text.trim() || isPending} onClick={() => sendMsg()}>
            <Send className="h-4 w-4" />
          </Button>
          <input ref={imageRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && uploadFile(e.target.files[0])} />
          <input ref={fileRef} type="file" className="hidden" onChange={(e) => e.target.files?.[0] && uploadFile(e.target.files[0])} />
        </div>
      )}
    </div>
  )
}
