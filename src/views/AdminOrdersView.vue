<template>
  <div class="admin-page">
    <AdminSidebar />
    <div class="main-shell">
      <AdminTopbar />

      <main class="page-body">

        <!-- ── Header ── -->
        <div class="page-header">
          <div>
            <h1><i class="fa-solid fa-receipt"></i> Orders</h1>
            <p class="sub">Manage, track and update all customer orders</p>
          </div>
          <div class="header-stats">
            <div class="stat-chip">
              <i class="fa-solid fa-box-open"></i>
              <span>{{ orders.length }} total</span>
            </div>
            <div class="stat-chip green">
              <i class="fa-solid fa-dollar-sign"></i>
              <span>{{ formatPrice(totalRevenue) }}</span>
            </div>
          </div>
        </div>

        <!-- ── Toolbar ── -->
        <div class="toolbar">
          <div class="tabs">
            <button
              v-for="tab in tabs" :key="tab.value" type="button"
              class="tab" :class="{ active: activeTab === tab.value }"
              @click="setTab(tab.value)"
            >
              <i :class="tab.icon"></i> {{ tab.label }}
              <span class="badge">{{ countByStatus(tab.value) }}</span>
            </button>
          </div>
          <label class="search">
            <i class="fa-solid fa-magnifying-glass"></i>
            <input v-model="search" type="search" placeholder="Search order ID or customer…" />
          </label>
        </div>

        <!-- ── Table ── -->
        <div class="card">
          <div v-if="loading" class="empty"><i class="fa-solid fa-spinner fa-spin"></i> Loading…</div>
          <div v-else-if="error" class="empty err"><i class="fa-solid fa-triangle-exclamation"></i> {{ error }}</div>
          <div v-else-if="!paginated.length" class="empty"><i class="fa-regular fa-folder-open"></i> No orders found.</div>

          <template v-else>
            <div class="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th><i class="fa-solid fa-hashtag ti"></i> Order</th>
                    <th><i class="fa-solid fa-user ti"></i> Customer</th>
                    <th><i class="fa-solid fa-box ti"></i> Items</th>
                    <th><i class="fa-regular fa-calendar ti"></i> Date</th>
                    <th><i class="fa-solid fa-dollar-sign ti"></i> Amount</th>
                    <th><i class="fa-solid fa-circle-half-stroke ti"></i> Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="o in paginated" :key="o.id" :class="{ expanded: expandedId === o.id }">
                    <td class="oid" @click="toggleExpand(o.id)">#{{ o.id }}</td>
                    <td>
                      <div class="user-cell">
                        <div class="avatar">{{ initial(o.username) }}</div>
                        <span>{{ o.username }}</span>
                      </div>
                    </td>
                    <td class="items-cell">
                      <span v-if="o.items?.length">
                        {{ o.items[0]?.productName ?? 'Item' }}
                        <em v-if="o.items.length > 1"> +{{ o.items.length - 1 }} more</em>
                      </span>
                      <span v-else class="muted">—</span>
                    </td>
                    <td class="muted">{{ fmtDate(o.orderDate) }}</td>
                    <td class="bold">{{ formatPrice(Number(o.totalAmount)) }}</td>
                    <td>
                      <span class="pill" :class="pillClass(o.status)">
                        <i :class="pillIcon(o.status)"></i> {{ o.status }}
                      </span>
                    </td>
                    <td>
                      <div class="actions">
                        <!-- Return management -->
                        <template v-if="o.status === 'RETURN_REQUESTED'">
                          <button class="btn green" @click="approveReturn(o.id)">
                            <i class="fa-solid fa-check"></i> Approve
                          </button>
                          <button class="btn red" @click="denyReturn(o.id)">
                            <i class="fa-solid fa-xmark"></i> Deny
                          </button>
                        </template>
                        <!-- Status update -->
                        <template v-else-if="nextStatuses(o.status).length">
                          <select class="status-select" @change="updateStatus(o.id, ($event.target as HTMLSelectElement).value)">
                            <option value="">Update…</option>
                            <option v-for="s in nextStatuses(o.status)" :key="s" :value="s">{{ s }}</option>
                          </select>
                        </template>
                        <span v-else class="muted">—</span>
                      </div>
                    </td>
                  </tr>
                  <!-- Expanded detail row -->
                  <tr v-if="expandedId && paginated.find(o => o.id === expandedId)" class="detail-row">
                    <td colspan="7">
                      <div class="detail-panel">
                        <div v-for="item in paginated.find(o => o.id === expandedId)?.items" :key="item.id" class="detail-item">
                          <img v-if="item.productImageUrl" :src="item.productImageUrl" :alt="item.productName" class="detail-img" />
                          <span>{{ item.productName }}</span>
                          <span class="muted">× {{ item.quantity }}</span>
                          <span class="bold">{{ formatPrice(Number(item.totalPrice)) }}</span>
                        </div>
                        <div class="detail-meta">
                          <span><i class="fa-solid fa-location-dot"></i> {{ paginated.find(o => o.id === expandedId)?.shippingAddress || 'No address' }}</span>
                          <span v-if="paginated.find(o => o.id === expandedId)?.cancellationReason">
                            <i class="fa-solid fa-ban"></i> {{ paginated.find(o => o.id === expandedId)?.cancellationReason }}
                          </span>
                        </div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Footer -->
            <div class="tfoot">
              <span class="muted">Showing {{ start }}–{{ end }} of {{ filtered.length }} orders</span>
              <div class="pages">
                <button class="pg" :disabled="page === 1" @click="page--"><i class="fa-solid fa-chevron-left"></i></button>
                <button v-for="p in totalPages" :key="p" class="pg" :class="{ active: page === p }" @click="page = p">{{ p }}</button>
                <button class="pg" :disabled="page === totalPages" @click="page++"><i class="fa-solid fa-chevron-right"></i></button>
              </div>
            </div>
          </template>
        </div>

      </main>
      <AdminFooter />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import AdminSidebar from '@/components/admin/layout/AdminSidebar.vue'
