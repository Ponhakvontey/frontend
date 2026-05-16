import { mockInventoryProducts } from '@/data/inventory'
import type { InventoryProduct, InventoryProductInput } from '@/types/inventory'
import { readStorage, writeStorage } from '@/utils/storage'

const USE_MOCK = true
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'https://api.ubuyee.com'
const INVENTORY_KEY = 'adminInventoryProducts'

function cloneProducts(products: InventoryProduct[]) {
  return products.map((product) => ({ ...product }))
}

function ensureInventorySeeded() {
  const stored = readStorage<InventoryProduct[] | null>(INVENTORY_KEY, null)
  if (stored && Array.isArray(stored)) return stored

  const seeded = cloneProducts(mockInventoryProducts)
  writeStorage(INVENTORY_KEY, seeded)
  return seeded
}

async function requestJson<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options?.headers || {}) },
    ...options,
  })

  if (!response.ok) {
    throw new Error(`Inventory request failed with ${response.status}`)
  }

  return response.json() as Promise<T>
}

export async function getInventoryProducts() {
  if (!USE_MOCK) return requestJson<InventoryProduct[]>('/admin/inventory')
  return ensureInventorySeeded()
}

export async function getInventoryProduct(id: string) {
  if (!USE_MOCK) return requestJson<InventoryProduct>(`/admin/inventory/${id}`)
  return ensureInventorySeeded().find((product) => product.id === id) || null
}

export async function createInventoryProduct(input: InventoryProductInput) {
  if (!USE_MOCK) {
    return requestJson<InventoryProduct>('/admin/inventory', {
      method: 'POST',
      body: JSON.stringify(input),
    })
  }

  const products = ensureInventorySeeded()
  const now = new Date().toISOString()
  const product: InventoryProduct = {
    ...input,
    id: `prod-${Date.now()}`,
    createdAt: now,
    updatedAt: now,
  }

  writeStorage(INVENTORY_KEY, [product, ...products])
  return product
}

export async function updateInventoryProduct(id: string, input: InventoryProductInput) {
  if (!USE_MOCK) {
    return requestJson<InventoryProduct>(`/admin/inventory/${id}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    })
  }

  const products = ensureInventorySeeded()
  let updatedProduct: InventoryProduct | null = null
  const updatedProducts = products.map((product) => {
    if (product.id !== id) return product

    updatedProduct = {
      ...product,
      ...input,
      updatedAt: new Date().toISOString(),
    }
    return updatedProduct
  })

  writeStorage(INVENTORY_KEY, updatedProducts)
  return updatedProduct
}

export async function deleteInventoryProduct(id: string) {
  if (!USE_MOCK) {
    await requestJson<{ ok: boolean }>(`/admin/inventory/${id}`, { method: 'DELETE' })
    return
  }

  const products = ensureInventorySeeded().filter((product) => product.id !== id)
  writeStorage(INVENTORY_KEY, products)
}
