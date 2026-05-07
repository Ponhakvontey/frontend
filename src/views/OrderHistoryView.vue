<template>
  <div class="orders-page">
    <AppHeader :nav-links="navLinks" :cart-count="cartCount" />

    <main class="orders-main">
      <div class="container">
        <div class="orders-head">
          <p class="eyebrow">MEMBER DASHBOARD</p>
          <h1>Your Orders</h1>
          <p class="subtitle">
            Track your curated acquisitions and explore your history with Curator Luxe.
          </p>
        </div>

        <div v-if="orders.length" class="orders-list">
          <article v-for="order in orders" :key="order.id" class="order-card">
            <div class="order-top">
              <div>
                <p class="label">ORDER REFERENCE</p>
                <h3>#{{ order.orderNumber }}</h3>
                <p class="placed-date">Placed on {{ order.placedDate }}</p>
              </div>

              <div class="order-right">
                <span class="status-pill">{{ order.status }}</span>
                <strong>{{ formatPrice(order.total) }}</strong>
              </div>
            </div>

            <div class="order-items">
              <img
                v-for="item in order.items.slice(0, 3)"
                :key="item.lineId || item.id"
                :src="item.image"
                :alt="item.name"
                class="order-thumb"
              />
              <div v-if="order.items.length > 3" class="more-items">
                +{{ order.items.length - 3 }} items
              </div>
            </div>

            <div class="order-actions">
              <button type="button" class="primary-btn">Track Shipment</button>
              <button type="button" class="secondary-btn">View Order Details</button>
              <button type="button" class="link-btn">Buy it Again</button>
            </div>
          </article>
        </div>

        <div v-else class="empty-state">
          <h2>No orders yet</h2>
          <p>Your placed orders will appear here.</p>
        </div>
      </div>
    </main>

    <AppFooter :footer-columns="footerColumns" :social-links="socialLinks" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import { getFooterColumns, getNavLinks, getSocialLinks } from '@/services/homeService'
import type { FooterColumn, NavLink, SocialLink } from '@/types/home'
import { readStorage } from '@/utils/storage'

interface CartItem {
  lineId?: string
  id: number
  name: string
  variant: string
  price: number
  quantity: number
  image: string
}

interface Order {
  id: number
  orderNumber: string
  placedDate: string
  status: string
  total: number
  items: CartItem[]
  email?: string
}

const navLinks = ref<NavLink[]>([])
const footerColumns = ref<FooterColumn[]>([])
const socialLinks = ref<SocialLink[]>([])
const orders = ref<Order[]>([])
const cartItems = ref<Array<{ id: number; quantity: number }>>([])

const cartCount = computed(() => {
  return cartItems.value.reduce((sum, item) => sum + item.quantity, 0)
})

function formatPrice(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(value)
}

onMounted(async () => {
  const currentEmail = (localStorage.getItem('userEmail') || '').toLowerCase()
  const allOrders = readStorage<Order[]>('orders', [])
  orders.value = allOrders.filter((order) => !currentEmail || (order.email || '').toLowerCase() === currentEmail)
  cartItems.value = readStorage<Array<{ id: number; quantity: number }>>('cartItems', [])
  navLinks.value = await getNavLinks()
  footerColumns.value = await getFooterColumns()
  socialLinks.value = await getSocialLinks()
})
</script>

<style scoped>
* {
  box-sizing: border-box;
}

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

.orders-main {
  padding: 40px 0 80px;
}

.orders-head {
  margin-bottom: 28px;
}

.eyebrow {
  margin: 0 0 10px;
  font-size: 10px;
  letter-spacing: 0.16em;
  color: #98a2b3;
}

.orders-head h1 {
  margin: 0 0 8px;
  font-size: 54px;
  line-height: 1.04;
  font-weight: 500;
}

.subtitle {
  margin: 0;
  color: #667085;
}

.orders-list {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

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

.label {
  margin: 0 0 6px;
  font-size: 10px;
  letter-spacing: 0.14em;
  color: #98a2b3;
}

.order-top h3 {
  margin: 0 0 6px;
  font-size: 22px;
}

.placed-date {
  margin: 0;
  color: #667085;
  font-size: 14px;
}

.order-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 10px;
}

.status-pill {
  padding: 6px 10px;
  border-radius: 999px;
  background: #eef4ff;
  color: #3563e9;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.1em;
}

.order-right strong {
  font-size: 32px;
}

.order-items {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.order-thumb,
.more-items {
  width: 72px;
  height: 72px;
  border-radius: 12px;
  background: #f4f6f9;
}

.order-thumb {
  object-fit: cover;
}

.more-items {
  display: grid;
  place-items: center;
  color: #667085;
  font-size: 12px;
}

.order-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.primary-btn,
.secondary-btn,
.link-btn {
  height: 38px;
  padding: 0 16px;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
}

.primary-btn {
  border: 0;
  background: #3563e9;
  color: #fff;
}

.secondary-btn {
  border: 0;
  background: #dfe7ff;
  color: #495467;
}

.link-btn {
  border: 0;
  background: transparent;
  color: #3563e9;
}

.empty-state {
  background: #fff;
  border: 1px solid #eef2f6;
  border-radius: 20px;
  padding: 40px;
  text-align: center;
}

@media (max-width: 700px) {
  .order-top {
    flex-direction: column;
  }

  .order-right {
    align-items: flex-start;
  }
}
</style>
