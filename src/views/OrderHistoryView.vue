<template>
  <div class="orders-page">
    <AppHeader :nav-links="navLinks" :cart-count="cartCount" />

    <div class="page-banner">
      <h1>My Orders</h1>
      <nav class="breadcrumb">
        <RouterLink to="/">Home</RouterLink><span> / My Orders</span>
      </nav>
    </div>

    <main class="orders-main">
      <div class="container">

        <!-- Status filter tabs -->
        <div class="tabs-wrap">
          <div class="tabs">
            <button
              v-for="tab in tabs"
              :key="tab.value"
              class="tab"
              :class="{ active: activeTab === tab.value }"
              @click="activeTab = tab.value"
            >
              {{ tab.label }}
              <span v-if="tabCount(tab.value) > 0" class="tab-badge">{{ tabCount(tab.value) }}</span>
            </button>
          </div>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="state-box">
          <i class="fa-solid fa-spinner fa-spin fa-2x" style="color:#aaa;"></i>
          <p>Loading your orders...</p>
        </div>

        <!-- Error -->
        <div v-else-if="error" class="state-box">
          <i class="fa-solid fa-triangle-exclamation fa-2x" style="color:#d92d20;"></i>
          <p>{{ error }}</p>
        </div>

        <!-- Orders -->
        <div v-else-if="filteredOrders.length" class="orders-list">
          <article v-for="order in filteredOrders" :key="order.id" class="order-card">

            <!-- Card header -->
            <div class="card-head" :class="headClass(order.status)">
              <div class="head-left">
                <i class="fa-solid fa-bag-shopping"></i>
                <span class="order-num">Order #{{ order.id }}</span>
                <span class="dot">·</span>
                <span class="order-date">{{ fmtDate(order.orderDate) }}</span>
              </div>
              <span class="status-pill" :class="pillClass(order.status)">
                <i :class="statusIcon(order.status)"></i>
                {{ statusLabel(order.status) }}
              </span>
            </div>

            <!-- Product rows -->
            <div class="card-body">
              <div v-for="item in order.items" :key="item.id" class="item-row">
                <img
                  :src="item.productImageUrl || '/placeholder.png'"
                  :alt="item.productName"
                  class="item-img"
                />
                <div class="item-info">
                  <p class="item-name">{{ item.productName }}</p>
                  <p class="item-qty">Qty: {{ item.quantity }}</p>
                </div>
                <p class="item-price">{{ formatPrice(Number(item.price)) }}</p>
              </div>
            </div>

            <!-- Card footer -->
            <div class="card-foot">
              <div class="foot-meta">
                <span v-if="order.shippingAddress" class="ship-addr">
                  <i class="fa-solid fa-location-dot"></i>
                  {{ order.shippingAddress }}
                </span>
              </div>
              <div class="foot-total">
                <span class="total-label">Order Total</span>
                <strong class="total-val">{{ formatPrice(Number(order.totalAmount)) }}</strong>
              </div>
            </div>

            <!-- Actions -->
            <div class="card-actions">
              <RouterLink :to="`/track-order/${order.id}`" class="btn btn-track">
                <i class="fa-solid fa-location-crosshairs"></i> Track Order
              </RouterLink>
              <RouterLink :to="`/invoice/${order.id}`" class="btn btn-ghost">
                <i class="fa-regular fa-file-lines"></i> Invoice
              </RouterLink>
              <RouterLink to="/sell" class="btn btn-ghost">
                <i class="fa-solid fa-rotate-right"></i> Buy Again
              </RouterLink>
              <button
                v-if="order.status === 'PENDING' || order.status === 'PAID'"
                class="btn btn-danger"
                :disabled="actionLoading === order.id"
                @click="cancelOrder(order)"
              >
                <i class="fa-solid fa-xmark"></i>
                {{ actionLoading === order.id ? 'Cancelling...' : 'Cancel' }}
              </button>
              <button
                v-if="order.status === 'DELIVERED'"
                class="btn btn-return"
                :disabled="actionLoading === order.id"
                @click="requestReturn(order)"
              >
                <i class="fa-solid fa-rotate-left"></i>
                {{ actionLoading === order.id ? 'Requesting...' : 'Return' }}
              </button>
            </div>

          </article>
        </div>

        <!-- Empty -->
        <div v-else class="state-box empty">
          <i class="fa-regular fa-folder-open fa-2x" style="color:#aaa;"></i>
          <h2>No orders found</h2>
          <p v-if="activeTab !== 'ALL'">
            No {{ activeTab.toLowerCase() }} orders.
            <button class="link-btn" @click="activeTab = 'ALL'">View all</button>
          </p>
          <p v-else>Your placed orders will appear here once you complete a purchase.</p>
          <RouterLink to="/sell" class="btn btn-primary mt">Browse Products</RouterLink>
        </div>

      </div>
    </main>

    <AppFooter :footer-columns="footerColumns" :social-links="socialLinks" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import { getFooterColumns, getNavLinks, getSocialLinks } from '@/services/homeService'
