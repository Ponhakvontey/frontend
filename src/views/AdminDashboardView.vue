<template>
  <div class="admin-page">
    <AdminSidebar />

    <div class="main-shell">
      <AdminTopbar />

      <main class="dashboard-main">
        <div v-if="error" class="error-banner">{{ error }}</div>

        <DashboardHero />
        <StatsOverview :stats="stats" :recent-count="recentOrders.length" />
        <RecentTransactions :orders="recentOrders" :loading="loading" />
      </main>

      <AdminFooter />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import AdminSidebar from '@/components/admin/layout/AdminSidebar.vue'
import AdminTopbar from '@/components/admin/layout/AdminTopbar.vue'
import AdminFooter from '@/components/admin/layout/AdminFooter.vue'
import DashboardHero from '@/components/admin/dashboard/DashboardHero.vue'
import StatsOverview from '@/components/admin/dashboard/StatsOverview.vue'
import RecentTransactions from '@/components/admin/dashboard/RecentTransactions.vue'
import { useAdminDashboard } from '@/composables/useAdminDashboard'

const { loading, error, stats, recentOrders, fetchDashboardData } = useAdminDashboard()

onMounted(fetchDashboardData)
</script>

<style scoped>
.admin-page {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 230px minmax(0, 1fr);
  background: #f8fafc;
}

.main-shell {
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 100vh;
}

.dashboard-main {
  flex: 1;
  padding: 28px 32px;
  overflow-x: auto;
}

.error-banner {
  background: #fff1f2;
  border: 1px solid #fecaca;
  color: #be123c;
  border-radius: 10px;
  padding: 12px 16px;
  font-size: 13px;
  margin-bottom: 20px;
}

@media (max-width: 768px) {
  .admin-page { grid-template-columns: 1fr !important; }
  .page-body  { padding: 16px !important; }
}
</style>