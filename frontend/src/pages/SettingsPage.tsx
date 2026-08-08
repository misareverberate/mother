import { useState, type ReactNode } from 'react'

import { AlertTriangle, Bell, RefreshCw } from 'lucide-react'

import { CATEGORIES } from '@/types'
import { mockPosts } from '@/data/posts'
import { mockProducts } from '@/data/products'
import { useAppStore } from '@/store/useAppStore'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Modal } from '@/components/ui/Modal'

function Section({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: ReactNode
}) {
  return (
    <Card>
      <div className="mb-5">
        <h3 className="text-[15px] font-bold tracking-tight text-ink-900">{title}</h3>
        {description && <p className="mt-0.5 text-[13px] text-ink-500">{description}</p>}
      </div>
      {children}
    </Card>
  )
}

export function SettingsPage() {
  const pushToast = useAppStore((s) => s.pushToast)
  const [name, setName] = useState('Misa')
  const [email, setEmail] = useState('misa@mother.app')
  const xHandle = '@misapromo'
  const telegramChannel = '@ofertasmisa'
  const [hashtags, setHashtags] = useState('#oferta #promo #tiktokshop')
  const [language, setLanguage] = useState('pt-BR')
  const [resetOpen, setResetOpen] = useState(false)

  const save = () => {
    pushToast({
      variant: 'success',
      title: 'Settings saved',
      description: 'These values are stored locally for the prototype.',
    })
  }

  const reset = () => {
    useAppStore.setState({ posts: mockPosts, products: mockProducts })
    setResetOpen(false)
    pushToast({
      variant: 'info',
      title: 'Prototype data reset',
      description: 'Posts and products restored to their initial mock state.',
    })
  }

  return (
    <div className="max-w-3xl space-y-6">
      <header>
        <h2 className="text-2xl font-bold tracking-tight text-ink-900">Settings</h2>
        <p className="mt-1 text-[15px] text-ink-500">
          Workspace and content preferences. Nothing is persisted yet.
        </p>
      </header>

      <Section title="Profile" description="Operator account details.">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="space-y-1.5">
            <span className="text-[13px] font-medium text-ink-700">Name</span>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <label className="space-y-1.5">
            <span className="text-[13px] font-medium text-ink-700">Email</span>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
        </div>
      </Section>

      <Section
        title="Platforms"
        description="Connected accounts. Simulated for the prototype."
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4 rounded-xl border border-ink-200/70 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-ink-900">X (Twitter)</p>
              <p className="text-[13px] text-ink-500">{xHandle}</p>
            </div>
            <Badge tone="success" dot>
              Connected
            </Badge>
          </div>
          <div className="flex items-center justify-between gap-4 rounded-xl border border-ink-200/70 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-ink-900">Telegram</p>
              <p className="text-[13px] text-ink-500">{telegramChannel}</p>
            </div>
            <Badge tone="success" dot>
              Connected
            </Badge>
          </div>
        </div>
      </Section>

      <Section title="Content defaults" description="Used when generating new posts.">
        <div className="space-y-4">
          <label className="space-y-1.5">
            <span className="text-[13px] font-medium text-ink-700">Default hashtags</span>
            <Input value={hashtags} onChange={(e) => setHashtags(e.target.value)} />
          </label>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="space-y-1.5">
              <span className="text-[13px] font-medium text-ink-700">Language</span>
              <Select value={language} onChange={(e) => setLanguage(e.target.value)} className="w-full">
                <option value="pt-BR">Português (Brasil)</option>
                <option value="en">English</option>
              </Select>
            </label>
            <label className="space-y-1.5">
              <span className="text-[13px] font-medium text-ink-700">Focus categories</span>
              <Select className="w-full" defaultValue="all">
                <option value="all">All categories</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </label>
          </div>
        </div>
      </Section>

      <Section title="Notifications">
        <div className="flex items-center gap-3 text-sm text-ink-700">
          <Bell className="size-4 text-ink-400" />
          Notifications will be configured after API integration.
        </div>
      </Section>

      <div className="flex justify-end gap-3">
        <Button variant="secondary" onClick={() => pushToast({ variant: 'info', title: 'Changes discarded' })}>
          Discard
        </Button>
        <Button onClick={save}>Save settings</Button>
      </div>

      <Section title="Danger zone">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-ink-900">Reset prototype data</p>
            <p className="text-[13px] text-ink-500">
              Restore posts and products to their initial mock state.
            </p>
          </div>
          <Button variant="danger" onClick={() => setResetOpen(true)}>
            <RefreshCw className="size-4" />
            Reset data
          </Button>
        </div>
      </Section>

      <Modal
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        title="Reset prototype data?"
        footer={
          <>
            <Button variant="secondary" onClick={() => setResetOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={reset}>
              Reset everything
            </Button>
          </>
        }
      >
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
            <AlertTriangle className="size-5" />
          </div>
          <p className="text-sm leading-relaxed text-ink-600">
            This will discard all status changes (published, archived, paused) and restore
            the original mock dataset. This is a local action only — no external data is
            affected.
          </p>
        </div>
      </Modal>
    </div>
  )
}
