import type { PostStatus } from '@/types'
import { Badge } from '@/components/ui/Badge'

const META: Record<
  PostStatus,
  { label: string; tone: 'success' | 'warning' | 'neutral'; pulse?: boolean }
> = {
  ready: { label: 'Ready to publish', tone: 'warning', pulse: true },
  published: { label: 'Published', tone: 'success' },
  archived: { label: 'Archived', tone: 'neutral' },
}

export function PostStatusBadge({ status }: { status: PostStatus }) {
  const meta = META[status]
  return (
    <Badge tone={meta.tone} dot pulse={meta.pulse}>
      {meta.label}
    </Badge>
  )
}
