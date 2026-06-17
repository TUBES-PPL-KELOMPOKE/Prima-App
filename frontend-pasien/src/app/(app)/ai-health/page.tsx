'use client'

import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { aiHealthService } from '@/services/index'
import { useAuthStore } from '@/store/auth.store'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Brain, Loader2, Zap, Activity, Stethoscope, AlertCircle, Info, HeartPulse, AlertTriangle, User, CheckCircle2 } from 'lucide-react'

function AiResult({ data }: { data: unknown }) {
  if (!data) return null

  let parsedData: any = null
  let patientContext: any = null
  let extractedJsonStr = ''

  try {
    // Check if data is our pre-parsed Next.js API structure
    if (typeof data === 'object' && data !== null) {
      const d = data as any
      if (d.analysis && d.analysis.possible_conditions) {
        parsedData = d.analysis
        patientContext = d.patientContext || null
      } else if (d.possible_conditions) {
        parsedData = d
      }
    }
  } catch (e) {
    console.error("Failed to parse pre-parsed AI output:", e)
  }

  if (parsedData && parsedData.possible_conditions) {
    const { possible_conditions, what_you_can_do_now, when_to_see_doctor, recommended_specialist, health_insight, disclaimer } = parsedData
    
    return (
      <div className="mt-6 space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-gray-200 dark:border-gray-800 pb-3">
          <div className="bg-blue-100 dark:bg-blue-900/50 p-2 rounded-xl">
            <Brain className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 tracking-tight">Hasil Analisis Kesehatan</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">Berdasarkan data dan gejala yang Anda berikan</p>
          </div>
        </div>

        {/* Patient Context */}
        {patientContext && (
          <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2 mb-4">
              <User className="h-5 w-5 text-blue-500" /> Informasi Pasien
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-100 dark:border-gray-700">
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Nama</p>
                <p className="font-medium text-gray-800 dark:text-gray-200">{patientContext.nama || '-'}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-100 dark:border-gray-700">
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Umur</p>
                <p className="font-medium text-gray-800 dark:text-gray-200">{patientContext.umur ? `${patientContext.umur} tahun` : '-'}</p>
              </div>
              <div className="col-span-2 bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-100 dark:border-gray-700">
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Riwayat Penyakit</p>
                <p className="font-medium text-gray-800 dark:text-gray-200">{patientContext.riwayat_penyakit || 'Tidak ada'}</p>
              </div>
              <div className="col-span-2 bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-100 dark:border-gray-700">
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Riwayat Alergi</p>
                <p className="font-medium text-gray-800 dark:text-gray-200">{patientContext.riwayat_alergi || 'Tidak ada'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Conditions */}
        {possible_conditions && possible_conditions.length > 0 && (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2 mb-4">
              <Activity className="h-5 w-5 text-red-500" /> Kemungkinan Kondisi
            </h3>
            <div className="space-y-3">
              {possible_conditions.map((c: any, i: number) => {
                const likelihood = c.likelihood?.toLowerCase() || ''
                let badgeClass = 'bg-gray-100 text-gray-700'
                
                if (likelihood.includes('tinggi')) badgeClass = 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800'
                else if (likelihood.includes('sedang')) badgeClass = 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800'
                else if (likelihood.includes('rendah')) badgeClass = 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800'

                return (
                  <div key={i} className="flex justify-between items-center bg-gray-50 dark:bg-gray-800/50 p-3.5 rounded-xl border border-gray-100 dark:border-gray-800">
                    <span className="font-semibold text-gray-800 dark:text-gray-200">{c.name}</span>
                    <Badge className={`px-2.5 py-0.5 border shadow-none font-semibold ${badgeClass}`}>
                      {c.likelihood}
                    </Badge>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* What to do */}
        {what_you_can_do_now && what_you_can_do_now.length > 0 && (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2 mb-4">
              <HeartPulse className="h-5 w-5 text-emerald-500" /> Tindakan yang Dapat Dilakukan Sekarang
            </h3>
            <ul className="space-y-3">
              {what_you_can_do_now.map((item: string, i: number) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* When to see doctor */}
        {when_to_see_doctor && when_to_see_doctor.length > 0 && (
          <div className="bg-orange-50/50 dark:bg-orange-950/10 border border-orange-200 dark:border-orange-900/50 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="font-bold text-orange-800 dark:text-orange-400 flex items-center gap-2 mb-4">
              <AlertTriangle className="h-5 w-5 text-orange-500" /> Kapan Harus ke Dokter
            </h3>
            <ul className="space-y-3">
              {when_to_see_doctor.map((item: string, i: number) => (
                <li key={i} className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
                  <span className="text-sm font-medium text-orange-900 dark:text-orange-300 leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Recommended Specialist */}
        {recommended_specialist && (
          <div className="bg-blue-50/50 dark:bg-blue-950/10 border border-blue-200 dark:border-blue-900/50 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="font-bold text-blue-800 dark:text-blue-400 flex items-center gap-2 mb-3">
              <Stethoscope className="h-5 w-5 text-blue-500" /> Rekomendasi Spesialis
            </h3>
            <div className="bg-white dark:bg-gray-900/50 p-4 rounded-xl border border-blue-100 dark:border-blue-900">
              <p className="text-lg font-bold text-blue-700 dark:text-blue-300 mb-1">{recommended_specialist.spesialisasi}</p>
              <p className="text-sm text-blue-900/70 dark:text-blue-300/70 leading-relaxed">{recommended_specialist.alasan}</p>
            </div>
          </div>
        )}

        {/* Health Insight */}
        {health_insight && (
          <div className="bg-purple-50/50 dark:bg-purple-950/10 border border-purple-200 dark:border-purple-900/50 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
            <h4 className="font-bold text-purple-800 dark:text-purple-400 flex items-center gap-2 mb-3">
              <Info className="h-5 w-5 text-purple-500" /> {health_insight.title}
            </h4>
            <p className="text-sm font-medium text-purple-900/80 dark:text-purple-300/80 leading-relaxed bg-white dark:bg-gray-900/50 p-3 rounded-xl border border-purple-100 dark:border-purple-900">
              {health_insight.description}
            </p>
          </div>
        )}

        {/* Disclaimer */}
        {disclaimer && (
          <div className="flex gap-3 items-start bg-red-50 dark:bg-red-950/20 p-4 rounded-2xl border border-red-200 dark:border-red-900/50 mt-6">
            <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-red-800 dark:text-red-400 mb-1 uppercase tracking-wider">Perhatian Medis</p>
              <p className="text-xs font-medium text-red-700/80 dark:text-red-300/80 leading-relaxed">{disclaimer}</p>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Fallback for non-JSON strings or unstructured data
  return (
    <div className="mt-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 rounded-2xl p-4 space-y-3">
      {typeof data === 'object' && data !== null
        ? Object.entries(data as Record<string, unknown>).map(([k, v]) => (
          <div key={k}>
            <p className="text-[10px] font-bold text-blue-400 uppercase">{k.replace(/_/g, ' ')}</p>
            <p className="text-sm text-gray-700 dark:text-gray-300 mt-0.5 whitespace-pre-wrap">
              {typeof v === 'object' ? JSON.stringify(v) : String(v)}
            </p>
          </div>
        ))
        : <p className="text-sm whitespace-pre-wrap">{String(data)}</p>
      }
    </div>
  )
}

export default function AiHealthPage() {
  const user = useAuthStore(s => s.user)
  const [symptomsResult, setSymptomsResult] = useState<unknown>(null)
  const [analyzeResult, setAnalyzeResult] = useState<unknown>(null)
  const [gejala, setGejala] = useState('')
  const symptomsForm = useForm()
  const analyzeForm = useForm()

  const { mutate: doSymptoms, isPending: s1 } = useMutation({
    mutationFn: () => aiHealthService.symptoms({
      user_id: user!.id,
      gejala: gejala.split(',').map(s => s.trim()).filter(Boolean),
      durasi: symptomsForm.getValues('durasi') || '1 hari',
      suhu_tubuh: symptomsForm.getValues('suhu_tubuh') ? Number(symptomsForm.getValues('suhu_tubuh')) : undefined,
      keluhan_tambahan: symptomsForm.getValues('keluhan_tambahan') || undefined,
    }),
    onSuccess: r => { if (r.success) setSymptomsResult(r.data) },
    onError: () => toast.error('Gagal menganalisis gejala'),
  })

  const { mutate: doAnalyze, isPending: s2 } = useMutation({
    mutationFn: (d: Record<string, unknown>) => aiHealthService.analyze({
      user_id: user!.id, ...d,
      tinggi_badan_cm: Number(d.tinggi_badan_cm),
      berat_badan_kg: Number(d.berat_badan_kg),
    }),
    onSuccess: r => { if (r.success) setAnalyzeResult(r.data) },
    onError: () => toast.error('Gagal menganalisis'),
  })

  return (
    <div className="pb-4">
      {/* Header */}
      <div className="bg-gradient-to-br from-cyan-500 to-blue-600 px-4 pt-4 pb-6">
        <div className="flex items-center gap-2 mb-1">
          <div className="bg-white/20 p-1.5 rounded-lg"><Brain className="h-4 w-4 text-white" /></div>
          <p className="text-white font-bold">AI Kesehatan PRIMA</p>
          <Zap className="h-4 w-4 text-yellow-300 ml-auto" />
        </div>
        <p className="text-blue-100 text-xs">Analisis gejala & rekomendasi dokter berbasis AI</p>
      </div>

      <div className="px-4 -mt-2">
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
          <Tabs defaultValue="symptoms">
            <TabsList className="grid grid-cols-2 w-full rounded-t-2xl rounded-b-none h-10">
              <TabsTrigger value="symptoms" className="text-xs">Gejala</TabsTrigger>
              <TabsTrigger value="analyze" className="text-xs">Data Kesehatan</TabsTrigger>
            </TabsList>

            <TabsContent value="symptoms" className="p-4 space-y-3">
              <div className="space-y-1">
                <Label className="text-xs">Gejala (pisahkan dengan koma)</Label>
                <Textarea placeholder="demam, batuk, sakit kepala..." rows={2} className="text-sm rounded-xl" value={gejala} onChange={e => setGejala(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Durasi</Label>
                  <Input placeholder="cth: 3 hari" className="h-9 text-sm rounded-xl" {...symptomsForm.register('durasi')} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Suhu (°C)</Label>
                  <Input type="number" step="0.1" placeholder="37.0" className="h-9 text-sm rounded-xl" {...symptomsForm.register('suhu_tubuh')} />
                </div>
              </div>
              <Textarea placeholder="Keluhan tambahan..." rows={2} className="text-sm rounded-xl" {...symptomsForm.register('keluhan_tambahan')} />
              <Button className="w-full rounded-xl" disabled={!gejala.trim() || s1} onClick={() => doSymptoms()}>
                {s1 ? <><Loader2 className="h-4 w-4 mr-1 animate-spin" />Menganalisis...</> : 'Analisis Gejala'}
              </Button>
              <AiResult data={symptomsResult} />
            </TabsContent>

            <TabsContent value="analyze" className="p-4 space-y-3">
              <form onSubmit={analyzeForm.handleSubmit(d => doAnalyze(d))} className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  {[['tinggi_badan_cm','Tinggi (cm)'],['berat_badan_kg','Berat (kg)'],['tekanan_darah','Tekanan Darah'],['gula_darah','Gula Darah'],['kolesterol','Kolesterol']].map(([name, label]) => (
                    <div key={name} className="space-y-1">
                      <Label className="text-xs">{label}</Label>
                      <Input className="h-9 text-sm rounded-xl" {...analyzeForm.register(name)} />
                    </div>
                  ))}
                </div>
                <Button type="submit" className="w-full rounded-xl" disabled={s2}>
                  {s2 ? <><Loader2 className="h-4 w-4 mr-1 animate-spin" />Menganalisis...</> : 'Analisis Data'}
                </Button>
              </form>
              <AiResult data={analyzeResult} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
