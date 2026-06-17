'use client'

import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { calculatorService } from '@/services/index'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

function Result({ data }: { data: Record<string, unknown> | null }) {
  if (!data) return null

  const renderValue = (v: unknown): React.ReactNode => {
    if (typeof v === 'object' && v !== null) {
      return (
        <div className="text-right text-xs space-y-1">
          {Object.entries(v as Record<string, unknown>).map(([subK, subV]) => (
            <div key={subK} className="text-gray-600 dark:text-gray-400">
              <span className="capitalize text-gray-500 mr-2">{subK.replace(/_/g, ' ')}:</span>
              <span className="font-medium text-gray-800 dark:text-gray-200">{String(subV)}</span>
            </div>
          ))}
        </div>
      )
    }
    return <span className="font-semibold text-gray-800 dark:text-gray-200">{String(v)}</span>
  }

  return (
    <div className="mt-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-2xl p-5 space-y-3 border border-blue-100 dark:border-blue-900/50 shadow-inner">
      <h4 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-2 border-b border-blue-200/50 dark:border-blue-800/50 pb-2">Hasil Analisis</h4>
      {Object.entries(data).map(([k, v]) => (
        <div key={k} className="flex items-start justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400 capitalize font-medium">{k.replace(/_/g, ' ')}</span>
          {renderValue(v)}
        </div>
      ))}
    </div>
  )
}

