import { api } from '@/services/apiClient'

interface PagedResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  page: number
  size: number
  last: boolean
}

export interface DashboardOrder {
  id: number
  orderDate: string
  status: string
  totalAmount: number
  username: string
  items: { productName: string }[]
}

export interface DashboardStats {
  totalUsers: number
  totalOrders: number
  totalProducts: number
  recentRevenue: number
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const [usersRes, ordersRes, productsRes] = await Promise.all([
    api.get<PagedResponse<unknown>>('/api/admin/users?page=0&size=1'),
    api.get<PagedResponse<DashboardOrder>>('/api/admin/orders?page=0&size=10'),
    api.get<PagedResponse<unknown>>('/api/products?page=0&size=1'),
  ])

  const recentRevenue = (ordersRes.content ?? []).reduce(
    (sum, o) => sum + Number(o.totalAmount ?? 0), 0,
  )

  return {
    totalUsers: usersRes.totalElements,
    totalOrders: ordersRes.totalElements,
    totalProducts: productsRes.totalElements,
    recentRevenue,
  }
}

export async function getRecentOrders(): Promise<DashboardOrder[]> {
  const res = await api.get<PagedResponse<DashboardOrder>>('/api/admin/orders?page=0&size=8')
  return res.content ?? []
}