import AdminTopbar from '@/components/admin/layout/AdminTopbar.vue'
import AdminFooter from '@/components/admin/layout/AdminFooter.vue'
import { api } from '@/services/apiClient'

interface OrderItem { id: number; productId: number; productName: string; productImageUrl: string; quantity: number; price: number; totalPrice: number }
interface OrderDTO { id: number; orderDate: string; status: string; totalAmount: number; shippingAddress: string; cancellationReason: string; username: string; items: OrderItem[] }
interface Paged<T> { content: T[]; totalElements: number }

const loading = ref(false)
const error   = ref<string | null>(null)
const orders  = ref<OrderDTO[]>([])
const activeTab = ref('all')
const search    = ref('')
const page      = ref(1)
const expandedId = ref<number | null>(null)
const PER_PAGE  = 10

const tabs = [
  { label: 'All',              value: 'all',              icon: 'fa-solid fa-list' },
  { label: 'Pending',          value: 'PENDING',          icon: 'fa-solid fa-clock' },
  { label: 'Paid',             value: 'PAID',             icon: 'fa-solid fa-circle-check' },
  { label: 'Shipped',          value: 'SHIPPED',          icon: 'fa-solid fa-truck' },
  { label: 'Delivered',        value: 'DELIVERED',        icon: 'fa-solid fa-circle-check' },
  { label: 'Cancelled',        value: 'CANCELLED',        icon: 'fa-solid fa-circle-xmark' },
  { label: 'Return Requested', value: 'RETURN_REQUESTED', icon: 'fa-solid fa-arrow-rotate-left' },
  { label: 'Refunded',         value: 'REFUNDED',         icon: 'fa-solid fa-rotate-left' },
]

// What statuses an admin can move an order to
const TRANSITIONS: Record<string, string[]> = {
  PENDING: ['PAID', 'CANCELLED'],
  PAID:    ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED'],
}

onMounted(load)

async function load() {
  loading.value = true; error.value = null
  try {
    const res = await api.get<Paged<OrderDTO>>('/api/admin/orders?page=0&size=500')
    orders.value = res.content ?? []
  } catch (e: any) {
    error.value = e?.message ?? 'Failed to load orders'
  } finally {
    loading.value = false
  }
}

const filtered = computed(() => {
  let list = orders.value
  if (activeTab.value !== 'all') list = list.filter(o => o.status === activeTab.value)
  const q = search.value.trim().toLowerCase()
  if (q) list = list.filter(o => String(o.id).includes(q) || (o.username ?? '').toLowerCase().includes(q))
  return list
})

const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / PER_PAGE)))
const start      = computed(() => filtered.value.length ? (page.value - 1) * PER_PAGE + 1 : 0)
const end        = computed(() => Math.min(page.value * PER_PAGE, filtered.value.length))
const paginated  = computed(() => filtered.value.slice((page.value - 1) * PER_PAGE, page.value * PER_PAGE))
const totalRevenue = computed(() => orders.value.reduce((s, o) => s + Number(o.totalAmount ?? 0), 0))

