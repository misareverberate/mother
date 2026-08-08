import { useMemo, useState } from 'react'

import { Inbox, Search } from 'lucide-react'

import type { Post, PostStatus } from '@/types'
import { useAppStore } from '@/store/useAppStore'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { TabBar } from '@/components/ui/TabBar'
import { Drawer } from '@/components/ui/Drawer'
import { EmptyState } from '@/components/ui/EmptyState'
import { PostCard } from '@/components/posts/PostCard'
import { PostDetail } from '@/components/posts/PostDetail'

type StatusFilter = 'all' | PostStatus

export function PostsPage() {
  const posts = useAppStore((s) => s.posts)
  const products = useAppStore((s) => s.products)
  const [selected, setSelected] = useState<Post | null>(null)
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<StatusFilter>('all')
  const [platform, setPlatform] = useState<'all' | 'X' | 'Telegram'>('all')
  const [sort, setSort] = useState<'newest' | 'oldest'>('newest')

  const counts = useMemo(
    () => ({
      all: posts.length,
      ready: posts.filter((p) => p.status === 'ready').length,
      published: posts.filter((p) => p.status === 'published').length,
      archived: posts.filter((p) => p.status === 'archived').length,
    }),
    [posts],
  )

  const productById = (id: string) => products.find((p) => p.id === id)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return posts
      .filter((p) => {
        if (status !== 'all' && p.status !== status) return false
        if (platform !== 'all' && p.platform !== platform) return false
        if (!q) return true
        const product = productById(p.productId)
        return (
          p.id.toLowerCase().includes(q) ||
          p.content.toLowerCase().includes(q) ||
          product?.name.toLowerCase().includes(q)
        )
      })
      .sort((a, b) => {
        const diff = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        return sort === 'newest' ? diff : -diff
      })
  }, [posts, products, query, status, platform, sort])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-ink-900">Posts</h2>
          <p className="mt-1 text-[15px] text-ink-500">
            Review, copy and publish generated content.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[240px] flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search posts or products..."
            className="pl-10"
          />
        </div>
        <TabBar<StatusFilter>
          value={status}
          onChange={setStatus}
          options={[
            { value: 'all', label: 'All', count: counts.all },
            { value: 'ready', label: 'Ready', count: counts.ready },
            { value: 'published', label: 'Published', count: counts.published },
            { value: 'archived', label: 'Archived', count: counts.archived },
          ]}
        />
        <Select
          value={platform}
          onChange={(e) => setPlatform(e.target.value as typeof platform)}
          className="w-[130px]"
        >
          <option value="all">All platforms</option>
          <option value="X">X</option>
          <option value="Telegram">Telegram</option>
        </Select>
        <Select
          value={sort}
          onChange={(e) => setSort(e.target.value as typeof sort)}
          className="w-[140px]"
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Inbox className="size-6" />}
          title="No posts found"
          description="Try adjusting your search or filters."
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {filtered.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              product={productById(post.productId)}
              onOpen={() => setSelected(post)}
            />
          ))}
        </div>
      )}

      <Drawer
        open={selected !== null}
        onClose={() => setSelected(null)}
        title={selected ? `${selected.id} · ${selected.platform}` : ''}
        subtitle={selected ? 'Post detail' : undefined}
      >
        {selected && <PostDetail post={selected} onClose={() => setSelected(null)} />}
      </Drawer>
    </div>
  )
}
