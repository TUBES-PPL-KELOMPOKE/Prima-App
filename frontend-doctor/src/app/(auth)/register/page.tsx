'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { authService } from '@/services/auth.service'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Stethoscope, ShieldCheck, HeartPulse } from 'lucide-react'

const schema = z.object({
  name: z.string().min(1, 'Nama lengkap wajib diisi'),
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
  nomor_str: z.string().min(1, 'Nomor STR wajib diisi'),
  nomor_sip: z.string().min(1, 'Nomor SIP wajib diisi'),
  spesialisasi: z.string().min(1, 'Spesialisasi wajib diisi'),
})
type FormData = z.infer<typeof schema>

export default function RegisterPage() {
  const router = useRouter()

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const { mutate, isPending } = useMutation({
    mutationFn: authService.register,
    onSuccess: (res) => {
      if (res.success || res.message) {
        toast.success('Pendaftaran Dokter berhasil! Silakan login.')
        router.push('/login')
      }
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || err.message || 'Gagal mendaftar'
      toast.error(msg)
    },
  })

  return (
    <div className="min-h-screen flex w-full bg-slate-50">
      
      {/* Kiri: Bagian Visual / Dekoratif */}
      <div className="hidden lg:block w-1/2">
        <div className="sticky top-0 h-screen w-full bg-blue-600 relative overflow-hidden flex flex-col justify-between p-12 text-white">
          {/* Dekorasi Latar Belakang */}
          <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-500 rounded-full blur-3xl opacity-50 mix-blend-screen pointer-events-none"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-cyan-400 rounded-full blur-3xl opacity-30 mix-blend-screen pointer-events-none"></div>
          
          <div className="relative z-10">
            <img 
              src="/logoprim.png" 
              alt="PRIMA Logo" 
              className="h-12 w-auto object-contain brightness-0 invert" 
              onError={(e) => { e.currentTarget.style.display = 'none'; }} 
            />
          </div>

          <div className="relative z-10 space-y-6">
            <h1 className="text-4xl lg:text-5xl font-bold leading-tight">
              Bergabunglah dengan Ekosistem PRIMA
            </h1>
            <p className="text-blue-100 text-lg max-w-md leading-relaxed">
              Daftarkan diri Anda untuk memberikan pelayanan medis terdepan dan terintegrasi secara digital.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-8">
              <div className="flex items-center gap-3 bg-blue-700/50 p-4 rounded-2xl backdrop-blur-sm border border-blue-500/30">
                <div className="bg-blue-500/50 p-2 rounded-xl">
                  <Stethoscope className="w-6 h-6 text-cyan-100" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Konsultasi Live</p>
                  <p className="text-xs text-blue-200">Real-time chat</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-blue-700/50 p-4 rounded-2xl backdrop-blur-sm border border-blue-500/30">
                <div className="bg-blue-500/50 p-2 rounded-xl">
                  <HeartPulse className="w-6 h-6 text-cyan-100" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Rekam Medis</p>
                  <p className="text-xs text-blue-200">Akses riwayat cepat</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-blue-700/50 p-4 rounded-2xl backdrop-blur-sm border border-blue-500/30 sm:col-span-2">
                <div className="bg-blue-500/50 p-2 rounded-xl">
                  <ShieldCheck className="w-6 h-6 text-cyan-100" />
                </div>
                <div>
                  <p className="font-semibold text-sm">E-Resep & Imunisasi</p>
                  <p className="text-xs text-blue-200">Terintegrasi dalam satu sistem cerdas</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-10 text-sm text-blue-200">
            &copy; {new Date().getFullYear()} PRIMA Healthcare. All rights reserved.
          </div>
        </div>
      </div>

      {/* Kanan: Form Register */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 min-h-screen overflow-y-auto">
        <div className="w-full max-w-md space-y-8 relative z-10 my-auto">
          
          <div className="text-center space-y-4">
            <img 
              src="/logoprim.png" 
              alt="PRIMA Logo" 
              className="h-20 w-auto mx-auto object-contain drop-shadow-sm" 
              onError={(e) => { e.currentTarget.style.display = 'none'; }} 
            />
            <p className="text-slate-500 font-medium">Buat akun tenaga kesehatan baru</p>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-xl shadow-blue-900/5 border border-slate-100">
            <form onSubmit={handleSubmit((d) => mutate(d))} className="space-y-4">
              
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-slate-700 font-semibold">Nama Lengkap & Gelar</Label>
                <Input 
                  id="name" 
                  placeholder="dr. Budi Santoso, Sp.A" 
                  className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                  {...register('name')} 
                />
                {errors.name && <p className="text-xs text-red-500 font-medium">{errors.name.message}</p>}
              </div>
              
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-slate-700 font-semibold">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="dokter@example.com" 
                  className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                  {...register('email')} 
                />
                {errors.email && <p className="text-xs text-red-500 font-medium">{errors.email.message}</p>}
              </div>
              
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-slate-700 font-semibold">Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••••" 
                  className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                  {...register('password')} 
                />
                {errors.password && <p className="text-xs text-red-500 font-medium">{errors.password.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="nomor_str" className="text-slate-700 font-semibold">Nomor STR</Label>
                  <Input 
                    id="nomor_str" 
                    placeholder="1234567890" 
                    className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                    {...register('nomor_str')} 
                  />
                  {errors.nomor_str && <p className="text-xs text-red-500 font-medium">{errors.nomor_str.message}</p>}
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="nomor_sip" className="text-slate-700 font-semibold">Nomor SIP</Label>
                  <Input 
                    id="nomor_sip" 
                    placeholder="0987654321" 
                    className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                    {...register('nomor_sip')} 
                  />
                  {errors.nomor_sip && <p className="text-xs text-red-500 font-medium">{errors.nomor_sip.message}</p>}
                </div>
              </div>
              
              <div className="space-y-1.5">
                <Label htmlFor="spesialisasi" className="text-slate-700 font-semibold">Spesialisasi</Label>
                <Input 
                  id="spesialisasi" 
                  placeholder="Penyakit Dalam" 
                  className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                  {...register('spesialisasi')} 
                />
                {errors.spesialisasi && <p className="text-xs text-red-500 font-medium">{errors.spesialisasi.message}</p>}
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 text-base font-bold rounded-xl bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-0.5 mt-4" 
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  'Daftar Sekarang'
                )}
              </Button>
            </form>
          </div>
          
          <p className="text-center text-sm font-medium text-slate-500">
            Sudah punya akun?{' '}
            <Link href="/login" className="text-blue-600 hover:text-blue-800 transition-colors">
              Login di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
