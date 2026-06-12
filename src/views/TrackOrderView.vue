<template>
  <div class="track-page">
    <AppHeader :nav-links="navLinks" :cart-count="cartCount" />

    <div class="page-banner">
      <h1>Track Your Order</h1>
      <nav class="breadcrumb">
        <RouterLink to="/">Home</RouterLink>
        <span> / Track Your Order</span>
      </nav>
    </div>

    <main class="track-main">
      <div class="container">

        <form class="search-box" @submit.prevent="trackOrder">
          <label class="search-label">Enter Your Order ID</label>
          <div class="search-row">
            <input
              v-model="orderIdInput"
              type="number"
              min="1"
              placeholder="e.g. 1234"
              class="search-input"
              required
            />
            <button type="submit" class="btn-track" :disabled="loading">
              <i class="fa-solid fa-magnifying-glass"></i>
              {{ loading ? 'Searching...' : 'Track Order' }}
            </button>
          </div>
        </form>

        <div v-if="loading" class="state-box">
          <i class="fa-solid fa-spinner fa-spin" style="font-size:28px;color:#808080;"></i>
          <p>Looking up your order...</p>
        </div>

        <div v-else-if="error" class="state-box error-state">
          <i class="fa-solid fa-triangle-exclamation" style="font-size:28px;color:#d92d20;"></i>
          <p>{{ error }}</p>
        </div>

        <template v-else-if="order">

          <div class="order-header">
            <div>
              <p class="eyebrow">ORDER STATUS</p>
              <p class="order-id-text">Order ID : #{{ order.id }}</p>
              <p class="order-date-text">Placed on {{ fmtDate(order.orderDate) }}</p>
            </div>
            <div class="header-right">
              <span class="status-pill" :class="pillClass(order.status)">{{ statusLabel(order.status) }}</span>
              <strong class="total-amount">{{ fmtPrice(order.totalAmount) }}</strong>
            </div>
          </div>

          <div class="timeline-card">
            <div class="timeline">
              <template v-for="(step, i) in timeline" :key="step.key">
                <div class="step" :class="{ done: step.done, current: step.current }">
                  <div class="step-circle">
                    <i v-if="step.done" class="fa-solid fa-check"></i>
                    <i v-else :class="`fa-solid ${step.icon}`"></i>
                  </div>
                  <span class="step-label">{{ step.label }}</span>
                  <template v-if="step.changedAt">
                    <span class="step-date">{{ fmtStepDate(step.changedAt) }}</span>
                    <span class="step-time">{{ fmtStepTime(step.changedAt) }}</span>
                  </template>
                  <span v-else class="step-expected">Expected</span>
                </div>
                <div
                  v-if="i < timeline.length - 1"
                  class="connector"
                  :class="{ done: step.done }"
                ></div>
              </template>
            </div>
          </div>

          <div v-if="order.cancellationReason" class="note-box">
            <i class="fa-solid fa-circle-info"></i> {{ order.cancellationReason }}
          </div>

          <div class="products-card">
            <h3 class="products-title">Products</h3>
            <div v-for="item in order.items" :key="item.id" class="product-row">
              <img
                :src="item.productImageUrl || '/placeholder.png'"
                :alt="item.productName"
                class="product-img"
              />
              <div class="product-details">
                <p class="product-name">{{ item.productName }}</p>
                <p class="product-meta">
                  <template v-if="item.size">Size : {{ item.size }} | </template>
                  {{ item.quantity }} Qty.
                </p>
              </div>
            </div>
          </div>

        </template>

      </div>
    </main>

    <AppFooter :footer-columns="footerColumns" :social-links="socialLinks" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import { getFooterColumns, getNavLinks, getSocialLinks } from '@/services/homeService'
import type { FooterColumn, NavLink, SocialLink } from '@/types/home'
import { readStorage } from '@/utils/storage'
import { api } from '@/services/apiClient'

interface OrderStatusHistoryDTO {
  status: string
  changedAt: string
  note: string | null
}

interface OrderItemDTO {
  id: number
  productName: string
  productImageUrl: string
  size: string | null
  quantity: number
}

interface OrderDTO {
  id: number
  orderDate: string
  status: string
  totalAmount: number
  shippingAddress: string
  cancellationReason: string | null
  items: OrderItemDTO[]
  statusHistory: OrderStatusHistoryDTO[]
}

const STEPS = [
  { key: 'PENDING',   label: 'Order Placed',       icon: 'fa-clipboard-list' },
  { key: 'PAID',      label: 'Payment Confirmed',   icon: 'fa-circle-check'  },
  { key: 'SHIPPED',   label: 'On the Way',          icon: 'fa-truck'         },
  { key: 'DELIVERED', label: 'Delivered',           icon: 'fa-box-open'      },
]

