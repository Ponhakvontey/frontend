<template>
  <div class="admin-page">
    <AdminSidebar />

    <div class="main-shell">
      <AdminTopbar />

      <main class="orders-main">
        <section class="orders-header">
          <div class="orders-header-left">
            <p class="eyebrow">OPERATIONS MANAGER</p>
            <h1>Order Fulfillment</h1>
            <p class="header-text">
              Manage and curate your customer transactions with surgical precision. View status,
              track shipments, and oversee the global commerce flow.
            </p>
          </div>

          <div class="volume-card">
            <span class="volume-label">TOTAL VOLUME</span>
            <strong class="volume-value">{{ formatPrice(totalVolume) }}</strong>
          </div>
        </section>

        <section class="toolbar">
          <div class="toolbar-tabs">
            <button
              v-for="tab in tabs"
              :key="tab.value"
              type="button"
              class="tab-btn"
              :class="{ active: activeTab === tab.value }"
              @click="setActiveTab(tab.value)"
            >
              {{ tab.label }}
            </button>
          </div>

          <div class="toolbar-actions">
            <button type="button" class="filter-btn">Advanced Filters</button>
            <button type="button" class="print-btn">Print Shipping Labels</button>
          </div>
        </section>

        <section class="orders-table-card">
          <div class="table-scroll">
            <table class="orders-table">
              <thead>
                <tr>
                  <th>ORDER ID</th>
                  <th>CUSTOMER</th>
                  <th>DATE</th>
                  <th>TOTAL AMOUNT</th>
                  <th>FULFILLMENT STATUS</th>
                </tr>
              </thead>

              <tbody>
                <tr v-for="order in paginatedOrders" :key="order.id">
                  <td class="order-id">{{ order.id }}</td>

                  <td>
                    <div class="customer-cell">
                      <img
                        v-if="order.avatar"
                        :src="order.avatar"
                        :alt="order.customer"
                        class="customer-avatar"
                      />
                      <div v-else class="customer-avatar initials">
                        {{ order.initials }}
                      </div>

                      <div class="customer-meta">
                        <p class="customer-name">{{ order.customer }}</p>
                        <p class="customer-email">{{ order.email }}</p>
                      </div>
                    </div>
                  </td>

                  <td class="order-date">{{ order.date }}</td>
                  <td class="order-total">{{ formatPrice(order.total) }}</td>

                  <td>
                    <span class="status-pill" :class="order.statusClass">
                      {{ order.status }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="table-footer">
            <p class="results-text">
              Showing {{ startItem }}-{{ endItem }} of {{ filteredOrders.length }} orders
            </p>

            <div class="pagination">
              <button
                type="button"
                class="page-arrow"
                :disabled="currentPage === 1"
                @click="currentPage--"
              >
                ‹
              </button>

              <button
                v-for="page in totalPages"
                :key="page"
                type="button"
                class="page-number"
                :class="{ active: currentPage === page }"
                @click="currentPage = page"
              >
                {{ page }}
              </button>

              <button
                type="button"
                class="page-arrow"
                :disabled="currentPage === totalPages"
                @click="currentPage++"
              ></button>
            </div>
          </div>
        </section>
        <button type="button" class="new-order-btn">+ New Order</button>
      </main>

      <AdminFooter />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import AdminSidebar from '@/components/admin/layout/AdminSidebar.vue'
import AdminTopbar from '@/components/admin/layout/AdminTopbar.vue'
import AdminFooter from '@/components/admin/layout/AdminFooter.vue'
import { readStorage } from '@/utils/storage'

interface OrderRow {
  id: string
  customer: string
  email: string
  date: string
  total: number
  status: string
  statusClass: 'processing' | 'shipped' | 'delivered' | 'cancelled'
  initials: string
  avatar?: string
}

const tabs = [
  { label: 'All Orders', value: 'all' },
  { label: 'Processing', value: 'processing' },
  { label: 'Shipped', value: 'shipped' },
  { label: 'Delivered', value: 'delivered' },
  { label: 'Cancelled', value: 'cancelled' },
]

const activeTab = ref('all')
const currentPage = ref(1)
const pageSize = 4

const mockOrders: OrderRow[] = [
  {
    id: 'P-2941-X',
    customer: "Julian D'Amico",
    email: 'julian.d@example.com',
    date: 'Oct 24, 2023',
    total: 1240.5,
    status: 'PROCESSING',
    statusClass: 'processing',
    initials: 'JD',
  },
  {
    id: 'P-2852-B',
    customer: 'Elena Moretti',
    email: 'e.moretti@webmail.it',
    date: 'Oct 23, 2023',
    total: 845,
    status: 'SHIPPED',
    statusClass: 'shipped',
    initials: 'EM',
  },
  {
    id: 'P-2719-A',
    customer: 'Soren Kierk',
    email: 'soren.k@domain.co',
    date: 'Oct 22, 2023',
    total: 3102.15,
    status: 'DELIVERED',
    statusClass: 'delivered',
    initials: 'SK',
  },
  {
    id: 'P-2605-F',
    customer: 'Maya Lin',
    email: 'maya@studio.art',
    date: 'Oct 21, 2023',
    total: 420,
    status: 'CANCELLED',
    statusClass: 'cancelled',
    initials: 'ML',
  },
]

function normalizeStatus(value: string) {
  const status = (value || '').toUpperCase()

  if (status.includes('DELIVER')) {
    return { label: 'DELIVERED', className: 'delivered' as const }
  }
  if (status.includes('SHIP')) {
    return { label: 'SHIPPED', className: 'shipped' as const }
  }
  if (status.includes('CANCEL')) {
    return { label: 'CANCELLED', className: 'cancelled' as const }
  }
  return { label: 'PROCESSING', className: 'processing' as const }
}

const storedOrders = readStorage<any[]>('orders', [])

const orders = computed<OrderRow[]>(() => {
  if (!storedOrders.length) return mockOrders

  return storedOrders.map((order, index) => {
    const firstName = order.shippingInfo?.firstName || 'Unknown'
    const lastName = order.shippingInfo?.lastName || 'Customer'
    const normalized = normalizeStatus(order.status || 'PROCESSING')

    return {
      id: order.orderNumber || `P-${2900 + index}-X`,
      customer: `${firstName} ${lastName}`.trim(),
      email: order.email || `${firstName.toLowerCase()}@example.com`,
      date: order.placedDate || 'Oct 24, 2023',
      total: Number(order.total || 0),
      status: normalized.label,
      statusClass: normalized.className,
      initials: `${firstName[0] || 'U'}${lastName[0] || 'S'}`,
      avatar: order.items?.[0]?.image || '',
    }
  })
})

const filteredOrders = computed(() => {
  if (activeTab.value === 'all') return orders.value
  if (activeTab.value === 'processing') {
    return orders.value.filter((order) => order.statusClass === 'processing')
  }
  if (activeTab.value === 'shipped') {
    return orders.value.filter((order) => order.statusClass === 'shipped')
  }
  if (activeTab.value === 'delivered') {
    return orders.value.filter((order) => order.statusClass === 'delivered')
  }
  if (activeTab.value === 'cancelled') {
    return orders.value.filter((order) => order.statusClass === 'cancelled')
  }
  return orders.value
})

const totalPages = computed(() => {
  return Math.max(1, Math.ceil(filteredOrders.value.length / pageSize))
})

const paginatedOrders = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredOrders.value.slice(start, start + pageSize)
})

