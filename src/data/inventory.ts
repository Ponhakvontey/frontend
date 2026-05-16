import bed1Img from '@/assets/home/bed1.png'
import lampImg from '@/assets/home/lamp.png'
import stoolImg from '@/assets/home/stool.png'
import diffuserImg from '@/assets/home/diffuser.png'
import type { InventoryProduct } from '@/types/inventory'

export const mockInventoryProducts: InventoryProduct[] = [
  {
    id: 'prod-1',
    name: 'Monochrome Archetype Jacket',
    maker: 'Exclusive Design',
    sku: 'CL-MAJ-0442-G',
    category: 'Exclusive Design',
    price: 895,
    stock: 142,
    status: 'active',
    image: bed1Img,
    description: 'Architectural tailoring with a refined editorial silhouette.',
    createdAt: '2026-04-23T00:00:00.000Z',
    updatedAt: '2026-04-23T00:00:00.000Z',
  },
  {
    id: 'prod-2',
    name: 'T1 Desktop Lamp',
    maker: 'Lumina Studio',
    sku: 'LM-T1-0911-B',
    category: 'Signature Lighting',
    price: 890,
    stock: 8,
    status: 'active',
    image: lampImg,
    description: 'Sculptural lamp with soft directional glow for calm interiors.',
    createdAt: '2026-04-22T00:00:00.000Z',
    updatedAt: '2026-04-22T00:00:00.000Z',
  },
  {
    id: 'prod-3',
    name: 'Nord Solid Oak Stool',
    maker: 'Fjord Design',
    sku: 'FJ-ST-2210-O',
    category: 'Handcrafted Woodwork',
    price: 1150,
    stock: 45,
    status: 'active',
    image: stoolImg,
    description: 'Solid oak object stool with softened geometry and a quiet profile.',
    createdAt: '2026-04-21T00:00:00.000Z',
    updatedAt: '2026-04-21T00:00:00.000Z',
  },
  {
    id: 'prod-4',
    name: 'Muted Scent Diffuser',
    maker: 'Curator House',
    sku: 'CH-DF-1408-A',
    category: 'Atmospheric Object',
    price: 185,
    stock: 0,
    status: 'active',
    image: diffuserImg,
    description: 'Ceramic fragrance object designed for subtle atmospheric styling.',
    createdAt: '2026-04-20T00:00:00.000Z',
    updatedAt: '2026-04-20T00:00:00.000Z',
  },
]
