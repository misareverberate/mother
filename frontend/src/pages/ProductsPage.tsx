import { useMemo, useState } from 'react'

import { Package, Search } from 'lucide-react'

import type { Post, Product, ProductStatus } from '@/types'
import { CATEGORIES } from '@/types'
import { formatBRL } from '@/lib/format'
import { useAppStore } from '@/store/useAppStore'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { TabBar } from '@/components/ui/TabBar'
import { Drawer } from '@/components/ui/Drawer'
import { EmptyState } from '@/components/ui/EmptyState'
import { ProductImage } from '@/components/ui/ProductImage'
import { ProductDetail } from '@/components/products/ProductDetail'
import { PostDetail } from '@/components/posts/PostDetail'

type StatusFilter = 'all' | ProductStatus
type SortKey = 'revenue' | 'priceAsc' | 'priceDesc' | 'newest' | 'discount'

const STATUS_META: Record<ProductStatus, { label: string; tone: 'success' | 'warning' | 'neutral' }> = {
  active: { label: 'Active', tone: 'success' },
  paused: { label: 'Paused', tone: 'warning' },
  inactive: { label: 'Inactive', tone: 'neutral' },
}

export function ProductsPage() {
  const products = useAppStore((s) => s.products)
  const posts = useAppStore((s) => s.posts)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<'all' | (typeof CATEGORIES)[number]>('all')
  const [status, setStatus] = useState<StatusFilter>('all')
  const [sort, setSort] = useState<SortKey>('revenue')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return products
      .filter((p) => {
        if (status !== 'all' && p.status !== status) return false
        if (category !== 'all' && p.category !== category) return false
        if (!q) return true
        return p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q)
      })
      .sort((a, b) => {
        switch (sort) {
          case 'priceAsc':
            return a.price - b.price
          case 'priceDesc':
            return b.price - a.price
          case 'newest':
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          case 'discount':
            return b.discountPct - a.discountPct
          default:
            return b.revenue - a.revenue
        }
      })
  }, [products, query, category, status, sort])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-ink-900">Products</h2>
          <p className="mt-1 text-[15px] text-ink-500">
            Catalog of products being promoted. {filtered.length} shown.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[240px] flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products..."
            className="pl-10"
          />
        </div>
        <Select
          value={category}
          onChange={(e) => setCategory(e.target.value as typeof category)}
          className="w-[170px]"
        >
          <option value="all">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
        <TabBar<StatusFilter>
          value={status}
          onChange={setStatus}
          options={[
            { value: 'all', label: 'All' },
            { value: 'active', label: 'Active' },
            { value: 'paused', label: 'Paused' },
            { value: 'inactive', label: 'Inactive' },
          ]}
        />
        <Select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          className="w-[170px]"
        >
          <option value="revenue">Highest revenue</option>
          <option value="discount">Biggest discount</option>
          <option value="priceAsc">Price: low to high</option>
          <option value="priceDesc">Price: high to low</option>
          <option value="newest">Newest</option>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Package className="size-6" />}
          title="No products found"
          description="Try adjusting your search or filters."
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onOpen={() => setSelectedProduct(product)}
            />
          ))}
        </div>
      )}

      <Drawer
        open={selectedProduct !== null}
        onClose={() => setSelectedProduct(null)}
        title={selectedProduct?.name}
        subtitle={selectedProduct ? `${selectedProduct.id} · ${selectedProduct.category}` : undefined}
        wide
      >
        {selectedProduct && (
          <ProductDetail
            product={selectedProduct}
            posts={posts.filter((p) => p.productId === selectedProduct.id)}
            onOpenPost={(post) => {
              setSelectedProduct(null)
              setSelectedPost(post)
            }}
            onClose={() => setSelectedProduct(null)}
          />
        )}
      </Drawer>

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

function ProductCard({
  product,
  onOpen,
}: {
  product: Product
  onOpen: () => void
}) {
  const meta = STATUS_META[product.status]

  return (
    <Card hover className="group cursor-pointer overflow-hidden" padded={false}>
      <div onClick={onOpen}>
        <ProductImage product={product} className="h-36 w-full rounded-none border-0" />
        <div className="p-4">
          <p className="line-clamp-1 text-[14px] font-bold text-ink-900">{product.name}</p>
          <div className="mt-1.5 flex items-center gap-2">
            <span className="text-[15px] font-bold text-ink-900 tabular-nums">
              {formatBRL(product.price)}
            </span>
            <span className="text-xs text-ink-400 line-through tabular-nums">
              {formatBRL(product.originalPrice)}
            </span>
            <Badge tone="danger" className="text-[11px]">
              -{product.discountPct}%
            </Badge>
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-ink-100 pt-3">
            <span className="text-xs font-medium text-ink-500">
              <span className="font-semibold text-brand-600">{product.commissionPct}%</span>{' '}
              commission
            </span>
            <Badge tone={meta.tone}>{meta.label}</Badge>
          </div>
        </div>
      </div>
    </Card>
  )
}
