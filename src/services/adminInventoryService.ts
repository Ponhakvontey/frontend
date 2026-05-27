import { mockInventoryProducts } from '@/data/inventory'
import { api } from '@/services/apiClient'
import type { InventoryProduct, InventoryProductInput } from '@/types/inventory'
import { readStorage, writeStorage } from '@/utils/storage'

const USE_API = import.meta.env.VITE_USE_API_PRODUCTS !== 'false'
const INVENTORY_KEY = 'adminInventoryProducts'
const PRODUCT_LIST_PATH = '/api/products?page=0&size=100&sortBy=createdAt&sortDir=desc'

interface BackendProduct {
  id: number | string
  name: string
  description?: string | null
  price: number | string
  stockQuantity?: number | string | null
  stock?: number | string | null
  imageUrl?: string | null
  image?: string | null
  categoryName?: string | null
  category?: string | null
  categoryId?: number | string | null
  sellerName?: string | null
  createdAt?: string | null
  updatedAt?: string | null
}

interface PagedResponse<T> {
  content?: T[]
  totalElements?: number
}

function cloneProducts(products: InventoryProduct[]) {
  return products.map((product) => ({ ...product }))
}

function ensureInventorySeeded() {
  const current = readStorage<InventoryProduct[]>(INVENTORY_KEY, [])
  if (current.length) return current

  const seeded = cloneProducts(mockInventoryProducts)
  writeStorage(INVENTORY_KEY, seeded)
  return seeded
}

function saveInventoryProducts(products: InventoryProduct[]) {
  writeStorage(INVENTORY_KEY, products)
}

function isLocalProductId(id: string) {
  return id.startsWith('prod-')
}

function normalizeStock(product: BackendProduct) {
  return Number(product.stockQuantity ?? product.stock ?? 0)
}

function toCategoryId(value: BackendProduct['categoryId']) {
  if (value === null || value === undefined || value === '') return null
  const categoryId = Number(value)
  return Number.isFinite(categoryId) ? categoryId : null
}

function toInventoryProduct(product: BackendProduct): InventoryProduct {
  const now = new Date().toISOString()

  return {
    id: String(product.id),
    name: product.name,
    description: product.description ?? '',
    price: Number(product.price || 0),
    stock: normalizeStock(product),
    imageUrl: product.imageUrl ?? product.image ?? '',
    category: product.categoryName ?? product.category ?? 'Clothing',
    categoryId: toCategoryId(product.categoryId),
    sellerName: product.sellerName ?? 'Ubuyee Studio',
    createdAt: product.createdAt ?? now,
    updatedAt: product.updatedAt ?? now,
  }
}

function readProductsFromResponse(response: PagedResponse<BackendProduct> | BackendProduct[]) {
  const products = Array.isArray(response) ? response : response.content ?? []
  return products.map(toInventoryProduct)
}

function toPayload(input: InventoryProductInput) {
  return {
    name: input.name,
    description: input.description,
    price: input.price,
    stockQuantity: input.stock,
    imageUrl: input.imageUrl,
    categoryId: input.categoryId ? Number(input.categoryId) : null,
  }
}

function createLocalProduct(input: InventoryProductInput) {
  const products = ensureInventorySeeded()
  const product: InventoryProduct = {
    id: `prod-${Date.now()}`,
    name: input.name,
    description: input.description,
    price: input.price,
    stock: input.stock,
    imageUrl: input.imageUrl,
    categoryId: input.categoryId,
    category: 'Clothing',
    sellerName: 'Ubuyee Studio',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  saveInventoryProducts([product, ...products])
  return product
}

function updateLocalProduct(id: string, input: InventoryProductInput) {
  const products = ensureInventorySeeded()
  let updatedProduct: InventoryProduct | null = null

  const updatedProducts = products.map((product) => {
    if (product.id !== id) return product

    updatedProduct = {
      ...product,
      name: input.name,
      description: input.description,
      price: input.price,
      stock: input.stock,
      imageUrl: input.imageUrl,
      categoryId: input.categoryId,
      updatedAt: new Date().toISOString(),
    }

    return updatedProduct
  })

  saveInventoryProducts(updatedProducts)
  return updatedProduct
}

function deleteLocalProduct(id: string) {
  const products = ensureInventorySeeded()
  saveInventoryProducts(products.filter((product) => product.id !== id))
}

export async function getInventoryProducts() {
  if (USE_API) {
    try {
      const response = await api.get<PagedResponse<BackendProduct> | BackendProduct[]>(PRODUCT_LIST_PATH)
      return readProductsFromResponse(response)
    } catch (error) {
      console.warn('Product API unavailable. Falling back to local inventory data.', error)
    }
  }

  return ensureInventorySeeded()
}

export async function getInventoryProduct(id: string) {
  if (USE_API && !isLocalProductId(id)) {
    try {
      const product = await api.get<BackendProduct>(`/api/products/${id}`)
      return toInventoryProduct(product)
    } catch (error) {
      console.warn('Product API lookup failed. Falling back to local inventory data.', error)
    }
  }

  return ensureInventorySeeded().find((product) => product.id === id) ?? null
}

export async function createInventoryProduct(input: InventoryProductInput) {
  if (USE_API) {
    try {
      const product = await api.post<BackendProduct>('/api/products', toPayload(input))
      return toInventoryProduct(product)
    } catch (error) {
      console.warn('Product API create failed. Saving product locally instead.', error)
    }
  }

  return createLocalProduct(input)
}

export async function updateInventoryProduct(id: string, input: InventoryProductInput) {
  if (USE_API && !isLocalProductId(id)) {
    try {
      const product = await api.put<BackendProduct>(`/api/products/${id}`, toPayload(input))
      return toInventoryProduct(product)
    } catch (error) {
      console.warn('Product API update failed. Updating local inventory data instead.', error)
    }
  }

  return updateLocalProduct(id, input)
}

export async function deleteInventoryProduct(id: string) {
  if (USE_API && !isLocalProductId(id)) {
    try {
      await api.delete(`/api/products/${id}`)
      return
    } catch (error) {
      console.warn('Product API delete failed. Removing local inventory data instead.', error)
    }
  }

  deleteLocalProduct(id)
}