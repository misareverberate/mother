import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

import { X } from 'lucide-react'

import { cn } from '@/lib/cn'

function useLockBody(active: boolean) {
  useEffect(() => {
    if (!active) return
    const original = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = original
    }
  }, [active])
}

export function Drawer({
  open,
  onClose,
  title,
  subtitle,
  footer,
  children,
  wide = false,
}: {
  open: boolean
  onClose: () => void
  title?: ReactNode
  subtitle?: ReactNode
  footer?: ReactNode
  children: ReactNode
  wide?: boolean
}) {
  useLockBody(open)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-ink-950/40 backdrop-blur-[2px] animate-fade-in"
        onClick={onClose}
      />
      <div
        className={cn(
          'absolute inset-y-0 right-0 flex w-full flex-col bg-surface shadow-lift animate-slide-in-right',
          wide ? 'max-w-2xl' : 'max-w-[520px]',
        )}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-start justify-between gap-4 border-b border-ink-100 px-6 py-5">
          <div className="min-w-0">
            {title && (
              <h2 className="truncate text-lg font-bold tracking-tight text-ink-900">
                {title}
              </h2>
            )}
            {subtitle && <div className="mt-0.5 text-sm text-ink-500">{subtitle}</div>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex size-8 shrink-0 items-center justify-center rounded-lg text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-700"
            aria-label="Close"
          >
            <X className="size-4.5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer && (
          <div className="flex items-center justify-end gap-3 border-t border-ink-100 px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  )
}
