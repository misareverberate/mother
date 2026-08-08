import { useEffect, useRef, useState } from 'react'

import { Check, Copy } from 'lucide-react'

import { Button, type ButtonProps } from '@/components/ui/Button'
import { copyText } from '@/lib/clipboard'
import { useAppStore } from '@/store/useAppStore'

export function CopyButton({
  text,
  label = 'Copy',
  copiedLabel = 'Copied!',
  showDescription = true,
  ...props
}: Omit<ButtonProps, 'children' | 'onClick'> & {
  text: string
  label?: string
  copiedLabel?: string
  showDescription?: boolean
}) {
  const [copied, setCopied] = useState(false)
  const timer = useRef<number | null>(null)
  const pushToast = useAppStore((s) => s.pushToast)

  useEffect(() => () => {
    if (timer.current) window.clearTimeout(timer.current)
  }, [])

  const onCopy = async () => {
    const ok = await copyText(text)
    if (ok) {
      setCopied(true)
      if (timer.current) window.clearTimeout(timer.current)
      timer.current = window.setTimeout(() => setCopied(false), 1600)
      pushToast({
        variant: 'success',
        title: 'Copied to clipboard',
        description: showDescription ? 'Ready to paste on your platform.' : undefined,
      })
    } else {
      pushToast({
        variant: 'error',
        title: 'Copy failed',
        description: 'Your browser blocked clipboard access.',
      })
    }
  }

  return (
    <Button
      variant={copied ? 'success' : 'secondary'}
      onClick={onCopy}
      aria-live="polite"
      {...props}
    >
      {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
      {copied ? copiedLabel : label}
    </Button>
  )
}