const startItem = computed(() => {
  if (!filteredOrders.value.length) return 0
  return (currentPage.value - 1) * pageSize + 1
})

const endItem = computed(() => {
  return Math.min(currentPage.value * pageSize, filteredOrders.value.length)
})

const totalVolume = computed(() => {
  return filteredOrders.value.reduce((sum, order) => sum + order.total, 0)
})

function setActiveTab(tab: string) {
  activeTab.value = tab
  currentPage.value = 1
}

watch(totalPages, (value) => {
  if (currentPage.value > value) {
    currentPage.value = value
  }
})

function formatPrice(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value)
}
</script>

<style scoped>
.admin-page {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 250px minmax(0, 1fr);
  min-width: 1280px;
  background: #f6f8fb;
}

.main-shell {
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 100vh;
}

.orders-main {
  position: relative;
  padding: 22px 28px 34px;
  background: #f6f8fb;
  min-width: 0;
}

.orders-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
  margin-bottom: 22px;
}

.orders-header-left {
  max-width: 560px;
}

.eyebrow {
  margin: 0 0 8px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.22em;
  color: #3563e9;
}

.orders-header h1 {
  margin: 0 0 10px;
  font-size: 54px;
  line-height: 1;
  letter-spacing: -0.05em;
  color: #191f2f;
}

.header-text {
  margin: 0;
  max-width: 470px;
  font-size: 14px;
  line-height: 1.55;
  color: #5f6674;
}

.volume-card {
  min-width: 132px;
  padding: 18px 20px;
  border-radius: 18px;
  background: #ffffff;
  text-align: center;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.05);
}

.volume-label {
  display: block;
  margin-bottom: 12px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.16em;
  color: #98a2b3;
}

.volume-value {
  font-size: 20px;
  font-weight: 800;
  color: #1d2435;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 18px;
  margin-bottom: 14px;
}

