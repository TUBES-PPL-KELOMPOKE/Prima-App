'use client'

import { useState, useRef, useEffect } from 'react'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { aiHealthService } from '@/services/index'
import { useAuthStore } from '@/store/auth.store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Bot, Send, Loader2, User, Stethoscope, Activity, Users, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

type Mode = 'symptoms' | 'analyze' | 'recommend'

interface BotMessage { role: 'bot'; data: Record<string, unknown>; mode: Mode }
interface BotText   { role: 'bot'; text: string }
interface UserMsg   { role: 'user'; text: string }
type ChatMessage = BotMessage | BotText | UserMsg

const MODES = [
  { value: 'symptoms'  as Mode, label: 'Analisis Gejala', icon: Stethoscope, placeholder: 'Contoh: demam, batuk, pusing sejak 2 hari, suhu 38°C', desc: 'Analisis gejala dan dapatkan rekomendasi tindakan' },
  { value: 'analyze'   as Mode, label: 'Cek Kesehatan',   icon: Activity,    placeholder: 'Contoh: tinggi 170, berat 70, tekanan darah 120/80', desc: 'Hitung BMI dan evaluasi kondisi kesehatan Anda' },
  { value: 'recommend' as Mode, label: 'Cari Dokter',     icon: Users,       placeholder: 'Contoh: nyeri dada, sesak napas, jantung berdebar', desc: 'Temukan dokter spesialis yang sesuai' },
]

function buildLines(data: Record<string, unknown>, mode: Mode): string[] {
  const lines: string[] = []
  
  if (data.response_text) {
    lines.push(String(data.response_text))
  } else if (data.analysis) {
    lines.push(String(data.analysis))
  } else if (data.analisis) {
    lines.push(String(data.analisis))
  }

  if (mode === 'recommend' && data.available_doctors) {
    const doctors = data.available_doctors as Array<{ name?: string; spesialisasi?: string; kota?: string }>
    if (doctors?.length) {
      lines.push('\nDokter yang tersedia:')
      doctors.forEach(d => lines.push(`  • ${d.name ?? ''}${d.kota ? ` — ${d.kota}` : ''}`))
    }
  }

  if (!lines.length) {
    Object.entries(data).forEach(([k, v]) => {
      if (k === 'disclaimer' || v == null) return
      const label = k.replace(/_/g, ' ')
      const val = Array.isArray(v)
        ? v.map(d => (typeof d === 'object' ? (d as Record<string, unknown>).name ?? JSON.stringify(d) : String(d))).join(', ')
        : typeof v === 'object' ? JSON.stringify(v) : String(v)
      lines.push(`${label}: ${val}`)
    })
  }

  return lines
}

function BotBubble({ msg }: { msg: BotMessage }) {
  const lines = buildLines(msg.data, msg.mode)
  const disclaimer = msg.data.disclaimer as string | undefined
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl px-4 py-3 max-w-[70%]">
      <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">
        {lines.join('\n')}
      </p>
      {disclaimer && (
        <div className="mt-3 flex gap-2 bg-amber-50 dark:bg-amber-950/20 rounded-lg px-3 py-2">
          <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700 dark:text-amber-400 leading-snug">{disclaimer}</p>
        </div>
      )}
    </div>
  )
}

