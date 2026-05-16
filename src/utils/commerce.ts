import { readStorage, writeStorage } from '@/utils/storage'

export interface CartItem {
  lineId: string
  id: number | string
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

export interface PaymentInfo {
  method: string
  cardLast4?: string
}

export interface OrderRecord {
  id: number | string
  orderNumber: string
  placedDate: string
  status: string
  total: number
  items: CartItem[]
  shippingInfo: ShippingInfo
  paymentInfo: PaymentInfo
  email?: string
}

export function toLineId(productId: number | string, variant: string) {
  return `${productId}:${variant}`
}

export function loadCartItems() {
  return readStorage<CartItem[]>('cartItems', [])
}

export function saveCartItems(items: CartItem[]) {
  writeStorage('cartItems', items)
}
