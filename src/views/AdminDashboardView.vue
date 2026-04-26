<template>
  <div class="admin-page">
    <AdminSidebar />

    <div class="main-shell">
      <AdminTopbar />

      <main class="dashboard-main">
        <DashboardHero />
        <StatsOverview />
        <RecentTransactions />
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
</script>

<style scoped>
.admin-page {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 250px 1fr;
  background: #f6f8fb;
}

.main-shell {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.dashboard-main {
  padding: 28px;
}

@media (max-width: 1200px) {
  .admin-page {
    grid-template-columns: 1fr;
  }
}
</style>
