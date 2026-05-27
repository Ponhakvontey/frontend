/**
 * Wishlist service — backed by /api/favorites.
 *
 * Strategy: localStorage acts as an optimistic cache so UI toggles feel instant.
 * Every add/remove also fires the real API call. Call syncWishlistFromApi() on
 * app boot or when opening the wishlist page to pull the server's source of truth.
 */
import { api, isLoggedIn } from '@/services/apiClient'
import { readStorage, writeStorage } from '@/utils/storage'

const WISHLIST_KEY = 'wishlistProductIds'

export interface WishlistProduct {
  id: string
  name: string
  price: number
  imageUrl: string
  sellerName: string
  categoryName: string
}

function normalizeId(productId: number | string): string {
  return String(productId)
}

// ─── Sync cache read/write ────────────────────────────────────────────────────

export function getWishlistIds(): string[] {
  return readStorage<string[]>(WISHLIST_KEY, [])
}

export function isWishlisted(productId: number | string): boolean {
  return getWishlistIds().includes(normalizeId(productId))
}

// ─── Optimistic add/remove (sync return + async API) ─────────────────────────

export function addToWishlist(productId: number | string): string[] {
  const id = normalizeId(productId)
  const existing = getWishlistIds()
  if (existing.includes(id)) return existing

  const next = [id, ...existing]
  writeStorage(WISHLIST_KEY, next)
  window.dispatchEvent(new Event('wishlist:changed'))

  if (isLoggedIn()) {
    api.post<void>(`/api/favorites/${id}`, {}).catch(() => {})
  }
  return next
}

export function removeFromWishlist(productId: number | string): string[] {
  const id = normalizeId(productId)
  const next = getWishlistIds().filter((item) => item !== id)
  writeStorage(WISHLIST_KEY, next)
  window.dispatchEvent(new Event('wishlist:changed'))

  if (isLoggedIn()) {
    api.delete<void>(`/api/favorites/${id}`).catch(() => {})
  }
  return next
}

export function toggleWishlist(productId: number | string): string[] {
  return isWishlisted(productId) ? removeFromWishlist(productId) : addToWishlist(productId)
}

// ─── Full sync from server ────────────────────────────────────────────────────

interface FavoriteDTO {
  id: number
  product: { id: string; name: string; price: number; imageUrl: string; sellerName: string; categoryName: string }
}

interface PagedFavorites {
  content: FavoriteDTO[]
  totalElements: number
}

/**
 * Fetches all favorites from the API and refreshes the localStorage cache.
 * Returns the full product details for display.
 */
export async function fetchFavorites(): Promise<WishlistProduct[]> {
  if (!isLoggedIn()) return []
  try {
    const res = await api.get<PagedFavorites>('/api/favorites?page=0&size=100')
    const favorites = res.content ?? []
    const ids = favorites.map((f) => String(f.product.id))
    writeStorage(WISHLIST_KEY, ids)
    return favorites.map((f) => ({
      id: String(f.product.id),
      name: f.product.name,
      price: Number(f.product.price),
      imageUrl: f.product.imageUrl ?? '',
      sellerName: f.product.sellerName ?? '',
      categoryName: f.product.categoryName ?? '',
    }))
  } catch {
    // API unavailable — return empty; local cache stays intact
    return []
  }
}
