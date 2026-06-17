'use client'

import { useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { authService } from '@/services/auth.service'
import { useAuthStore } from '@/store/auth.store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Camera, LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function ProfilePage() {
  const { user, setAuth, token, clearAuth } = useAuthStore()
  const qc = useQueryClient()
  const fileRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const { data, isLoading } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: () => authService.getUser(user!.id),
    enabled: !!user?.id,
  })

  const profile = data?.data
  const { register, handleSubmit, reset } = useForm()

  useEffect(() => { if (profile) reset(profile) }, [profile, reset])

  const { mutate: save, isPending } = useMutation({
    mutationFn: (d: Record<string, unknown>) => authService.updatePasienProfile(user!.id, d),
    onSuccess: () => {
      toast.success('Profil berhasil disimpan')
      qc.invalidateQueries({ queryKey: ['profile', user?.id] })
    },
    onError: () => toast.error('Gagal menyimpan profil'),
  })

  const { mutate: uploadPhoto } = useMutation({
    mutationFn: (file: File) => authService.uploadPhoto(user!.id, file),
    onSuccess: (res) => {
      toast.success('Foto berhasil diupload')
      if (token && user) setAuth(token, { ...user, foto_profil_url: res.data?.foto_profil_url })
      qc.invalidateQueries({ queryKey: ['profile', user?.id] })
    },
    onError: () => toast.error('Gagal upload foto'),
  })

  const handleLogout = async () => {
    await authService.logout().catch(() => {})
    clearAuth()
    document.cookie = 'token=; path=/; max-age=0'
    router.push('/login')
    toast.success('Berhasil logout')
  }

  if (isLoading) return (
    <div className="p-4 space-y-4">
      <Skeleton className="h-28 w-full rounded-2xl" />
      <Skeleton className="h-96 w-full rounded-2xl" />
    </div>
  )

  return (
    <div className="pb-4">
      {/* Profile card */}
      <div className="bg-gradient-to-br from-blue-600 to-cyan-600 px-4 pt-5 pb-8">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar className="h-16 w-16 border-2 border-white">
              <AvatarImage src={profile?.foto_profil_url} />
              <AvatarFallback className="text-xl bg-white/20 text-white font-bold">
                {user?.name?.charAt(0)?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <button
              onClick={() => fileRef.current?.click()}
              className="absolute bottom-0 right-0 bg-white text-blue-600 rounded-full p-1 shadow-sm"
            >
              <Camera className="h-3 w-3" />
            </button>
          </div>
          <div>
            <p className="text-white font-bold text-lg">{profile?.name}</p>
            <p className="text-blue-100 text-xs">{profile?.email}</p>
          </div>
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden"
          onChange={(e) => e.target.files?.[0] && uploadPhoto(e.target.files[0])} />
      </div>

      {/* Form */}
      <div className="mx-4 -mt-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4">
        <p className="text-sm font-bold text-gray-800 dark:text-white mb-4">Data Diri</p>
        <form onSubmit={handleSubmit((d) => save(d))} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            {[
              { name: 'name',           label: 'Nama Lengkap',   type: 'text',   span: 2 },
              { name: 'no_telepon',     label: 'No. Telepon',    type: 'tel',    span: 2 },
              { name: 'alamat',         label: 'Alamat',         type: 'text',   span: 2 },
              { name: 'kota',           label: 'Kota',           type: 'text',   span: 1 },
              { name: 'provinsi',       label: 'Provinsi',       type: 'text',   span: 1 },
              { name: 'kode_pos',       label: 'Kode Pos',       type: 'text',   span: 1 },
              { name: 'nik',            label: 'NIK',            type: 'text',   span: 1 },
              { name: 'no_bpjs',        label: 'No. BPJS',       type: 'text',   span: 1 },
              { name: 'golongan_darah', label: 'Gol. Darah',     type: 'text',   span: 1 },
              { name: 'tinggi_badan_cm',label: 'Tinggi (cm)',    type: 'number', span: 1 },
              { name: 'berat_badan_kg', label: 'Berat (kg)',     type: 'number', span: 1 },
              { name: 'riwayat_alergi', label: 'Riwayat Alergi',type: 'text',   span: 2 },
              { name: 'riwayat_penyakit',label:'Riwayat Penyakit',type:'text',  span: 2 },
            ].map(({ name, label, type, span }) => (
              <div key={name} className={`space-y-1 ${span === 2 ? 'col-span-2' : ''}`}>
                <Label className="text-xs text-gray-500">{label}</Label>
                <Input className="h-9 text-sm rounded-xl" id={name} type={type} {...register(name)} />
              </div>
            ))}
          </div>
          <Button type="submit" className="w-full rounded-xl" disabled={isPending}>
            {isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
          </Button>
        </form>
      </div>

      {/* Logout */}
      <div className="mx-4 mt-3">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-red-100 text-red-500 hover:bg-red-50 transition-colors text-sm font-medium"
        >
          <LogOut className="h-4 w-4" />
          Keluar dari Akun
        </button>
      </div>
    </div>
  )
}