watch(totalPages, v => { if (page.value > v) page.value = v })

function setTab(v: string) { activeTab.value = v; page.value = 1 }
function countByStatus(v: string) { return v === 'all' ? orders.value.length : orders.value.filter(o => o.status === v).length }
function toggleExpand(id: number) { expandedId.value = expandedId.value === id ? null : id }
function nextStatuses(status: string) { return TRANSITIONS[status] ?? [] }

async function updateStatus(id: number, status: string) {
  if (!status) return
  try {
    const updated = await api.put<OrderDTO>(`/api/orders/${id}/status`, { status })
    orders.value = orders.value.map(o => o.id === id ? { ...o, status: updated.status } : o)
  } catch (e: any) { alert(e?.message ?? 'Failed to update status') }
}

async function approveReturn(id: number) {
  try {
    const updated = await api.post<OrderDTO>(`/api/admin/orders/${id}/approve-return`, {})
    orders.value = orders.value.map(o => o.id === id ? { ...o, status: updated.status } : o)
  } catch (e: any) { alert(e?.message ?? 'Failed') }
}

async function denyReturn(id: number) {
  try {
    const updated = await api.post<OrderDTO>(`/api/admin/orders/${id}/deny-return`, {})
    orders.value = orders.value.map(o => o.id === id ? { ...o, status: updated.status } : o)
  } catch (e: any) { alert(e?.message ?? 'Failed') }
}

