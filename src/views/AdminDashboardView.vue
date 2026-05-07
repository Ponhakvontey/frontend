<template>
  <div class="admin-page">
    <AdminSidebar />

    <div class="main-shell">
      <AdminTopbar />

      <main class="dashboard-main">
        <DashboardHero />
        <StatsOverview />
        <RecentTransactions :rows="transactions" />
      </main>

      <AdminFooter />
    </div>
  </div>
</template>

<script setup lang="ts">
import AdminSidebar from '@/components/admin/layout/AdminSidebar.vue'
import AdminTopbar from '@/components/admin/layout/AdminTopbar.vue'
import AdminFooter from '@/components/admin/layout/AdminFooter.vue'
import DashboardHero from '@/components/admin/dashboard/DashboardHero.vue'
import StatsOverview from '@/components/admin/dashboard/StatsOverview.vue'
import RecentTransactions from '@/components/admin/dashboard/RecentTransactions.vue'
import { onMounted } from 'vue'
import { useAdminDashboard } from '@/composables/useAdminDashboard'

const { transactions, fetchDashboardData } = useAdminDashboard()

onMounted(() => {
  fetchDashboardData()
})
</script>

<style scoped>
.admin-page {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 250px minmax(0, 1fr);
  min-width: 1180px;
  background: #f6f8fb;
}

.main-shell {
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 100vh;
}

.dashboard-main {
  padding: 28px;
}
</style>
