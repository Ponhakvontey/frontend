import { mockAdminDashboard } from '@/data/admin'
import { readStorage } from '@/utils/storage'

export async function getAdminDashboardData() {
  const orders = readStorage<any[]>('orders', [])

  const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total || 0), 0)
  const transactions = orders.slice(0, 8).map((order) => ({
    id: `#${order.orderNumber}`,
    initials: (order.shippingInfo?.firstName?.[0] || 'U') + (order.shippingInfo?.lastName?.[0] || 'S'),
    customer: `${order.shippingInfo?.firstName || 'Unknown'} ${order.shippingInfo?.lastName || ''}`.trim(),
    product: order.items?.[0]?.name || 'Mixed items',
    date: order.placedDate || '-',
    amount: `$${Number(order.total || 0).toFixed(2)}`,
    status: order.status || 'PLACED',
    statusClass: order.status === 'DELIVERED' ? 'green' : 'blue',
  }))

  return {
    adminName: mockAdminDashboard.adminName,
    stats: {
      products: mockAdminDashboard.stats.products,
      totalOrders: orders.length,
      users: readStorage<any[]>('users', []).length,
      totalRevenue,
    },
    transactions: transactions.length ? transactions : mockAdminDashboard.transactions,
  }
}
