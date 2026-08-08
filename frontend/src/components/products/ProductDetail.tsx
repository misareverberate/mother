import type { ReactNode } from 'react'

import { Link as LinkIcon, Star } from 'lucide-react'

import type { Post, Product, ProductStatus } from '@/types'
import { formatBRL, formatNumber, timeAgo } from '@/lib/format'
import { useAppStore } from '@/store/useAppStore'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { CopyButton } from '@/components/ui/CopyButton'
import { ProductImage } from '@/components/ui/ProductImage'
import { PostStatusBadge } from '@/components/posts/PostStatusBadge'

const STATUS_META: Record<ProductStatus, { label: string; tone: 'success' | 'warning' | 'neutral' }> = {
  active: { label: 'Active', tone: 'success' },
  paused: { label: 'Paused', tone: 'warning' },
  inactive: { label: 'Inactive', tone: 'neutral' },
}

function InfoRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <dt className="text-[13px] text-ink-500">{label}</dt>
      <dd className="text-right text-[13px] font-semibold text-ink-800">{value}</dd>
    </div>
  )
}

export function ProductDetail({
  product,
  posts,
  onOpenPost,
}: {
  product: Product
  posts: Post[]
  onOpenPost: (post: Post) => void
  onClose: () => void
}) {
  const setProductStatus = useAppStore((s) => s.setProductStatus)

  const meta = STATUS_META[product.status]
  const generatedPosts = posts.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )

  return (
    <div className="space-y-6">
      <ProductImage product={product} className="h-44 w-full" />

      <div>
        <h3 className="text-xl font-bold tracking-tight text-ink-900">{product.name}</h3>
        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="text-xl font-bold text-ink-900 tabular-nums">
            {formatBRL(product.price)}
          </span>
          <span className="text-sm text-ink-400 line-through tabular-nums">
            {formatBRL(product.originalPrice)}
          </span>
          <Badge tone="danger" className="text-[11px]">
            -{product.discountPct}%
          </Badge>
        </div>
        <div className="mt-1 flex items-center gap-2 text-sm text-ink-500">
          <span>{product.category}</span>
          <span className="text-ink-300">·</span>
          <span className="flex items-center gap-1">
            <Star className="size-3.5 fill-amber-400 text-amber-400" />
            <span className="font-medium text-ink-700">{product.rating.toFixed(1)}</span>
          </span>
        </div>
      </div>

      <div>
        <h4 className="mb-2 text-[13px] font-semibold text-ink-900">Overview</h4>
        <Card padded={false} className="px-4">
          <dl className="divide-y divide-ink-100">
            <InfoRow label="Commission" value={`${product.commissionPct}%`} />
            <InfoRow label="Status" value={<Badge tone={meta.tone}>{meta.label}</Badge>} />
            <InfoRow label="Sales" value={formatNumber(product.sales)} />
            <InfoRow label="Added" value={timeAgo(product.createdAt)} />
            <InfoRow
              label="Affiliate link"
              value={
                <span className="flex items-center justify-end gap-2">
                  <span className="max-w-[170px] truncate text-ink-500">
                    {product.affiliateUrl}
                  </span>
                  <CopyButton text={product.affiliateUrl} label="" size="icon" showDescription={false} />
                </span>
              }
            />
          </dl>
        </Card>
      </div>

      <div>
        <h4 className="mb-2 text-[13px] font-semibold text-ink-900">Performance</h4>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Clicks', value: formatNumber(product.clicks) },
            { label: 'Conversions', value: formatNumber(product.conversions) },
            { label: 'Est. revenue', value: formatBRL(product.revenue) },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-xl border border-ink-200/70 bg-ink-50/40 px-3 py-3 text-center"
            >
              <p className="text-[15px] font-bold tabular-nums text-ink-900">{item.value}</p>
              <p className="mt-0.5 text-[11px] text-ink-500">{item.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h4 className="mb-2 text-[13px] font-semibold text-ink-900">
          Generated posts{' '}
          <span className="font-normal text-ink-500">({generatedPosts.length})</span>
        </h4>
        {generatedPosts.length === 0 ? (
          <p className="rounded-xl border border-dashed border-ink-200 px-4 py-6 text-center text-[13px] text-ink-500">
            No posts generated for this product yet.
          </p>
        ) : (
          <ul className="space-y-2">
            {generatedPosts.map((post) => (
              <li key={post.id}>
                <button
                  type="button"
                  onClick={() => onOpenPost(post)}
                  className="flex w-full items-center justify-between gap-3 rounded-xl border border-ink-200/70 px-3.5 py-2.5 text-left transition-colors hover:border-ink-300 hover:bg-ink-50"
                >
                  <span className="flex items-center gap-2.5">
                    <LinkIcon className="size-3.5 text-ink-400" />
                    <span className="text-[13px] font-semibold text-ink-800">{post.id}</span>
                    <span className="text-xs text-ink-500">
                      {post.platform} · {timeAgo(post.createdAt)}
                    </span>
                  </span>
                  <PostStatusBadge status={post.status} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-ink-100 pt-4">
        {product.status !== 'inactive' && (
          <Button
            variant={product.status === 'active' ? 'secondary' : 'success'}
            onClick={() =>
              setProductStatus(product.id, product.status === 'active' ? 'paused' : 'active')
            }
          >
            {product.status === 'active' ? 'Pause promotion' : 'Resume promotion'}
          </Button>
        )}
      </div>
    </div>
  )
}
