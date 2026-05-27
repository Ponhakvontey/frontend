<template>
  <div class="payment-page">
    <AppHeader :nav-links="navLinks" :cart-count="cartCount" />

    <main class="payment-main">
      <div class="container">
        <section class="payment-head">
          <h1>Payment</h1>
          <div class="stepper">
            <div class="step done">
              <span><i class="fa-solid fa-check"></i></span>
              <p>SHIPPING</p>
            </div>
            <div class="step active">
              <span>2</span>
              <p>PAYMENT</p>
            </div>
            <div class="step">
              <span>3</span>
              <p>CONFIRM</p>
            </div>
          </div>
        </section>

        <section class="payment-layout">
          <div class="payment-left">

            <!-- Payment Method Selector -->
            <div v-if="state === 'idle'" class="panel">
              <div class="method-title">
                <span class="payway-badge"><i class="fa-solid fa-shield-halved"></i> Secure Payment</span>
              </div>

              <p class="method-label">Choose a payment method</p>

              <div class="method-options">
                <button
                  class="method-card"
                  :class="{ selected: method === 'aba' }"
                  @click="method = 'aba'"
                >
                  <span class="method-radio" :class="{ active: method === 'aba' }"></span>
                  <div class="method-info">
                    <strong>ABA KHQR</strong>
                    <span>Scan with ABA Mobile or any KHQR-compatible app</span>
                  </div>
                  <span class="method-icon"><i class="fa-solid fa-credit-card"></i></span>
                </button>

                <button
                  class="method-card"
                  :class="{ selected: method === 'stripe' }"
                  @click="method = 'stripe'"
                >
                  <span class="method-radio" :class="{ active: method === 'stripe' }"></span>
                  <div class="method-info">
                    <strong>Credit / Debit Card</strong>
                    <span>Visa, Mastercard, and more — powered by Stripe</span>
                  </div>
                  <span class="method-icon"><i class="fa-solid fa-credit-card"></i></span>
                </button>
              </div>

              <div class="amount-row">
                <span>Amount due</span>
                <strong>{{ formatPrice(total) }}</strong>
              </div>

              <button class="pay-btn" @click="pay">
                <i v-if="method === 'aba'" class="fa-solid fa-qrcode"></i>
                <i v-else class="fa-solid fa-credit-card"></i>
                {{ method === 'aba' ? 'Generate KHQR' : 'Pay with Card' }}
              </button>
              <button class="back-btn" @click="router.push('/checkout')">← Back to Shipping</button>
            </div>

            <!-- Loading -->
            <div v-else-if="state === 'loading'" class="panel center-panel">
              <i class="fa-solid fa-spinner fa-spin load-icon"></i>
              <p>{{ method === 'aba' ? 'Generating your KHQR…' : 'Redirecting to Stripe…' }}</p>
            </div>

            <!-- QR: show QR code + timer (ABA only) -->
            <div v-else-if="state === 'qr'" class="panel qr-panel">
              <div class="qr-header">
                <span class="payway-badge"><i class="fa-solid fa-shield-halved"></i> Secure Payment</span>
                <span class="qr-timer" :class="{ 'timer-warn': secondsLeft <= 60 }">
                  <i class="fa-regular fa-clock"></i> {{ formatTime(secondsLeft) }}
                </span>
              </div>

              <p class="qr-instruction">
                Scan with <strong>ABA Mobile</strong> or any KHQR-compatible app
              </p>

              <div class="qr-image-wrap">
                <img v-if="qrImage" :src="qrImage" alt="KHQR Payment Code" class="qr-image" />
                <div v-else class="qr-placeholder">QR unavailable</div>
              </div>

              <div class="amount-row">
                <span>Amount due</span>
                <strong>{{ formatPrice(total) }}</strong>
              </div>

              <button class="simulate-btn" @click="simulate" :disabled="simulating">
                <i class="fa-solid fa-flask"></i>
                {{ simulating ? 'Simulating…' : 'Simulate Payment (Sandbox)' }}
              </button>

              <button class="back-btn" @click="cancelQr">← Cancel</button>
            </div>

            <!-- QR expired -->
            <div v-else-if="state === 'expired'" class="panel center-panel">
              <i class="fa-regular fa-clock error-icon"></i>
              <p class="error-text">QR code expired. Please generate a new one.</p>
              <button class="pay-btn" @click="state = 'idle'">Generate New QR</button>
              <button class="back-btn" @click="router.push('/checkout')">← Back to Shipping</button>
            </div>

            <!-- Error -->
            <div v-else-if="state === 'error'" class="panel center-panel">
              <i class="fa-solid fa-circle-exclamation error-icon"></i>
              <p class="error-text">{{ error }}</p>
              <button class="pay-btn" @click="state = 'idle'">Try Again</button>
              <button class="back-btn" @click="router.push('/checkout')">← Back to Shipping</button>
            </div>

          </div>

          <aside class="summary-panel">
            <div class="summary-card">
              <h2>Order Summary</h2>
              <div class="summary-items">
                <article v-for="item in items" :key="item.lineId" class="summary-item">
                  <img :src="item.image" :alt="item.name" class="summary-item-image" />
                  <div class="summary-item-info">
                    <h4>{{ item.name }}</h4>
                    <p>Qty: {{ item.quantity }}</p>
                    <strong>{{ formatPrice(item.price * item.quantity) }}</strong>
                  </div>
                </article>
              </div>
              <div class="summary-breakdown">
                <div class="summary-row"><span>Subtotal</span><span>{{ formatPrice(subtotal) }}</span></div>
                <div class="summary-row"><span>Shipping</span><span class="free-text">Free</span></div>
              </div>
              <div class="summary-total">
                <span>Total</span>
                <strong>{{ formatPrice(total) }}</strong>
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
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import { getFooterColumns, getNavLinks, getSocialLinks } from '@/services/homeService'
import type { FooterColumn, NavLink, SocialLink } from '@/types/home'
import { readStorage } from '@/utils/storage'
import { loadCartItems, type CartItem } from '@/utils/commerce'
import { api } from '@/services/apiClient'

