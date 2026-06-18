'use client';

import { useAuthStore } from '@/store/auth.store';
import { Bell, Search, LogOut } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export default function Topbar() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10">
      <div className="w-96 relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <Input 
          type="text" 
          placeholder="Cari..." 
          className="pl-10 bg-slate-50 border-transparent focus-visible:ring-1 focus-visible:ring-blue-500 rounded-full h-9"
        />
      </div>

      <div className="flex items-center space-x-4">
        <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
        </button>
        
        <div className="h-8 w-px bg-slate-200 mx-2"></div>
        
        <DropdownMenu>
          <DropdownMenuTrigger>
            <div className="flex items-center space-x-3 cursor-pointer hover:bg-slate-50 p-1.5 rounded-lg transition-colors outline-none">
              <div className="text-right hidden md:block">
                <p className="text-sm font-medium text-slate-700">{user?.name || 'Admin'}</p>
                <p className="text-xs text-slate-500 capitalize">{user?.role || 'Administrator'}</p>
              </div>
              <Avatar className="h-9 w-9 ring-2 ring-white shadow-sm">
                <AvatarImage src="" alt={user?.name || 'Admin'} />
                <AvatarFallback className="bg-blue-100 text-blue-700 font-medium">
                  {user?.name?.charAt(0) || 'A'}
                </AvatarFallback>
              </Avatar>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-600">
              <LogOut className="w-4 h-4 mr-2" />
              <span>Keluar</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
