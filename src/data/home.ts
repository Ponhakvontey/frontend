import shirtOneImg from '@/assets/home/shirt_carousel1.jpg'
import shirtTwoImg from '@/assets/home/shirt_carousel2.jpg'
import bed1Img from '@/assets/home/bed1.png'
import bed2Img from '@/assets/home/bed2.png'
import logoImg from '@/assets/home/logo1.png'
import type {
  Benefit,
  Category,
  FooterColumn,
  HeroContent,
  JournalContent,
  NavLink,
  Product,
  SocialLink,
} from '@/types/home'

export const mockNavLinks: NavLink[] = [
  { id: 1, label: 'Home', slug: 'home', active: false },
  { id: 2, label: 'Sell', slug: 'sell', active: false },
  { id: 3, label: 'Orders', slug: 'order-history', active: false },
  { id: 4, label: 'Become a Seller', slug: 'become-seller', active: false },
]

export const mockBenefits: Benefit[] = [
  {
    id: 1,
    icon: 'fa-solid fa-truck',
    title: 'Complimentary Shipping',
    description: 'Free tracked delivery on qualifying orders worldwide.',
  },
  {
    id: 2,
    icon: 'fa-solid fa-gem',
    title: 'Curated Quality',
    description: 'Every item is checked before it reaches you.',
  },
  {
    id: 3,
    icon: 'fa-solid fa-headset',
    title: 'Support',
    description: 'Get product and order guidance from our support team.',
  },
]

export const mockCategories: Category[] = [
  {
    id: 1,
    name: 'Shirts',
    slug: 'shirts',
    image: shirtTwoImg,
    description: 'Clean shirts for polished everyday outfits.',
    ctaLabel: 'Explore',
    featured: true,
  },
  {
    id: 2,
    name: 'Outerwear',
    slug: 'outerwear',
    image: shirtOneImg,
    description: 'Structured layers and light jackets.',
    ctaLabel: 'Explore',
    featured: false,
  },
  {
    id: 3,
    name: 'Trousers',
    slug: 'trousers',
    image: bed1Img,
    description: 'Tailored bottoms for modern wardrobes.',
    ctaLabel: 'Explore',
    featured: false,
  },
]

export const mockHeroContent: HeroContent = {
  eyebrow: 'New Collection',
  headingLine1: 'Elevate Your',
  headingLine2: 'Everyday Style',
  description: 'Premium shirts, trousers, jackets, and daily essentials for the modern wardrobe.',
  primaryCta: 'Shop Collection',
  secondaryCta: 'View Lookbook',
  image: shirtOneImg,
  designerLabel: 'Featured Brand',
  designerName: 'Ubuyee Studio',
}

export const mockJournalContent: JournalContent = {
  image: shirtTwoImg,
  title: 'Style Journal',
  description: 'Outfit notes, product stories, and styling ideas from the Ubuyee team.',
  newsletterPlaceholder: 'Enter your email',
  newsletterCta: 'Subscribe',
}

export const mockSocialLinks: SocialLink[] = [
  { id: 1, platform: 'x', icon: 'fa-brands fa-x-twitter', href: '#' },
  { id: 2, platform: 'facebook', icon: 'fa-brands fa-facebook-f', href: '#' },
  { id: 3, platform: 'instagram', icon: 'fa-brands fa-instagram', href: '#' },
  { id: 4, platform: 'github', icon: 'fa-brands fa-github', href: '#' },
]

export const mockFooterColumns: FooterColumn[] = [
  {
    id: 1,
    title: 'Company',
    links: [
      { label: 'About', slug: '/about' },
      { label: 'Features', slug: '/features' },
      { label: 'Works', slug: '/works' },
      { label: 'Career', slug: '/careers' },
    ],
  },
  {
    id: 2,
    title: 'Help',
    links: [
      { label: 'Customer Support', slug: '/contact' },
      { label: 'Delivery Details', slug: '/shipping' },
      { label: 'Terms & Conditions', slug: '/terms' },
      { label: 'Privacy Policy', slug: '/privacy' },
    ],
  },
  {
    id: 3,
    title: 'FAQ',
    links: [
      { label: 'Account', slug: 'login' },
      { label: 'Manage Deliveries', slug: '/shipping' },
      { label: 'Orders', slug: 'order-history' },
      { label: 'Payments', slug: '/payment' },
    ],
  },
]

export const uiAssets = {
  logo: logoImg,
}

