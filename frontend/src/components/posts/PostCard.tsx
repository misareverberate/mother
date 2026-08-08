import { Send } from 'lucide-react'

import type { Post, Product } from '@/types'
import { formatBRL, timeAgo } from '@/lib/format'
import { useAppStore } from '@/store/useAppStore'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { CopyButton } from '@/components/ui/CopyButton'
import { ProductImage } from '@/components/ui/ProductImage'
import { PostStatusBadge } from '@/components/posts/PostStatusBadge'

export function PostCard({
  post,
  product,
  onOpen,
}: {
  post: Post
  product?: Product
  onOpen: () => void
}) {
  const setPostStatus = useAppStore((s) => s.setPostStatus)
  const pushToast = useAppStore((s) => s.pushToast)

  const markPublished = () => {
    setPostStatus(post.id, 'published')
    pushToast({
      variant: 'success',
      title: 'Post published',
      description: `${post.id} is now published on ${post.platform}.`,
    })
  }

  return (
    <Card
      hover
      className="flex h-full cursor-pointer flex-col"
      onClick={onOpen}
    >
      <div className="flex items-center gap-4">
        {product ? (
          <ProductImage product={product} className="size-[72px] shrink-0" />
        ) : (
          <div className="flex size-[72px] shrink-0 items-center justify-center rounded-xl bg-ink-100 text-xs text-ink-400">
            —{'\u200B'}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-bold text-ink-900">
            {product?.name ?? 'Unknown product'}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
            {product && (
              <>
                <span className="text-sm font-bold text-ink-900 tabular-nums">
                  {formatBRL(product.price)}
                </span>
                <span className="text-xs text-ink-400 line-through tabular-nums">
                  {formatBRL(product.originalPrice)}
                </span>
              </>
            )}
            <span className="text-xs text-ink-500">{post.id}</span>
          </div>
        </div>
        <PostStatusBadge status={post.status} />
      </div>

      <div className="mt-4 rounded-xl border border-ink-200 bg-ink-50/60 px-4 py-3">
        <p className="line-clamp-3 whitespace-pre-wrap text-[13px] leading-relaxed text-ink-700">
          {post.content}
        </p>
      </div>

      <div className="mt-4 flex items-center gap-2 text-xs text-ink-500">
        <Badge tone={post.platform === 'X' ? 'brand' : 'info'}>{post.platform}</Badge>
        <span>{timeAgo(post.createdAt)}</span>
        <span className="text-ink-300">·</span>
        <span className="text-ink-500">
          {post.status === 'ready'
            ? 'Waiting for you'
            : post.status === 'published'
              ? `Published ${timeAgo(post.publishedAt ?? post.createdAt)}`
              : 'Archived'}
        </span>
      </div>

      <div className="mt-4 flex items-center gap-2 border-t border-ink-100 pt-4">
        <CopyButton
          text={post.content}
          size="sm"
          variant="primary"
          className="flex-1"
        />
        {post.status === 'ready' ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              markPublished()
            }}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-ink-200 bg-white px-3 text-[13px] font-medium text-ink-700 shadow-sm transition-colors hover:border-ink-300 hover:bg-ink-50"
          >
            <Send className="size-3.5" />
            Mark published
          </button>
        ) : post.status === 'archived' ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              setPostStatus(post.id, 'ready')
              pushToast({
                variant: 'info',
                title: 'Post restored',
                description: `${post.id} moved back to Ready.`,
              })
            }}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-ink-200 bg-white px-3 text-[13px] font-medium text-ink-600 shadow-sm transition-colors hover:bg-ink-50"
          >
            Restore
          </button>
        ) : null}
      </div>
    </Card>
  )
}
