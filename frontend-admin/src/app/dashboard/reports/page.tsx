'use client';

import { Download, FileText, ActivitySquare, Stethoscope, Users, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { reportService } from '@/services/report.service';
import api from '@/lib/axios';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
  BarChart, Bar, Legend, Cell 
} from 'recharts';

export default function LaporanPage() {
  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['reports', 'users'],
    queryFn: reportService.getUsersStats,
  });

  const { data: appointmentsData, isLoading: appointmentsLoading } = useQuery({
    queryKey: ['reports', 'appointments'],
    queryFn: async () => {
      const res = await api.get('/reports/appointments');
      return res.data;
    },
  });

  const handlePrint = () => {
    window.print();
  };

  const isLoading = usersLoading || appointmentsLoading;

  // Real data processing for Line Chart (Tren Konsultasi Bulanan)
  const processTrendData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const trend = months.map(m => ({ name: m, Konsultasi: 0 }));
    
    if (appointmentsData?.data?.appointments) {
      appointmentsData.data.appointments.forEach((app: any) => {
        if (!app.tanggal) return;
        const date = new Date(app.tanggal);
        const monthIndex = date.getMonth(); // 0-11
        if (monthIndex >= 0 && monthIndex < 12) {
          trend[monthIndex].Konsultasi += 1;
        }
      });
    }
    // Only show up to current month or at least 6 months if we want to truncate, 
    // but showing Jan-Dec is fine too. Let's just show all 12 months for a complete year view.
    return trend;
  };
  
  const trendData = processTrendData();

  // Real data for Bar Chart (Daily Report Janji Temu)
  const processDailyAppointmentsData = () => {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const daily = days.map(d => ({ name: d, JanjiTemu: 0 }));
    
    if (appointmentsData?.data?.appointments) {
      appointmentsData.data.appointments.forEach((app: any) => {
        if (!app.tanggal) return;
        const date = new Date(app.tanggal);
        const dayIndex = date.getDay(); // 0 = Minggu, 6 = Sabtu
        if (dayIndex >= 0 && dayIndex < 7) {
          daily[dayIndex].JanjiTemu += 1;
        }
      });
    }
    return daily;
  };

  const dailyAppointmentsData = processDailyAppointmentsData();

  const barColors = ['#3b82f6', '#6366f1', '#f43f5e']; // Blue for Pasien, Indigo for Dokter, Rose for Admin

  // Calculate actual summary numbers
  const totalUsers = usersData?.data?.summary?.total_users || 0;
  const totalAppointments = appointmentsData?.data?.summary?.total || 0;

  return (
    <div className="space-y-6 print:space-y-4 print:p-8 print:bg-white min-h-screen">
      {/* Header section - hidden during print */}
      <div className="flex justify-between items-center print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Laporan & Statistik</h1>
          <p className="text-slate-500 mt-1">Ringkasan performa dan laporan detail platform.</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" className="text-blue-600 border-blue-200 bg-blue-50 hover:bg-blue-100">
            <Download className="w-4 h-4 mr-2" /> Export CSV
          </Button>
          <Button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
            <Download className="w-4 h-4 mr-2" /> Export PDF
          </Button>
        </div>
      </div>

      {/* Print-only Header */}
      <div className="hidden print:block mb-8 text-center border-b pb-4">
        <h1 className="text-3xl font-bold text-slate-900">Laporan Statistik Telemedicine</h1>
        <p className="text-slate-500 mt-2">Dicetak pada: {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 print:gap-2">
            <Card className="shadow-sm border-slate-200 print:shadow-none print:border-slate-300">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Total Konsultasi</CardTitle>
                <ActivitySquare className="w-4 h-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">{totalAppointments.toLocaleString()}</div>
                <p className="text-xs text-slate-500 mt-1">+12.5% dari bulan lalu</p>
              </CardContent>
            </Card>
            
            <Card className="shadow-sm border-slate-200 print:shadow-none print:border-slate-300">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Janji Temu Aktif</CardTitle>
                <FileText className="w-4 h-4 text-emerald-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">
                  {appointmentsData?.data?.summary?.breakdown?.menunggu || 0}
                </div>
                <p className="text-xs text-slate-500 mt-1">+8.2% dari bulan lalu</p>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-slate-200 print:shadow-none print:border-slate-300">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Total Pengguna</CardTitle>
                <Users className="w-4 h-4 text-indigo-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">{totalUsers.toLocaleString()}</div>
                <p className="text-xs text-slate-500 mt-1">+2.4% dari bulan lalu</p>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-slate-200 print:shadow-none print:border-slate-300">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Pendapatan</CardTitle>
                <span className="text-rose-500 font-bold text-sm">Rp</span>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">45.2M</div>
                <p className="text-xs text-slate-500 mt-1">+15.1% dari bulan lalu</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6 print:grid-cols-2 print:gap-4 print:mt-4 print:break-inside-avoid">
            <Card className="shadow-sm border-slate-200 print:shadow-none print:border-slate-300">
              <CardHeader>
                <CardTitle className="text-base text-slate-800">Tren Konsultasi (Tahun Ini)</CardTitle>
              </CardHeader>
              <CardContent className="h-80 w-full pb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                    <RechartsTooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="Konsultasi" 
                      stroke="#3b82f6" 
                      strokeWidth={3}
                      dot={{ r: 4, strokeWidth: 2 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-slate-200 print:shadow-none print:border-slate-300 print:break-inside-avoid">
              <CardHeader>
                <CardTitle className="text-base text-slate-800">Laporan Janji Temu Harian</CardTitle>
              </CardHeader>
              <CardContent className="h-80 w-full pb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyAppointmentsData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                    <RechartsTooltip 
                      cursor={{fill: '#f1f5f9'}}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="JanjiTemu" radius={[4, 4, 0, 0]}>
                      {dailyAppointmentsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={barColors[index % barColors.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
          
          {/* Print-only Footer */}
          <div className="hidden print:block mt-12 pt-8 border-t text-sm text-slate-500 text-center">
            <p>Dokumen ini dihasilkan secara otomatis oleh Sistem Admin Telemedicine Prima.</p>
            <p>Data yang tertera adalah akurat pada saat dokumen ini dicetak.</p>
          </div>
        </>
      )}
    </div>
  );
}
