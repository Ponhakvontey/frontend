export interface NavLink {
  id: number
  label: string
  slug: string
  active: boolean
}

export interface Benefit {
  id: number
  icon: string
  title: string
  description: string
}

export interface Category {
  id: number
  name: string
  slug: string
  image: string
  description?: string
  ctaLabel?: string
  featured: boolean
}

export interface FooterLink {
  label: string
  slug: string
  href?: string
}

export interface FooterColumn {
  id: number
  title: string
  links: FooterLink[]
}

export interface HeroContent {
  eyebrow: string
  headingLine1: string
  headingLine2: string
  description: string
  primaryCta: string
  secondaryCta: string
  image: string
  designerLabel: string
  designerName: string
}

export interface JournalContent {
  image: string
  title: string
  description: string
  newsletterPlaceholder: string
  newsletterCta: string
}

export interface SocialLink {
  id: number
  platform: string
  icon: string
  href: string
}

export interface ProductImage {
  id: number
  url: string
}

export interface ProductOptionSize {
  label: string
  disabled?: boolean
}

export interface ProductBenefit {
  id: number
  title: string
  description: string
}

export interface ProductInfoCard {
  id: number
  title: string
  description: string
}

export interface ProductPairing {
  id: number
  name: string
  material: string
  price: number
  image: string
}

export interface Product {
  id: number | string
  name: string
  maker: string
  price: number
  currency: string
  image: string
  badge?: string
  slug: string

  colorLabel?: string
  reviewCount?: number
  tagLabel?: string
  gallery?: ProductImage[]
  sizes?: ProductOptionSize[]
  narrative?: string
  composition?: string
  origin?: string
  sku?: string
  infoCards?: ProductInfoCard[]
  editorialImage?: string
  pairings?: ProductPairing[]
  benefits?: ProductBenefit[]
}
