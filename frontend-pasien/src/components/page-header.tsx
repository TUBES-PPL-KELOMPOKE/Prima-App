'use client'

import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'

export function PageHeader({ title, back = true }: { title: string; back?: boolean }) {
  const router = useRouter()
  return (
    <div className="flex items-center gap-2 px-4 py-3 bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800 sticky top-14 z-30">
      {back && (
        <button onClick={() => router.back()} className="p-1 -ml-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <ChevronLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
        </button>
      )}
      <h1 className="font-bold text-gray-800 dark:text-white">{title}</h1>
    </div>
  )
}
