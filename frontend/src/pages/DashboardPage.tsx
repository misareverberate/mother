import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import {
  ArrowRight,
  MessagesSquare,
  Package,
  Send,
  TrendingUp,
} from 'lucide-react'

import type { Post, Product } from '@/types'
import { formatBRL, formatDay, greeting } from '@/lib/format'
import { kpis, postsTrend, revenueTrend, topProducts } from '@/data'
import { useAppStore } from '@/store/useAppStore'
import { Card } from '@/components/ui/Card'
import { StatCard } from '@/components/ui/StatCard'
import { ChartCard } from '@/components/charts/ChartCard'
import { TrendArea } from '@/components/charts/Charts'
import { Drawer } from '@/components/ui/Drawer'
import { Skeleton } from '@/components/ui/Skeleton'
import { ProductImage } from '@/components/ui/ProductImage'
import { CopyButton } from '@/components/ui/CopyButton'
import { PostStatusBadge } from '@/components/posts/PostStatusBadge'
import { PostDetail } from '@/components/posts/PostDetail'
import { useSimulatedLoading } from '@/hooks/useSimulatedLoading'

function QueueItem({
  post,
  product,
  onOpen,
  nextUp = false,
}: {
  post: Post
  product?: Product
  onOpen: () => void
  nextUp?: boolean
}) {
  return (
    <div
      className="group flex cursor-pointer items-center gap-4 rounded-xl px-2 py-3 transition-colors hover:bg-ink-50"
      onClick={onOpen}
    >
      {product ? (
        <ProductImage product={product} className="size-12 shrink-0" />
      ) : (
        <div className="size-12 shrink-0 rounded-lg bg-ink-100" />
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          {nextUp && (
            <span className="rounded-md bg-brand-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-700">
              Next up
            </span>
          )}
          <p className="truncate text-sm font-semibold text-ink-900">
            {product?.name ?? post.id}
          </p>
        </div>
        <p className="mt-0.5 truncate text-[13px] text-ink-500">
          {post.content.replace(/\n/g, ' ')}
        </p>
      </div>
      <PostStatusBadge status={post.status} />
      <div className="hidden shrink-0 items-center gap-2 sm:flex">
        <CopyButton
          text={post.content}
          label="Copy"
          size="sm"
          variant="primary"
          showDescription={false}
        />
      </div>
    </div>
  )
}

export function DashboardPage() {
  const loading = useSimulatedLoading(380)
  const posts = useAppStore((s) => s.posts)
  const products = useAppStore((s) => s.products)
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)

  const data = useMemo(() => kpis(), [])
  const readyPosts = useMemo(
    () =>
      posts
        .filter((p) => p.status === 'ready' && p.platform === 'X')
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [posts],
  )
  const shown = readyPosts.slice(0, 5)

  const miniRevenue = useMemo(
    () =>
      revenueTrend.slice(-14).map((p) => ({
        label: formatDay(p.day),
        estimated: p.estimated,
      })),
    [],
  )

  const productById = (id: string) => products.find((p) => p.id === id)

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[124px] rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <Skeleton className="h-[420px] rounded-2xl xl:col-span-2" />
          <div className="space-y-6">
            <Skeleton className="h-60 rounded-2xl" />
            <Skeleton className="h-60 rounded-2xl" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-ink-900">
          {greeting()}, Misa
        </h1>
        <p className="text-[15px] text-ink-500">
          Here&apos;s what&apos;s happening with your affiliate operation.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Products"
          value={data.products}
          delta={`+${data.productsDelta} this week`}
          icon={<Package className="size-5" />}
        />
        <StatCard
          label="Posts generated"
          value={data.posts}
          delta={`+${data.postsDelta} today`}
          icon={<MessagesSquare className="size-5" />}
        />
        <StatCard
          label="Pending X"
          value={data.readyCount}
          delta="Needs action"
          deltaTone="warning"
          icon={<Send className="size-5" />}
          hint="posts waiting"
        />
        <StatCard
          label="Revenue (month)"
          value={formatBRL(data.revenue)}
          delta={`+${data.revenueDelta}%`}
          icon={<TrendingUp className="size-5" />}
          hint="vs last month"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card padded={false} className="xl:col-span-2">
          <div className="flex items-center justify-between gap-4 px-6 pb-2 pt-5">
            <div>
              <h2 className="text-[15px] font-bold tracking-tight text-ink-900">
                Posts ready for X
              </h2>
              <p className="mt-0.5 text-[13px] text-ink-500">
                {data.readyCount} posts waiting for publication
              </p>
            </div>
            <Link
              to="/posts"
              className="inline-flex items-center gap-1 text-[13px] font-semibold text-brand-600 transition-colors hover:text-brand-700"
            >
              Review all
              <ArrowRight className="size-4" />
            </Link>
          </div>

          <div className="px-4 pb-4">
            {shown.length === 0 ? (
              <p className="px-4 py-12 text-center text-sm text-ink-500">
                No posts waiting. Great job — you&apos;re all caught up.
              </p>
            ) : (
              <div className="divide-y divide-ink-100">
                {shown.map((post, i) => (
                  <QueueItem
                    key={post.id}
                    post={post}
                    product={productById(post.productId)}
                    nextUp={i === 0}
                    onOpen={() => setSelectedPost(post)}
                  />
                ))}
              </div>
            )}
          </div>

          {readyPosts.length > 0 && (
            <div className="border-t border-ink-100 px-6 py-3.5">
              <Link
                to="/posts"
                className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-brand-600 transition-colors hover:text-brand-700"
              >
                View all {data.readyCount} posts
                <ArrowRight className="size-4" />
              </Link>
            </div>
          )}
        </Card>

        <div className="space-y-6">
          <ChartCard
            title="Estimated revenue"
            subtitle="Last 14 days · mock projection"
          >
            <TrendArea
              data={miniRevenue}
              series={[{ key: 'estimated', name: 'Estimated', color: '#10b981' }]}
              height={150}
            />
          </ChartCard>

          <Card>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-[15px] font-bold tracking-tight text-ink-900">
                Top products
              </h3>
              <Link
                to="/analytics"
                className="text-[13px] font-semibold text-brand-600 hover:text-brand-700"
              >
                Analytics
              </Link>
            </div>
            <ol className="space-y-3">
              {topProducts(4).map((p, i) => (
                <li key={p.id} className="flex items-center gap-3">
                  <span className="w-5 text-center text-sm font-bold tabular-nums text-ink-400">
                    {i + 1}
                  </span>
                  <ProductImage product={p} className="size-8" />
                  <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-ink-700">
                    {p.name}
                  </span>
                  <span className="text-[13px] font-semibold tabular-nums text-ink-900">
                    {formatBRL(p.revenue)}
                  </span>
                </li>
              ))}
            </ol>
          </Card>
        </div>
      </div>

      <Card>
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h3 className="text-[15px] font-bold tracking-tight text-ink-900">
              Content generation
            </h3>
            <p className="mt-0.5 text-[13px] text-ink-500">
              Posts generated and published per day
            </p>
          </div>
          <Link
            to="/analytics"
            className="text-[13px] font-semibold text-brand-600 hover:text-brand-700"
          >
            View analytics
          </Link>
        </div>
        <TrendArea
          data={postsTrend}
          series={[
            { key: 'generated', name: 'Generated', color: '#6366f1' },
            { key: 'published', name: 'Published', color: '#10b981' },
          ]}
          height={240}
        />
      </Card>

      <Drawer
        open={selectedPost !== null}
        onClose={() => setSelectedPost(null)}
        title={selectedPost ? `${selectedPost.id} · ${selectedPost.platform}` : ''}
        subtitle={selectedPost ? 'Post detail' : undefined}
      >
        {selectedPost && (
          <PostDetail post={selectedPost} onClose={() => setSelectedPost(null)} />
        )}
      </Drawer>
    </div>
  )
}
