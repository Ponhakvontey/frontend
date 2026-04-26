import orderService from '@/service/orders.service'
import userService from '@/service/user.service'
import productService from '@/service/product.service'

export async function getAdminDashboardData() {
  const result = {
    products: 0,
    totalOrders: 0,
    users: 0,
    totalRevenue: 0,
    transactions: [] as any[],
  }

  const orderStats = await orderService.getDashboardStats()
  result.totalOrders = orderStats.totalOrders || 0
  result.totalRevenue = orderStats.totalRevenue || 0

  try {
    const userList = await userService.getAllUsers()
    result.users = Array.isArray(userList) ? userList.length : 0
  } catch {
    result.users = 0
  }

  try {
    const productData = await productService.getAllProducts(1, 1)
    result.products = productData.pagination?.total || productData.length || 0
  } catch {
    result.products = 0
  }

  try {
    const orders = await orderService.getRecentOrders?.()
    result.transactions = Array.isArray(orders) ? orders : []
  } catch {
    result.transactions = []
  }

  return result
}
