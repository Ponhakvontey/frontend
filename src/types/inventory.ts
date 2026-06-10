export interface InventoryProduct {
  id: string
  name: string
  description: string
  price: number
  stock: number
  imageUrl: string
  imageUrls: string[]
  sizes: string[]
  categoryId: number | null
  category: string
  sellerName: string
  imagePosition: string | null
  averageRating: number | null
  reviewCount: number | null
  createdAt: string
  updatedAt: string
}

export interface InventoryProductInput {
  name: string
  description: string
  price: number
  stock: number
  imageUrl: string
  imageUrls: string[]
  sizes: string[]
  categoryId: number | null
  imagePosition: string | null
}

export type InventoryFilterKey = 'all' | 'in-stock' | 'low-stock' | 'out-of-stock'
export type InventorySortKey = 'name' | 'category' | 'price' | 'stock'