const route         = useRoute()
const navLinks      = ref<NavLink[]>([])
const footerColumns = ref<FooterColumn[]>([])
const socialLinks   = ref<SocialLink[]>([])
const cartItems     = ref<Array<{ id: number; quantity: number }>>([])
const cartCount     = computed(() => cartItems.value.reduce((s, i) => s + i.quantity, 0))

const orderIdInput = ref('')
const order        = ref<OrderDTO | null>(null)
const loading      = ref(false)
const error        = ref<string | null>(null)

const timeline = computed(() => {
  if (!order.value) return []
  const histMap: Record<string, string> = {}
  for (const h of order.value.statusHistory ?? []) {
    histMap[h.status] = h.changedAt
  }
  const lastDoneIdx = STEPS.reduce((acc, s, i) => histMap[s.key] ? i : acc, -1)
  return STEPS.map((step, i) => ({
    ...step,
    done:      !!histMap[step.key],
    current:   i === lastDoneIdx,
    changedAt: histMap[step.key] ?? null,
  }))
})

async function trackOrder() {
  const id = orderIdInput.value.trim()
  if (!id) return
  loading.value = true
  error.value   = null
  order.value   = null
  try {
    order.value = await api.get<OrderDTO>(`/api/orders/${id}`)
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : ''
    if (msg.includes('404') || msg.toLowerCase().includes('not found')) {
      error.value = 'Order not found. Please check your order ID.'
    } else {
      error.value = msg || 'Something went wrong. Please try again.'
    }
  } finally {
    loading.value = false
  }
}

function statusLabel(status: string) {
  const map: Record<string, string> = {
    PENDING: 'Order Placed', PAID: 'Payment Confirmed', SHIPPED: 'On the Way',
    DELIVERED: 'Delivered', CANCELLED: 'Cancelled',
    RETURN_REQUESTED: 'Return Requested', REFUNDED: 'Refunded',
  }
  return map[status] ?? status
}

function pillClass(status: string) {
  const map: Record<string, string> = {
    PENDING: 'pill-amber', PAID: 'pill-blue', SHIPPED: 'pill-purple',
    DELIVERED: 'pill-green', CANCELLED: 'pill-red',
    RETURN_REQUESTED: 'pill-amber', REFUNDED: 'pill-gray',
  }
  return map[status] ?? 'pill-gray'
}

function fmtDate(iso: string) {
  if (!iso) return '-'
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

function fmtStepDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })
}

function fmtStepTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

function fmtPrice(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value))
}

onMounted(async () => {
  cartItems.value = readStorage<Array<{ id: number; quantity: number }>>('cartItems', [])
  const [nav, footer, social] = await Promise.all([getNavLinks(), getFooterColumns(), getSocialLinks()])
  navLinks.value      = nav
  footerColumns.value = footer
  socialLinks.value   = social

  const routeId = route.params.orderId
  if (routeId) {
    orderIdInput.value = String(routeId)
    await trackOrder()
  }
})
</script>

<style scoped>
* { box-sizing: border-box; }

.track-page {
  min-height: 100vh;
  background: #fff;
  color: #000;
  font-family: Helvetica, Arial, sans-serif;
  padding-top: 50px;
}

