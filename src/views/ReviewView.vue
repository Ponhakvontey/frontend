<template>
  <div class="review-page">
    <AppHeader :nav-links="navLinks" :cart-count="cartCount" />

    <main class="review-main">
      <div class="container">
        <section class="review-head">
          <h1>Order Review</h1>

          <div class="stepper">
            <div class="step">
              <span>1</span>
              <p>SHIPPING</p>
            </div>
            <div class="step">
              <span>2</span>
              <p>PAYMENT</p>
            </div>
            <div class="step active">
              <span>3</span>
              <p>REVIEW</p>
            </div>
          </div>
        </section>

        <section class="review-layout">
          <div class="review-left">
            <div class="info-grid">
              <div class="info-card">
                <div class="info-head">
                  <h3>Shipping Address</h3>
                  <button type="button" @click="goToShipping">EDIT</button>
                </div>

                <div class="info-body">
                  <p>{{ shippingInfo.firstName }} {{ shippingInfo.lastName }}</p>
                  <p>{{ shippingInfo.address }}</p>
                  <p>
                    {{ shippingInfo.city }}, {{ shippingInfo.state }} {{ shippingInfo.zipCode }}
                  </p>
                  <p>{{ shippingInfo.phone }}</p>
                </div>
              </div>

              <div class="info-card">
                <div class="info-head">
                  <h3>Payment Method</h3>
                  <button type="button" @click="goToPayment">EDIT</button>
                </div>

                <div class="info-body">
                  <p v-if="paymentInfo.method === 'card'">Visa Platinum</p>
                  <p v-if="paymentInfo.method === 'card'">Ending in •••• {{ last4Digits }}</p>
                  <p v-else-if="paymentInfo.method === 'paypal'">PayPal</p>
                  <p v-else-if="paymentInfo.method === 'applepay'">Apple Pay</p>
                  <p v-else>No payment method selected</p>
                </div>
              </div>

              <div class="summary-box">
                <h3>Order Summary</h3>

                <div class="summary-row">
                  <span>Subtotal</span>
                  <span>{{ formatPrice(subtotal) }}</span>
                </div>

                <div class="summary-row">
                  <span>Express Shipping</span>
                  <span>Free</span>
                </div>

                <div class="summary-row">
                  <span>Est. Duties & Taxes</span>
                  <span>{{ formatPrice(estimatedTax) }}</span>
                </div>

                <div class="summary-total">
                  <div>
                    <span>Total Amount</span>
                    <small>INCLUDES VAT</small>
                  </div>
                  <strong>{{ formatPrice(total) }}</strong>
                </div>

                <button type="button" class="place-btn" @click="placeOrder">PLACE ORDER</button>
                <p v-if="checkoutError" class="field-error">{{ checkoutError }}</p>

                <p class="terms">
                  BY PLACING YOUR ORDER, YOU AGREE TO OUR TERMS AND PRIVACY POLICY.
                </p>

                <div class="icons-row">
                  <span>🛡️</span>
                  <span>🔒</span>
                  <span>🌍</span>
                </div>
              </div>
            </div>

            <section class="selected-items">
              <p class="section-label">SELECTED ITEMS</p>

              <article v-for="item in items" :key="item.lineId" class="review-item">
                <img :src="item.image" :alt="item.name" class="review-item-image" />

                <div class="review-item-info">
                  <div class="review-item-top">
                    <div>
                      <h4>{{ item.name }}</h4>
                      <p class="variant">{{ item.variant }}</p>
                    </div>
                    <strong>{{ formatPrice(item.price * item.quantity) }}</strong>
                  </div>

                  <div class="review-item-bottom">
                    <span>Quantity: {{ item.quantity }}</span>
                    <span>SKU: ITEM-{{ item.id }}</span>
                  </div>
                </div>
              </article>
            </section>
          </div>
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
import { readStorage, writeStorage } from '@/utils/storage'
import { loadCartItems, type CartItem } from '@/utils/commerce'

const router = useRouter()

const navLinks = ref<NavLink[]>([])
const footerColumns = ref<FooterColumn[]>([])
const socialLinks = ref<SocialLink[]>([])
const items = ref<CartItem[]>([])

const shippingInfo = ref({
  firstName: '',
  lastName: '',
  address: '',
  city: '',
  state: '',
  zipCode: '',
  phone: '',
})

const paymentInfo = ref({
  method: '',
  cardLast4: '',
})
const checkoutError = ref('')

function loadCart() {
  items.value = loadCartItems()
}

function loadShipping() {
  const savedShipping = readStorage<typeof shippingInfo.value | null>('shippingInfo', null)
  if (savedShipping) shippingInfo.value = savedShipping
}

function loadPayment() {
  const savedPayment = readStorage<typeof paymentInfo.value | null>('paymentInfo', null)
  if (savedPayment) paymentInfo.value = savedPayment
}

const cartCount = computed(() => {
  return items.value.reduce((sum, item) => sum + item.quantity, 0)
})

const subtotal = computed(() => {
  return items.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
})

const estimatedTax = computed(() => subtotal.value * 0.08)
const total = computed(() => subtotal.value + estimatedTax.value)

const last4Digits = computed(() => {
  return paymentInfo.value.cardLast4 || '0000'
})

function formatPrice(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(value)
}

function goToShipping() {
  router.push('/checkout')
}

function goToPayment() {
  router.push('/payment')
}

