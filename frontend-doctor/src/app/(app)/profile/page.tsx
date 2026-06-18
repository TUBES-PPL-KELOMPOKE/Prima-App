'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { authService } from '@/services/auth.service'
import { useAuthStore } from '@/store/auth.store'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Loader2, User, Save, Upload } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export default function ProfilePage() {
  const { user, setUser } = useAuthStore()
  const queryClient = useQueryClient()
  const fileRef = useRef<HTMLInputElement>(null)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [gender, setGender] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [address, setAddress] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: () => authService.getUser(user?.id!),
    enabled: !!user?.id
  })

  useEffect(() => {
    if (data?.data) {
      const p = data.data
      setName(p.name || '')
      setEmail(p.email || '')
      setPhone(p.phone || '')
      setGender(p.gender || '')
      setDateOfBirth(p.date_of_birth ? p.date_of_birth.slice(0, 10) : '')
      setAddress(p.address || '')
    }
  }, [data])

  const updateMutation = useMutation({
    mutationFn: (payload: any) => authService.updateUser(user?.id!, payload),
    onSuccess: (res) => {
      toast.success('Profil berhasil diperbarui!')
      // Update local storage user data
      const updatedUser = { ...user, ...res.data }
      setUser(updatedUser)
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] })
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Gagal memperbarui profil')
    }
  })

  const uploadMutation = useMutation({
    mutationFn: (file: File) => authService.uploadPhoto(user?.id!, file),
    onSuccess: (res) => {
      toast.success('Foto profil berhasil diunggah!')
      // Update local storage user data
      if (res.data?.photo_url) {
        const updatedUser = { ...user, photo_url: res.data.photo_url }
        setUser(updatedUser as any)
      }
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] })
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Gagal mengunggah foto profil')
    }
  })

  const handleSave = () => {
    updateMutation.mutate({
      name,
      phone,
      gender,
      date_of_birth: dateOfBirth,
      address
    })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      uploadMutation.mutate(e.target.files[0])
    }
  }

  const profileData = data?.data || user

  return (
    <div className="p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-blue-900 dark:text-blue-400">Profil Dokter</h1>
        <p className="text-muted-foreground mt-1">Kelola informasi publik Anda yang akan dilihat oleh pasien.</p>
      </div>

      <div className="grid md:grid-cols-[1fr_2fr] gap-6">
        <Card className="border-blue-100 shadow-md h-fit">
          <CardHeader className="bg-blue-50/50 border-b border-blue-100 rounded-t-xl text-center pb-6 pt-8">
            <div className="relative inline-block mx-auto mb-4">
              <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
                <AvatarImage src={profileData?.photo_url} className="object-cover" />
                <AvatarFallback className="text-4xl bg-blue-100 text-blue-700">
                  {profileData?.name?.charAt(0).toUpperCase() || 'D'}
                </AvatarFallback>
              </Avatar>
              <Button 
                size="icon" 
                className="absolute bottom-0 right-0 rounded-full h-10 w-10 bg-blue-600 hover:bg-blue-700 shadow-md border-2 border-white"
                onClick={() => fileRef.current?.click()}
                disabled={uploadMutation.isPending}
              >
                {uploadMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              </Button>
              <input type="file" ref={fileRef} className="hidden" accept="image/*" onChange={handleFileChange} />
            </div>
            <CardTitle className="text-xl text-blue-900">{profileData?.name}</CardTitle>
            <CardDescription className="mt-1">{profileData?.email}</CardDescription>
            <div className="mt-2 inline-block px-3 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded-full uppercase tracking-wider">
              {profileData?.role}
            </div>
          </CardHeader>
        </Card>

        <Card className="border-blue-100 shadow-md">
          <CardHeader className="bg-blue-50/50 border-b border-blue-100 rounded-t-xl pb-4">
            <CardTitle className="text-lg flex items-center gap-2 text-blue-800">
              <User className="h-5 w-5" /> Informasi Dasar
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-5">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              </div>
            ) : (
              <>
                <div className="grid sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Nama Lengkap & Gelar</label>
                    <Input value={name} onChange={e => setName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email (Tidak dapat diubah)</label>
                    <Input value={email} disabled className="bg-slate-50" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Nomor Telepon</label>
                    <Input value={phone} onChange={e => setPhone(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Tanggal Lahir</label>
                    <Input type="date" value={dateOfBirth} onChange={e => setDateOfBirth(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Jenis Kelamin</label>
                    <select 
                      className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={gender} 
                      onChange={e => setGender(e.target.value)}
                    >
                      <option value="">Pilih...</option>
                      <option value="L">Laki-laki</option>
                      <option value="P">Perempuan</option>
                    </select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Alamat Praktik / Domisili</label>
                  <Textarea value={address} onChange={e => setAddress(e.target.value)} />
                </div>

                <div className="pt-4 border-t flex justify-end">
                  <Button 
                    className="bg-blue-600 hover:bg-blue-700" 
                    onClick={handleSave}
                    disabled={updateMutation.isPending}
                  >
                    {updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                    Simpan Perubahan
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