/* ── Banner ──────────────────────────────────── */
.page-banner {
  background: #f5f5f0;
  padding: 40px 20px;
  text-align: center;
  border-bottom: 1px solid #AABBAA;
}
.page-banner h1 { margin: 0 0 8px; font-size: 28px; font-weight: 700; }
.breadcrumb { margin: 0; font-size: 13px; color: #808080; }
.breadcrumb a { color: #808080; text-decoration: none; }
.breadcrumb a:hover { color: #000; }

/* ── Main ────────────────────────────────────── */
.track-main { padding: 48px 0 64px; }

.container { max-width: 900px; margin: 0 auto; padding: 0 20px; }

/* ── Search ──────────────────────────────────── */
.search-box {
  background: #fff;
  border: 1px solid #AABBAA;
  border-radius: 4px;
  padding: 24px;
  margin-bottom: 32px;
  box-shadow: rgba(0,0,0,0.04) 0 2px 4px;
}
.search-label { display: block; font-size: 13px; font-weight: 700; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.08em; color: #808080; }
.search-row { display: flex; gap: 10px; }
.search-input {
  flex: 1;
  height: 44px;
  padding: 0 14px;
  border: 1px solid #AABBAA;
  border-radius: 4px;
  font-size: 15px;
  font-family: inherit;
  outline: none;
  transition: border-color 0.15s;
}
.search-input:focus { border-color: #000; }
.btn-track {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 44px;
  padding: 0 22px;
  background: #000;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-family: inherit;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s;
  white-space: nowrap;
}
.btn-track:hover:not(:disabled) { background: #333; }
.btn-track:disabled { opacity: 0.5; cursor: not-allowed; }

/* ── State boxes ─────────────────────────────── */
.state-box {
  border: 1px solid #AABBAA;
  border-radius: 4px;
  padding: 48px 24px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: #808080;
  font-size: 14px;
}
.error-state { color: #d92d20; }

/* ── Order header ────────────────────────────── */
.order-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  gap: 16px;
}
.eyebrow { margin: 0 0 4px; font-size: 11px; font-weight: 700; letter-spacing: 0.12em; color: #808080; text-transform: uppercase; }
.order-id-text { margin: 0 0 4px; font-size: 20px; font-weight: 700; }
.order-date-text { margin: 0; font-size: 13px; color: #808080; }
.header-right { display: flex; flex-direction: column; align-items: flex-end; gap: 8px; }
.total-amount { font-size: 20px; font-weight: 700; }

.status-pill {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
.pill-amber  { background: #fffbeb; color: #d97706; }
.pill-blue   { background: #e6f4ff; color: #1890ff; }
.pill-purple { background: #f5f3ff; color: #7c3aed; }
.pill-green  { background: #f0fdf4; color: #16a34a; }
.pill-red    { background: #fff1f2; color: #da292e; }
.pill-gray   { background: #f5f5f5; color: #808080; }

/* ── Timeline card ───────────────────────────── */
.timeline-card {
  border: 1px solid #AABBAA;
  border-radius: 4px;
  padding: 32px 24px;
  margin-bottom: 20px;
  background: #fff;
  box-shadow: rgba(0,0,0,0.04) 0 2px 4px;
  overflow-x: auto;
}

.timeline {
  display: flex;
  align-items: flex-start;
  min-width: 500px;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  flex: 0 0 auto;
  width: 110px;
  text-align: center;
  color: #b0b0b0;
}

.step-circle {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 2px solid #d0d0d0;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: #d0d0d0;
  flex-shrink: 0;
  transition: background 0.2s, border-color 0.2s, color 0.2s;
}

.step.done .step-circle {
  background: #2d6a4f;
  border-color: #2d6a4f;
  color: #fff;
}

.step.current .step-circle {
  border-color: #2d6a4f;
  color: #2d6a4f;
}

.step-label {
  font-size: 12px;
  font-weight: 700;
  color: #b0b0b0;
}
.step.done .step-label,
.step.current .step-label {
  color: #000;
}

.step-date { font-size: 11px; color: #000; font-weight: 600; line-height: 1.3; }
.step-time { font-size: 11px; color: #808080; line-height: 1.3; }
.step-expected { font-size: 11px; color: #b0b0b0; }

.connector {
  flex: 1;
  height: 2px;
  background: #e0e0e0;
  margin-top: 21px; /* centers on the 44px circle */
  transition: background 0.2s;
  min-width: 20px;
}
.connector.done { background: #2d6a4f; }

/* ── Note box ────────────────────────────────── */
.note-box {
  border: 1px solid #fde68a;
  background: #fffbeb;
  border-radius: 4px;
  padding: 12px 16px;
  font-size: 13px;
  color: #92400e;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* ── Products card ───────────────────────────── */
.products-card {
  border: 1px solid #AABBAA;
  border-radius: 4px;
  padding: 24px;
  background: #fff;
  box-shadow: rgba(0,0,0,0.04) 0 2px 4px;
}
.products-title { margin: 0 0 20px; font-size: 15px; font-weight: 700; }

.product-row {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px 0;
  border-bottom: 1px solid #f0f0f0;
}
.product-row:last-child { border-bottom: none; padding-bottom: 0; }

.product-img {
  width: 64px;
  height: 64px;
  object-fit: cover;
  border-radius: 4px;
  border: 1px solid #AABBAA;
  background: #f5f5f5;
  flex-shrink: 0;
}

.product-details { display: flex; flex-direction: column; gap: 4px; }
.product-name { margin: 0; font-size: 14px; font-weight: 700; color: #000; }
.product-meta { margin: 0; font-size: 13px; color: #808080; }

/* ── Responsive ──────────────────────────────── */
@media (max-width: 640px) {
  .track-main { padding: 32px 0 48px; }
  .container { padding: 0 12px; }
  .page-banner h1 { font-size: 22px; }
  .order-header { flex-direction: column; gap: 12px; }
  .header-right { align-items: flex-start; flex-direction: row; gap: 12px; }
  .search-row { flex-direction: column; }
  .btn-track { width: 100%; justify-content: center; }
}
</style>
