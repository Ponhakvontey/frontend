import { readStorage, writeStorage } from '@/utils/storage'

const WISHLIST_KEY = 'wishlistProductIds'

function normalizeId(productId: number | string) {
  return String(productId)
}

export function getWishlistIds() {
  return readStorage<string[]>(WISHLIST_KEY, [])
}

export function isWishlisted(productId: number | string) {
  return getWishlistIds().includes(normalizeId(productId))
}

export function addToWishlist(productId: number | string) {
  const id = normalizeId(productId)
  const existing = getWishlistIds()
  if (existing.includes(id)) return existing

  const next = [id, ...existing]
  writeStorage(WISHLIST_KEY, next)
  window.dispatchEvent(new Event('wishlist:changed'))
  return next
}

export function removeFromWishlist(productId: number | string) {
  const id = normalizeId(productId)
  const next = getWishlistIds().filter((item) => item !== id)
  writeStorage(WISHLIST_KEY, next)
  window.dispatchEvent(new Event('wishlist:changed'))
  return next
}

export function toggleWishlist(productId: number | string) {
  return isWishlisted(productId) ? removeFromWishlist(productId) : addToWishlist(productId)
}