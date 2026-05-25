/**
 * Admin inventory service — calls the real Spring Boot product endpoints.
 *
 * Backend ProductDTO fields:
 *   stockQuantity  → stock
 *   imageUrl       → imageUrl
 *   categoryName   → category
 *   categoryId     → categoryId (sent on create/update)
 *   sellerName     → sellerName (read-only)
 */
import { api } from '@/services/apiClient'
import type { InventoryProduct, InventoryProductInput } from '@/types/inventory'

localStorage.removeItem('adminInventoryProducts')

interface BackendProduct {
  id: number
  name: string
  description: string
  price: number
  stockQuantity: number
  imageUrl: string | null
  categoryId: number | null
  categoryName: string | null
  sellerId: number | null
  sellerName: string | null
  createdAt: string
  updatedAt: string
}

interface PagedResponse<T> {
  content: T[]
  totalElements: number
}

function toInventoryProduct(dto: BackendProduct): InventoryProduct {
  return {
    id: String(dto.id),
    name: dto.name ?? '',
    description: dto.description ?? '',
    price: Number(dto.price ?? 0),
    stock: dto.stockQuantity ?? 0,
    imageUrl: dto.imageUrl ?? '',
    categoryId: dto.categoryId ?? null,
    category: dto.categoryName ?? 'Uncategorized',
    sellerName: dto.sellerName ?? '',
    createdAt: dto.createdAt ?? '',
    updatedAt: dto.updatedAt ?? '',
  }
}

function toPayload(input: InventoryProductInput) {
  return {
    name: input.name,
    description: input.description || null,
    price: input.price,
    stockQuantity: input.stock,
    imageUrl: input.imageUrl || null,
    categoryId: input.categoryId ?? null,
  }
}

export async function getInventoryProducts(): Promise<InventoryProduct[]> {
  const res = await api.get<PagedResponse<BackendProduct>>(
    '/api/products?page=0&size=100&sortBy=createdAt&sortDir=desc',
  )
  return (res.content ?? []).map(toInventoryProduct)
}

export async function getInventoryProduct(id: string): Promise<InventoryProduct | null> {
  const dto = await api.get<BackendProduct>(`/api/products/${id}`)
  return toInventoryProduct(dto)
}

export async function createInventoryProduct(input: InventoryProductInput): Promise<InventoryProduct> {
  const dto = await api.post<BackendProduct>('/api/products', toPayload(input))
  return toInventoryProduct(dto)
}

export async function updateInventoryProduct(id: string, input: InventoryProductInput): Promise<InventoryProduct> {
  const dto = await api.put<BackendProduct>(`/api/products/${id}`, toPayload(input))
  return toInventoryProduct(dto)
}

export async function deleteInventoryProduct(id: string): Promise<void> {
  await api.delete(`/api/products/${id}`)
}