export default function HealthCalculatorPage() {
  const [bmi, setBmi] = useState<Record<string, unknown> | null>(null)
  const [bmr, setBmr] = useState<Record<string, unknown> | null>(null)
  const [diabetes, setDiabetes] = useState<Record<string, unknown> | null>(null)
  const [hipertensi, setHipertensi] = useState<Record<string, unknown> | null>(null)

  const bmiForm = useForm()
  const bmrForm = useForm()
  const diabetesForm = useForm()
  const htnForm = useForm()

  const { mutate: calcBmi, isPending: p1 } = useMutation({ mutationFn: (d: { tinggi_cm: number; berat_kg: number }) => calculatorService.bmi(d), onSuccess: r => r.success && setBmi(r.data), onError: () => toast.error('Gagal') })
  const { mutate: calcBmr, isPending: p2 } = useMutation({ mutationFn: calculatorService.bmr, onSuccess: r => r.success && setBmr(r.data), onError: () => toast.error('Gagal') })
  const { mutate: calcDiabetes, isPending: p3 } = useMutation({ mutationFn: calculatorService.diabetesRisk, onSuccess: r => r.success && setDiabetes(r.data), onError: () => toast.error('Gagal') })
  const { mutate: calcHtn, isPending: p4 } = useMutation({ mutationFn: calculatorService.hipertensiRisk, onSuccess: r => r.success && setHipertensi(r.data), onError: () => toast.error('Gagal') })

  const f = (v: unknown) => Number(v)

  return (
    <div className="pb-4">
      <div className="px-4 py-3 font-bold text-base border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950">Kalkulator Kesehatan</div>
      <div className="px-4 pt-3">
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
          <Tabs defaultValue="bmi">
            <TabsList className="grid grid-cols-4 w-full rounded-t-2xl rounded-b-none h-9">
              <TabsTrigger value="bmi" className="text-xs">BMI</TabsTrigger>
              <TabsTrigger value="bmr" className="text-xs">BMR</TabsTrigger>
              <TabsTrigger value="diabetes" className="text-xs">Diabetes</TabsTrigger>
              <TabsTrigger value="htn" className="text-xs">Hipertensi</TabsTrigger>
            </TabsList>

            {/* BMI */}
            <TabsContent value="bmi" className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1"><Label className="text-xs">Tinggi (cm)</Label><Input type="number" className="h-9 rounded-xl text-sm" {...bmiForm.register('tinggi_cm')} /></div>
                <div className="space-y-1"><Label className="text-xs">Berat (kg)</Label><Input type="number" className="h-9 rounded-xl text-sm" {...bmiForm.register('berat_kg')} /></div>
              </div>
              <Button className="w-full rounded-xl" disabled={p1} onClick={bmiForm.handleSubmit(d => calcBmi({ tinggi_cm: f(d.tinggi_cm), berat_kg: f(d.berat_kg) }))}>
                {p1 ? 'Menghitung...' : 'Hitung BMI'}
              </Button>
              <Result data={bmi} />
            </TabsContent>

            {/* BMR */}
            <TabsContent value="bmr" className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1"><Label className="text-xs">Umur</Label><Input type="number" className="h-9 rounded-xl text-sm" {...bmrForm.register('umur')} /></div>
                <div className="space-y-1"><Label className="text-xs">Berat (kg)</Label><Input type="number" className="h-9 rounded-xl text-sm" {...bmrForm.register('berat_kg')} /></div>
                <div className="space-y-1"><Label className="text-xs">Tinggi (cm)</Label><Input type="number" className="h-9 rounded-xl text-sm" {...bmrForm.register('tinggi_cm')} /></div>
                <div className="space-y-1"><Label className="text-xs">Kelamin</Label>
                  <Select onValueChange={v => bmrForm.setValue('jenis_kelamin', String(v || ''))}>
                    <SelectTrigger className="h-9 rounded-xl text-sm"><SelectValue placeholder="Pilih" /></SelectTrigger>
                    <SelectContent><SelectItem value="pria">Pria</SelectItem><SelectItem value="wanita">Wanita</SelectItem></SelectContent>
                  </Select>
                </div>
                <div className="col-span-2 space-y-1"><Label className="text-xs">Aktivitas</Label>
                  <Select onValueChange={v => bmrForm.setValue('aktifitas_fisik', String(v || ''))}>
                    <SelectTrigger className="h-9 rounded-xl text-sm"><SelectValue placeholder="Pilih" /></SelectTrigger>
                    <SelectContent><SelectItem value="rendah">Rendah</SelectItem><SelectItem value="sedang">Sedang</SelectItem><SelectItem value="tinggi">Tinggi</SelectItem></SelectContent>
                  </Select>
                </div>
              </div>
              <Button className="w-full rounded-xl" disabled={p2} onClick={bmrForm.handleSubmit(d => calcBmr({ ...d, umur: f(d.umur), berat_kg: f(d.berat_kg), tinggi_cm: f(d.tinggi_cm) }))}>
                {p2 ? 'Menghitung...' : 'Hitung BMR'}
              </Button>
              <Result data={bmr} />
            </TabsContent>

            {/* Diabetes */}
            <TabsContent value="diabetes" className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                {[['umur','Umur'],['berat_kg','Berat (kg)'],['tinggi_cm','Tinggi (cm)'],['gula_darah','Gula Darah']].map(([n,l]) => (
                  <div key={n} className="space-y-1"><Label className="text-xs">{l}</Label><Input type="number" className="h-9 rounded-xl text-sm" {...diabetesForm.register(n)} /></div>
                ))}
                <div className="space-y-1"><Label className="text-xs">Riwayat Keluarga</Label>
                  <Select onValueChange={v => diabetesForm.setValue('riwayat_keluarga', String(v || ''))}>
                    <SelectTrigger className="h-9 rounded-xl text-sm"><SelectValue placeholder="Pilih" /></SelectTrigger>
                    <SelectContent><SelectItem value="ya">Ya</SelectItem><SelectItem value="tidak">Tidak</SelectItem></SelectContent>
                  </Select>
                </div>
                <div className="space-y-1"><Label className="text-xs">Aktivitas</Label>
                  <Select onValueChange={v => diabetesForm.setValue('aktifitas_fisik', String(v || ''))}>
                    <SelectTrigger className="h-9 rounded-xl text-sm"><SelectValue placeholder="Pilih" /></SelectTrigger>
                    <SelectContent><SelectItem value="rendah">Rendah</SelectItem><SelectItem value="sedang">Sedang</SelectItem><SelectItem value="tinggi">Tinggi</SelectItem></SelectContent>
                  </Select>
                </div>
              </div>
              <Button className="w-full rounded-xl" disabled={p3} onClick={diabetesForm.handleSubmit(d => calcDiabetes({ ...d, umur: f(d.umur), berat_kg: f(d.berat_kg), tinggi_cm: f(d.tinggi_cm), gula_darah: f(d.gula_darah), riwayat_keluarga: d.riwayat_keluarga === 'ya' }))}>
                {p3 ? 'Menghitung...' : 'Hitung Risiko'}
              </Button>
              <Result data={diabetes} />
            </TabsContent>

            {/* Hipertensi */}
            <TabsContent value="htn" className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                {[['umur','Umur'],['tekanan_sistolik','Sistolik'],['tekanan_diastolik','Diastolik']].map(([n,l]) => (
                  <div key={n} className="space-y-1"><Label className="text-xs">{l}</Label><Input type="number" className="h-9 rounded-xl text-sm" {...htnForm.register(n)} /></div>
                ))}
                <div className="space-y-1"><Label className="text-xs">Merokok</Label>
                  <Select onValueChange={v => htnForm.setValue('merokok', String(v || ''))}>
                    <SelectTrigger className="h-9 rounded-xl text-sm"><SelectValue placeholder="Pilih" /></SelectTrigger>
                    <SelectContent><SelectItem value="ya">Ya</SelectItem><SelectItem value="tidak">Tidak</SelectItem></SelectContent>
                  </Select>
                </div>
                <div className="space-y-1"><Label className="text-xs">Riwayat Keluarga</Label>
                  <Select onValueChange={v => htnForm.setValue('riwayat_keluarga', String(v || ''))}>
                    <SelectTrigger className="h-9 rounded-xl text-sm"><SelectValue placeholder="Pilih" /></SelectTrigger>
                    <SelectContent><SelectItem value="ya">Ya</SelectItem><SelectItem value="tidak">Tidak</SelectItem></SelectContent>
                  </Select>
                </div>
              </div>
              <Button className="w-full rounded-xl" disabled={p4} onClick={htnForm.handleSubmit(d => calcHtn({ ...d, umur: f(d.umur), tekanan_sistolik: f(d.tekanan_sistolik), tekanan_diastolik: f(d.tekanan_diastolik), merokok: d.merokok === 'ya', riwayat_keluarga: d.riwayat_keluarga === 'ya' }))}>
                {p4 ? 'Menghitung...' : 'Hitung Risiko'}
              </Button>
              <Result data={hipertensi} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
