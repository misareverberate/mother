import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

import { AppShell } from '@/components/layout/AppShell'
import { ToastHost } from '@/components/ui/ToastHost'
import { Skeleton } from '@/components/ui/Skeleton'

const DashboardPage = lazy(() =>
  import('@/pages/DashboardPage').then((m) => ({ default: m.DashboardPage })),
)
const ProductsPage = lazy(() =>
  import('@/pages/ProductsPage').then((m) => ({ default: m.ProductsPage })),
)
const PostsPage = lazy(() =>
  import('@/pages/PostsPage').then((m) => ({ default: m.PostsPage })),
)
const AnalyticsPage = lazy(() =>
  import('@/pages/AnalyticsPage').then((m) => ({ default: m.AnalyticsPage })),
)
const RevenuePage = lazy(() =>
  import('@/pages/RevenuePage').then((m) => ({ default: m.RevenuePage })),
)
const SettingsPage = lazy(() =>
  import('@/pages/SettingsPage').then((m) => ({ default: m.SettingsPage })),
)

function PageLoader() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-8 w-56" />
      <Skeleton className="h-40 rounded-2xl" />
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Skeleton className="h-72 rounded-2xl" />
        <Skeleton className="h-72 rounded-2xl" />
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<DashboardPage />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="posts" element={<PostsPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="revenue" element={<RevenuePage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </Suspense>
      <ToastHost />
    </BrowserRouter>
  )
}
