import bed1Img from '@/assets/home/bed1.png'
import bed2Img from '@/assets/home/bed2.png'
import diffuserImg from '@/assets/home/diffuser.png'
import lampImg from '@/assets/home/lamp.png'
import lightingImg from '@/assets/home/ligthing.png'
import logoImg from '@/assets/home/logo1.png'
import objectsImg from '@/assets/home/ligth2.png'
import stoolImg from '@/assets/home/stool.png'
import textilesImg from '@/assets/home/textiles.png'
import vaseImg from '@/assets/home/vase1.png'
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
    description: 'Every item is hand-checked before it reaches you.',
  },
  {
    id: 3,
    icon: 'fa-solid fa-headset',
    title: 'Concierge Support',
    description: 'Get styling and product guidance from our support team.',
  },
]

export const mockCategories: Category[] = [
  {
    id: 1,
    name: 'Lighting',
    slug: 'lighting',
    image: lightingImg,
    description: 'Statement lamps and ambient essentials.',
    ctaLabel: 'Explore',
    featured: true,
  },
  {
    id: 2,
    name: 'Textiles',
    slug: 'textiles',
    image: textilesImg,
    description: 'Layered textures for modern interiors.',
    ctaLabel: 'Explore',
    featured: false,
  },
  {
    id: 3,
    name: 'Objects',
    slug: 'objects',
    image: objectsImg,
    description: 'Sculptural forms and decorative accents.',
    ctaLabel: 'Explore',
    featured: false,
  },
]

export const mockHeroContent: HeroContent = {
  eyebrow: 'NEW ARRIVAL',
  headingLine1: 'Curated Living',
  headingLine2: 'For Contemporary Homes',
  description: 'Discover editorial pieces that blend craft, comfort, and timeless design language.',
  primaryCta: 'Shop Collection',
  secondaryCta: 'View Journal',
  image: bed1Img,
  designerLabel: 'Featured Designer',
  designerName: 'Studio Atelier',
}

export const mockJournalContent: JournalContent = {
  image: bed2Img,
  title: 'Design Journal',
  description: 'Stories, spaces, and product narratives from our design editors and collaborators.',
  newsletterPlaceholder: 'Enter your email',
  newsletterCta: 'Subscribe',
}

export const mockSocialLinks: SocialLink[] = [
  { id: 1, platform: 'facebook', icon: 'fa-brands fa-facebook-f', href: '#' },
  { id: 2, platform: 'instagram', icon: 'fa-brands fa-instagram', href: '#' },
  { id: 3, platform: 'x', icon: 'fa-brands fa-x-twitter', href: '#' },
]

