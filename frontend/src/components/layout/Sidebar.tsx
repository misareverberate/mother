import type { ComponentType } from 'react'
import { NavLink } from 'react-router-dom'

import {
  BarChart3,
  Database,
  LayoutDashboard,
  MessagesSquare,
  Package,
  Settings,
  TrendingUp,
} from 'lucide-react'

import { cn } from '@/lib/cn'

interface NavItem {
  to: string
  label: string
  icon: ComponentType<{ className?: string }>
  end?: boolean
}

const NAV: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/products', label: 'Products', icon: Package },
  { to: '/posts', label: 'Posts', icon: MessagesSquare },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/revenue', label: 'Revenue', icon: TrendingUp },
]

function Brand() {
  return (
    <div className="flex items-center gap-3 px-2">
      <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 text-sm font-extrabold text-white shadow-lg shadow-brand-900/40">
        M
      </div>
      <div className="leading-tight">
        <p className="text-[15px] font-bold tracking-tight text-white">Mother</p>
        <p className="text-xs text-ink-400">Affiliate Automation</p>
      </div>
    </div>
  )
}

function NavLinkItem({ item, onNavigate }: { item: NavItem; onNavigate?: () => void }) {
  const Icon = item.icon
  return (
    <NavLink
      to={item.to}
      end={item.end}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-medium transition-colors duration-150',
          isActive
            ? 'bg-white/10 text-white'
            : 'text-ink-300 hover:bg-white/5 hover:text-white',
        )
      }
    >
      {({ isActive }) => (
        <>
          <span
            className={cn(
              'absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-brand-400 transition-all duration-150',
              isActive ? 'opacity-100' : 'opacity-0',
            )}
          />
          <Icon
            className={cn(
              'size-[18px] transition-colors',
              isActive ? 'text-brand-300' : 'text-ink-500 group-hover:text-ink-300',
            )}
          />
          {item.label}
        </>
      )}
    </NavLink>
  )
}

export function Sidebar({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-ink-950/50 backdrop-blur-[2px] lg:hidden animate-fade-in"
          onClick={onClose}
        />
      )}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-[248px] flex-col bg-ink-950 lg:z-0 lg:translate-x-0',
          'transition-transform duration-200 ease-snappy',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-16 items-center border-b border-white/5 px-5">
          <Brand />
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
          <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-ink-500">
            Overview
          </p>
          {NAV.map((item) => (
            <NavLinkItem key={item.to} item={item} onNavigate={onClose} />
          ))}

          <div className="py-3">
            <div className="border-t border-white/5" />
          </div>

          <NavLinkItem
            item={{ to: '/settings', label: 'Settings', icon: Settings }}
            onNavigate={onClose}
          />
        </nav>

        <div className="space-y-3 border-t border-white/5 px-4 py-4">
          <div className="flex items-center gap-2 rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2.5">
            <Database className="size-3.5 text-brand-300" />
            <div className="leading-tight">
              <p className="text-xs font-medium text-ink-200">Mock data</p>
              <p className="text-[11px] text-ink-500">Prototype · no live APIs</p>
            </div>
          </div>
          <div className="flex items-center gap-3 px-1.5">
            <div className="flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-ink-600 to-ink-800 text-xs font-bold text-white">
              M
            </div>
            <div className="leading-tight">
              <p className="text-[13px] font-semibold text-white">Misa</p>
              <p className="text-[11px] text-ink-500">Operator</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
