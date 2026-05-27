import shirtOneImg from '@/assets/home/shirt_carousel1.jpg'
import shirtTwoImg from '@/assets/home/shirt_carousel2.jpg'
import bed1Img from '@/assets/home/bed1.png'
import bed2Img from '@/assets/home/bed2.png'
import type { InventoryProduct } from '@/types/inventory'

export const mockInventoryProducts: InventoryProduct[] = [
  {
    id: 'prod-1',
    name: 'Monochrome Archetype Jacket',
    description: 'A structured jacket with a clean silhouette for everyday styling.',
    price: 895,
    stock: 142,
    imageUrl: shirtOneImg,
    categoryId: null,
    category: 'Outerwear',
    sellerName: 'Ubuyee Studio',
    createdAt: '2026-04-23T00:00:00.000Z',
    updatedAt: '2026-04-23T00:00:00.000Z',
  },
  {
    id: 'prod-2',
    name: 'Essential Cotton Shirt',
    description: 'A crisp cotton shirt made for polished daily wear.',
    price: 120,
    stock: 36,
    imageUrl: shirtTwoImg,
    categoryId: null,
    category: 'Shirts',
    sellerName: 'Ubuyee Studio',
    createdAt: '2026-04-22T00:00:00.000Z',
    updatedAt: '2026-04-22T00:00:00.000Z',
  },
  {
    id: 'prod-3',
    name: 'Tailored Linen Trouser',
    description: 'Relaxed trousers with a tailored finish and breathable hand feel.',
    price: 165,
    stock: 45,
    imageUrl: bed1Img,
    categoryId: null,
    category: 'Trousers',
    sellerName: 'Ubuyee Studio',
    createdAt: '2026-04-21T00:00:00.000Z',
    updatedAt: '2026-04-21T00:00:00.000Z',
  },
  {
    id: 'prod-4',
    name: 'Soft Knit Overshirt',
    description: 'A soft layering piece designed for simple modern outfits.',
    price: 185,
    stock: 18,
    imageUrl: bed2Img,
    categoryId: null,
    category: 'Knitwear',
    sellerName: 'Ubuyee Studio',
    createdAt: '2026-04-20T00:00:00.000Z',
    updatedAt: '2026-04-20T00:00:00.000Z',
  },
]