export const mockFooterColumns: FooterColumn[] = [
  {
    id: 1,
    title: 'Company',
    links: [
      { label: 'About', slug: '/about' },
      { label: 'Journal', slug: '/journal' },
      { label: 'Careers', slug: '/careers' },
    ],
  },
  {
    id: 2,
    title: 'Support',
    links: [
      { label: 'Shipping', slug: '/shipping' },
      { label: 'Returns', slug: '/returns' },
      { label: 'Contact', slug: '/contact' },
    ],
  },
  {
    id: 3,
    title: 'Account',
    links: [
      { label: 'Login', slug: 'login' },
      { label: 'Register', slug: 'register' },
      { label: 'Order History', slug: 'order-history' },
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
    maker: 'Exclusive Design',
    price: 895,
    currency: 'USD',
    image: bed1Img,
    badge: 'NEW',
    slug: 'monochrome-archetype-jacket',

    colorLabel: 'OBSIDIAN GREY',
    reviewCount: 128,
    tagLabel: 'EXCLUSIVE DESIGN',

    gallery: [
      { id: 1, url: bed1Img },
      { id: 2, url: bed2Img },
      { id: 3, url: lightingImg },
      { id: 4, url: objectsImg },
    ],

    sizes: [
      { label: 'XS' },
      { label: 'S' },
      { label: 'M' },
      { label: 'L' },
      { label: 'XL' },
      { label: 'XXL', disabled: true },
    ],

    narrative:
      'The Monochrome Archetype Jacket is a testament to architectural precision in design. Crafted with a refined, structured silhouette, it balances softness and control for a look that feels both editorial and timeless.',

    composition: '85% Wool, 15% Silk',
    origin: 'Made in Italy',
    sku: 'CL-MAJ-0442-G',

    infoCards: [
      {
        id: 1,
        title: 'The Fit',
        description:
          'Designed for a slightly oversized structured fit. Take your usual size for the intended silhouette, or size down for a closer tailored look.',
      },
      {
        id: 2,
        title: 'Care Instructions',
        description:
          'Dry clean only. Store on a wide hanger to preserve the structure and steam lightly between wears.',
      },
    ],

    editorialImage: bed2Img,

    benefits: [
      {
        id: 1,
        title: 'Complimentary Express Shipping',
        description:
          'For worldwide shipping on orders above $500. Expected delivery: 3–5 business days.',
      },
      {
        id: 2,
        title: 'Authenticity Guaranteed',
        description: 'Each piece is hand-inspected and shipped with a certificate of origin.',
      },
    ],

    pairings: [
      {
        id: 1,
        name: 'Pleated Linear Trouser',
        material: 'OBSIDIAN',
        price: 450,
        image: stoolImg,
      },
      {
        id: 2,
        name: 'The Sculpture Boot',
        material: 'ITALIAN LEATHER',
        price: 620,
        image: lampImg,
      },
      {
        id: 3,
        name: 'Architectural White Shirt',
        material: 'EGYPTIAN COTTON',
        price: 325,
        image: vaseImg,
      },
      {
        id: 4,
        name: 'Monolith Tote',
        material: 'FINE GRAINED LEATHER',
        price: 540,
        image: diffuserImg,
      },
    ],
  },

  {
    id: 2,
    name: 'T1 Desktop Lamp',
    maker: 'Lumina Studio',
    price: 890,
    currency: 'USD',
    image: lampImg,
    slug: 't1-desktop-lamp',

    colorLabel: 'SOFT BLACK',
    reviewCount: 64,
    tagLabel: 'SIGNATURE LIGHTING',

    gallery: [
      { id: 1, url: lampImg },
      { id: 2, url: lightingImg },
      { id: 3, url: objectsImg },
      { id: 4, url: bed2Img },
    ],

    sizes: [{ label: 'ONE SIZE' }],

    narrative:
      'The T1 Desktop Lamp combines sculptural simplicity with soft atmospheric illumination, making it a strong accent for desks, shelves, and bedside styling.',

    composition: 'Powder-Coated Steel',
    origin: 'Made in Denmark',
    sku: 'LM-T1-0911-B',

    infoCards: [
      {
        id: 1,
        title: 'The Design',
        description:
          'Minimal profile with a balanced base and warm directional glow suited for modern interiors.',
      },
      {
        id: 2,
        title: 'Care Instructions',
        description:
          'Wipe clean with a dry microfiber cloth. Avoid harsh cleaners on painted metal surfaces.',
      },
    ],

    editorialImage: lightingImg,

    benefits: [
      {
        id: 1,
        title: 'Complimentary Express Shipping',
        description: 'Available with premium tracked shipping for qualifying orders.',
      },
      {
        id: 2,
        title: 'Curated Quality Assurance',
        description: 'Each lighting piece is checked before dispatch for finish and condition.',
      },
    ],

    pairings: [
      {
        id: 1,
        name: 'Nord Solid Oak Stool',
        material: 'OAK',
        price: 1150,
        image: stoolImg,
      },
      {
        id: 2,
        name: 'Arp Ceramic Vase',
        material: 'CERAMIC',
        price: 420,
        image: vaseImg,
      },
    ],
  },

  {
    id: 3,
    name: 'Nord Solid Oak Stool',
    maker: 'Fjord Design',
    price: 1150,
    currency: 'USD',
    image: stoolImg,
    slug: 'nord-solid-oak-stool',

    colorLabel: 'NATURAL OAK',
    reviewCount: 39,
    tagLabel: 'HANDCRAFTED WOODWORK',

    gallery: [
      { id: 1, url: stoolImg },
      { id: 2, url: bed1Img },
      { id: 3, url: bed2Img },
      { id: 4, url: objectsImg },
    ],

    sizes: [{ label: 'STANDARD' }],

    narrative:
      'A sculpted oak stool designed to function as both seating and object. Its calm geometry makes it ideal for curated, quiet interiors.',

    composition: 'Solid Oak',
    origin: 'Made in Norway',
    sku: 'FJ-ST-2210-O',

    infoCards: [
      {
        id: 1,
        title: 'The Form',
        description:
          'Rounded edges and balanced proportions create a tactile, gallery-like presence.',
      },
      {
        id: 2,
        title: 'Care Instructions',
        description:
          'Clean with a soft cloth and use wood-safe oil periodically to maintain finish.',
      },
    ],

    editorialImage: bed1Img,

    benefits: [
      {
        id: 1,
        title: 'White-Glove Delivery Available',
        description: 'Special handling options available for selected furniture orders.',
      },
      {
        id: 2,
        title: 'Authenticity Guaranteed',
        description: 'Crafted with traceable materials and curated by our design team.',
      },
    ],

    pairings: [
      {
        id: 1,
        name: 'T1 Desktop Lamp',
        material: 'SOFT BLACK',
        price: 890,
        image: lampImg,
      },
      {
        id: 2,
        name: 'Muted Scent Diffuser',
        material: 'MATTE CERAMIC',
        price: 185,
        image: diffuserImg,
      },
    ],
  },

  {
    id: 4,
    name: 'Muted Scent Diffuser',
    maker: 'Curator House',
    price: 185,
    currency: 'USD',
    image: diffuserImg,
    slug: 'muted-scent-diffuser',

    colorLabel: 'ASH STONE',
    reviewCount: 22,
    tagLabel: 'ATMOSPHERIC OBJECT',

    gallery: [
      { id: 1, url: diffuserImg },
      { id: 2, url: vaseImg },
      { id: 3, url: bed2Img },
      { id: 4, url: objectsImg },
    ],

    sizes: [{ label: 'ONE SIZE' }],

    narrative:
      'The Muted Scent Diffuser is designed to soften a room through both form and fragrance, blending easily into refined interiors.',

    composition: 'Ceramic Vessel',
    origin: 'Made in France',
    sku: 'CH-DF-1408-A',

    infoCards: [
      {
        id: 1,
        title: 'The Scent',
        description: 'Balanced notes crafted for a quiet, clean atmosphere with subtle depth.',
      },
      {
        id: 2,
        title: 'Care Instructions',
        description: 'Keep away from direct sunlight and wipe vessel exterior with a dry cloth.',
      },
    ],

    editorialImage: vaseImg,

    benefits: [
      {
        id: 1,
        title: 'Gift-Ready Packaging',
        description: 'Presented in protective packaging suitable for gifting.',
      },
      {
        id: 2,
        title: 'Curated Quality Assurance',
        description: 'Inspected before dispatch to ensure finish and presentation quality.',
      },
    ],

    pairings: [
      {
        id: 1,
        name: 'Arp Ceramic Vase',
        material: 'CERAMIC',
        price: 420,
        image: vaseImg,
      },
      {
        id: 2,
        name: 'T1 Desktop Lamp',
        material: 'SOFT BLACK',
        price: 890,
        image: lampImg,
      },
    ],
  },
]
