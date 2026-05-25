<template>
  <section class="table-section">
    <div class="table-head">
      <div>
        <h2>
          <i class="fa-solid fa-clock-rotate-left title-icon"></i>
          Recent Orders
        </h2>
        <p>Latest activity across your store</p>
      </div>
      <RouterLink to="/admin/orders" class="view-all">
        View all <i class="fa-solid fa-arrow-right"></i>
      </RouterLink>
    </div>

    <div class="table-card">
      <div v-if="loading" class="table-empty">
        <i class="fa-solid fa-spinner fa-spin"></i> Loading…
      </div>
      <div v-else-if="!orders.length" class="table-empty">
        <i class="fa-regular fa-folder-open"></i> No orders yet.
      </div>
      <table v-else>
        <thead>
          <tr>
            <th><i class="fa-solid fa-hashtag col-icon"></i> Order</th>
            <th><i class="fa-solid fa-user col-icon"></i> Customer</th>
            <th><i class="fa-solid fa-box col-icon"></i> Product</th>
            <th><i class="fa-regular fa-calendar col-icon"></i> Date</th>
            <th><i class="fa-solid fa-dollar-sign col-icon"></i> Amount</th>
            <th><i class="fa-solid fa-circle-half-stroke col-icon"></i> Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="o in orders" :key="o.id">
            <td class="order-id">#{{ o.id }}</td>
            <td>
              <div class="customer-cell">
                <span class="avatar">{{ (o.username ?? '?')[0].toUpperCase() }}</span>
                {{ o.username ?? '—' }}
              </div>
            </td>
            <td>{{ o.items?.[0]?.productName ?? '—' }}</td>
            <td>{{ formatDate(o.orderDate) }}</td>
            <td class="amount">${{ Number(o.totalAmount).toFixed(2) }}</td>
            <td>
              <span class="pill" :class="statusClass(o.status)">
                <i :class="statusIcon(o.status)"></i>
                {{ o.status }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
import type { DashboardOrder } from '@/services/adminDashboardService'

defineProps<{
  orders: DashboardOrder[]
  loading?: boolean
}>()

function formatDate(d: string) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function statusClass(status: string) {
  const map: Record<string, string> = {
    PLACED: 'blue', PROCESSING: 'blue', SHIPPED: 'amber',
    DELIVERED: 'green', CANCELLED: 'red', REFUNDED: 'gray',
    RETURN_REQUESTED: 'amber',
  }
  return map[status] ?? 'gray'
}

function statusIcon(status: string) {
  const map: Record<string, string> = {
    PLACED: 'fa-solid fa-circle-dot',
    PROCESSING: 'fa-solid fa-rotate',
    SHIPPED: 'fa-solid fa-truck',
    DELIVERED: 'fa-solid fa-circle-check',
    CANCELLED: 'fa-solid fa-circle-xmark',
    REFUNDED: 'fa-solid fa-rotate-left',
    RETURN_REQUESTED: 'fa-solid fa-arrow-rotate-left',
  }
  return map[status] ?? 'fa-solid fa-circle'
}
</script>

<style scoped>
.table-section {
  font-family: 'Inter', Arial, sans-serif;
}

.table-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 14px;
}

h2 {
  margin: 0 0 4px;
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: -0.02em;
  display: flex;
  align-items: center;
  gap: 8px;
}

.title-icon { color: #94a3b8; font-size: 15px; }

.table-head p {
  margin: 0;
  font-size: 13px;
  color: #94a3b8;
}

.view-all {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: #513B3C;
  text-decoration: none;
}

.view-all:hover { text-decoration: underline; }

.table-card {
  background: #fff;
  border-radius: 16px;
  border: 1px solid #e9eef5;
  overflow: hidden;
}

.table-empty {
  padding: 48px;
  text-align: center;
  color: #94a3b8;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

table {
  width: 100%;
  border-collapse: collapse;
  min-width: 760px;
}

thead th {
  text-align: left;
  font-size: 11px;
  letter-spacing: 0.08em;
  color: #94a3b8;
  padding: 14px 18px 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.col-icon { margin-right: 4px; font-size: 10px; }

tbody tr { border-top: 1px solid #f1f5f9; }
tbody tr:hover { background: #fafbfc; }

tbody td {
  padding: 13px 18px;
  font-size: 13.5px;
  color: #334155;
  vertical-align: middle;
}

.order-id { font-weight: 600; color: #0f172a; font-size: 13px; }

.customer-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #e0e7ff;
  color: #4338ca;
  display: grid;
  place-items: center;
  font-size: 11px;
  font-weight: 700;
  flex-shrink: 0;
}

.amount { font-weight: 600; color: #0f172a; }

.pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 22px;
  padding: 0 10px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.pill.blue   { background: #eff6ff; color: #2563eb; }
.pill.green  { background: #f0fdf4; color: #16a34a; }
.pill.amber  { background: #fffbeb; color: #d97706; }
.pill.red    { background: #fff1f2; color: #be123c; }
.pill.gray   { background: #f8fafc; color: #64748b; }
</style>
