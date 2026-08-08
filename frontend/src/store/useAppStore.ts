import { create } from 'zustand'

import type { Post, PostStatus, Product, ProductStatus } from '@/types'
import { mockPosts } from '@/data/posts'
import { mockProducts } from '@/data/products'

export type ToastVariant = 'success' | 'error' | 'info'

export interface Toast {
  id: number
  title: string
  description?: string
  variant: ToastVariant
}

interface AppState {
  posts: Post[]
  products: Product[]
  toasts: Toast[]
  toastCounter: number
  pushToast: (toast: Omit<Toast, 'id'>) => void
  dismissToast: (id: number) => void
  markPublished: (id: string) => void
  setPostStatus: (id: string, status: PostStatus) => void
  setProductStatus: (id: string, status: ProductStatus) => void
}

export const useAppStore = create<AppState>((set) => ({
  posts: mockPosts,
  products: mockProducts,
  toasts: [],
  toastCounter: 0,

  pushToast: (toast) =>
    set((state) => {
      const id = state.toastCounter + 1
      return { toasts: [...state.toasts, { ...toast, id }], toastCounter: id }
    }),

  dismissToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),

  markPublished: (id) =>
    set((state) => ({
      posts: state.posts.map((p) =>
        p.id === id
          ? { ...p, status: 'published', publishedAt: new Date().toISOString() }
          : p,
      ),
    })),

  setPostStatus: (id, status) =>
    set((state) => ({
      posts: state.posts.map((p) =>
        p.id === id
          ? {
              ...p,
              status,
              publishedAt:
                status === 'published' ? (p.publishedAt ?? new Date().toISOString()) : status === 'ready' ? null : p.publishedAt,
            }
          : p,
      ),
    })),

  setProductStatus: (id, status) =>
    set((state) => ({
      products: state.products.map((p) => (p.id === id ? { ...p, status } : p)),
    })),
}))
