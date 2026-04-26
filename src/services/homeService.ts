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

// ─── Toggle this to switch between mock and real API ──────────────────────────
const USE_MOCK = true
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'https://api.ubuyee.com'

// ─── Service Functions ────────────────────────────────────────────────────────

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
  if (USE_MOCK) return mockCategories
  const res = await fetch(`${API_BASE}/categories`)
  return res.json()
}

export async function getTrendingProducts(): Promise<Product[]> {
  if (USE_MOCK) return mockProducts
  const res = await fetch(`${API_BASE}/products?trending=true&limit=4`)
  return res.json()
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
