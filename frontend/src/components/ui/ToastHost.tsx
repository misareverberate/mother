import { useEffect } from 'react'
import { createPortal } from 'react-dom'

import { CheckCircle2, Info, X, XCircle } from 'lucide-react'

import { useAppStore, type Toast } from '@/store/useAppStore'
import { cn } from '@/lib/cn'

const ICONS = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
}

const STYLES = {
  success: 'text-emerald-500',
  error: 'text-rose-500',
  info: 'text-brand-500',
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const Icon = ICONS[toast.variant]

  useEffect(() => {
    const timer = setTimeout(onDismiss, 3200)
    return () => clearTimeout(timer)
  }, [onDismiss])

  return (
    <div
      className="pointer-events-auto flex w-[340px] items-start gap-3 rounded-xl border border-ink-200 bg-white/95 p-3.5 shadow-lift backdrop-blur animate-toast-in"
      role="status"
    >
      <Icon className={cn('mt-0.5 size-5 shrink-0', STYLES[toast.variant])} />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-ink-900">{toast.title}</p>
        {toast.description && (
          <p className="mt-0.5 text-[13px] leading-snug text-ink-500">
            {toast.description}
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={onDismiss}
        className="flex size-6 shrink-0 items-center justify-center rounded-md text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-700"
        aria-label="Dismiss"
      >
        <X className="size-3.5" />
      </button>
    </div>
  )
}

export function ToastHost() {
  const toasts = useAppStore((s) => s.toasts)
  const dismissToast = useAppStore((s) => s.dismissToast)

  if (toasts.length === 0) return null

  return createPortal(
    <div className="pointer-events-none fixed bottom-5 right-5 z-[60] flex flex-col items-end gap-2.5">
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onDismiss={() => dismissToast(toast.id)}
        />
      ))}
    </div>,
    document.body,
  )
}
