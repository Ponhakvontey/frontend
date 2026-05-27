<template>
  <div class="orders-page">
    <AppHeader :nav-links="navLinks" :cart-count="cartCount" />

    <main class="orders-main">
      <div class="container">
        <div class="orders-head">
          <p class="eyebrow">MEMBER DASHBOARD</p>
          <h1>Your Orders</h1>
          <p class="subtitle">
            Track your purchases and explore your order history.
          </p>
        </div>

        <div v-if="loading" class="empty-state">
          <i class="fa-solid fa-spinner fa-spin" style="font-size:28px;color:#513B3C;"></i>
          <p>Loading your orders...</p>
        </div>

        <div v-else-if="error" class="empty-state">
          <i class="fa-solid fa-triangle-exclamation" style="font-size:28px;color:#d92d20;"></i>
          <p>{{ error }}</p>
        </div>

        <div v-else-if="orders.length" class="orders-list">
          <article v-for="order in orders" :key="order.id" class="order-card">
            <div class="order-top">
              <div>
                <p class="label">ORDER REFERENCE</p>
                <h3>#{{ order.id }}</h3>
                <p class="placed-date">Placed on {{ fmtDate(order.orderDate) }}</p>
              </div>

              <div class="order-right">
                <span class="status-pill" :class="pillClass(order.status)">{{ order.status }}</span>
                <strong>{{ formatPrice(Number(order.totalAmount)) }}</strong>
              </div>
            </div>

            <div v-if="order.items?.length" class="order-items">
              <img
                v-for="item in order.items.slice(0, 3)"
                :key="item.id"
                :src="item.productImageUrl || ''"
                :alt="item.productName"
                class="order-thumb"
              />
              <div v-if="order.items.length > 3" class="more-items">
                +{{ order.items.length - 3 }} items
              </div>
            </div>

            <div class="order-footer">
              <span class="item-count">
                {{ order.items?.length ?? 0 }} {{ order.items?.length === 1 ? 'item' : 'items' }}
              </span>
              <span v-if="order.shippingAddress" class="ship-addr">
                <i class="fa-solid fa-location-dot"></i> {{ order.shippingAddress }}
              </span>
              <div class="order-actions">
                <RouterLink :to="`/invoice/${order.id}`" class="action-btn invoice-btn">
                  <i class="fa-regular fa-file-lines"></i>
                  View Invoice
                </RouterLink>
                <RouterLink to="/sell" class="action-btn buy-btn">
                  <i class="fa-solid fa-bag-shopping"></i>
                  Buy Again
                </RouterLink>
                <button
                  v-if="order.status === 'PENDING' || order.status === 'PAID'"
                  class="action-btn cancel-btn"
                  :disabled="actionLoading === order.id"
                  @click="cancelOrder(order)"
                >
                  <i class="fa-solid fa-xmark"></i>
                  {{ actionLoading === order.id ? 'Cancelling...' : 'Cancel Order' }}
                </button>
                <button
                  v-if="order.status === 'DELIVERED'"
                  class="action-btn return-btn"
                  :disabled="actionLoading === order.id"
                  @click="requestReturn(order)"
                >
                  <i class="fa-solid fa-rotate-left"></i>
                  {{ actionLoading === order.id ? 'Requesting...' : 'Request Return' }}
                </button>
              </div>
            </div>
          </article>
        </div>

        <div v-else class="empty-state">
          <i class="fa-regular fa-folder-open" style="font-size:36px;color:#98a2b3;"></i>
          <h2>No orders yet</h2>
          <p>Your placed orders will appear here once you complete a purchase.</p>
          <RouterLink to="/sell" class="shop-btn">Browse Products</RouterLink>
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

const navLinks     = ref<NavLink[]>([])
const footerColumns = ref<FooterColumn[]>([])
const socialLinks  = ref<SocialLink[]>([])
const orders        = ref<OrderDTO[]>([])
const loading       = ref(true)
const error         = ref<string | null>(null)
const actionLoading = ref<number | null>(null)
const cartItems     = ref<Array<{ id: number; quantity: number }>>([])

const cartCount = computed(() => cartItems.value.reduce((s, i) => s + i.quantity, 0))

