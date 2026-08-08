import { useId } from 'react'

import {
  Dumbbell,
  Gamepad2,
  Headphones,
  Home,
  Shirt,
  Sparkles,
  Watch,
  Zap,
  type LucideIcon,
} from 'lucide-react'

import type { Category, Product } from '@/types'
import { cn } from '@/lib/cn'
import { CATEGORY_META } from '@/data/products'

const CATEGORY_ICON: Record<Category, LucideIcon> = {
  Electronics: Headphones,
  Beauty: Sparkles,
  Home: Home,
  Fashion: Shirt,
  Accessories: Watch,
  Gaming: Gamepad2,
  Fitness: Dumbbell,
  Gadgets: Zap,
}

const ICON_SAT = 72
const ICON_LIGHT = 46

export function ProductImage({
  product,
  className,
  iconClass,
}: {
  product: Product
  className?: string
  iconClass?: string
}) {
  const gid = useId().replace(/:/g, '')
  const { hue } = CATEGORY_META[product.category]
  const Icon = CATEGORY_ICON[product.category]

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl border border-black/5',
        className,
      )}
    >
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 120 120"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={`hsl(${hue} ${ICON_SAT}% ${Math.min(ICON_LIGHT + 14, 78)}%)`} />
            <stop offset="100%" stopColor={`hsl(${(hue + 24) % 360} ${ICON_SAT}% ${Math.max(ICON_LIGHT - 10, 16)}%)`} />
          </linearGradient>
        </defs>
        <rect width="120" height="120" fill={`url(#${gid})`} />
        <circle cx="96" cy="18" r="30" fill="white" opacity="0.08" />
        <circle cx="14" cy="104" r="26" fill="black" opacity="0.06" />
      </svg>
      <div
        className={cn(
          'relative flex h-full w-full items-center justify-center',
          iconClass,
        )}
      >
        <Icon className="h-[38%] w-[38%] text-white/90 drop-shadow-sm" strokeWidth={1.6} />
      </div>
    </div>
  )
}
