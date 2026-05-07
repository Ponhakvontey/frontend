<template>
  <div class="payment-page">
    <AppHeader :nav-links="navLinks" :cart-count="cartCount" />

    <main class="payment-main">
      <div class="container">
        <section class="payment-head">
          <h1>Payment Method</h1>

          <div class="stepper">
            <div class="step">
              <span>1</span>
              <p>SHIPPING</p>
            </div>
            <div class="step active">
              <span>2</span>
              <p>PAYMENT</p>
            </div>
            <div class="step">
              <span>3</span>
              <p>REVIEW</p>
            </div>
          </div>
        </section>

        <section class="payment-layout">
          <div class="payment-left">
            <div class="panel payment-panel">
              <label class="payment-option active-option">
                <div class="option-left">
                  <input v-model="paymentMethod" type="radio" value="card" />
                  <span>Credit or Debit Card</span>
                </div>
                <span>💳</span>
              </label>

              <div class="payment-form" v-if="paymentMethod === 'card'">
                <div class="field">
                  <label>CARD NUMBER</label>
                  <input v-model="card.number" type="text" placeholder="0000 0000 0000 0000" />
                  <p v-if="paymentErrors.number" class="field-error">{{ paymentErrors.number }}</p>
                </div>

                <div class="grid two">
                  <div class="field">
                    <label>EXPIRY DATE</label>
                    <input v-model="card.expiry" type="text" placeholder="MM / YY" />
                    <p v-if="paymentErrors.expiry" class="field-error">{{ paymentErrors.expiry }}</p>
                  </div>
                  <div class="field">
                    <label>CVV</label>
                    <input v-model="card.cvv" type="text" placeholder="•••" />
                    <p v-if="paymentErrors.cvv" class="field-error">{{ paymentErrors.cvv }}</p>
                  </div>
                </div>
              </div>
            </div>

            <div class="panel alt-option">
              <label class="payment-option">
                <div class="option-left">
                  <input v-model="paymentMethod" type="radio" value="paypal" />
                  <span>PayPal</span>
                </div>
                <span>◔</span>
              </label>
            </div>

            <div class="panel alt-option">
              <label class="payment-option">
                <div class="option-left">
                  <input v-model="paymentMethod" type="radio" value="applepay" />
                  <span>Apple Pay</span>
                </div>
                <span></span>
              </label>
            </div>

            <div class="payment-actions">
              <button type="button" class="back-btn" @click="goBack">← BACK TO SHIPPING</button>

              <button type="button" class="review-btn" @click="reviewOrder">REVIEW ORDER</button>
            </div>
            <p v-if="formError" class="field-error">{{ formError }}</p>
          </div>

          <aside class="summary-panel">
            <div class="summary-card">
              <h2>Order Summary</h2>

              <div class="summary-items">
                <article v-for="item in items" :key="item.lineId" class="summary-item">
                  <img :src="item.image" :alt="item.name" class="summary-item-image" />
                  <div class="summary-item-info">
                    <h4>{{ item.name }}</h4>
                    <p>{{ item.variant }}</p>
                    <p>Qty: {{ item.quantity }}</p>
                    <strong>{{ formatPrice(item.price * item.quantity) }}</strong>
                  </div>
                </article>
              </div>

              <div class="summary-breakdown">
                <div class="summary-row">
                  <span>Subtotal</span>
                  <span>{{ formatPrice(subtotal) }}</span>
                </div>
                <div class="summary-row">
                  <span>Shipping</span>
                  <span class="free-text">Free</span>
                </div>
                <div class="summary-row">
                  <span>Estimated Tax</span>
                  <span>{{ formatPrice(estimatedTax) }}</span>
                </div>
              </div>

              <div class="summary-total">
                <span>Total</span>
                <strong>{{ formatPrice(total) }}</strong>
              </div>

              <div class="summary-footer">
                <span>🛡️ Secure Payment</span>
                <span>🚚 Ships Tomorrow</span>
              </div>
            </div>
          </aside>
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
import { isValidCardNumber, isValidCvv, isValidExpiry } from '@/utils/validation'
import { loadCartItems, type CartItem } from '@/utils/commerce'

const router = useRouter()

const navLinks = ref<NavLink[]>([])
const footerColumns = ref<FooterColumn[]>([])
const socialLinks = ref<SocialLink[]>([])
const items = ref<CartItem[]>([])

const paymentMethod = ref('card')

const card = ref({
  number: '',
  expiry: '',
  cvv: '',
})
const paymentErrors = ref<Record<string, string>>({})
const formError = ref('')

function loadCart() {
  items.value = loadCartItems()
}

function loadPayment() {
  const savedPayment = readStorage<{ method?: string; cardLast4?: string } | null>('paymentInfo', null)
  if (!savedPayment) return
  paymentMethod.value = savedPayment.method || 'card'
}

const cartCount = computed(() => {
  return items.value.reduce((sum, item) => sum + item.quantity, 0)
})

