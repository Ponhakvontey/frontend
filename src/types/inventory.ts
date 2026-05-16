export type InventoryStatus = 'active' | 'draft' | 'archived'

export interface InventoryProduct {
  id: string
  name: string
  maker: string
  sku: string
  category: string
  price: number
  stock: number
  status: InventoryStatus
  image: string
  description: string
  createdAt: string
  updatedAt: string
}

export interface InventoryProductInput {
  name: string
  maker: string
  sku: string
  category: string
  price: number
  stock: number
  status: InventoryStatus
  image: string
  description: string
}

export type InventorySortKey = 'name' | 'sku' | 'category' | 'price' | 'stock'
export type InventoryFilterKey = 'all' | 'in-stock' | 'low-stock' | 'out-of-stock'
