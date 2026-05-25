import { ref } from 'vue'
import { getDashboardStats, getRecentOrders } from '@/services/adminDashboardService'
import type { DashboardStats, DashboardOrder } from '@/services/adminDashboardService'

export function useAdminDashboard() {
  const loading = ref(false)
  const error = ref<string | null>(null)
  const stats = ref<DashboardStats>({ totalUsers: 0, totalOrders: 0, totalProducts: 0, recentRevenue: 0 })
  const recentOrders = ref<DashboardOrder[]>([])

  async function fetchDashboardData() {
    loading.value = true
    error.value = null
    try {
      const [s, orders] = await Promise.all([getDashboardStats(), getRecentOrders()])
      stats.value = s
      recentOrders.value = orders
    } catch (err: any) {
      error.value = err?.message ?? 'Failed to load dashboard'
    } finally {
      loading.value = false
    }
  }

  return { loading, error, stats, recentOrders, fetchDashboardData }
}