function placeOrder() {
  checkoutError.value = ''
  if (!items.value.length) {
    checkoutError.value = 'Your cart is empty. Add items before placing an order.'
    return
  }
  if (
    !shippingInfo.value.firstName ||
    !shippingInfo.value.lastName ||
    !shippingInfo.value.address ||
    !shippingInfo.value.city ||
    !shippingInfo.value.state ||
    !shippingInfo.value.zipCode ||
    !shippingInfo.value.phone
  ) {
    checkoutError.value = 'Shipping information is incomplete.'
    return
  }
  if (!paymentInfo.value.method) {
    checkoutError.value = 'Payment method is missing.'
    return
  }

  const orderNumber = `CLX-${Math.floor(1000000 + Math.random() * 9000000)}`

  const newOrder = {
    id: Date.now(),
    orderNumber,
    placedDate: new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }),
    status: 'PLACED',
    total: total.value,
    items: items.value,
    shippingInfo: shippingInfo.value,
    paymentInfo: paymentInfo.value,
    email: localStorage.getItem('userEmail') || '',
  }

  const existingOrders = readStorage<any[]>('orders', [])
  existingOrders.unshift(newOrder)
  writeStorage('orders', existingOrders)

  writeStorage('orderConfirmation', newOrder)
  localStorage.removeItem('cartItems')
  localStorage.removeItem('shippingInfo')
  localStorage.removeItem('paymentInfo')

  router.push('/order-confirm')
}

onMounted(async () => {
  loadCart()
  loadShipping()
  loadPayment()

  navLinks.value = await getNavLinks()
  footerColumns.value = await getFooterColumns()
  socialLinks.value = await getSocialLinks()
})
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.review-page {
  min-height: 100vh;
  background: #f7f9fb;
  color: #191c1e;
  font-family: Inter, Arial, sans-serif;
}

.container {
  width: min(1440px, 100%);
  margin: 0 auto;
  padding: 0 20px;
}

.review-main {
  padding: 70px 0 80px;
}

.review-head {
  text-align: center;
  margin-bottom: 34px;
}

.review-head h1 {
  margin: 0 0 18px;
  font-size: 54px;
  line-height: 1.04;
  font-weight: 400;
  letter-spacing: -0.03em;
}

.stepper {
  display: flex;
  justify-content: center;
  gap: 34px;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.step span {
  width: 30px;
  height: 30px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  background: #e8ecf4;
  color: #6b7280;
  font-size: 13px;
  font-weight: 600;
}

.step p {
  margin: 0;
  font-size: 10px;
  letter-spacing: 0.14em;
  color: #98a2b3;
}

.step.active span {
  background: #3563e9;
  color: #fff;
}

.step.active p {
  color: #3563e9;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 320px;
  gap: 18px;
  align-items: start;
}

.info-card,
.summary-box {
  background: #fff;
  border: 1px solid #eef2f6;
  border-radius: 18px;
  padding: 20px;
}

.info-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.info-head h3,
.summary-box h3 {
  margin: 0;
  font-size: 15px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.info-head button {
  border: 0;
  background: transparent;
  color: #3563e9;
  font-weight: 700;
  cursor: pointer;
  font-size: 11px;
}

.info-body p {
  margin: 0 0 6px;
  font-size: 14px;
  color: #4b5563;
}

.summary-row,
.summary-total {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.summary-row {
  margin-top: 14px;
  font-size: 14px;
  color: #667085;
}

.summary-total {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #e7ebf2;
  align-items: end;
}

.summary-total small {
  display: block;
  margin-top: 4px;
  font-size: 10px;
  color: #98a2b3;
}

.summary-total strong {
  font-size: 34px;
  color: #3563e9;
}

.place-btn {
  width: 100%;
  height: 48px;
  border: 0;
  border-radius: 14px;
  background: #3563e9;
  color: #fff;
  font-weight: 700;
  cursor: pointer;
  margin-top: 18px;
}

.field-error {
  margin: 10px 0 0;
  color: #d92d20;
  font-size: 12px;
}

.terms {
  margin: 14px 0 0;
  font-size: 10px;
  line-height: 1.6;
  color: #98a2b3;
}

.icons-row {
  display: flex;
  gap: 18px;
  margin-top: 16px;
  color: #7b8494;
}

.selected-items {
  margin-top: 30px;
}

.section-label {
  margin: 0 0 18px;
  font-size: 11px;
  letter-spacing: 0.18em;
  color: #98a2b3;
}

.review-item {
  display: grid;
  grid-template-columns: 88px 1fr;
  gap: 16px;
  margin-bottom: 24px;
}

.review-item-image {
  width: 88px;
  height: 88px;
  border-radius: 14px;
  object-fit: cover;
  background: #f4f6f9;
}

.review-item-top {
  display: flex;
  justify-content: space-between;
  gap: 16px;
}

.review-item-top h4 {
  margin: 0 0 8px;
  font-size: 24px;
  font-weight: 500;
}

.variant {
  margin: 0;
  font-size: 12px;
  letter-spacing: 0.1em;
  color: #98a2b3;
  text-transform: uppercase;
}

.review-item-bottom {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-top: 16px;
  font-size: 11px;
  color: #98a2b3;
}

@media (max-width: 1100px) {
  .info-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 760px) {
  .review-head h1 {
    font-size: 38px;
  }

  .review-item {
    grid-template-columns: 1fr;
  }

  .review-item-top,
  .review-item-bottom {
    flex-direction: column;
    align-items: flex-start;
  }

  .stepper {
    gap: 18px;
  }
}
</style>
