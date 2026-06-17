'use client'

import { useForm, Controller } from 'react-hook-form'
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

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

  const { register, handleSubmit, control, formState: { errors } } = useForm<FormData>({
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-blue-600">Medicare+</CardTitle>
          <CardDescription>Buat akun pasien baru</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit((d) => mutate(d))} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="name">Nama Lengkap *</Label>
                <Input id="name" placeholder="Nama lengkap" {...register('name')} />
                {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
              </div>
              <div className="space-y-1">
                <Label htmlFor="nama_panggilan">Nama Panggilan</Label>
                <Input id="nama_panggilan" placeholder="Panggilan" {...register('nama_panggilan')} />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="email">Email *</Label>
              <Input id="email" type="email" placeholder="email@example.com" {...register('email')} />
              {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
            </div>

            <div className="space-y-1">
              <Label htmlFor="password">Password *</Label>
              <Input id="password" type="password" placeholder="Min. 6 karakter" {...register('password')} />
              {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
            </div>

            <div className="space-y-1">
              <Label htmlFor="tanggal_lahir">Tanggal Lahir</Label>
              <Input id="tanggal_lahir" type="date" {...register('tanggal_lahir')} />
            </div>

            <div className="space-y-1">
              <Label htmlFor="no_telepon">No. Telepon</Label>
              <Input id="no_telepon" placeholder="08xxxxxxxxxx" {...register('no_telepon')} />
            </div>

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? 'Memproses...' : 'Daftar Sekarang'}
            </Button>
          </form>
          <p className="text-center text-sm text-muted-foreground mt-4">
            Sudah punya akun?{' '}
            <Link href="/login" className="text-blue-600 hover:underline font-medium">
              Masuk
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
