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
import { Loader2, Activity, CalendarHeart, ShieldCheck } from 'lucide-react'

const schema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter'),
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
  nama_panggilan: z.string().optional(),
  jenis_kelamin: z.string().optional(),
  tanggal_lahir: z.string().optional(),
  no_telepon: z.string().optional(),
})
type FormData = z.infer<typeof schema>

export default function RegisterPage() {
  const router = useRouter()

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const { mutate, isPending } = useMutation({
    mutationFn: (data: FormData) => authService.register(data),
    onSuccess: (res) => {
      if (res.success) {
        toast.success('Registrasi berhasil! Silakan login.')
        router.push('/login')
      }
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg || 'Registrasi gagal')
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
              Mari Bergabung dengan Ekosistem PRIMA
            </h1>
            <p className="text-blue-100 text-lg max-w-md leading-relaxed">
              Daftarkan diri Anda untuk mendapatkan layanan medis yang cepat, mudah, dan terintegrasi kapan saja di mana saja.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-8">
              <div className="flex items-center gap-3 bg-blue-700/50 p-4 rounded-2xl backdrop-blur-sm border border-blue-500/30">
                <div className="bg-blue-500/50 p-2 rounded-xl">
                  <CalendarHeart className="w-6 h-6 text-cyan-100" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Booking Mudah</p>
                  <p className="text-xs text-blue-200">Atur jadwal dokter</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-blue-700/50 p-4 rounded-2xl backdrop-blur-sm border border-blue-500/30">
                <div className="bg-blue-500/50 p-2 rounded-xl">
                  <Activity className="w-6 h-6 text-cyan-100" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Rekam Medis</p>
                  <p className="text-xs text-blue-200">Pantau riwayat aman</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-blue-700/50 p-4 rounded-2xl backdrop-blur-sm border border-blue-500/30 sm:col-span-2">
                <div className="bg-blue-500/50 p-2 rounded-xl">
                  <ShieldCheck className="w-6 h-6 text-cyan-100" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Imunisasi & Konsultasi</p>
                  <p className="text-xs text-blue-200">Layanan komprehensif dalam satu genggaman</p>
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
        <div className="w-full max-w-md space-y-8 relative z-10 my-auto py-8">
          
          <div className="text-center space-y-4">
            <img 
              src="/logoprim.png" 
              alt="PRIMA Logo" 
              className="h-20 w-auto mx-auto object-contain drop-shadow-sm" 
              onError={(e) => { e.currentTarget.style.display = 'none'; }} 
            />
            <p className="text-slate-500 font-medium">Buat akun Pasien baru</p>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-xl shadow-blue-900/5 border border-slate-100">
            <form onSubmit={handleSubmit((d) => mutate(d))} className="space-y-4">
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-slate-700 font-semibold">Nama Lengkap *</Label>
                  <Input 
                    id="name" 
                    placeholder="Nama lengkap" 
                    className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                    {...register('name')} 
                  />
                  {errors.name && <p className="text-xs text-red-500 font-medium">{errors.name.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="nama_panggilan" className="text-slate-700 font-semibold">Nama Panggilan</Label>
                  <Input 
                    id="nama_panggilan" 
                    placeholder="Panggilan" 
                    className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                    {...register('nama_panggilan')} 
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-slate-700 font-semibold">Email *</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="email@example.com" 
                  className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                  {...register('email')} 
                />
                {errors.email && <p className="text-xs text-red-500 font-medium">{errors.email.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-slate-700 font-semibold">Password *</Label>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="Min. 6 karakter" 
                  className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                  {...register('password')} 
                />
                {errors.password && <p className="text-xs text-red-500 font-medium">{errors.password.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="tanggal_lahir" className="text-slate-700 font-semibold">Tanggal Lahir</Label>
                <Input 
                  id="tanggal_lahir" 
                  type="date" 
                  className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                  {...register('tanggal_lahir')} 
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="no_telepon" className="text-slate-700 font-semibold">No. Telepon</Label>
                <Input 
                  id="no_telepon" 
                  placeholder="08xxxxxxxxxx" 
                  className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                  {...register('no_telepon')} 
                />
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
              Masuk di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