.toolbar-tabs {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.tab-btn,
.filter-btn,
.print-btn {
  height: 32px;
  border: 0;
  border-radius: 10px;
  padding: 0 14px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
}

.tab-btn {
  background: #ffffff;
  color: #5f6674;
}

.tab-btn.active {
  background: #edf3ff;
  color: #3563e9;
}

.toolbar-actions {
  display: flex;
  gap: 10px;
}

.filter-btn {
  background: #ffffff;
  color: #344054;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.04);
}

.print-btn {
  background: #3563e9;
  color: #fff;
  box-shadow: 0 8px 18px rgba(53, 99, 233, 0.22);
}

.orders-table-card {
  background: #ffffff;
  border-radius: 18px;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.05);
  overflow: hidden;
  margin-bottom: 28px;
}

.orders-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 760px;
}

.orders-table thead th {
  text-align: left;
  padding: 18px 20px 12px;
  font-size: 10px;
  letter-spacing: 0.16em;
  color: #98a2b3;
  font-weight: 700;
}

.orders-table tbody td {
  padding: 16px 20px;
  border-top: 1px solid #eef2f6;
  font-size: 13px;
  color: #4b5563;
}

.order-id {
  color: #3563e9;
  font-weight: 700;
}

.customer-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.customer-avatar {
  width: 30px;
  height: 30px;
  border-radius: 999px;
  object-fit: cover;
  background: #e8efff;
}

.customer-avatar.initials {
  display: grid;
  place-items: center;
  font-size: 11px;
  font-weight: 700;
  color: #3563e9;
}

.customer-meta {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.customer-name {
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  color: #1f2937;
}

.customer-email {
  margin: 0;
  font-size: 10px;
  color: #98a2b3;
}

.order-date {
  color: #667085;
}

.order-total {
  font-weight: 700;
  color: #1d2435;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  height: 20px;
  padding: 0 10px;
  border-radius: 999px;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.12em;
}

.status-pill.processing {
  background: #eef3ff;
  color: #3563e9;
}

.status-pill.shipped {
  background: #f4ebff;
  color: #9b59ff;
}

.status-pill.delivered {
  background: #eaf8ef;
  color: #16a34a;
}

.status-pill.cancelled {
  background: #ffe8e8;
  color: #ef4444;
}

.table-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-top: 1px solid #eef2f6;
}

.table-scroll {
  overflow-x: auto;
}

.results-text {
  margin: 0;
  font-size: 11px;
  color: #667085;
}

.pagination {
  display: flex;
  align-items: center;
  gap: 8px;
}

.page-arrow,
.page-number {
  width: 22px;
  height: 22px;
  border: 0;
  border-radius: 999px;
  background: transparent;
  font-size: 11px;
  color: #667085;
  cursor: pointer;
}

.page-number.active {
  background: #3563e9;
  color: #fff;
}

.page-arrow:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.bottom-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 220px;
  gap: 16px;
  align-items: stretch;
}

.forecast-card {
  border-radius: 20px;
  background: linear-gradient(135deg, #3563e9 0%, #2350d8 100%);
  min-height: 136px;
  padding: 24px 20px;
  display: flex;
  justify-content: space-between;
  overflow: hidden;
  position: relative;
}

.forecast-content {
  position: relative;
  z-index: 2;
  max-width: 350px;
}

.forecast-card h2 {
  margin: 0 0 8px;
  font-size: 29px;
  line-height: 1.05;
  color: #ffffff;
}

.forecast-card p {
  margin: 0 0 18px;
  font-size: 12px;
  line-height: 1.45;
  color: rgba(255, 255, 255, 0.8);
}

.forecast-btn {
  height: 34px;
  border: 0;
  border-radius: 999px;
  padding: 0 18px;
  background: #ffffff;
  color: #3563e9;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  cursor: pointer;
}

.forecast-graphic {
  position: absolute;
  right: -10px;
  bottom: -16px;
  width: 150px;
  height: 150px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0) 70%);
}

.bulk-card {
  border-radius: 18px;
  background: #ffffff;
  padding: 22px 18px;
  text-align: center;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.05);
}

.bulk-icon {
  width: 42px;
  height: 42px;
  margin: 0 auto 14px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  background: #eef3ff;
  color: #3563e9;
  font-size: 20px;
}

.bulk-card h3 {
  margin: 0 0 10px;
  font-size: 24px;
  line-height: 1.05;
  color: #1d2435;
}

.bulk-card p {
  margin: 0;
  font-size: 12px;
  line-height: 1.5;
  color: #667085;
}

.new-order-btn {
  position: fixed;
  right: 34px;
  bottom: 34px;
  height: 46px;
  border: 0;
  border-radius: 999px;
  padding: 0 18px;
  background: #3563e9;
  color: #ffffff;
  font-size: 14px;
  font-weight: 700;
  box-shadow: 0 12px 24px rgba(53, 99, 233, 0.28);
  cursor: pointer;
}
</style>