export const mockProducts: Product[] = [
  {
    id: 1,
    name: 'Monochrome Archetype Jacket',
    maker: 'Ubuyee Studio',
    price: 895,
    currency: 'USD',
    image: shirtOneImg,
    badge: 'NEW',
    slug: 'monochrome-archetype-jacket',
    colorLabel: 'OBSIDIAN GREY',
    reviewCount: 128,
    tagLabel: 'OUTERWEAR',
    gallery: [
      { id: 1, url: shirtOneImg },
      { id: 2, url: shirtTwoImg },
      { id: 3, url: bed1Img },
    ],
    sizes: [{ label: 'XS' }, { label: 'S' }, { label: 'M' }, { label: 'L' }, { label: 'XL' }],
    narrative: 'A structured jacket with a clean silhouette for everyday styling.',
    composition: '85% Wool, 15% Silk',
    origin: 'Made for Ubuyee',
    sku: 'CL-MAJ-0442-G',
    infoCards: [
      { id: 1, title: 'The Fit', description: 'Designed for a slightly oversized structured fit.' },
      { id: 2, title: 'Care', description: 'Dry clean only and store on a wide hanger.' },
    ],
    editorialImage: shirtTwoImg,
    benefits: [
      { id: 1, title: 'Complimentary Shipping', description: 'Available on qualifying orders.' },
      { id: 2, title: 'Quality Checked', description: 'Each piece is reviewed before dispatch.' },
    ],
    pairings: [],
  },
  {
    id: 2,
    name: 'Essential Cotton Shirt',
    maker: 'Ubuyee Studio',
    price: 120,
    currency: 'USD',
    image: shirtTwoImg,
    slug: 'essential-cotton-shirt',
    colorLabel: 'WHITE',
    reviewCount: 64,
    tagLabel: 'SHIRTS',
    gallery: [{ id: 1, url: shirtTwoImg }, { id: 2, url: shirtOneImg }],
    sizes: [{ label: 'S' }, { label: 'M' }, { label: 'L' }, { label: 'XL' }],
    narrative: 'A crisp cotton shirt made for polished daily wear.',
    composition: '100% Cotton',
    origin: 'Made for Ubuyee',
    sku: 'UB-SH-0911-W',
    infoCards: [{ id: 1, title: 'The Design', description: 'Clean lines and comfortable everyday structure.' }],
    editorialImage: shirtOneImg,
    benefits: [{ id: 1, title: 'Easy Styling', description: 'Pairs well with trousers, denim, and layering pieces.' }],
    pairings: [],
  },
  {
    id: 3,
    name: 'Tailored Linen Trouser',
    maker: 'Ubuyee Studio',
    price: 165,
    currency: 'USD',
    image: bed1Img,
    slug: 'tailored-linen-trouser',
    colorLabel: 'NATURAL',
    reviewCount: 39,
    tagLabel: 'TROUSERS',
    gallery: [{ id: 1, url: bed1Img }, { id: 2, url: shirtTwoImg }],
    sizes: [{ label: 'S' }, { label: 'M' }, { label: 'L' }],
    narrative: 'Relaxed trousers with a tailored finish and breathable hand feel.',
    composition: 'Linen Blend',
    origin: 'Made for Ubuyee',
    sku: 'UB-TR-2210-N',
    infoCards: [{ id: 1, title: 'The Fit', description: 'A relaxed fit with a refined line.' }],
    editorialImage: bed2Img,
    benefits: [{ id: 1, title: 'Comfort First', description: 'Built for repeated everyday wear.' }],
    pairings: [],
  },
  {
    id: 4,
    name: 'Soft Knit Overshirt',
    maker: 'Ubuyee Studio',
    price: 185,
    currency: 'USD',
    image: bed2Img,
    slug: 'soft-knit-overshirt',
    colorLabel: 'ASH',
    reviewCount: 22,
    tagLabel: 'KNITWEAR',
    gallery: [{ id: 1, url: bed2Img }, { id: 2, url: shirtOneImg }],
    sizes: [{ label: 'S' }, { label: 'M' }, { label: 'L' }],
    narrative: 'A soft layering piece designed for simple modern outfits.',
    composition: 'Cotton Knit Blend',
    origin: 'Made for Ubuyee',
    sku: 'UB-KN-1408-A',
    infoCards: [{ id: 1, title: 'Layering', description: 'Designed to wear open or buttoned over a shirt.' }],
    editorialImage: shirtTwoImg,
    benefits: [{ id: 1, title: 'Soft Hand Feel', description: 'Comfortable for day-long wear.' }],
    pairings: [],
  },
]