const router = useRouter()

const navLinks    = ref<NavLink[]>([])
const footerColumns = ref<FooterColumn[]>([])
const socialLinks = ref<SocialLink[]>([])
const items       = ref<CartItem[]>([])

type State = 'idle' | 'loading' | 'qr' | 'expired' | 'error'
type Method = 'aba' | 'stripe'

const state     = ref<State>('idle')
const method    = ref<Method>('aba')
const error     = ref('')
const qrImage   = ref('')
const tranId    = ref('')
const secondsLeft = ref(0)
const simulating  = ref(false)

let pollInterval: ReturnType<typeof setInterval> | null = null
let timerInterval: ReturnType<typeof setInterval> | null = null

interface ShippingInfo {
  firstName: string; lastName: string
  address: string; city: string; state: string; zipCode: string; phone: string
}

const cartCount = computed(() => items.value.reduce((s, i) => s + i.quantity, 0))
const subtotal  = computed(() => items.value.reduce((s, i) => s + i.price * i.quantity, 0))
const total     = computed(() => subtotal.value)

function formatPrice(v: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD', minimumFractionDigits: 2,
  }).format(v)
}

function formatTime(secs: number) {
  const m = Math.floor(secs / 60).toString().padStart(2, '0')
  const s = (secs % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

function stopTimers() {
  if (pollInterval)  { clearInterval(pollInterval);  pollInterval  = null }
  if (timerInterval) { clearInterval(timerInterval); timerInterval = null }
}

function cancelQr() {
  stopTimers()
  state.value = 'idle'
}

function startPolling(id: string) {
  pollInterval = setInterval(async () => {
    try {
      const res = await api.get<{ status: string }>(`/api/payment/status/${id}`)
      if (res.status === 'COMPLETED') {
        stopTimers()
        router.push(`/order-success?tran_id=${id}`)
      } else if (res.status === 'FAILED') {
        stopTimers()
        state.value = 'error'
        error.value = 'Payment was declined or failed.'
      }
    } catch { /* keep polling */ }
  }, 5000)
}

function startTimer(secs: number) {
  secondsLeft.value = secs
  timerInterval = setInterval(() => {
    secondsLeft.value--
    if (secondsLeft.value <= 0) {
      stopTimers()
      state.value = 'expired'
    }
  }, 1000)
}

async function payAba(shipping: ShippingInfo) {
  // Sync cart → backend
  try { await api.delete('/api/cart/clear') } catch { /* ignore */ }
  for (const item of items.value) {
    await api.post('/api/cart/add', { productId: item.id, quantity: item.quantity })
  }

  const shippingAddress = `${shipping.address}, ${shipping.city}, ${shipping.state} ${shipping.zipCode}`

  const res = await api.post<{
    transactionId: string
    qrImage: string
    qrString: string
    expiresIn: number
  }>('/api/payment/initiate', {
    shippingAddress,
    firstName: shipping.firstName,
    lastName:  shipping.lastName,
    phone:     shipping.phone,
  })

  tranId.value  = res.transactionId
  qrImage.value = res.qrImage
  state.value   = 'qr'

  startTimer(res.expiresIn)
  startPolling(res.transactionId)
}

async function payStripe(shipping: ShippingInfo) {
  // Sync cart → backend
  try { await api.delete('/api/cart/clear') } catch { /* ignore */ }
  for (const item of items.value) {
    await api.post('/api/cart/add', { productId: item.id, quantity: item.quantity })
  }

  const shippingAddress = `${shipping.address}, ${shipping.city}, ${shipping.state} ${shipping.zipCode}`

  const res = await api.post<{ url: string; sessionId: string; orderId: number }>(
    '/api/stripe/checkout',
    { shippingAddress },
  )

  // Redirect to Stripe-hosted checkout
  window.location.href = res.url
}

async function pay() {
  state.value = 'loading'
  error.value = ''

  try {
    const shipping = readStorage<ShippingInfo | null>('shippingInfo', null)
    if (!shipping) {
      state.value = 'error'
      error.value = 'Shipping info missing. Please go back and fill in your address.'
      return
    }
    if (!items.value.length) {
      state.value = 'error'
      error.value = 'Your cart is empty.'
      return
    }

    if (method.value === 'stripe') {
      await payStripe(shipping)
    } else {
      await payAba(shipping)
    }

  } catch (err: unknown) {
    state.value = 'error'
    error.value = err instanceof Error ? err.message : 'Payment failed. Please try again.'
  }
}

async function simulate() {
  if (!tranId.value || simulating.value) return
  simulating.value = true
  try {
    await api.post(`/api/payment/simulate/${tranId.value}`, {})
  } catch {
    // polling still runs
  } finally {
    simulating.value = false
  }
}

onMounted(async () => {
  items.value         = loadCartItems()
  navLinks.value      = await getNavLinks()
  footerColumns.value = await getFooterColumns()
  socialLinks.value   = await getSocialLinks()
})

onUnmounted(() => stopTimers())
</script>

<style scoped>
.payment-page { min-height: 100vh; background: #f7f9fb; color: #191c1e; font-family: Inter, Arial, sans-serif; }
.container { width: min(1440px, 100%); margin: 0 auto; padding: 0 20px; }
.payment-main { padding: 70px 0 80px; }
.payment-head { text-align: center; margin-bottom: 34px; }
.payment-head h1 { margin: 0 0 18px; font-size: 54px; font-weight: 400; letter-spacing: -0.03em; }
.stepper { display: flex; justify-content: center; gap: 34px; }
.step { display: flex; flex-direction: column; align-items: center; gap: 8px; }
.step span { width: 30px; height: 30px; border-radius: 999px; display: grid; place-items: center; background: #e8ecf4; color: #6b7280; font-size: 13px; font-weight: 600; }
.step p { margin: 0; font-size: 10px; letter-spacing: 0.14em; color: #98a2b3; }
.step.active span { background: #513B3C; color: #fff; }
.step.active p { color: #513B3C; }
.step.done span { background: #16a34a; color: #fff; }
.step.done p { color: #16a34a; }
.payment-layout { display: grid; grid-template-columns: minmax(0, 1fr) 360px; gap: 26px; align-items: start; }
.panel { background: #fff; border: 1px solid #eef2f6; border-radius: 20px; padding: 28px 24px; display: flex; flex-direction: column; gap: 16px; }

/* Payment method selector */
.method-title { display: flex; align-items: center; }
.method-label { margin: 0; font-size: 13px; font-weight: 600; color: #344054; letter-spacing: 0.04em; text-transform: uppercase; }
.method-options { display: flex; flex-direction: column; gap: 12px; }
.method-card { display: flex; align-items: center; gap: 14px; padding: 16px; border: 1.5px solid #e4e7ec; border-radius: 14px; background: #fff; cursor: pointer; text-align: left; transition: border-color 0.15s, background 0.15s; }
.method-card:hover { border-color: #513B3C; background: #fdf8f8; }
.method-card.selected { border-color: #513B3C; background: #fdf8f8; }
.method-radio { width: 18px; height: 18px; border-radius: 999px; border: 2px solid #d0d5dd; flex-shrink: 0; transition: border-color 0.15s, background 0.15s; }
.method-radio.active { border-color: #513B3C; background: #513B3C; box-shadow: inset 0 0 0 3px #fff; }
.method-info { flex: 1; display: flex; flex-direction: column; gap: 3px; }
.method-info strong { font-size: 14px; font-weight: 600; color: #191c1e; }
.method-info span { font-size: 12px; color: #667085; }
.method-icon { font-size: 22px; }

.payway-badge { font-size: 12px; font-weight: 600; color: #16a34a; background: #dcfce7; border-radius: 999px; padding: 4px 12px; }
.center-panel { align-items: center; text-align: center; padding: 48px 24px; }
.load-icon { font-size: 40px; color: #003366; }
.error-icon { font-size: 40px; color: #d92d20; }
.error-text { margin: 0; color: #d92d20; font-size: 14px; }
.amount-row { display: flex; justify-content: space-between; align-items: center; background: #f7f9fb; border-radius: 12px; padding: 12px 16px; font-size: 14px; color: #667085; }
.amount-row strong { font-size: 22px; color: #191c1e; }
.pay-btn { width: 100%; height: 50px; border: 0; border-radius: 14px; background: #513B3C; color: #fff; font-size: 15px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; }
.pay-btn:hover { background: #6b4f50; }
.back-btn { background: transparent; border: 0; color: #513B3C; font-size: 13px; font-weight: 600; cursor: pointer; text-align: center; }
/* QR panel */
.qr-panel { align-items: center; }
.qr-header { width: 100%; display: flex; justify-content: space-between; align-items: center; }
.qr-timer { font-size: 13px; font-weight: 600; color: #667085; display: flex; align-items: center; gap: 5px; }
.qr-timer.timer-warn { color: #d92d20; }
.qr-instruction { margin: 0; font-size: 14px; color: #667085; text-align: center; }
.qr-image-wrap { display: flex; align-items: center; justify-content: center; }
.qr-image { width: 260px; height: auto; border-radius: 12px; border: 1px solid #eef2f6; display: block; }
.qr-placeholder { width: 260px; height: 260px; border-radius: 12px; border: 1px dashed #d0d5dd; display: grid; place-items: center; font-size: 13px; color: #98a2b3; }
.simulate-btn { width: 100%; height: 44px; border: 1.5px dashed #d0d5dd; border-radius: 14px; background: transparent; color: #667085; font-size: 13px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; }
.simulate-btn:hover:not(:disabled) { background: #f7f9fb; border-color: #98a2b3; color: #191c1e; }
.simulate-btn:disabled { opacity: 0.5; cursor: not-allowed; }
/* Summary */
.summary-card { background: #fff; border: 1px solid #eef2f6; border-radius: 20px; padding: 22px; }
.summary-card h2 { margin: 0 0 16px; font-size: 26px; font-weight: 500; }
.summary-items { display: flex; flex-direction: column; gap: 14px; margin-bottom: 16px; }
.summary-item { display: grid; grid-template-columns: 64px 1fr; gap: 10px; }
.summary-item-image { width: 64px; height: 64px; border-radius: 10px; object-fit: cover; background: #f4f6f9; }
.summary-item-info h4 { margin: 0 0 4px; font-size: 13px; font-weight: 600; }
.summary-item-info p { margin: 0 0 3px; font-size: 12px; color: #667085; }
.summary-item-info strong { font-size: 13px; }
.summary-breakdown { border-top: 1px solid #e7ebf2; padding-top: 14px; margin-top: 14px; }
.summary-row { display: flex; justify-content: space-between; font-size: 14px; color: #667085; margin-bottom: 10px; }
.free-text { color: #16a34a; font-weight: 700; }
.summary-total { display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #e7ebf2; padding-top: 14px; margin-top: 6px; }
.summary-total strong { font-size: 30px; }
@media (max-width: 1100px) { .payment-layout { grid-template-columns: 1fr; } }
@media (max-width: 760px) { .payment-head h1 { font-size: 38px; } .stepper { gap: 18px; } }
</style>