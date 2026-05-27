/**
 * Global cart-sidebar state.
 * Module-level reactive object so every component shares the same instance.
 */
import { reactive } from 'vue'
import { api, isLoggedIn } from '@/services/apiClient'

export interface SidebarCartItem {
  id: number
  productId: string
  productName: string
  productImageUrl: string | null
  size: string | null
  quantity: number
  currentPrice: number
  totalPrice: number
  availableStock: number
}

interface CartSidebarState {
  open: boolean
  loading: boolean
  error: string
  items: SidebarCartItem[]
  totalAmount: number
}

const state = reactive<CartSidebarState>({
  open: false,
  loading: false,
  error: '',
  items: [],
  totalAmount: 0,
})

async function fetchCart() {
  if (!isLoggedIn()) { state.items = []; state.totalAmount = 0; return }
  state.loading = true
  state.error = ''
  try {
    const data = await api.get<any>('/api/cart')
    state.items = (data.items ?? []).map((i: any) => ({
      id: i.id,
      productId: i.productId,
      productName: i.productName,
      productImageUrl: i.productImageUrl ?? null,
      size: i.size ?? null,
      quantity: i.quantity,
      currentPrice: Number(i.currentPrice ?? i.price ?? 0),
      totalPrice: Number(i.totalPrice ?? 0),
      availableStock: i.availableStock ?? 0,
    }))
    state.totalAmount = Number(data.totalAmount ?? 0)
  } catch {
    state.error = 'Failed to load cart.'
  } finally {
    state.loading = false
  }
}

export function useCartSidebar() {
  async function openSidebar() {
    state.open = true
    await fetchCart()
  }

  function closeSidebar() {
    state.open = false
  }

  async function updateQuantity(productId: string, size: string | null, quantity: number) {
    try {
      await api.put('/api/cart/update', { productId, quantity, size: size ?? undefined })
      await fetchCart()
    } catch { /* ignore */ }
  }

  async function removeItem(productId: string, size: string | null) {
    const sizeParam = size ? `?size=${encodeURIComponent(size)}` : ''
    try {
      await api.delete(`/api/cart/remove/${productId}${sizeParam}`)
      await fetchCart()
    } catch { /* ignore */ }
  }

  return { state, openSidebar, closeSidebar, updateQuantity, removeItem, refreshCart: fetchCart }
}