const subtotal = computed(() => {
  return items.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
})

const estimatedTax = computed(() => subtotal.value * 0.08)
const total = computed(() => subtotal.value + estimatedTax.value)

function formatPrice(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(value)
}

function goBack() {
  router.push('/checkout')
}

function reviewOrder() {
  paymentErrors.value = {}
  formError.value = ''

  if (!items.value.length) {
    formError.value = 'Your cart is empty. Add items before payment.'
    return
  }

  const nextErrors: Record<string, string> = {}
  if (paymentMethod.value === 'card') {
    if (!card.value.number.trim()) nextErrors.number = 'Card number is required.'
    else if (!isValidCardNumber(card.value.number)) nextErrors.number = 'Enter a valid 16-digit card number.'
    if (!card.value.expiry.trim()) nextErrors.expiry = 'Expiry date is required.'
    else if (!isValidExpiry(card.value.expiry)) nextErrors.expiry = 'Enter a valid expiry date (MM/YY).'
    if (!card.value.cvv.trim()) nextErrors.cvv = 'CVV is required.'
    else if (!isValidCvv(card.value.cvv)) nextErrors.cvv = 'Enter a valid CVV.'
  }

  paymentErrors.value = nextErrors
  if (Object.keys(nextErrors).length > 0) return

  writeStorage('paymentInfo', {
    method: paymentMethod.value,
    cardLast4: paymentMethod.value === 'card' ? card.value.number.replace(/\s/g, '').slice(-4) : '',
  })

  router.push('/review')
}

onMounted(async () => {
  loadCart()
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

.payment-page {
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

.payment-main {
  padding: 70px 0 80px;
}

.payment-head {
  text-align: center;
  margin-bottom: 34px;
}

.payment-head h1 {
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

.payment-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 360px;
  gap: 26px;
  align-items: start;
}

.payment-left {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.panel {
  background: #fff;
  border: 1px solid #eef2f6;
  border-radius: 20px;
  padding: 18px 20px;
}

.payment-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
}

.option-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.payment-form {
  margin-top: 18px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field-error {
  margin: 0;
  color: #d92d20;
  font-size: 12px;
}

.field label {
  font-size: 10px;
  letter-spacing: 0.12em;
  color: #98a2b3;
}

.field input {
  height: 44px;
  border: 0;
  border-radius: 12px;
  background: #f4f6f9;
  padding: 0 14px;
  outline: none;
  color: #191c1e;
}

.grid {
  display: grid;
  gap: 14px;
}

.grid.two {
  grid-template-columns: 1fr 1fr;
}

.payment-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 6px;
}

.back-btn {
  border: 0;
  background: transparent;
  color: #3563e9;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.review-btn {
  min-width: 180px;
  height: 48px;
  border: 0;
  border-radius: 14px;
  background: #3563e9;
  color: #fff;
  font-weight: 700;
  cursor: pointer;
}

.summary-card {
  background: #fff;
  border: 1px solid #eef2f6;
  border-radius: 20px;
  padding: 22px;
}

.summary-card h2 {
  margin: 0 0 18px;
  font-size: 28px;
  font-weight: 500;
}

.summary-items {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 18px;
}

.summary-item {
  display: grid;
  grid-template-columns: 70px 1fr;
  gap: 12px;
}

.summary-item-image {
  width: 70px;
  height: 70px;
  border-radius: 12px;
  object-fit: cover;
  background: #f4f6f9;
}

.summary-item-info h4 {
  margin: 0 0 6px;
  font-size: 14px;
  font-weight: 600;
}

.summary-item-info p {
  margin: 0 0 4px;
  font-size: 12px;
  color: #667085;
}

.summary-item-info strong {
  font-size: 13px;
  color: #191c1e;
}

.summary-breakdown {
  margin-top: 18px;
  padding-top: 16px;
  border-top: 1px solid #e7ebf2;
}

.summary-row,
.summary-total,
.summary-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.summary-row {
  margin-bottom: 14px;
  font-size: 14px;
  color: #667085;
}

.free-text {
  color: #3563e9;
  font-weight: 700;
}

.summary-total {
  margin-top: 18px;
  padding-top: 16px;
  border-top: 1px solid #e7ebf2;
}

.summary-total strong {
  font-size: 34px;
  color: #191c1e;
}

.summary-footer {
  margin-top: 18px;
  font-size: 11px;
  color: #7b8494;
}

@media (max-width: 1100px) {
  .payment-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 760px) {
  .payment-head h1 {
    font-size: 38px;
  }

  .grid.two {
    grid-template-columns: 1fr;
  }

  .payment-actions {
    flex-direction: column;
    align-items: flex-start;
    gap: 14px;
  }

  .stepper {
    gap: 18px;
  }

  .summary-footer {
    flex-direction: column;
    gap: 8px;
    align-items: flex-start;
  }
}
</style>
