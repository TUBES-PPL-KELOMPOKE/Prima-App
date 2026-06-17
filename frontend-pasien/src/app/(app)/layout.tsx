import { Sidebar } from '@/components/sidebar'
import { TopHeader } from '@/components/top-header'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        <TopHeader />
        <main className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto w-full p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
