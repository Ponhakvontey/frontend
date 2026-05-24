import type {
  NavLink,
  Benefit,
  Category,
  Product,
  FooterColumn,
  HeroContent,
  JournalContent,
  SocialLink,
} from '@/types/home'

import {
  mockNavLinks,
  mockBenefits,
  mockCategories,
  mockProducts,
  mockFooterColumns,
  mockHeroContent,
  mockJournalContent,
  mockSocialLinks,
} from '@/data/home'
import { getInventoryProducts } from '@/services/adminInventoryService'
import type { InventoryProduct } from '@/types/inventory'

// Static/CMS content has no backend endpoint — always use mock
// Only products & categories hit the real Spring Boot API
const USE_MOCK = true
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

function toProductId(id: string): number | string {
  const numericId = id.match(/^prod-(\d+)$/)?.[1]
  return numericId ? Number(numericId) : id
}

function toSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function inventoryToStorefrontProduct(product: InventoryProduct): Product {
  const existingProduct = mockProducts.find((item) => item.sku === product.sku || item.name === product.name)
  const productId = toProductId(product.id)

  return {
    ...(existingProduct || {}),
    id: productId,
    name: product.name,
    maker: product.maker,
    price: product.price,
    currency: existingProduct?.currency || 'USD',
    image: product.image || existingProduct?.image || '',
    badge: existingProduct?.badge,
    slug: existingProduct?.slug || toSlug(product.name),
    colorLabel: existingProduct?.colorLabel || product.category.toUpperCase(),
    reviewCount: existingProduct?.reviewCount || 0,
    tagLabel: product.category.toUpperCase(),
    gallery: existingProduct?.gallery || [{ id: 1, url: product.image }],
    sizes: existingProduct?.sizes || [{ label: 'ONE SIZE' }],
    narrative: existingProduct?.narrative || product.description,
    composition: existingProduct?.composition || '-',
    origin: existingProduct?.origin || '-',
    sku: product.sku,
    infoCards: existingProduct?.infoCards || [
      {
        id: 1,
        title: 'Product Notes',
        description: product.description || 'Curated by the admin inventory team.',
      },
    ],
    editorialImage: existingProduct?.editorialImage || product.image,
    pairings: existingProduct?.pairings || [],
    benefits: existingProduct?.benefits || [
      {
        id: 1,
        title: 'Curated Quality Assurance',
        description: 'This product is managed through the admin inventory workflow.',
      },
    ],
  }
}

export async function getNavLinks(): Promise<NavLink[]> {
  if (USE_MOCK) return mockNavLinks
  const res = await fetch(`${API_BASE}/navigation`)
  return res.json()
}

export async function getBenefits(): Promise<Benefit[]> {
  if (USE_MOCK) return mockBenefits
  const res = await fetch(`${API_BASE}/benefits`)
  return res.json()
}

export async function getCategories(): Promise<Category[]> {
  try {
    const res = await fetch(`${API_BASE}/api/categories`)
    if (!res.ok) throw new Error()
    return res.json()
  } catch {
    return mockCategories
  }
}

export async function getTrendingProducts(): Promise<Product[]> {
  try {
    const res = await fetch(`${API_BASE}/api/products?page=0&size=4`)
    if (!res.ok) throw new Error()
    const data = await res.json()
    // Backend returns a Page object; extract the content array
    return (data.content ?? data).map(inventoryToStorefrontProduct)
  } catch {
    // Fallback to local inventory if backend is unreachable
    const inventoryProducts = await getInventoryProducts()
    return inventoryProducts
      .filter((product) => product.status === 'active')
      .map(inventoryToStorefrontProduct)
  }
}

export async function getFooterColumns(): Promise<FooterColumn[]> {
  if (USE_MOCK) return mockFooterColumns
  const res = await fetch(`${API_BASE}/footer`)
  return res.json()
}

export async function getHeroContent(): Promise<HeroContent> {
  if (USE_MOCK) return mockHeroContent
  const res = await fetch(`${API_BASE}/cms/hero`)
  return res.json()
}

export async function getJournalContent(): Promise<JournalContent> {
  if (USE_MOCK) return mockJournalContent
  const res = await fetch(`${API_BASE}/cms/journal`)
  return res.json()
}

export async function getSocialLinks(): Promise<SocialLink[]> {
  if (USE_MOCK) return mockSocialLinks
  const res = await fetch(`${API_BASE}/social-links`)
  return res.json()
}
