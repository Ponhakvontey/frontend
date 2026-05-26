import { readStorage, writeStorage } from '@/utils/storage'

export interface CartItem {
  lineId: string
  id: string
  brand: string
  name: string
  variant: string
  price: number
  quantity: number
  image: string
}

export interface ShippingInfo {
  firstName: string
  lastName: string
  address: string
  city: string
  state: string
  zipCode: string
  phone: string
}

export function toLineId(productId: string, variant: string) {
  return `${productId}:${variant}`
}

export function loadCartItems() {
  return readStorage<CartItem[]>('cartItems', [])
}

export function saveCartItems(items: CartItem[]) {
  writeStorage('cartItems', items)
}
