'use client';

import { useQuery } from '@tanstack/react-query';
import { Users, Stethoscope, ShieldCheck, UserCircle, ArrowUpRight, ArrowDownRight, Loader2, Activity, CalendarDays } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { reportService } from '@/services/report.service';
import api from '@/lib/axios';

export default function DashboardOverview() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['reports', 'users'],
    queryFn: reportService.getUsersStats,
  });

  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await api.get('/auth/users');
      return res.data;
    },
  });

  const summary = data?.data?.summary;
  const recentUsers = Array.isArray(usersData?.data) ? usersData.data.slice(0, 5) : [];
  const stats = {
    totalUsers: {
      value: summary?.total_users || 0,
      growth: summary?.new_this_month || 0,
    },
    totalPasien: {
      value: summary?.breakdown?.pasien || 0,
      growth: 0,
    },
    totalDokter: {
      value: summary?.breakdown?.doctor || summary?.breakdown?.dokter || 0,
      growth: 0,
    },
    totalAdmin: {
      value: summary?.breakdown?.admin || 0,
      growth: 0,
    },
  };

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers?.value || 0,
      growth: stats.totalUsers?.growth || 0,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Total Pasien',
      value: stats.totalPasien?.value || 0,
      growth: stats.totalPasien?.growth || 0,
      icon: UserCircle,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
    },
    {
      title: 'Total Dokter',
      value: stats.totalDokter?.value || 0,
      growth: stats.totalDokter?.growth || 0,
      icon: Stethoscope,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
    },
    {
      title: 'Total Admin',
      value: stats.totalAdmin?.value || 0,
      growth: stats.totalAdmin?.growth || 0,
      icon: ShieldCheck,
      color: 'text-rose-600',
      bgColor: 'bg-rose-100',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Overview</h1>
        <p className="text-slate-500 mt-1">Ringkasan statistik pengguna platform telemedicine.</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-200">
          Gagal memuat data statistik. Silakan coba lagi.
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statCards.map((stat, index) => {
              const Icon = stat.icon;
              const isPositive = stat.growth >= 0;
              
              return (
                <Card key={index} className="border-0 shadow-sm ring-1 ring-slate-200 hover:shadow-md transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                    <CardTitle className="text-sm font-medium text-slate-600">
                      {stat.title}
                    </CardTitle>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${stat.bgColor}`}>
                      <Icon className={`w-5 h-5 ${stat.color}`} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-slate-900">{stat.value.toLocaleString()}</div>
                    <div className="flex items-center mt-2 space-x-1">
                      {isPositive ? (
                        <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4 text-red-500" />
                      )}
                      <span className={`text-sm font-medium ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
                        {Math.abs(stat.growth)}%
                      </span>
                      <span className="text-sm text-slate-500 ml-1">
                        {stat.title === 'Total Users' ? 'baru bulan ini' : 'dari total user'}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Users Table */}
            <Card className="lg:col-span-2 border-0 shadow-sm ring-1 ring-slate-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg text-slate-800">Pendaftar Terbaru</CardTitle>
                    <CardDescription>5 pengguna terakhir yang mendaftar ke platform.</CardDescription>
                  </div>
                  <Activity className="w-5 h-5 text-slate-400" />
                </div>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <div className="flex justify-center py-6"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-slate-50/50">
                        <TableRow>
                          <TableHead>Nama</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Terdaftar</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {recentUsers.length > 0 ? recentUsers.map((user: any) => (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium text-slate-900">{user.name}</TableCell>
                            <TableCell className="text-slate-500">{user.email}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className={
                                user.role === 'admin' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                                user.role === 'doctor' || user.role === 'dokter' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                                'bg-emerald-50 text-emerald-700 border-emerald-200'
                              }>
                                {user.role === 'doctor' ? 'dokter' : user.role}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-slate-500 text-sm">
                              {new Date(user.created_at || user.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </TableCell>
                          </TableRow>
                        )) : (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center text-slate-500 py-6">Belum ada user mendaftar</TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Distribution Card */}
            <Card className="border-0 shadow-sm ring-1 ring-slate-200">
              <CardHeader>
                <CardTitle className="text-lg text-slate-800">Distribusi User</CardTitle>
                <CardDescription>Persentase pengguna berdasarkan role.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Pasien */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center text-slate-700 font-medium">
                        <UserCircle className="w-4 h-4 mr-2 text-emerald-500" /> Pasien
                      </div>
                      <span className="font-bold">{stats.totalPasien.value}</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-500 rounded-full" 
                        style={{ width: `${stats.totalUsers.value ? (stats.totalPasien.value / stats.totalUsers.value) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                  {/* Dokter */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center text-slate-700 font-medium">
                        <Stethoscope className="w-4 h-4 mr-2 text-indigo-500" /> Dokter
                      </div>
                      <span className="font-bold">{stats.totalDokter.value}</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-indigo-500 rounded-full" 
                        style={{ width: `${stats.totalUsers.value ? (stats.totalDokter.value / stats.totalUsers.value) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                  {/* Admin */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center text-slate-700 font-medium">
                        <ShieldCheck className="w-4 h-4 mr-2 text-rose-500" /> Admin
                      </div>
                      <span className="font-bold">{stats.totalAdmin.value}</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-rose-500 rounded-full" 
                        style={{ width: `${stats.totalUsers.value ? (stats.totalAdmin.value / stats.totalUsers.value) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center"><CalendarDays className="w-3 h-3 mr-1" /> Diperbarui hari ini</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
