'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Filter, MapPin, MoreVertical, Edit, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import api from '@/lib/axios';

type Doctor = {
  id: string;
  name?: string;
  nama?: string;
  email?: string;
  spesialisasi: string;
  kota: string | null;
  status: 'Tersedia' | 'Sibuk' | 'aktif' | 'nonaktif' | string;
};

const fetchDoctors = async () => {
  const response = await api.get('/doctors');
  return response.data;
};

export default function DoctorsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [spesialisasiFilter, setSpesialisasiFilter] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  const [formData, setFormData] = useState({ name: '', email: '', password: '', spesialisasi: '', kota: '', status: 'aktif', nomor_str: '', nomor_sip: '' });
  const [editFormData, setEditFormData] = useState({ id: '', name: '', spesialisasi: '', kota: '', status: '' });

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['doctors'],
    queryFn: fetchDoctors,
  });

  const doctors: Doctor[] = data?.data || [];

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      await api.post('/auth/register/doctor', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
      setIsAddDialogOpen(false);
      setFormData({ name: '', email: '', password: '', spesialisasi: '', kota: '', status: 'aktif', nomor_str: '', nomor_sip: '' });
      alert('Dokter berhasil ditambahkan!');
    },
    onError: (error: any) => {
      alert(error?.response?.data?.message || 'Gagal menambahkan dokter');
    }
  });

  const editMutation = useMutation({
    mutationFn: async (data: typeof editFormData) => {
      // Update data user basic
      await api.patch(`/auth/users/${data.id}`, { name: data.name, status: data.status });
      // Update data profile doctor
      await api.patch(`/auth/users/${data.id}/doctor`, { spesialisasi: data.spesialisasi, kota: data.kota });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
      setIsEditDialogOpen(false);
      alert('Data dokter berhasil diupdate!');
    },
    onError: (error: any) => {
      alert(error?.response?.data?.message || 'Gagal update data dokter');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/auth/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
      alert('Dokter berhasil dihapus!');
    },
    onError: (error: any) => {
      alert(error?.response?.data?.message || 'Gagal menghapus dokter');
    }
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    editMutation.mutate(editFormData);
  };

  const handleDelete = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus dokter ini?')) {
      deleteMutation.mutate(id);
    }
  };

  const openEditDialog = (doc: Doctor) => {
    setEditFormData({
      id: doc.id,
      name: doc.name || doc.nama || '',
      spesialisasi: doc.spesialisasi,
      kota: doc.kota || '',
      status: doc.status || 'aktif'
    });
    setIsEditDialogOpen(true);
  };

  const filteredDoctors = doctors.filter((doc) => {
    const name = doc.name || doc.nama || '';
    const matchesSearch = searchTerm === '' || name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpesialisasi = spesialisasiFilter === 'all' || doc.spesialisasi === spesialisasiFilter;
    return matchesSearch && matchesSpesialisasi;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Data Dokter</h1>
          <p className="text-slate-500 mt-1">Kelola data dan status dokter terdaftar.</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              +   Tambah Dokter
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Tambah Dokter Baru</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Nama Lengkap</Label>
                <Input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Contoh: Dr. Budi Santoso" />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="email@contoh.com" />
              </div>
              <div className="space-y-2">
                <Label>Password</Label>
                <Input type="password" required minLength={6} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="Min. 6 Karakter" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nomor STR</Label>
                  <Input required value={formData.nomor_str} onChange={e => setFormData({...formData, nomor_str: e.target.value})} placeholder="No. STR" />
                </div>
                <div className="space-y-2">
                  <Label>Nomor SIP</Label>
                  <Input required value={formData.nomor_sip} onChange={e => setFormData({...formData, nomor_sip: e.target.value})} placeholder="No. SIP" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Spesialisasi</Label>
                <Input required value={formData.spesialisasi} onChange={e => setFormData({...formData, spesialisasi: e.target.value})} placeholder="Contoh: Kardiologi" />
              </div>
              <div className="space-y-2">
                <Label>Kota</Label>
                <Input value={formData.kota} onChange={e => setFormData({...formData, kota: e.target.value})} placeholder="Contoh: Jakarta" />
              </div>
              <DialogFooter className="mt-6">
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>Batal</Button>
                <Button type="submit" disabled={createMutation.isPending} className="bg-blue-600 hover:bg-blue-700 text-white">
                  {createMutation.isPending ? 'Menyimpan...' : 'Simpan'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Doctor Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Dokter</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Nama Lengkap</Label>
              <Input required value={editFormData.name} onChange={e => setEditFormData({...editFormData, name: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Spesialisasi</Label>
              <Input required value={editFormData.spesialisasi} onChange={e => setEditFormData({...editFormData, spesialisasi: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Kota</Label>
              <Input value={editFormData.kota} onChange={e => setEditFormData({...editFormData, kota: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select required value={editFormData.status} onValueChange={v => setEditFormData({...editFormData, status: v})}>
                <SelectTrigger><SelectValue placeholder="Pilih Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="aktif">Aktif</SelectItem>
                  <SelectItem value="nonaktif">Nonaktif</SelectItem>
                  <SelectItem value="Tersedia">Tersedia</SelectItem>
                  <SelectItem value="Sibuk">Sibuk</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>Batal</Button>
              <Button type="submit" disabled={editMutation.isPending} className="bg-blue-600 hover:bg-blue-700 text-white">
                {editMutation.isPending ? 'Menyimpan...' : 'Update'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input 
              placeholder="Cari dokter..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full"
            />
          </div>
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <Select value={spesialisasiFilter} onValueChange={setSpesialisasiFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Spesialisasi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Spesialisasi</SelectItem>
                <SelectItem value="Kardiologi">Kardiologi</SelectItem>
                <SelectItem value="Pediatri">Pediatri</SelectItem>
                <SelectItem value="Umum">Umum</SelectItem>
                <SelectItem value="Penyakit Dalam">Penyakit Dalam</SelectItem>
                <SelectItem value="Mata">Mata</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="rounded-md border border-slate-200 overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>Nama Dokter</TableHead>
                <TableHead>Spesialisasi</TableHead>
                <TableHead>Kota</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24 text-slate-500">Memuat data...</TableCell>
                </TableRow>
              ) : filteredDoctors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24 text-slate-500">Tidak ada data dokter</TableCell>
                </TableRow>
              ) : filteredDoctors.map((doctor) => (
                <TableRow key={doctor.id}>
                  <TableCell className="font-medium text-slate-900">{doctor.name || doctor.nama}</TableCell>
                  <TableCell className="text-slate-600">{doctor.spesialisasi || '-'}</TableCell>
                  <TableCell>
                    <div className="flex items-center text-slate-600 text-sm">
                      <MapPin className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                      {doctor.kota || '-'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={
                      doctor.status === 'aktif' || doctor.status === 'Tersedia'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }>
                      {doctor.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-slate-100 hover:text-slate-900 h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditDialog(doctor)} className="cursor-pointer">
                          <Edit className="w-4 h-4 mr-2 text-blue-500" /> Edit Dokter
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(doctor.id)} className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50">
                          <Trash className="w-4 h-4 mr-2" /> Hapus
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