import type { FooterColumn, NavLink, SocialLink } from '@/types/home'
import { readStorage } from '@/utils/storage'
import { api } from '@/services/apiClient'

interface OrderItem {
  id: number
  productId: number
  productName: string
  productImageUrl: string
  quantity: number
  price: number
  totalPrice: number
}

interface OrderDTO {
  id: number
  orderDate: string
  status: string
  totalAmount: number
  shippingAddress: string
  cancellationReason: string | null
  items: OrderItem[]
}

interface Paged<T> { content: T[]; totalElements: number }

const navLinks       = ref<NavLink[]>([])
const footerColumns  = ref<FooterColumn[]>([])
const socialLinks    = ref<SocialLink[]>([])
const orders         = ref<OrderDTO[]>([])
const loading        = ref(true)
const error          = ref<string | null>(null)
const actionLoading  = ref<number | null>(null)
const cartItems      = ref<Array<{ id: number; quantity: number }>>([])
const activeTab      = ref('ALL')

const cartCount = computed(() => cartItems.value.reduce((s, i) => s + i.quantity, 0))

const tabs = [
  { label: 'All',       value: 'ALL'              },
  { label: 'Pending',   value: 'PENDING'          },
  { label: 'Paid',      value: 'PAID'             },
  { label: 'Shipped',   value: 'SHIPPED'          },
  { label: 'Delivered', value: 'DELIVERED'        },
  { label: 'Cancelled', value: 'CANCELLED'        },
  { label: 'Returned',  value: 'RETURN_REQUESTED' },
]

const filteredOrders = computed(() =>
  activeTab.value === 'ALL'
    ? orders.value
    : orders.value.filter(o => o.status === activeTab.value)
)

function tabCount(val: string) {
  if (val === 'ALL') return 0
  return orders.value.filter(o => o.status === val).length
}

