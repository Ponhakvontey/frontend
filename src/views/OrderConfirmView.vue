<template>
  <div class="confirm-page">
    <AppHeader :nav-links="navLinks" :cart-count="0" />

    <main class="confirm-main">
      <div class="container">
        <section class="confirm-section">
          <div class="success-icon">✓</div>

          <h1>Order Confirmed!</h1>
          <p class="subtitle">Thank you for choosing Curator Luxe.</p>

          <div class="order-pill">
            <span>ORDER NUMBER</span>
            <strong>#{{ orderData.orderNumber }}</strong>
          </div>

          <div class="confirm-grid">
            <div class="summary-card">
              <p class="card-label">SHIPMENT SUMMARY</p>

              <article v-for="item in orderData.items" :key="item.id" class="summary-item">
                <img :src="item.image" :alt="item.name" class="summary-item-image" />

                <div class="summary-item-info">
                  <h4>{{ item.name }}</h4>
                  <p>{{ item.variant }}</p>
                  <strong>{{ formatPrice(item.price * item.quantity) }}</strong>
                </div>
              </article>
            </div>

            <div class="address-card">
              <p class="card-label">DELIVERY ADDRESS</p>

              <div class="address-text">
                <p>{{ orderData.shippingInfo.firstName }} {{ orderData.shippingInfo.lastName }}</p>
                <p>{{ orderData.shippingInfo.address }}</p>
                <p>
                  {{ orderData.shippingInfo.city }}, {{ orderData.shippingInfo.state }}
                  {{ orderData.shippingInfo.zipCode }}
                </p>
                <p>{{ orderData.shippingInfo.phone }}</p>
              </div>

              <div class="arrival-box">
                <span>ESTIMATED ARRIVAL</span>
                <strong>Oct 24 – Oct 26</strong>
              </div>
            </div>
          </div>

          <div class="action-row">
            <button type="button" class="primary-btn" @click="goHome">Continue Shopping →</button>

            <button type="button" class="secondary-btn">View Full Invoice</button>
          </div>

          <p class="email-note">A confirmation email has been sent to {{ confirmationEmail }}</p>
        </section>
      </div>
    </main>

    <AppFooter :footer-columns="footerColumns" :social-links="socialLinks" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import { getFooterColumns, getNavLinks, getSocialLinks } from '@/services/homeService'
import type { FooterColumn, NavLink, SocialLink } from '@/types/home'
import { readStorage } from '@/utils/storage'

interface OrderItem {
  id: number
  name: string
  variant: string
  price: number
  quantity: number
  image: string
}

interface ShippingInfo {
  firstName: string
  lastName: string
  address: string
  city: string
  state: string
  zipCode: string
  phone: string
}

interface OrderConfirmation {
  orderNumber: string
  items: OrderItem[]
  shippingInfo: ShippingInfo
  total: number
}

const router = useRouter()

const navLinks = ref<NavLink[]>([])
const footerColumns = ref<FooterColumn[]>([])
const socialLinks = ref<SocialLink[]>([])

const orderData = ref<OrderConfirmation>({
  orderNumber: '',
  items: [],
  shippingInfo: {
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
  },
  total: 0,
})

const confirmationEmail = computed(() => localStorage.getItem('userEmail') || 'your account email')

function formatPrice(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(value)
}

function goHome() {
  router.push('/')
}

onMounted(async () => {
  const savedOrder = readStorage<OrderConfirmation | null>('orderConfirmation', null)
  if (savedOrder) orderData.value = savedOrder

  navLinks.value = await getNavLinks()
  footerColumns.value = await getFooterColumns()
  socialLinks.value = await getSocialLinks()
})
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.confirm-page {
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

.confirm-main {
  padding: 70px 0 80px;
}

.confirm-section {
  text-align: center;
}

.success-icon {
  width: 84px;
  height: 84px;
  margin: 0 auto 22px;
  border-radius: 999px;
  background: #eaf8ef;
  color: #38b26b;
  display: grid;
  place-items: center;
  font-size: 42px;
  font-weight: 700;
}

.confirm-section h1 {
  margin: 0 0 8px;
  font-size: 56px;
  line-height: 1.04;
  font-weight: 700;
  letter-spacing: -0.03em;
}

.subtitle {
  margin: 0 0 18px;
  color: #667085;
}

.order-pill {
  display: inline-flex;
  flex-direction: column;
  gap: 6px;
  background: #f1f4f8;
  border-radius: 14px;
  padding: 12px 18px;
  margin-bottom: 36px;
}

.order-pill span {
  font-size: 10px;
  letter-spacing: 0.14em;
  color: #98a2b3;
}

.order-pill strong {
  color: #3563e9;
  font-size: 18px;
}

.confirm-grid {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 18px;
  align-items: start;
  text-align: left;
  margin-bottom: 30px;
}

.summary-card,
.address-card {
  background: #ffffff;
  border: 1px solid #eef2f6;
  border-radius: 20px;
  padding: 22px;
}

.card-label {
  margin: 0 0 18px;
  font-size: 10px;
  letter-spacing: 0.16em;
  color: #98a2b3;
}

.summary-item {
  display: grid;
  grid-template-columns: 72px 1fr;
  gap: 14px;
  margin-bottom: 16px;
}

.summary-item:last-child {
  margin-bottom: 0;
}

.summary-item-image {
  width: 72px;
  height: 72px;
  border-radius: 12px;
  object-fit: cover;
  background: #f4f6f9;
}

.summary-item-info h4 {
  margin: 0 0 6px;
  font-size: 15px;
  font-weight: 600;
}

.summary-item-info p {
  margin: 0 0 6px;
  font-size: 12px;
  color: #667085;
}

.summary-item-info strong {
  font-size: 14px;
}

.address-text p {
  margin: 0 0 6px;
  color: #4b5563;
  font-size: 14px;
}

.arrival-box {
  margin-top: 22px;
}

.arrival-box span {
  display: block;
  margin-bottom: 6px;
  font-size: 10px;
  letter-spacing: 0.14em;
  color: #98a2b3;
}

.arrival-box strong {
  color: #3563e9;
  font-size: 22px;
}

.action-row {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-bottom: 18px;
}

.primary-btn,
.secondary-btn {
  min-width: 220px;
  height: 48px;
  border-radius: 14px;
  padding: 0 20px;
  font-weight: 700;
  cursor: pointer;
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

.email-note {
  margin: 0;
  font-size: 12px;
  color: #98a2b3;
}

@media (max-width: 900px) {
  .confirm-grid {
    grid-template-columns: 1fr;
  }

  .confirm-section h1 {
    font-size: 40px;
  }

  .action-row {
    flex-direction: column;
    align-items: center;
  }
}
</style>
