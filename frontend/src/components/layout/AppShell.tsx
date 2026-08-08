import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'

import { Menu } from 'lucide-react'

import { Sidebar } from '@/components/layout/Sidebar'
import { MockDataChip } from '@/components/ui/MockDataChip'

const TITLES: Record<string, string> = {
  '/': 'Dashboard',
  '/products': 'Products',
  '/posts': 'Posts',
  '/analytics': 'Analytics',
  '/revenue': 'Revenue',
  '/settings': 'Settings',
}

function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}

export function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { pathname } = useLocation()
  const title = TITLES[pathname] ?? 'Dashboard'

  return (
    <div className="min-h-screen">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:pl-[248px]">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-ink-200/70 bg-canvas/80 px-4 backdrop-blur-md sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="flex size-9 items-center justify-center rounded-lg text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink-800 lg:hidden"
              aria-label="Open menu"
            >
              <Menu className="size-5" />
            </button>
            <h1 className="text-[15px] font-bold tracking-tight text-ink-900">
              {title}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <MockDataChip className="hidden sm:inline-flex" />
            <div className="flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-xs font-bold text-white lg:hidden">
              M
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1240px] px-4 pb-16 pt-7 sm:px-6 lg:px-8 lg:pt-9">
          <ScrollToTop />
          <Outlet />
        </main>
      </div>
    </div>
  )
}
