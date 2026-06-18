'use client';

import Sidebar from '@/components/layouts/Sidebar';
import Topbar from '@/components/layouts/Topbar';
import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { useRouter } from 'next/navigation';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const initializeAuth = useAuthStore((state) => state.initializeAuth);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isInitialized = useAuthStore((state) => state.isInitialized);

  useEffect(() => {
    const isValidSession = initializeAuth();

    if (!isValidSession) {
      router.replace('/login');
    }
  }, [initializeAuth, router]);

  if (!isInitialized || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-sm text-slate-500">
        Memuat dashboard...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar - fixed width 64 */}
      <div className="print:hidden">
        <Sidebar />
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 ml-64 print:ml-0 flex flex-col min-h-screen">
        <div className="print:hidden">
          <Topbar />
        </div>
        
        <main className="flex-1 p-8 print:p-0 print:bg-white">
          {children}
        </main>
      </div>
    </div>
  );
}
