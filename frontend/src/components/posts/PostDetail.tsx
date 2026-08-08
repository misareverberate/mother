import type { ReactNode } from 'react'

import { Archive, CalendarClock, Eye, MousePointerClick, Send, ThumbsUp } from 'lucide-react'

import type { Post } from '@/types'
import { formatBRL, formatDateTime, formatNumber } from '@/lib/format'
import { useAppStore } from '@/store/useAppStore'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { CopyButton } from '@/components/ui/CopyButton'
import { Badge } from '@/components/ui/Badge'
import { ProductImage } from '@/components/ui/ProductImage'
import { PostStatusBadge } from '@/components/posts/PostStatusBadge'

function MetaRow({
  label,
  value,
}: {
  label: string
  value: ReactNode
}) {
  return (
    <div>
      <dt className="text-[11px] font-semibold uppercase tracking-wider text-ink-500">
        {label}
      </dt>
      <dd className="mt-0.5 text-sm font-medium text-ink-800">{value}</dd>
    </div>
  )
}

export function PostDetail({
  post,
  onClose,
}: {
  post: Post
  onClose: () => void
}) {
  const products = useAppStore((s) => s.products)
  const setPostStatus = useAppStore((s) => s.setPostStatus)
  const pushToast = useAppStore((s) => s.pushToast)
  const product = products.find((p) => p.id === post.productId)

  const handlePublished = () => {
    setPostStatus(post.id, 'published')
    pushToast({
      variant: 'success',
      title: 'Post published',
      description: `${post.id} is now published on ${post.platform}.`,
    })
    onClose()
  }

  const handleArchive = () => {
    setPostStatus(post.id, 'archived')
    pushToast({
      variant: 'info',
      title: 'Post archived',
      description: `${post.id} moved to Archived.`,
    })
    onClose()
  }

  return (
    <div className="space-y-6">
      {product && (
        <div className="flex items-center gap-4">
          <ProductImage product={product} className="size-16 shrink-0" />
          <div className="min-w-0">
            <p className="truncate text-[15px] font-bold text-ink-900">{product.name}</p>
            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="text-[15px] font-bold text-ink-900 tabular-nums">
                {formatBRL(product.price)}
              </span>
              <span className="text-[13px] text-ink-400 line-through tabular-nums">
                {formatBRL(product.originalPrice)}
              </span>
              <Badge tone="danger" className="text-[11px]">
                -{product.discountPct}%
              </Badge>
            </div>
            <p className="mt-0.5 text-xs text-ink-500">{product.category}</p>
          </div>
        </div>
      )}

      <div>
        <h3 className="mb-2 text-[13px] font-semibold text-ink-900">Generated content</h3>
        <div className="rounded-xl border border-ink-200 bg-ink-50/60 p-4">
          <p className="whitespace-pre-wrap text-[14px] leading-relaxed text-ink-800">
            {post.content}
          </p>
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
        <MetaRow label="Platform" value={post.platform} />
        <MetaRow
          label="Status"
          value={<PostStatusBadge status={post.status} />}
        />
        <MetaRow label="Created" value={formatDateTime(post.createdAt)} />
        <MetaRow
          label="Published"
          value={post.publishedAt ? formatDateTime(post.publishedAt) : '—'}
        />
        {post.performance && (
          <>
            <MetaRow label="Impressions" value={formatNumber(post.performance.impressions)} />
            <MetaRow label="Clicks" value={formatNumber(post.performance.clicks)} />
          </>
        )}
      </dl>

      {post.performance && (
        <Card padded className="bg-ink-50/40">
          <p className="mb-3 text-[13px] font-semibold text-ink-900">Performance</p>
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Eye, label: 'Impressions', value: formatNumber(post.performance.impressions) },
              { icon: MousePointerClick, label: 'Clicks', value: formatNumber(post.performance.clicks) },
              { icon: ThumbsUp, label: 'Likes', value: formatNumber(post.performance.likes) },
            ].map(({ icon: Icon, label, value }) => (
              <div
                key={label}
                className="flex flex-col items-center gap-1 rounded-xl border border-ink-200/70 bg-white px-2 py-3"
              >
                <Icon className="size-4 text-ink-400" />
                <span className="text-sm font-bold tabular-nums text-ink-900">{value}</span>
                <span className="text-[11px] text-ink-500">{label}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <CopyButton text={post.content} label="Copy post" variant="primary" className="flex-1" />
        {post.status === 'ready' && (
          <Button variant="secondary" onClick={handlePublished}>
            <Send className="size-4" />
            Mark as published
          </Button>
        )}
        {post.status !== 'archived' && (
          <Button variant="ghost" onClick={handleArchive}>
            <Archive className="size-4" />
            Archive
          </Button>
        )}
      </div>

      {post.status === 'ready' && (
        <p className="flex items-center gap-1.5 text-xs text-ink-500">
          <CalendarClock className="size-3.5" />
          Tip: copy the post, paste it on X, then mark it as published.
        </p>
      )}
    </div>
  )
}
