'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  ActivitySquare, 
  Stethoscope, 
  FileBarChart, 
  Settings, 
  LogOut,
  ChevronRight
} from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const menuItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Manajemen User', href: '/dashboard/users', icon: Users },
  { name: 'Program Kesehatan', href: '/dashboard/programs', icon: ActivitySquare },
  { name: 'Dokter', href: '/dashboard/doctors', icon: Stethoscope },
  { name: 'Laporan', href: '/dashboard/reports', icon: FileBarChart },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { logout, user } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <aside className="w-64 shrink-0 flex flex-col border-r bg-white h-screen fixed left-0 top-0 overflow-y-auto">
      {/* Logo */}
      <div className="p-5 border-b border-slate-100 flex flex-col items-center text-center gap-0">
        <img 
          src="/logo.png" 
          alt="PRIMA Logo" 
          className="h-25 w-auto object-contain drop-shadow-sm" 
          onError={(e) => { e.currentTarget.style.display = 'none'; }} 
        />
        <div className="-mt-4">
          <h1 className="text-xl font-bold text-blue-600 tracking-tight">Prima Admin</h1>
          <p className="text-xs text-slate-500 mt-0.5">Portal Administrator</p>
        </div>
      </div>

      {/* User */}
      <div className="p-4 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarImage src={user?.foto_profil_url} />
            <AvatarFallback className="bg-blue-100 text-blue-600 text-sm">
              {user?.name?.charAt(0)?.toUpperCase() || 'A'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 truncate">{user?.name || 'Admin'}</p>
            <p className="text-xs text-slate-500 truncate">{user?.email || 'admin@prima.com'}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          // Fix logic: Dashboard only active on exact match, others can use startsWith
          const isActive = item.href === '/dashboard' 
            ? pathname === '/dashboard'
            : pathname === item.href || pathname.startsWith(item.href + '/');
            
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span>{item.name}</span>
              {isActive && <ChevronRight className="w-4 h-4 ml-auto opacity-70" />}
            </Link>
          );
        })}
      </nav>

      <div className="h-px bg-slate-100 my-1 mx-3" />
      <div className="p-3">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          <span>Keluar</span>
        </button>
      </div>
    </aside>
  );
}
