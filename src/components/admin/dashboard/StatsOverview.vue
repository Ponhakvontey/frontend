<template>
  <section class="stats-grid">

    <div class="stat-card">
      <div class="stat-icon blue">
        <i class="fa-solid fa-users"></i>
      </div>
      <p class="stat-label">Total Users</p>
      <h3 class="stat-value">{{ stats.totalUsers.toLocaleString() }}</h3>
    </div>

    <div class="stat-card">
      <div class="stat-icon wine">
        <i class="fa-solid fa-receipt"></i>
      </div>
      <p class="stat-label">Total Orders</p>
      <h3 class="stat-value">{{ stats.totalOrders.toLocaleString() }}</h3>
    </div>

    <div class="stat-card">
      <div class="stat-icon green">
        <i class="fa-solid fa-box-archive"></i>
      </div>
      <p class="stat-label">Products</p>
      <h3 class="stat-value">{{ stats.totalProducts.toLocaleString() }}</h3>
    </div>

    <div class="stat-card">
      <div class="stat-icon amber">
        <i class="fa-solid fa-dollar-sign"></i>
      </div>
      <p class="stat-label">Recent Revenue</p>
      <h3 class="stat-value">${{ stats.recentRevenue.toFixed(2) }}</h3>
      <p class="stat-sub">last {{ recentCount }} orders</p>
    </div>

  </section>
</template>

<script setup lang="ts">
import type { DashboardStats } from '@/services/adminDashboardService'

const props = defineProps<{
  stats: DashboardStats
  recentCount?: number
}>()
</script>

<style scoped>
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 28px;
  font-family: 'Inter', Arial, sans-serif;
}

.stat-card {
  background: #fff;
  border-radius: 16px;
  border: 1px solid #e9eef5;
  padding: 20px;
}

.stat-icon {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  margin-bottom: 14px;
  font-size: 15px;
}

.stat-icon.blue  { background: #eff6ff; color: #2563eb; }
.stat-icon.wine  { background: #fff1f2; color: #be123c; }
.stat-icon.green { background: #f0fdf4; color: #16a34a; }
.stat-icon.amber { background: #fffbeb; color: #d97706; }

.stat-label {
  margin: 0 0 6px;
  font-size: 11px;
  color: #94a3b8;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.stat-value {
  margin: 0;
  font-size: 32px;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: -0.03em;
  line-height: 1;
}

.stat-sub {
  margin: 6px 0 0;
  font-size: 11px;
  color: #cbd5e1;
}
</style>