function parseUserInput(input: string, mode: Mode) {
  const lower = input.toLowerCase()
  if (mode === 'symptoms') {
    const durasiMatch = lower.match(/(\d+\s*(?:hari|jam|minggu|bulan))/)
    const suhuMatch   = lower.match(/suhu\s*([\d.]+)|(\d{2}(?:[.,]\d)?)\s*°?[cC]/)
    const durasi = durasiMatch ? durasiMatch[1] : '1 hari'
    const suhu   = suhuMatch ? parseFloat((suhuMatch[1] || suhuMatch[2]).replace(',', '.')) : undefined
    const cleaned = input
      .replace(/sejak\s*\d+\s*(?:hari|jam|minggu|bulan)/gi, '')
      .replace(/selama\s*\d+\s*(?:hari|jam|minggu|bulan)/gi, '')
      .replace(/suhu\s*[\d.,]+\s*°?[cC]?/gi, '')
      .replace(/[\d.]+\s*°[cC]/gi, '')
    const gejala = cleaned.split(/[,،.;]+/).map(s => s.trim()).filter(s => s.length > 1)
    return { gejala: gejala.length ? gejala : [input], durasi, suhu_tubuh: suhu }
  }
  if (mode === 'analyze') {
    const tinggiMatch = lower.match(/tinggi\s*(\d+)/i)
    const beratMatch  = lower.match(/berat\s*(\d+)/i)
    const tdMatch     = lower.match(/(?:tekanan darah|td)\s*([\d]+\/[\d]+)/i)
    const gulaMatch   = lower.match(/(?:gula darah|gula)\s*(\d+)/i)
    const kolMatch    = lower.match(/kolesterol\s*(\d+)/i)
    if (!tinggiMatch || !beratMatch) return null
    return {
      tinggi_badan_cm: Number(tinggiMatch[1]),
      berat_badan_kg:  Number(beratMatch[1]),
      tekanan_darah:   tdMatch?.[1],
      gula_darah:      gulaMatch ? Number(gulaMatch[1]) : undefined,
      kolesterol:      kolMatch  ? Number(kolMatch[1])  : undefined,
    }
  }
  const gejala = input.split(/[,،.;]+/).map(s => s.trim()).filter(s => s.length > 1)
  return { gejala: gejala.length ? gejala : [input] }
}