function fmtDate(iso: string) {
  if (!iso) return '-'
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

function formatPrice(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(value)
}

function statusLabel(status: string) {
  const map: Record<string, string> = {
    PENDING: 'Pending', PAID: 'Paid', SHIPPED: 'Shipped',
    DELIVERED: 'Delivered', CANCELLED: 'Cancelled',
    RETURN_REQUESTED: 'Return Requested', REFUNDED: 'Refunded',
  }
  return map[status] ?? status
}

function statusIcon(status: string) {
  const map: Record<string, string> = {
    PENDING: 'fa-solid fa-clock',
    PAID: 'fa-solid fa-circle-check',
    SHIPPED: 'fa-solid fa-truck',
    DELIVERED: 'fa-solid fa-box-open',
    CANCELLED: 'fa-solid fa-xmark',
    RETURN_REQUESTED: 'fa-solid fa-rotate-left',
    REFUNDED: 'fa-solid fa-money-bill-wave',
  }
  return map[status] ?? 'fa-solid fa-circle'
}

function pillClass(status: string) {
  const map: Record<string, string> = {
    PENDING: 'pill-amber', PAID: 'pill-blue', SHIPPED: 'pill-purple',
    DELIVERED: 'pill-green', CANCELLED: 'pill-red',
    RETURN_REQUESTED: 'pill-amber', REFUNDED: 'pill-gray',
  }
  return map[status] ?? 'pill-gray'
}

function headClass(status: string) {
  const map: Record<string, string> = {
    PENDING: 'head-amber', PAID: 'head-blue', SHIPPED: 'head-purple',
    DELIVERED: 'head-green', CANCELLED: 'head-red',
    RETURN_REQUESTED: 'head-amber', REFUNDED: 'head-gray',
  }
  return map[status] ?? 'head-gray'
}

function loadLocalOrders() {
  const currentEmail = (localStorage.getItem('userEmail') || '').toLowerCase()
  const localOrders = readStorage<any[]>('orders', [])
  return localOrders
    .filter((o) => !currentEmail || (o.email || '').toLowerCase() === currentEmail)
    .map((o) => ({
      id: o.orderNumber || o.id,
      orderDate: o.placedDate || '',
      status: o.status || 'PLACED',
      totalAmount: Number(o.total || 0),
      shippingAddress: [o.shippingInfo?.address, o.shippingInfo?.city, o.shippingInfo?.state, o.shippingInfo?.zipCode].filter(Boolean).join(', '),
      cancellationReason: null,
      items: (o.items || []).map((item: any) => ({
        id: item.lineId || item.id,
        productId: item.id,
        productName: item.name,
        productImageUrl: item.image,
        quantity: item.quantity,
        price: item.price,
        totalPrice: item.price * item.quantity,
      })),
    }))
}

async function cancelOrder(order: OrderDTO) {
  if (!confirm(`Cancel order #${order.id}? This cannot be undone.`)) return
  actionLoading.value = order.id
  try {
    await api.post(`/api/orders/${order.id}/cancel`, {})
    order.status = 'CANCELLED'
  } catch (e: unknown) {
    alert(e instanceof Error ? e.message : 'Failed to cancel order.')
  } finally {
    actionLoading.value = null
  }
}

async function requestReturn(order: OrderDTO) {
  const reason = prompt('Please enter the reason for your return request:')
  if (!reason?.trim()) return
  actionLoading.value = order.id
  try {
    await api.post(`/api/orders/${order.id}/return`, { reason: reason.trim() })
    order.status = 'RETURN_REQUESTED'
  } catch (e: unknown) {
    alert(e instanceof Error ? e.message : 'Failed to submit return request.')
  } finally {
    actionLoading.value = null
  }
}

onMounted(async () => {
  cartItems.value = readStorage<Array<{ id: number; quantity: number }>>('cartItems', [])
  const [nav, footer, social] = await Promise.all([getNavLinks(), getFooterColumns(), getSocialLinks()])
  navLinks.value      = nav
  footerColumns.value = footer
  socialLinks.value   = social

  try {
    const res = await api.get<Paged<OrderDTO>>('/api/orders/my?page=0&size=50')
    orders.value = res.content ?? []
  } catch (e: unknown) {
    const local = loadLocalOrders()
    orders.value = local
    error.value = local.length ? null : e instanceof Error ? e.message : 'Failed to load orders. Please try again.'
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
* { box-sizing: border-box; }

.orders-page {
  min-height: 100vh;
  background: #f4f6f8;
  color: #000;
  font-family: Helvetica, Arial, sans-serif;
  padding-top: 50px;
}

/* ── Banner ─────────────────────────────── */
.page-banner {
  background: #f5f5f0;
  padding: 36px 20px;
  text-align: center;
  border-bottom: 1px solid #e2e2dc;
}
.page-banner h1 { margin: 0 0 6px; font-size: 26px; font-weight: 800; }
.breadcrumb { margin: 0; font-size: 13px; color: #888; }
.breadcrumb a { color: #888; text-decoration: none; }
.breadcrumb a:hover { color: #000; }

/* ── Main ───────────────────────────────── */
.orders-main { padding: 32px 0 64px; }

.container { max-width: 860px; margin: 0 auto; padding: 0 20px; }

/* ── Tabs ───────────────────────────────── */
.tabs-wrap {
  overflow-x: auto;
  margin-bottom: 24px;
  -webkit-overflow-scrolling: touch;
}
.tabs {
  display: flex;
  gap: 6px;
  min-width: max-content;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  padding: 6px;
}
.tab {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 16px;
  border-radius: 7px;
  border: none;
  background: transparent;
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  color: #666;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
  white-space: nowrap;
}
.tab:hover:not(.active) { background: #f4f6f8; color: #333; }
.tab.active { background: #111; color: #fff; }
.tab-badge {
  background: #e74c3c;
  color: #fff;
  font-size: 10px;
  font-weight: 800;
  min-width: 18px;
  height: 18px;
  border-radius: 9px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
}
.tab.active .tab-badge { background: rgba(255,255,255,0.25); }

/* ── Order card ─────────────────────────── */
.orders-list { display: flex; flex-direction: column; gap: 16px; }

.order-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0,0,0,0.07), 0 4px 16px rgba(0,0,0,0.04);
  border: 1px solid #e8e8e8;
}

/* ── Card header ────────────────────────── */
.card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  gap: 12px;
  border-bottom: 1px solid #f0f0f0;
}
.head-green  { background: #f0fdf4; }
.head-blue   { background: #eff8ff; }
.head-purple { background: #faf5ff; }
.head-amber  { background: #fffbeb; }
.head-red    { background: #fff5f5; }
.head-gray   { background: #fafafa; }

.head-left { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #444; }
.head-left i { color: #888; font-size: 12px; }
.order-num { font-weight: 700; color: #111; font-size: 14px; }
.dot { color: #ccc; }
.order-date { color: #888; }

/* ── Status pill ─────────────────────────── */
.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  flex-shrink: 0;
}
.pill-green  { background: #dcfce7; color: #15803d; }
.pill-blue   { background: #dbeafe; color: #1d4ed8; }
.pill-purple { background: #ede9fe; color: #7c3aed; }
.pill-amber  { background: #fef9c3; color: #a16207; }
.pill-red    { background: #fee2e2; color: #dc2626; }
.pill-gray   { background: #f1f5f9; color: #64748b; }

/* ── Product rows ───────────────────────── */
.card-body { padding: 16px 20px; display: flex; flex-direction: column; gap: 14px; }

.item-row {
  display: flex;
  align-items: center;
  gap: 14px;
}

.item-img {
  width: 72px;
  height: 72px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #efefef;
  background: #f8f8f8;
  flex-shrink: 0;
}

.item-info { flex: 1; min-width: 0; }
.item-name { margin: 0 0 4px; font-size: 14px; font-weight: 600; color: #111; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.item-qty  { margin: 0; font-size: 12px; color: #888; }
.item-price { font-size: 14px; font-weight: 700; color: #111; white-space: nowrap; }

/* ── Card footer ────────────────────────── */
.card-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  background: #fafafa;
  border-top: 1px solid #f0f0f0;
  gap: 12px;
  flex-wrap: wrap;
}
.foot-meta { flex: 1; min-width: 0; }
.ship-addr {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: #888;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 340px;
}
.ship-addr i { color: #aaa; flex-shrink: 0; }
.foot-total { display: flex; align-items: center; gap: 8px; }
.total-label { font-size: 12px; color: #888; }
.total-val   { font-size: 18px; font-weight: 800; color: #111; }

/* ── Actions ────────────────────────────── */
.card-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border-top: 1px solid #f0f0f0;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 36px;
  padding: 0 16px;
  border-radius: 8px;
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  text-decoration: none;
  transition: all 0.15s;
  white-space: nowrap;
}
.btn:disabled { opacity: 0.5; cursor: not-allowed; }

.btn-track  { background: #111; color: #fff; }
.btn-track:hover:not(:disabled) { background: #333; }

.btn-ghost  { background: #f4f6f8; color: #444; border: 1px solid #e0e0e0; }
.btn-ghost:hover:not(:disabled) { background: #e8eaec; }

.btn-danger { background: #fee2e2; color: #dc2626; border: 1px solid #fecaca; }
.btn-danger:hover:not(:disabled) { background: #fecaca; }

.btn-return { background: #dbeafe; color: #1d4ed8; border: 1px solid #bfdbfe; }
.btn-return:hover:not(:disabled) { background: #bfdbfe; }

.btn-primary { background: #111; color: #fff; }
.btn-primary:hover { background: #333; }

/* ── State boxes ─────────────────────────── */
.state-box {
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e8e8e8;
  padding: 56px 24px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: #888;
}
.state-box h2 { margin: 0; font-size: 20px; font-weight: 700; color: #111; }
.state-box p  { margin: 0; font-size: 14px; }

.link-btn {
  background: none;
  border: none;
  color: #111;
  font-weight: 700;
  cursor: pointer;
  text-decoration: underline;
  font-family: inherit;
  font-size: inherit;
  padding: 0;
}
.mt { margin-top: 8px; }

/* ── Responsive ─────────────────────────── */
@media (max-width: 640px) {
  .orders-main { padding: 20px 0 48px; }
  .container { padding: 0 12px; }
  .card-head { flex-direction: column; align-items: flex-start; gap: 8px; }
  .card-foot { flex-direction: column; align-items: flex-start; }
  .card-actions { justify-content: flex-start; }
  .ship-addr { max-width: 100%; }
  .item-img { width: 56px; height: 56px; }
  .total-val { font-size: 16px; }
}
</style>