function fmtDate(iso: string) {
  if (!iso) return '-'
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

function formatPrice(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(value)
}

function loadLocalOrders() {
  const currentEmail = (localStorage.getItem('userEmail') || '').toLowerCase()
  const localOrders = readStorage<any[]>('orders', [])

  return localOrders
    .filter((order) => !currentEmail || (order.email || '').toLowerCase() === currentEmail)
    .map((order) => ({
      id: order.orderNumber || order.id,
      orderDate: order.placedDate || '',
      status: order.status || 'PLACED',
      totalAmount: Number(order.total || 0),
      shippingAddress: [
        order.shippingInfo?.address,
        order.shippingInfo?.city,
        order.shippingInfo?.state,
        order.shippingInfo?.zipCode,
      ].filter(Boolean).join(', '),
      cancellationReason: null,
      items: (order.items || []).map((item: any) => ({
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

function pillClass(status: string) {
  return {
    PENDING: 'pill-amber',
    PAID:    'pill-blue',
    SHIPPED: 'pill-purple',
    DELIVERED: 'pill-green',
    CANCELLED: 'pill-red',
    RETURN_REQUESTED: 'pill-amber',
    REFUNDED: 'pill-gray',
  }[status] ?? 'pill-gray'
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
    const localOrders = loadLocalOrders()
    orders.value = localOrders
    error.value = localOrders.length ? null : e instanceof Error ? e.message : 'Failed to load orders. Please try again.'
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
* { box-sizing: border-box; }

.orders-page {
  min-height: 100vh;
  background: #f7f9fb;
  color: #191c1e;
  font-family: Inter, Arial, sans-serif;
}

.container {
  width: min(1200px, 100%);
  margin: 0 auto;
  padding: 0 20px;
}

.orders-main { padding: 40px 0 80px; }

.orders-head { margin-bottom: 28px; }
.eyebrow { margin: 0 0 10px; font-size: 10px; letter-spacing: 0.16em; color: #98a2b3; }
.orders-head h1 { margin: 0 0 8px; font-size: 54px; line-height: 1.04; font-weight: 500; }
.subtitle { margin: 0; color: #667085; }

.orders-list { display: flex; flex-direction: column; gap: 18px; }

.order-card {
  background: #fff;
  border: 1px solid #eef2f6;
  border-radius: 20px;
  padding: 22px;
}

.order-top {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 18px;
}

.label { margin: 0 0 6px; font-size: 10px; letter-spacing: 0.14em; color: #98a2b3; }
.order-top h3 { margin: 0 0 6px; font-size: 22px; }
.placed-date { margin: 0; color: #667085; font-size: 14px; }

.order-right { display: flex; flex-direction: column; align-items: flex-end; gap: 10px; }
.order-right strong { font-size: 28px; }

.status-pill {
  padding: 5px 12px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}
.pill-amber  { background: #fffbeb; color: #d97706; }
.pill-blue   { background: #eff6ff; color: #2563eb; }
.pill-purple { background: #f5f3ff; color: #7c3aed; }
.pill-green  { background: #f0fdf4; color: #16a34a; }
.pill-red    { background: #fff1f2; color: #be123c; }
.pill-gray   { background: #f8fafc; color: #64748b; }

.order-items { display: flex; gap: 10px; margin-bottom: 14px; }

.order-thumb, .more-items {
  width: 72px;
  height: 72px;
  border-radius: 12px;
  background: #f4f6f9;
}
.order-thumb { object-fit: cover; }
.more-items { display: grid; place-items: center; color: #667085; font-size: 12px; }

.order-footer {
  display: flex;
  gap: 20px;
  align-items: center;
  font-size: 13px;
  color: #94a3b8;
  border-top: 1px solid #f1f5f9;
  padding-top: 12px;
  flex-wrap: wrap;
}
.ship-addr { display: flex; align-items: center; gap: 5px; }

.order-actions { display: flex; gap: 8px; margin-left: auto; }

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 34px;
  padding: 0 14px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid;
  transition: background 0.15s, opacity 0.15s;
}
.action-btn:disabled { opacity: 0.55; cursor: not-allowed; }

.cancel-btn { background: #fff1f2; color: #be123c; border-color: #fecdd3; }
.cancel-btn:hover:not(:disabled) { background: #ffe4e6; }

.return-btn { background: #eff6ff; color: #2563eb; border-color: #bfdbfe; }
.invoice-btn { background: #ede6e7; color: #495467; border-color: #ede6e7; }
.buy-btn { background: #fff; color: #513B3C; border-color: #e7dfe0; }
.return-btn:hover:not(:disabled) { background: #dbeafe; }

.empty-state {
  background: #fff;
  border: 1px solid #eef2f6;
  border-radius: 20px;
  padding: 56px 40px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}
.empty-state h2 { margin: 0; font-size: 22px; font-weight: 700; }
.empty-state p  { margin: 0; color: #667085; font-size: 14px; }

.shop-btn {
  display: inline-flex;
  align-items: center;
  height: 44px;
  padding: 0 24px;
  border-radius: 14px;
  background: #513B3C;
  color: #fff;
  font-weight: 700;
  font-size: 14px;
  text-decoration: none;
  margin-top: 4px;
  transition: background 0.15s;
}
.shop-btn:hover { background: #6b4f50; }

@media (max-width: 700px) {
  .order-top { flex-direction: column; }
  .order-right { align-items: flex-start; }
  .orders-head h1 { font-size: 36px; }
}
</style>