export default function ChatbotPage() {
  const user = useAuthStore(s => s.user)
  const [mode, setMode] = useState<Mode>('symptoms')
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'bot', text: 'Halo! Saya PRIMA AI 👋\nCeritakan keluhan kesehatan Anda dan saya akan bantu menganalisisnya.' },
  ])
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const currentMode = MODES.find(m => m.value === mode)!

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const { mutate, isPending } = useMutation({
    mutationFn: async (userInput: string) => {
      const parsed = parseUserInput(userInput, mode)
      if (mode === 'symptoms')  return aiHealthService.symptoms({ user_id: user!.id, ...parsed as object })
      if (mode === 'analyze') {
        if (!parsed) throw new Error('format')
        return aiHealthService.analyze({ user_id: user!.id, ...parsed })
      }
      return aiHealthService.recommendDoctor({ user_id: user!.id, ...parsed as object })
    },
    onSuccess: (res) => {
      const payload = (res?.data ?? res) as Record<string, unknown>
      setMessages(prev => [...prev, { role: 'bot', data: payload, mode } as BotMessage])
    },
    onError: (err: Error) => {
      const text = err.message === 'format'
        ? 'Format kurang lengkap. Contoh: "tinggi 170, berat 65, tekanan darah 120/80"'
        : 'Maaf, terjadi kesalahan. Coba lagi.'
      if (err.message !== 'format') toast.error('Gagal menghubungi AI')
      setMessages(prev => [...prev, { role: 'bot', text } as BotText])
    },
  })

  const handleSend = () => {
    const trimmed = input.trim()
    if (!trimmed || isPending) return
    setMessages(prev => [...prev, { role: 'user', text: trimmed }])
    setInput('')
    mutate(trimmed)
  }

  const handleModeChange = (m: Mode) => {
    setMode(m)
    const label = MODES.find(x => x.value === m)!.label
    setMessages([{ role: 'bot', text: `Mode ${label} aktif. Ceritakan keluhan Anda.` }])
  }

  return (
    <div className="flex gap-6 h-[calc(100vh-8rem)] -m-6 lg:-m-8 p-6 lg:p-8">

      {/* Mode sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col gap-3">
        <div className="bg-gradient-to-br from-violet-500 to-blue-600 rounded-2xl p-5 text-white">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-white/20 p-2 rounded-lg"><Bot className="h-5 w-5" /></div>
            <div>
              <p className="font-bold">PRIMA AI</p>
              <p className="text-xs text-violet-100">Asisten kesehatan 24/7</p>
            </div>
          </div>
        </div>
        {MODES.map(({ value, label, icon: Icon, desc }) => (
          <button
            key={value}
            onClick={() => handleModeChange(value)}
            className={cn(
              'text-left p-4 rounded-xl border transition-all',
              mode === value
                ? 'bg-violet-50 dark:bg-violet-950/30 border-violet-200 dark:border-violet-800'
                : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 hover:border-violet-100'
            )}
          >
            <div className="flex items-center gap-2 mb-1">
              <Icon className={cn('h-4 w-4', mode === value ? 'text-violet-600' : 'text-gray-400')} />
              <span className={cn('text-sm font-semibold', mode === value ? 'text-violet-700 dark:text-violet-300' : 'text-gray-700 dark:text-gray-300')}>
                {label}
              </span>
            </div>
            <p className="text-xs text-gray-400 leading-snug">{desc}</p>
          </button>
        ))}
      </aside>

      {/* Chat area */}
      <div className="flex-1 flex flex-col bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden min-w-0">
        {/* Mobile/tablet mode tabs */}
        <div className="lg:hidden bg-gradient-to-br from-violet-500 to-blue-600 px-4 pt-4 pb-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="bg-white/20 p-1.5 rounded-lg"><Bot className="h-4 w-4 text-white" /></div>
            <p className="text-white font-bold text-sm">PRIMA AI Chatbot</p>
          </div>
          <div className="flex gap-2">
            {MODES.map(({ value, label, icon: Icon }) => (
              <button key={value} onClick={() => handleModeChange(value)}
                className={cn(
                  'flex-1 flex items-center justify-center gap-1 text-xs py-2 rounded-lg font-medium transition-colors',
                  mode === value ? 'bg-white text-violet-600' : 'bg-white/20 text-white hover:bg-white/30'
                )}>
                <Icon className="h-3.5 w-3.5" />{label}
              </button>
            ))}
          </div>
        </div>

        {/* Desktop header */}
        <div className="hidden lg:flex items-center gap-3 px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <div className="bg-violet-100 dark:bg-violet-900/30 p-2 rounded-lg">
            <currentMode.icon className="h-5 w-5 text-violet-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 dark:text-white">{currentMode.label}</p>
            <p className="text-xs text-gray-400">{currentMode.desc}</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={cn('flex gap-3', msg.role === 'user' && 'flex-row-reverse')}>
              <div className={cn('shrink-0 rounded-full p-2 self-end',
                msg.role === 'bot' ? 'bg-violet-100 dark:bg-violet-900/30' : 'bg-blue-100 dark:bg-blue-900/30'
              )}>
                {msg.role === 'bot'
                  ? <Bot  className="h-4 w-4 text-violet-600" />
                  : <User className="h-4 w-4 text-blue-600" />}
              </div>
              {msg.role === 'user' ? (
                <div className="max-w-[65%] rounded-2xl px-4 py-2.5 text-sm bg-blue-600 text-white">
                  {msg.text}
                </div>
              ) : 'data' in msg ? (
                <BotBubble msg={msg} />
              ) : (
                <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl px-4 py-3 max-w-[70%] text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">
                  {msg.text}
                </div>
              )}
            </div>
          ))}

          {isPending && (
            <div className="flex gap-3">
              <div className="shrink-0 bg-violet-100 dark:bg-violet-900/30 rounded-full p-2 self-end">
                <Bot className="h-4 w-4 text-violet-600" />
              </div>
              <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl px-5 py-4">
                <Loader2 className="h-5 w-5 animate-spin text-violet-500" />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/50">
          <p className="text-xs text-gray-400 mb-2">{currentMode.placeholder}</p>
          <div className="flex gap-3">
            <Input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="Ketik pesan..."
              className="rounded-xl text-sm h-11 flex-1"
            />
            <Button onClick={handleSend} disabled={!input.trim() || isPending}
              size="icon" className="h-11 w-11 rounded-xl bg-violet-600 hover:bg-violet-700 shrink-0">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
