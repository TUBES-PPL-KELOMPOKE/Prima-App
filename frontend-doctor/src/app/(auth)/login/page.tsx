'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { authService } from '@/services/auth.service'
import { useAuthStore } from '@/store/auth.store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Stethoscope, ShieldCheck, HeartPulse } from 'lucide-react'

const schema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(1, 'Password wajib diisi'),
})
type FormData = z.infer<typeof schema>

export default function LoginPage() {
  const router = useRouter()
  const setAuth = useAuthStore((s) => s.setAuth)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const { mutate, isPending } = useMutation({
    mutationFn: authService.login,
    onSuccess: (res) => {
      if (res.success) {
        if (res.data.user.role !== 'doctor') {
          toast.error('Gagal login: Akun Anda bukan akun Dokter!')
          return
        }
        setAuth(res.data.user, res.data.token)
        document.cookie = `token=${res.data.token}; path=/`
        router.push('/dashboard')
      }
    },
    onError: (err: unknown) => {
      console.error('Full Login Error:', err)
      const errorObj = err as any
      
      if (!errorObj.response) {
        toast.error('Network Error: Tidak dapat menghubungi server. Pastikan API menyala dan URL benar.', { duration: 5000 })
        return
      }

      const status = errorObj.response.status
      const data = errorObj.response.data
      
      let msg = 'Login gagal'
      
      if (status === 404) {
        msg = 'Endpoint login tidak ditemukan (404)'
      } else if (status === 401) {
        msg = data?.error_message || data?.message || 'Email atau password salah (401)'
      } else if (status === 500) {
        msg = 'Terjadi kesalahan internal pada server backend (500)'
      } else {
        msg = data?.error_message || data?.message || `Error [${status}]: Gagal login`
      }

      toast.error(msg, { duration: 5000 })
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
              Pelayanan Cerdas untuk Pasien Prioritas
            </h1>
            <p className="text-blue-100 text-lg max-w-md leading-relaxed">
              Kelola jadwal, rekam medis, dan konsultasi dengan lebih efisien menggunakan ekosistem digital PRIMA.
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

      {/* Kanan: Form Login */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 min-h-screen overflow-y-auto">
        <div className="w-full max-w-md space-y-8 relative z-10">
          
          <div className="text-center space-y-4">
            <img 
              src="/logoprim.png" 
              alt="PRIMA Logo" 
              className="h-20 w-auto mx-auto object-contain drop-shadow-sm" 
              onError={(e) => { e.currentTarget.style.display = 'none'; }} 
            />
            <p className="text-slate-500 font-medium">Masuk ke portal tenaga kesehatan</p>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-xl shadow-blue-900/5 border border-slate-100">
            <form onSubmit={handleSubmit((d) => mutate(d))} className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-slate-700 font-semibold">Email Praktik</Label>
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
                <div className="flex justify-between items-center">
                  <Label htmlFor="password" className="text-slate-700 font-semibold">Password</Label>
                  <Link href="#" className="text-xs font-semibold text-blue-600 hover:underline">
                    Lupa password?
                  </Link>
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••••" 
                  className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                  {...register('password')} 
                />
                {errors.password && <p className="text-xs text-red-500 font-medium">{errors.password.message}</p>}
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
                  'Masuk Sekarang'
                )}
              </Button>
            </form>
          </div>
          
          {/* <p className="text-center text-sm font-medium text-slate-500">
            Belum punya akun Dokter?{' '}
            <Link href="/register" className="text-blue-600 hover:text-blue-800 transition-colors">
              Daftar sekarang
            </Link>
          </p> */}
        </div>
      </div>
    </div>
  )
}
