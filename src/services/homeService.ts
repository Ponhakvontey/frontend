/**
 * Home/CMS service.
 * Navigation, hero, footer etc. are static data — no backend endpoint exists for them.
 * Products and categories come from the real Spring Boot API.
 */
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
  mockFooterColumns,
  mockHeroContent,
  mockJournalContent,
  mockSocialLinks,
} from '@/data/home'
import { getInventoryProducts } from '@/services/adminInventoryService'
import type { InventoryProduct } from '@/types/inventory'

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

// ── Static content (no backend endpoint) ─────────────────────────────────────

export const getNavLinks     = (): Promise<NavLink[]>      => Promise.resolve(mockNavLinks)
export const getBenefits     = (): Promise<Benefit[]>      => Promise.resolve(mockBenefits)
export const getFooterColumns= (): Promise<FooterColumn[]> => Promise.resolve(mockFooterColumns)
export const getHeroContent  = (): Promise<HeroContent>    => Promise.resolve(mockHeroContent)
export const getJournalContent= (): Promise<JournalContent>=> Promise.resolve(mockJournalContent)
export const getSocialLinks  = (): Promise<SocialLink[]>   => Promise.resolve(mockSocialLinks)

// ── Live data ─────────────────────────────────────────────────────────────────

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
  const products = await getInventoryProducts()
  return products.map(inventoryToProduct)
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function toSlug(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

function inventoryToProduct(p: InventoryProduct): Product {
  return {
    id: p.id,
    name: p.name,
    maker: p.sellerName || 'Ubuyee Studio',
    price: p.price,
    currency: 'USD',
    image: p.imageUrl || '',
    slug: toSlug(p.name),
    colorLabel: p.category.toUpperCase(),
    reviewCount: 0,
    tagLabel: p.category.toUpperCase(),
    gallery: [{ id: 1, url: p.imageUrl }],
    sizes: [{ label: 'ONE SIZE' }],
    narrative: p.description,
    composition: '-',
    origin: '-',
    sku: `SKU-${p.id}`,
    infoCards: [{ id: 1, title: 'Product Notes', description: p.description || 'No description.' }],
    editorialImage: p.imageUrl,
    pairings: [],
    benefits: [],
  }
}
