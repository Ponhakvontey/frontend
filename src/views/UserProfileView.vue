<template>
  <div class="profile-page">
    <AppHeader :nav-links="navLinks" :cart-count="cartCount" />

    <main class="profile-main">
      <div class="container">
        <section class="profile-head">
          <div>
            <p class="eyebrow">ACCOUNT</p>
            <h1>Profile</h1>
            <p>Review your account, orders, saved pieces, and checkout details.</p>
          </div>
          <RouterLink to="/sell" class="primary-btn">Continue Shopping</RouterLink>
        </section>

        <section class="profile-grid">
          <article class="panel identity-panel">
            <div class="avatar">{{ initials }}</div>
            <div>
              <h2>{{ displayName }}</h2>
              <p>{{ email }}</p>
            </div>
          </article>

          <article v-for="stat in stats" :key="stat.label" class="panel stat-panel">
            <span>{{ stat.label }}</span>
            <strong>{{ stat.value }}</strong>
          </article>
        </section>

        <section class="content-grid">
          <article class="panel detail-panel">
            <div class="panel-head">
              <h2>Account Details</h2>
              <RouterLink to="/checkout">Edit Shipping</RouterLink>
            </div>

            <dl>
              <div>
                <dt>Email</dt>
                <dd>{{ email }}</dd>
              </div>
              <div>
                <dt>Role</dt>
                <dd>{{ roleLabel }}</dd>
              </div>
              <div>
                <dt>Default Shipping</dt>
                <dd>{{ shippingSummary }}</dd>
              </div>
            </dl>
          </article>

          <article class="panel orders-panel">
            <div class="panel-head">
              <h2>Recent Orders</h2>
              <RouterLink to="/order-history">View All</RouterLink>
            </div>

            <div v-if="recentOrders.length" class="order-list">
              <RouterLink
                v-for="order in recentOrders"
                :key="order.orderNumber"
                :to="`/invoice/${order.orderNumber}`"
                class="order-row"
              >
                <span>#{{ order.orderNumber }}</span>
                <strong>{{ formatPrice(order.total) }}</strong>
              </RouterLink>
            </div>
            <p v-else class="muted">No orders yet.</p>
          </article>
        </section>
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
import { getUser } from '@/services/apiClient'
import { getWishlistIds } from '@/services/wishlistService'
import { loadCartItems } from '@/utils/commerce'
import { readStorage } from '@/utils/storage'
import type { FooterColumn, NavLink, SocialLink } from '@/types/home'

interface OrderRecord {
  orderNumber: string
  total: number
  email?: string
}

const navLinks = ref<NavLink[]>([])
const footerColumns = ref<FooterColumn[]>([])
const socialLinks = ref<SocialLink[]>([])
const orders = ref<OrderRecord[]>([])
const wishlistIds = ref<string[]>([])
const cartItems = ref(loadCartItems())
const shipping = ref(readStorage<any>('shippingInfo', {}))

const authUser = computed(() => getUser())
const email = computed(() => authUser.value?.email || localStorage.getItem('userEmail') || 'member@example.com')
const displayName = computed(() => authUser.value?.username || email.value.split('@')[0] || 'Member')
const roleLabel = computed(() => authUser.value?.roles?.includes('ROLE_ADMIN') ? 'Administrator' : 'Customer')
const initials = computed(() => displayName.value.slice(0, 2).toUpperCase())

const currentOrders = computed(() => {
  const normalizedEmail = email.value.toLowerCase()
  return orders.value.filter((order) => !order.email || order.email.toLowerCase() === normalizedEmail)
})

const recentOrders = computed(() => currentOrders.value.slice(0, 3))
const cartCount = computed(() => cartItems.value.reduce((sum, item) => sum + item.quantity, 0))

const stats = computed(() => [
  { label: 'Orders', value: currentOrders.value.length },
  { label: 'Wishlist', value: wishlistIds.value.length },
  { label: 'Cart Items', value: cartCount.value },
])

const shippingSummary = computed(() => {
  if (!shipping.value?.address) return 'No saved shipping address'
  return `${shipping.value.address}, ${shipping.value.city || ''}`.replace(/,\s*$/, '')
})

function formatPrice(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(value)
}

onMounted(async () => {
  orders.value = readStorage<OrderRecord[]>('orders', [])
  wishlistIds.value = getWishlistIds()
  navLinks.value = await getNavLinks()
  footerColumns.value = await getFooterColumns()
  socialLinks.value = await getSocialLinks()
})
</script>

<style scoped>
* { box-sizing: border-box; }

.profile-page {
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

.profile-main { padding: 88px 0 80px; }

.profile-head {
  display: flex;
  justify-content: space-between;
  gap: 24px;
  align-items: flex-end;
  margin-bottom: 28px;
}

.eyebrow {
  margin: 0 0 10px;
  font-size: 10px;
  letter-spacing: 0.16em;
  color: #98a2b3;
}

.profile-head h1 {
  margin: 0 0 10px;
  font-size: 56px;
  line-height: 1.04;
  font-weight: 400;
}

.profile-head p,
.muted { margin: 0; color: #667085; }

.profile-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.6fr) repeat(3, minmax(130px, 0.45fr));
  gap: 16px;
  margin-bottom: 16px;
}

.content-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.panel {
  background: #fff;
  border: 1px solid #eef2f6;
  border-radius: 18px;
  padding: 22px;
}

.identity-panel {
  display: flex;
  align-items: center;
  gap: 16px;
}

.avatar {
  width: 62px;
  height: 62px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  background: #513B3C;
  color: #fff;
  font-weight: 800;
}

.identity-panel h2,
.panel-head h2 {
  margin: 0;
  font-size: 22px;
  font-weight: 500;
}

.identity-panel p { margin: 6px 0 0; color: #667085; }

.stat-panel span {
  display: block;
  margin-bottom: 12px;
  color: #98a2b3;
  font-size: 10px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.stat-panel strong {
  font-size: 36px;
  color: #191c1e;
}

.panel-head {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
}

.panel-head a,
.primary-btn {
  color: #513B3C;
  font-weight: 700;
  text-decoration: none;
}

.primary-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 46px;
  border-radius: 14px;
  padding: 0 18px;
  background: #513B3C;
  color: #fff;
}

dl { margin: 0; display: grid; gap: 16px; }
dt { margin-bottom: 5px; color: #98a2b3; font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase; }
dd { margin: 0; color: #344054; }

.order-list { display: grid; gap: 10px; }

.order-row {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 14px;
  border-radius: 14px;
  background: #f7f9fb;
  color: inherit;
  text-decoration: none;
}

.order-row span { color: #667085; }
.order-row strong { color: #191c1e; }

@media (max-width: 900px) {
  .profile-head,
  .content-grid { grid-template-columns: 1fr; flex-direction: column; align-items: flex-start; }
  .profile-grid { grid-template-columns: 1fr 1fr; }
  .identity-panel { grid-column: 1 / -1; }
}

@media (max-width: 640px) {
  .profile-head h1 { font-size: 40px; }
  .profile-grid { grid-template-columns: 1fr; }
}
</style>