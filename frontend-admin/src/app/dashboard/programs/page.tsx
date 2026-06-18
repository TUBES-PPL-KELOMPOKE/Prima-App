'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Filter, MoreVertical, Calendar, Edit, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import api from '@/lib/axios';

type Program = {
  id: string;
  nama: string;
  type: string;
  tanggal_mulai?: string;
  tanggal_selesai?: string;
  kuota: number;
  status: 'aktif' | 'direncanakan' | 'selesai' | string;
};

const formatDate = (value?: string) => {
  if (!value) {
    return '-';
  }

  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
};

// Use YYYY-MM-DD for input type="date"
const formatInputDate = (value?: string) => {
  if (!value) return '';
  const d = new Date(value);
  return d.toISOString().split('T')[0];
};

const fetchPrograms = async () => {
  const response = await api.get('/programs');
  return response.data;
};

export default function ProgramKesehatanPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  const [formData, setFormData] = useState({ nama: '', type: 'vaksinasi', kuota: '', status: 'direncanakan', tanggal_mulai: '', tanggal_selesai: '' });
  const [editFormData, setEditFormData] = useState({ id: '', nama: '', type: '', kuota: '', status: '', tanggal_mulai: '', tanggal_selesai: '' });

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['programs'],
    queryFn: fetchPrograms,
  });

  const programs: Program[] = data?.data || [];

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const payload = {
        ...data,
        kuota: parseInt(data.kuota, 10),
      };
      await api.post('/programs', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['programs'] });
      setIsAddDialogOpen(false);
      setFormData({ nama: '', type: 'vaksinasi', kuota: '', status: 'direncanakan', tanggal_mulai: '', tanggal_selesai: '' });
      alert('Program berhasil dibuat!');
    },
    onError: (error: any) => {
      alert(error?.response?.data?.message || 'Gagal menambahkan program');
    }
  });

  const editMutation = useMutation({
    mutationFn: async (data: typeof editFormData) => {
      const payload = {
        ...data,
        kuota: parseInt(data.kuota, 10),
      };
      await api.patch(`/programs/${data.id}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['programs'] });
      setIsEditDialogOpen(false);
      alert('Program berhasil diupdate!');
    },
    onError: (error: any) => {
      alert(error?.response?.data?.message || 'Gagal update program');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/programs/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['programs'] });
      alert('Program berhasil dihapus!');
    },
    onError: (error: any) => {
      alert(error?.response?.data?.message || 'Gagal menghapus program');
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
    if (confirm('Apakah Anda yakin ingin menghapus program ini?')) {
      deleteMutation.mutate(id);
    }
  };

  const openEditDialog = (prog: Program) => {
    setEditFormData({
      id: prog.id,
      nama: prog.nama,
      type: prog.type,
      kuota: prog.kuota.toString(),
      status: prog.status,
      tanggal_mulai: formatInputDate(prog.tanggal_mulai),
      tanggal_selesai: formatInputDate(prog.tanggal_selesai)
    });
    setIsEditDialogOpen(true);
  };

  const filteredPrograms = programs.filter((prog) => {
    const matchesSearch = searchTerm === '' || prog.nama.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || prog.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Program Kesehatan</h1>
          <p className="text-slate-500 mt-1">Kelola jadwal dan data program kesehatan.</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              +   Buat Program
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Buat Program Kesehatan Baru</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Nama Program</Label>
                <Input required value={formData.nama} onChange={e => setFormData({...formData, nama: e.target.value})} placeholder="Contoh: Vaksinasi Massal" />
              </div>
              <div className="space-y-2">
                <Label>Tipe</Label>
                <Select required value={formData.type} onValueChange={v => setFormData({...formData, type: v})}>
                  <SelectTrigger><SelectValue placeholder="Tipe" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vaksinasi">Vaksinasi</SelectItem>
                    <SelectItem value="penyuluhan">Penyuluhan</SelectItem>
                    <SelectItem value="pemeriksaan">Pemeriksaan</SelectItem>
                    <SelectItem value="olahraga">Olahraga</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tanggal Mulai</Label>
                  <Input type="date" required value={formData.tanggal_mulai} onChange={e => setFormData({...formData, tanggal_mulai: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Tanggal Selesai</Label>
                  <Input type="date" required value={formData.tanggal_selesai} onChange={e => setFormData({...formData, tanggal_selesai: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Kuota</Label>
                  <Input type="number" required value={formData.kuota} onChange={e => setFormData({...formData, kuota: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select required value={formData.status} onValueChange={v => setFormData({...formData, status: v})}>
                    <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="direncanakan">Direncanakan</SelectItem>
                      <SelectItem value="aktif">Aktif</SelectItem>
                      <SelectItem value="selesai">Selesai</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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

      {/* Edit Program Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Program Kesehatan</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Nama Program</Label>
              <Input required value={editFormData.nama} onChange={e => setEditFormData({...editFormData, nama: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Tipe</Label>
              <Select required value={editFormData.type} onValueChange={v => setEditFormData({...editFormData, type: v})}>
                <SelectTrigger><SelectValue placeholder="Tipe" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="vaksinasi">Vaksinasi</SelectItem>
                  <SelectItem value="penyuluhan">Penyuluhan</SelectItem>
                  <SelectItem value="pemeriksaan">Pemeriksaan</SelectItem>
                  <SelectItem value="olahraga">Olahraga</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tanggal Mulai</Label>
                <Input type="date" required value={editFormData.tanggal_mulai} onChange={e => setEditFormData({...editFormData, tanggal_mulai: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Tanggal Selesai</Label>
                <Input type="date" required value={editFormData.tanggal_selesai} onChange={e => setEditFormData({...editFormData, tanggal_selesai: e.target.value})} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Kuota</Label>
                <Input type="number" required value={editFormData.kuota} onChange={e => setEditFormData({...editFormData, kuota: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select required value={editFormData.status} onValueChange={v => setEditFormData({...editFormData, status: v})}>
                  <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="direncanakan">Direncanakan</SelectItem>
                    <SelectItem value="aktif">Aktif</SelectItem>
                    <SelectItem value="selesai">Selesai</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
              placeholder="Cari program..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full"
            />
          </div>
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[170px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="aktif">Aktif</SelectItem>
                <SelectItem value="direncanakan">Direncanakan</SelectItem>
                <SelectItem value="selesai">Selesai</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="rounded-md border border-slate-200 overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>Nama Program</TableHead>
                <TableHead>Tipe</TableHead>
                <TableHead>Periode</TableHead>
                <TableHead>Kuota</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-24 text-slate-500">Memuat data...</TableCell>
                </TableRow>
              ) : filteredPrograms.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-24 text-slate-500">Tidak ada data program</TableCell>
                </TableRow>
              ) : filteredPrograms.map((prog) => (
                <TableRow key={prog.id}>
                  <TableCell className="font-medium text-slate-900">{prog.nama}</TableCell>
                  <TableCell className="capitalize text-slate-600">{prog.type}</TableCell>
                  <TableCell>
                    <div className="flex items-center text-slate-600 text-sm">
                      <Calendar className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                      {formatDate(prog.tanggal_mulai)} - {formatDate(prog.tanggal_selesai)}
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-600">{prog.kuota} Orang</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={
                      prog.status === 'aktif' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      prog.status === 'selesai' ? 'bg-slate-100 text-slate-700 border-slate-200' :
                      'bg-amber-50 text-amber-700 border-amber-200'
                    }>
                      {prog.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-slate-100 hover:text-slate-900 h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditDialog(prog)} className="cursor-pointer">
                          <Edit className="w-4 h-4 mr-2 text-blue-500" /> Edit Program
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(prog.id)} className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50">
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
