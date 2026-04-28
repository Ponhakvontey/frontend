import { ref } from 'vue'
import { getAdminDashboardData } from '@/services/adminDashboardService'

export function useAdminDashboard() {
  const loading = ref(false)
  const error = ref<string | null>(null)

  const adminName = ref('')
  const stats = ref({
    products: 0,
    totalOrders: 0,
    users: 0,
    totalRevenue: 0,
  })
  const transactions = ref<any[]>([])

  async function fetchDashboardData() {
    loading.value = true
    error.value = null

    try {
      const data = await getAdminDashboardData()
      adminName.value = data.adminName
      stats.value = data.stats
      transactions.value = data.transactions
    } catch (err: any) {
      error.value = err?.message || 'Failed to load dashboard data'
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    adminName,
    stats,
    transactions,
    fetchDashboardData,
  }
}