// helpers
function initial(u: string) { return (u ?? '?').charAt(0).toUpperCase() }
function fmtDate(d: string) { return d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—' }
function formatPrice(v: number) { return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(v) }

function pillClass(s: string) {
  return { PENDING:'amber', PAID:'blue', SHIPPED:'purple', DELIVERED:'green', CANCELLED:'red', REFUNDED:'gray', RETURN_REQUESTED:'amber' }[s] ?? 'gray'
}
function pillIcon(s: string) {
  return { PENDING:'fa-solid fa-clock', PAID:'fa-solid fa-circle-check', SHIPPED:'fa-solid fa-truck', DELIVERED:'fa-solid fa-circle-check', CANCELLED:'fa-solid fa-circle-xmark', REFUNDED:'fa-solid fa-rotate-left', RETURN_REQUESTED:'fa-solid fa-arrow-rotate-left' }[s] ?? 'fa-solid fa-circle'
}
</script>

<style scoped>
.admin-page, .admin-page *{ box-sizing:border-box; }
.admin-page :not(i){ font-family:Helvetica,Arial,sans-serif; }
.admin-page{ min-height:100vh; display:grid; grid-template-columns:230px minmax(0,1fr); background:#f8fafc; }
.main-shell{ display:flex; flex-direction:column; min-height:100vh; }
.page-body{ flex:1; padding:28px 32px; }

/* Header */
.page-header{ display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:22px; gap:16px; }
h1{ margin:0 0 4px; font-size:26px; font-weight:800; color:#0f172a; letter-spacing:-0.03em; display:flex; align-items:center; gap:10px; }
h1 i{ color:#000000; }
.sub{ margin:0; font-size:13px; color:#94a3b8; }
.header-stats{ display:flex; gap:10px; }
.stat-chip{ display:flex; align-items:center; gap:6px; height:34px; padding:0 14px; border-radius:10px; background:#fff; border:1px solid #e2e8f0; font-size:13px; font-weight:600; color:#334155; }
.stat-chip.green{ background:#f0fdf4; border-color:#bbf7d0; color:#16a34a; }

/* Toolbar */
.toolbar{ display:flex; justify-content:space-between; align-items:center; gap:12px; margin-bottom:14px; flex-wrap:wrap; }
.tabs{ display:flex; gap:5px; flex-wrap:wrap; }
.tab{ display:inline-flex; align-items:center; gap:5px; height:32px; padding:0 12px; border:1px solid #e2e8f0; border-radius:8px; background:#fff; color:#64748b; font-size:12px; font-weight:500; cursor:pointer; transition:all .15s; font-family:Helvetica,Arial,sans-serif; }
.tab:hover{ background:#f8fafc; color:#0f172a; }
.tab.active{ background:#f0eaeb; color:#000000; border-color:#e2c8c9; font-weight:600; }
.badge{ background:#e2e8f0; color:#64748b; border-radius:999px; padding:1px 6px; font-size:10px; font-weight:700; margin-left:2px; }
.tab.active .badge{ background:#000000; color:#fff; }
.search{ display:flex; align-items:center; gap:8px; height:32px; background:#fff; border:1px solid #e2e8f0; border-radius:8px; padding:0 12px; color:#94a3b8; min-width:220px; }
.search input{ border:none; outline:none; background:transparent; font-size:13px; color:#334155; font-family:Helvetica,Arial,sans-serif; width:100%; }

/* Card */
.card{ background:#fff; border-radius:16px; border:1px solid #e9eef5; overflow:hidden; }
.empty{ padding:52px; text-align:center; color:#94a3b8; font-size:14px; display:flex; align-items:center; justify-content:center; gap:8px; }
.empty.err{ color:#be123c; }
.table-wrap{ overflow-x:auto; }
table{ width:100%; border-collapse:collapse; min-width:900px; }
thead th{ text-align:left; padding:13px 16px 10px; font-size:11px; letter-spacing:.08em; color:#94a3b8; font-weight:600; text-transform:uppercase; }
.ti{ margin-right:3px; font-size:10px; }
tbody tr{ border-top:1px solid #f1f5f9; transition:background .1s; }
tbody tr:hover{ background:#fafbfc; }
tbody tr.expanded{ background:#fef9f9; }
tbody td{ padding:12px 16px; font-size:13px; color:#334155; vertical-align:middle; }

.oid{ font-weight:700; color:#0f172a; cursor:pointer; }
.oid:hover{ color:#000000; text-decoration:underline; }

.user-cell{ display:flex; align-items:center; gap:8px; }
.avatar{ width:28px; height:28px; border-radius:50%; background:#f0eaeb; color:#000000; display:grid; place-items:center; font-size:11px; font-weight:700; flex-shrink:0; }
.items-cell em{ color:#94a3b8; font-style:normal; }
.bold{ font-weight:700; color:#0f172a; }
.muted{ color:#94a3b8; }

/* Pill */
.pill{ display:inline-flex; align-items:center; gap:4px; height:21px; padding:0 9px; border-radius:999px; font-size:10px; font-weight:700; letter-spacing:.04em; text-transform:uppercase; }
.pill.blue  { background:#eff6ff; color:#2563eb; }
.pill.purple{ background:#f5f3ff; color:#7c3aed; }
.pill.green { background:#f0fdf4; color:#16a34a; }
.pill.red   { background:#fff1f2; color:#be123c; }
.pill.amber { background:#fffbeb; color:#d97706; }
.pill.gray  { background:#f8fafc; color:#64748b; }

/* Actions */
.actions{ display:flex; gap:6px; align-items:center; }
.btn{ display:inline-flex; align-items:center; gap:4px; height:26px; padding:0 10px; border:none; border-radius:6px; font-size:11px; font-weight:600; cursor:pointer; font-family:Helvetica,Arial,sans-serif; }
.btn.green{ background:#f0fdf4; color:#16a34a; }
.btn.green:hover{ background:#dcfce7; }
.btn.red{ background:#fff1f2; color:#be123c; }
.btn.red:hover{ background:#ffe4e6; }
.status-select{ height:26px; border:1px solid #e2e8f0; border-radius:6px; font-size:11px; font-weight:500; color:#334155; background:#fff; cursor:pointer; padding:0 6px; font-family:Helvetica,Arial,sans-serif; outline:none; }

/* Expanded detail */
.detail-row td{ background:#fef9f9; padding:0 16px 14px; }
.detail-panel{ display:flex; flex-direction:column; gap:8px; padding-top:4px; }
.detail-item{ display:flex; align-items:center; gap:12px; font-size:13px; color:#334155; }
.detail-img{ width:36px; height:36px; border-radius:6px; object-fit:cover; background:#f1f5f9; }
.detail-meta{ display:flex; gap:20px; font-size:12px; color:#94a3b8; padding-top:4px; border-top:1px solid #f1f5f9; }

/* Footer */
.tfoot{ display:flex; justify-content:space-between; align-items:center; padding:13px 16px; border-top:1px solid #f1f5f9; }
.pages{ display:flex; gap:4px; }
.pg{ min-width:28px; height:28px; border:1px solid #e2e8f0; border-radius:7px; background:#fff; font-size:12px; color:#64748b; cursor:pointer; display:grid; place-items:center; font-family:Helvetica,Arial,sans-serif; }
.pg:hover:not(:disabled){ background:#f8fafc; }
.pg.active{ background:#000000; color:#fff; border-color:#000000; font-weight:600; }
.pg:disabled{ opacity:.35; cursor:not-allowed; }

@media (max-width: 768px) {
  .admin-page { grid-template-columns: 1fr !important; }
  .page-body  { padding: 16px !important; }
}
</style>