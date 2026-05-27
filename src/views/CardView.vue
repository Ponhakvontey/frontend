<template>
  <div class="cart-page">
    <AppHeader :nav-links="navLinks" :cart-count="cartCount" />

    <main class="cart-main">
      <div class="container">

        <!-- Empty -->
        <div v-if="items.length === 0" class="empty-state">
          <i class="fa-regular fa-bag-shopping" style="font-size:40px;color:#AABBAA;"></i>
          <h2>Your bag is empty</h2>
          <p>Add items from the shop to get started.</p>
          <RouterLink to="/sell" class="browse-btn">Browse Products</RouterLink>
        </div>

        <!-- Main layout -->
        <div v-else class="page-layout">

          <!-- ── LEFT ── -->
          <div class="left-col">

            <!-- Delivery Address -->
            <section class="section-block">
              <h2 class="section-title">Delivery address</h2>
              <div class="address-card">
                <div class="addr-row">
                  <label class="check-wrap">
                    <input type="checkbox" checked readonly class="addr-check" />
                  </label>
                  <div class="addr-details">
                    <strong class="addr-name">{{ profile.fullName || '—' }}</strong>
                    <p class="addr-line">{{ profile.city || profile.address || '—' }}</p>
                    <p class="addr-line">{{ profile.phone || '' }}</p>
                  </div>
                  <button class="text-btn" @click="goToProfile">
                    Change Address <i class="fa-solid fa-chevron-right"></i>
                  </button>
                </div>
                <hr class="addr-hr" />
                <div class="delivery-row">
                  <div class="brand-circle">U</div>
                  <div class="delivery-info">
                    <strong>Delivery: $1.00</strong>
                    <p>Ubuyee Delivery (within 1–3 days)</p>
                  </div>
                  <button class="text-btn">More <i class="fa-solid fa-chevron-right"></i></button>
                </div>
              </div>
            </section>

            <!-- Shopping Bag -->
            <section class="section-block">
              <h2 class="section-title">My shopping bag ({{ totalQty }})</h2>
              <div class="items-list">
                <article v-for="item in items" :key="item.lineId" class="cart-item">
                  <div class="item-img-wrap">
                    <img v-if="item.image" :src="item.image" :alt="item.name" class="item-img" />
                    <div v-else class="item-img-ph"><i class="fa-solid fa-image"></i></div>
                  </div>
                  <div class="item-details">
                    <p class="item-name">{{ item.name }}</p>
                    <p class="item-meta">Code. {{ item.id }}</p>
                    <p class="item-meta">{{ item.variant || 'Default' }}</p>
                    <p class="item-meta">Quantity x {{ item.quantity }}</p>
                    <div class="item-controls">
                      <div class="qty-ctrl">
                        <button type="button" class="qty-btn" @click="decreaseQty(item.lineId)">
                          <i class="fa-solid fa-minus"></i>
                        </button>
                        <span class="qty-val">{{ item.quantity }}</span>
                        <button type="button" class="qty-btn" @click="increaseQty(item.lineId)">
                          <i class="fa-solid fa-plus"></i>
                        </button>
                      </div>
                      <button type="button" class="remove-btn" @click="removeItem(item.lineId)">
                        <i class="fa-solid fa-trash-can"></i>
                      </button>
                    </div>
                  </div>
                  <p class="item-price">US ${{ (item.price * item.quantity).toFixed(2) }}</p>
                </article>
              </div>
            </section>

          </div>

          <!-- ── RIGHT ── -->
          <div class="right-col">

            <!-- Payment Methods -->
            <section class="section-block">
              <h2 class="section-title">Payment</h2>
              <div class="payment-list">

                <!-- ABA PAY -->
                <label class="method-row" :class="{ selected: selectedMethod === 'aba' }">
                  <input
                    type="checkbox"
                    :checked="selectedMethod === 'aba'"
                    @change="selectedMethod = selectedMethod === 'aba' ? '' : 'aba'"
                    class="method-check"
                  />
                  <img :src="abaLogo" alt="ABA Pay" class="aba-img" />
                  <div class="method-text">
                    <strong>ABA PAY</strong>
                    <span>Scan to pay with ABA Mobile</span>
                  </div>
                </label>

                <!-- Credit / Debit Card -->
                <label class="method-row" :class="{ selected: selectedMethod === 'card' }">
                  <input
                    type="checkbox"
                    :checked="selectedMethod === 'card'"
                    @change="selectedMethod = selectedMethod === 'card' ? '' : 'card'"
                    class="method-check"
                  />
                  <div class="card-icon-box">
                    <i class="fa-solid fa-credit-card"></i>
                  </div>
                  <div class="method-text">
                    <strong>Credit/Debit Card</strong>
                    <div class="card-brand-icons">
                      <img src="https://cdn.simpleicons.org/visa" alt="Visa" class="brand-img" />
                      <img src="https://cdn.simpleicons.org/mastercard" alt="Mastercard" class="brand-img" />
                      <i class="fa-brands fa-cc-amex"></i>
                      <i class="fa-brands fa-cc-jcb"></i>
                    </div>
                  </div>
                </label>

              </div>
            </section>

            <!-- Preferred contact -->
            <section class="section-block">
              <h2 class="section-title">Preferred contact line</h2>
              <div class="contact-row">
                <label class="contact-opt" :class="{ selected: contactMethods.includes('phone') }">
                  <input type="checkbox" :checked="contactMethods.includes('phone')" @change="toggleContact('phone')" />
                  <i class="fa-solid fa-phone"></i> Phone call
                </label>
                <label class="contact-opt" :class="{ selected: contactMethods.includes('telegram') }">
                  <input type="checkbox" :checked="contactMethods.includes('telegram')" @change="toggleContact('telegram')" />
                  <i class="fa-brands fa-telegram"></i> Telegram
                </label>
                <label class="contact-opt" :class="{ selected: contactMethods.includes('whatsapp') }">
                  <input type="checkbox" :checked="contactMethods.includes('whatsapp')" @change="toggleContact('whatsapp')" />
                  <i class="fa-brands fa-whatsapp"></i> WhatsApp
                </label>
              </div>
              <input
                v-model="contactPhone"
                type="tel"
                class="contact-phone"
                :placeholder="profile.phone || '+855 123 456 789'"
              />
            </section>

            <!-- Order Summary -->
            <div class="summary-box">
              <div class="sum-row">
                <strong>Total</strong>
                <strong>US ${{ subtotal.toFixed(2) }}</strong>
              </div>
              <div class="sum-row muted">
                <span>Save</span>
                <span>US $0</span>
              </div>
              <div class="sum-row muted">
                <span>Delivery fee (Ubuyee)</span>
                <span>US ${{ deliveryFee.toFixed(2) }}</span>
              </div>
              <hr class="sum-hr" />
              <div class="sum-row bold-row">
                <strong>Amount to pay</strong>
                <strong>US ${{ amountToPay.toFixed(2) }}</strong>
              </div>

              <button
                class="checkout-btn"
                :disabled="!selectedMethod || checkoutLoading"
                @click="handleCheckout"
              >
                <i v-if="checkoutLoading" class="fa-solid fa-spinner fa-spin"></i>
                {{ checkoutLoading ? 'Processing…' : 'Checkout' }}
              </button>
              <p v-if="checkoutError" class="checkout-error">{{ checkoutError }}</p>
            </div>

          </div>
        </div>
      </div>
    </main>

    <!-- ═══════════ ABA PAY MODAL ═══════════ -->
    <Teleport to="body">
      <div v-if="showAbaModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal aba-modal">

          <div class="modal-head">
            <div class="aba-badge">
              <img :src="abaLogo" alt="ABA Pay" class="aba-img-sm" />
            </div>
            <div class="modal-timer">
              <i class="fa-solid fa-spinner fa-spin timer-spin"></i>
              <span :class="{ 'timer-warn': secondsLeft <= 60 }">{{ formatTime(secondsLeft) }}</span>
            </div>
            <button class="modal-x" @click="closeModal">×</button>
          </div>

          <div class="aba-amount">
            <span class="amount-num">{{ amountToPay.toFixed(2) }}</span>
            <span class="amount-usd">USD</span>
          </div>

          <div class="qr-wrap">
            <div class="qr-frame">
              <span class="qr-corner tl"></span>
              <span class="qr-corner tr"></span>
              <span class="qr-corner bl"></span>
              <span class="qr-corner br"></span>
              <img v-if="qrImage" :src="qrImage" class="qr-img" alt="QR code" />
              <div v-else class="qr-ph"><i class="fa-solid fa-spinner fa-spin" style="font-size:32px;color:#AABBAA;"></i></div>
            </div>
            <p class="scan-label">Scan to pay</p>
          </div>

          <!-- Sandbox simulate button (dev only) -->
          <button v-if="isDev" class="sim-btn" :disabled="simulating" @click="simulate">
            <i class="fa-solid fa-flask"></i>
            {{ simulating ? 'Simulating…' : 'Simulate Payment (Dev)' }}
          </button>

        </div>
      </div>
    </Teleport>

    <!-- ═══════════ CARD MODAL ═══════════ -->
    <Teleport to="body">
      <div v-if="showCardModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal card-modal">

          <div class="modal-head">
            <h3 class="card-modal-title">Credit/Debit Card</h3>
            <div class="modal-timer">
              <i class="fa-solid fa-spinner fa-spin timer-spin"></i>
              <span :class="{ 'timer-warn': cardTimer <= 30 }">{{ formatTime(cardTimer) }}</span>
            </div>
            <button class="modal-x" @click="closeModal">×</button>
          </div>

          <div class="card-form">
            <div class="field-wrap">
              <label class="field-label">Card number</label>
              <div class="card-input-row">
                <input
                  v-model="cardNumber"
                  type="text"
                  placeholder="Card number"
                  class="card-input"
                  maxlength="19"
                  @input="formatCardNumber"
                />
                <div class="inline-card-logos">
                  <img src="https://cdn.simpleicons.org/visa" alt="Visa" class="brand-img" />
                  <img src="https://cdn.simpleicons.org/mastercard" alt="Mastercard" class="brand-img" />
                  <i class="fa-brands fa-cc-amex"></i>
                  <i class="fa-brands fa-cc-jcb"></i>
                </div>
              </div>
            </div>

            <div class="card-fields-row">
              <div class="field-wrap">
                <label class="field-label">Expiry date</label>
                <input
                  v-model="expiryDate"
                  type="text"
                  placeholder="MM / YY"
                  class="card-input"
                  maxlength="7"
                />
              </div>
              <div class="field-wrap">
                <label class="field-label">CVV</label>
                <div class="card-input-row">
                  <input
                    v-model="cvv"
                    type="password"
                    placeholder="000"
                    class="card-input"
                    maxlength="4"
                  />
                  <i class="fa-regular fa-credit-card cvv-icon"></i>
                </div>
              </div>
            </div>

            <p class="security-note">
              Encrypted storage and processing of credit/debit card payments is handled by our
              trusted payment solution <a href="#" class="payway-link">Stripe</a>.
            </p>
          </div>

          <div class="card-totals">
            <div class="ctotal-row">
              <span>Subtotal:</span>
              <span>{{ subtotal.toFixed(2) }} USD</span>
            </div>
            <hr class="ctotal-hr" />
            <div class="ctotal-row bold">
              <span>TOTAL:</span>
              <span>{{ amountToPay.toFixed(2) }} USD</span>
            </div>
          </div>

          <button class="card-pay-btn" :disabled="stripeLoading" @click="payWithStripe">
            <i v-if="stripeLoading" class="fa-solid fa-spinner fa-spin"></i>
            {{ stripeLoading ? 'Redirecting…' : `Pay $${amountToPay.toFixed(2)}` }}
          </button>

        </div>
      </div>
    </Teleport>

    <AppFooter :footer-columns="footerColumns" :social-links="socialLinks" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import { getFooterColumns, getNavLinks, getSocialLinks } from '@/services/homeService'
import type { FooterColumn, NavLink, SocialLink } from '@/types/home'
import type { CartItem } from '@/utils/commerce'
import { api } from '@/services/apiClient'
import abaLogo from '@/assets/aba.png'

const router = useRouter()

// ── Nav / footer ──────────────────────────────────────────────────────────────
const navLinks      = ref<NavLink[]>([])
const footerColumns = ref<FooterColumn[]>([])
const socialLinks   = ref<SocialLink[]>([])

// ── Cart ──────────────────────────────────────────────────────────────────────
const items       = ref<CartItem[]>([])
const deliveryFee = ref(1.0)

// ── User profile ──────────────────────────────────────────────────────────────
interface Profile { fullName: string; phone: string; address: string; city: string }
const profile = ref<Profile>({ fullName: '', phone: '', address: '', city: '' })

// ── Payment selection ─────────────────────────────────────────────────────────
const selectedMethod = ref<'aba' | 'card' | ''>('')

// ── Contact preferences ───────────────────────────────────────────────────────
const contactMethods = ref<string[]>(['phone'])
const contactPhone   = ref('')

// ── ABA modal state ───────────────────────────────────────────────────────────
const showAbaModal = ref(false)
const qrImage      = ref('')
const tranId       = ref('')
const secondsLeft  = ref(0)
const simulating   = ref(false)
let sseSource: EventSource | null = null
let timerInterval: ReturnType<typeof setInterval> | null = null

// ── Card modal state ──────────────────────────────────────────────────────────
const showCardModal = ref(false)
const cardNumber    = ref('')
const expiryDate    = ref('')
const cvv           = ref('')
const cardTimer     = ref(180)
const stripeLoading = ref(false)
let cardTimerInterval: ReturnType<typeof setInterval> | null = null

// ── UI state ──────────────────────────────────────────────────────────────────
const checkoutLoading = ref(false)
const checkoutError   = ref('')
const isDev = import.meta.env.DEV

// ── Computed ──────────────────────────────────────────────────────────────────
const cartCount  = computed(() => items.value.reduce((s, i) => s + i.quantity, 0))
const totalQty   = computed(() => items.value.reduce((s, i) => s + i.quantity, 0))
const subtotal   = computed(() => items.value.reduce((s, i) => s + i.price * i.quantity, 0))
const amountToPay = computed(() => subtotal.value + deliveryFee.value)

// ── API cart helpers ──────────────────────────────────────────────────────────
interface ApiCartItem {
  productId: string
  productName: string
  productImageUrl: string | null
  size: string | null
  quantity: number
  currentPrice: number
}

async function loadCart() {
  try {
    const data = await api.get<{ items?: ApiCartItem[] }>('/api/cart')
    items.value = (data.items ?? []).map(i => ({
      lineId:   `${i.productId}:${i.size ?? 'Default'}`,
      id:       i.productId,
      brand:    '',
      name:     i.productName,
      variant:  i.size ?? 'Default',
      price:    Number(i.currentPrice),
      quantity: i.quantity,
      image:    i.productImageUrl ?? '',
    }))
  } catch {
    items.value = []
  }
}

function parseLineId(lineId: string) {
  const idx = lineId.indexOf(':')
  const productId = lineId.substring(0, idx)
  const variant   = lineId.substring(idx + 1)
  return { productId, size: variant === 'Default' ? null : variant }
}

async function increaseQty(lineId: string) {
  const item = items.value.find(i => i.lineId === lineId)
  if (!item) return
  const { productId, size } = parseLineId(lineId)
  try {
    await api.put('/api/cart/update', { productId, quantity: item.quantity + 1, size: size ?? undefined })
    await loadCart()
  } catch { /* ignore */ }
}

async function decreaseQty(lineId: string) {
  const item = items.value.find(i => i.lineId === lineId)
  if (!item || item.quantity <= 1) return
  const { productId, size } = parseLineId(lineId)
  try {
    await api.put('/api/cart/update', { productId, quantity: item.quantity - 1, size: size ?? undefined })
    await loadCart()
  } catch { /* ignore */ }
}

async function removeItem(lineId: string) {
  const { productId, size } = parseLineId(lineId)
  const sizeParam = size ? `?size=${encodeURIComponent(size)}` : ''
  try {
    await api.delete(`/api/cart/remove/${productId}${sizeParam}`)
    await loadCart()
  } catch { /* ignore */ }
}

// ── Contact helpers ───────────────────────────────────────────────────────────
function toggleContact(method: string) {
  const idx = contactMethods.value.indexOf(method)
  if (idx >= 0) contactMethods.value.splice(idx, 1)
  else contactMethods.value.push(method)
}

// ── Timer helpers ──────────────────────────────────────────────────────────────
function formatTime(secs: number) {
  const m = Math.floor(secs / 60).toString().padStart(2, '0')
  const s = (secs % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

function stopAbaTimers() {
  if (sseSource)     { sseSource.close();            sseSource     = null }
  if (timerInterval) { clearInterval(timerInterval); timerInterval = null }
}

function stopCardTimer() {
  if (cardTimerInterval) { clearInterval(cardTimerInterval); cardTimerInterval = null }
}

function startAbaTimer(secs: number) {
  secondsLeft.value = secs
  timerInterval = setInterval(() => {
    secondsLeft.value--
    if (secondsLeft.value <= 0) {
      stopAbaTimers()
      closeModal()
      checkoutError.value = 'QR code expired. Please try again.'
    }
  }, 1000)
}

function startPolling(id: string) {
  // Use SSE for real-time payment status — falls back to the /status poll endpoint
  // if EventSource is not available (unlikely in any modern browser).
  if (typeof EventSource === 'undefined') {
    return
  }

  const url = `/api/payment/stream/${encodeURIComponent(id)}`
  sseSource = new EventSource(url, { withCredentials: true })

  sseSource.addEventListener('payment-status', (event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data) as { status: string }
      if (data.status === 'COMPLETED') {
        stopAbaTimers()
        router.push(`/order-success?tran_id=${id}`)
      } else if (data.status === 'FAILED') {
        stopAbaTimers()
        closeModal()
        checkoutError.value = 'Payment was declined. Please try again.'
      }
    } catch { /* malformed event — keep connection open */ }
  })

  sseSource.onerror = () => {
    // Connection dropped — SSE auto-reconnects, but if we're past the QR lifetime
    // the timer will close the modal anyway. No user action needed.
  }
}

function startCardTimer() {
  cardTimer.value = 180
  cardTimerInterval = setInterval(() => {
    cardTimer.value--
    if (cardTimer.value <= 0) {
      stopCardTimer()
      closeModal()
    }
  }, 1000)
}

// ── Modal helpers ─────────────────────────────────────────────────────────────
function closeModal() {
  stopAbaTimers()
  stopCardTimer()
  showAbaModal.value  = false
  showCardModal.value = false
}

// ── Profile ───────────────────────────────────────────────────────────────────
async function loadProfile() {
  try {
    const res = await api.get<any>('/api/users/profile')
    profile.value = {
      fullName: res.fullName ?? res.name ?? '',
      phone:    res.phone ?? res.phoneNumber ?? '',
      address:  res.address ?? '',
      city:     res.city ?? '',
    }
    if (!contactPhone.value) contactPhone.value = profile.value.phone
  } catch { /* not logged in or no profile */ }
}

function goToProfile() { router.push('/profile') }

// ── Shipping info builder ─────────────────────────────────────────────────────
function buildShippingInfo() {
  const parts  = (profile.value.fullName || 'User').split(' ')
  const phone  = contactPhone.value || profile.value.phone || ''
  return {
    firstName: parts[0] || 'User',
    lastName:  parts.slice(1).join(' ') || '',
    address:   profile.value.address || profile.value.city || 'Phnom Penh',
    city:      profile.value.city || 'Phnom Penh',
    state:     'KH',
    zipCode:   '12000',
    phone,
  }
}

// ── Checkout handler ──────────────────────────────────────────────────────────
async function handleCheckout() {
  if (!selectedMethod.value || checkoutLoading.value) return
  checkoutLoading.value = true
  checkoutError.value   = ''

  try {
    const shipping = buildShippingInfo()

    if (selectedMethod.value === 'aba') {
      const res = await api.post<{ transactionId: string; qrImage: string; expiresIn: number }>(
        '/api/payment/initiate',
        {
          shippingAddress: `${shipping.address}, ${shipping.city}`,
          firstName: shipping.firstName,
          lastName:  shipping.lastName,
          phone:     shipping.phone,
        },
      )
      tranId.value   = res.transactionId
      qrImage.value  = res.qrImage
      showAbaModal.value = true
      startAbaTimer(res.expiresIn)
      startPolling(res.transactionId)

    } else {
      // Card: show form first, actual payment on submit
      showCardModal.value = true
      startCardTimer()
    }

  } catch (err: unknown) {
    checkoutError.value = err instanceof Error ? err.message : 'Checkout failed. Please try again.'
  } finally {
    checkoutLoading.value = false
  }
}

// ── Pay with Stripe (from card modal) ────────────────────────────────────────
async function payWithStripe() {
  stripeLoading.value = true
  try {
    const shipping = buildShippingInfo()
    const res = await api.post<{ url: string; sessionId: string }>(
      '/api/stripe/checkout',
      { shippingAddress: `${shipping.address}, ${shipping.city}` },
    )
    window.location.href = res.url
  } catch (err: unknown) {
    checkoutError.value = err instanceof Error ? err.message : 'Stripe checkout failed.'
    closeModal()
  } finally {
    stripeLoading.value = false
  }
}

// ── Sandbox simulate ──────────────────────────────────────────────────────────
async function simulate() {
  if (!tranId.value || simulating.value) return
  simulating.value = true
  try { await api.post(`/api/payment/simulate/${tranId.value}`, {}) }
  catch { /* polling still runs */ }
  finally { simulating.value = false }
}

// ── Card number formatter ─────────────────────────────────────────────────────
function formatCardNumber() {
  cardNumber.value = cardNumber.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim().slice(0, 19)
}

// ── Init ──────────────────────────────────────────────────────────────────────
onMounted(async () => {
  const [nav, footer, social] = await Promise.all([getNavLinks(), getFooterColumns(), getSocialLinks(), loadCart()])
  navLinks.value      = nav
  footerColumns.value = footer
  socialLinks.value   = social
  await loadProfile()
})

onUnmounted(() => { stopAbaTimers(); stopCardTimer() })
</script>

<style scoped>
* { box-sizing: border-box; }

.cart-page {
  min-height: 100vh;
  background: #fff;
  color: #000;
  font-family: Helvetica, Arial, sans-serif;
}

.cart-main { padding: 90px 0 72px; }

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

/* ── Empty ── */
.empty-state {
  display: flex; flex-direction: column; align-items: center;
  gap: 12px; padding: 80px 20px; text-align: center;
}
.empty-state h2 { margin: 0; font-size: 24px; font-weight: 700; }
.empty-state p  { margin: 0; font-size: 14px; color: #808080; }
.browse-btn {
  display: inline-flex; align-items: center; height: 44px; padding: 0 24px;
  background: #000; color: #fff; border-radius: 4px; text-decoration: none;
  font-weight: 700; font-size: 14px; transition: background 0.15s;
}
.browse-btn:hover { background: #222; }

/* ── Page layout ── */
.page-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 380px;
  gap: 32px;
  align-items: start;
}

/* ── Section blocks ── */
.section-block { margin-bottom: 28px; }

.section-title {
  margin: 0 0 14px;
  font-size: 18px;
  font-weight: 700;
  color: #000;
}

/* ── Address card ── */
.address-card {
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 16px 20px;
  background: #fafafa;
}

.addr-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.check-wrap { padding-top: 2px; }
.addr-check { width: 16px; height: 16px; cursor: pointer; accent-color: #000; }

.addr-details { flex: 1; }
.addr-name { display: block; font-size: 15px; font-weight: 700; margin-bottom: 4px; }
.addr-line { margin: 0 0 2px; font-size: 13px; color: #333; }

.text-btn {
  white-space: nowrap; background: none; border: none; cursor: pointer;
  font-size: 13px; color: #555; font-family: inherit; padding: 0;
  display: flex; align-items: center; gap: 4px;
}
.text-btn:hover { color: #000; }
.text-btn i { font-size: 10px; }

.addr-hr { border: none; border-top: 1px solid #e0e0e0; margin: 14px 0; }

.delivery-row {
  display: flex; align-items: center; gap: 12px;
}

.brand-circle {
  width: 36px; height: 36px; border-radius: 50%;
  background: #000; color: #fff;
  display: grid; place-items: center;
  font-size: 14px; font-weight: 700; flex-shrink: 0;
}

.delivery-info { flex: 1; }
.delivery-info strong { display: block; font-size: 14px; font-weight: 700; color: #000; }
.delivery-info p { margin: 2px 0 0; font-size: 12px; color: #808080; }

/* ── Cart items ── */
.items-list { display: flex; flex-direction: column; }

.cart-item {
  display: grid;
  grid-template-columns: 96px 1fr auto;
  gap: 16px;
  padding: 16px 0;
  border-bottom: 1px solid #f0f0f0;
  align-items: start;
}
.cart-item:last-child { border-bottom: none; }

.item-img-wrap {
  width: 96px; height: 120px; border-radius: 4px;
  background: #f5f5f5; overflow: hidden; border: 1px solid #AABBAA;
}
.item-img { width: 100%; height: 100%; object-fit: cover; display: block; }
.item-img-ph { width: 100%; height: 100%; display: grid; place-items: center; color: #AABBAA; font-size: 20px; }

.item-details { min-width: 0; }
.item-name { margin: 0 0 4px; font-size: 14px; font-weight: 700; color: #000; }
.item-meta { margin: 0 0 3px; font-size: 12px; color: #555; }

.item-controls {
  display: flex; align-items: center; gap: 8px; margin-top: 8px;
}

.qty-ctrl {
  display: inline-flex; align-items: center; gap: 8px;
  border: 1px solid #AABBAA; border-radius: 4px;
  padding: 4px 10px; background: #f5f5f5;
}
.qty-btn {
  border: none; background: transparent; cursor: pointer;
  color: #000; font-size: 11px; width: 18px; height: 18px;
  display: grid; place-items: center;
}
.qty-val { font-size: 13px; font-weight: 700; min-width: 16px; text-align: center; }

.remove-btn {
  border: none; background: transparent; cursor: pointer;
  color: #DA292E; font-size: 13px; padding: 4px;
  transition: opacity 0.15s;
}
.remove-btn:hover { opacity: 0.7; }

.item-price {
  white-space: nowrap; font-size: 15px; font-weight: 700;
  color: #DA292E; margin: 0;
}

/* ── Payment list ── */
.payment-list { display: flex; flex-direction: column; gap: 0; border: 1px solid #e0e0e0; border-radius: 4px; overflow: hidden; }

.method-row {
  display: flex; align-items: center; gap: 14px;
  padding: 14px 16px; cursor: pointer;
  background: #fff; border-bottom: 1px solid #e0e0e0;
  transition: background 0.15s;
}
.method-row:last-child { border-bottom: none; }
.method-row:hover { background: #fafafa; }
.method-row.selected { background: #f5f5f5; }

.method-check { width: 16px; height: 16px; cursor: pointer; accent-color: #000; flex-shrink: 0; }

/* ABA logo image */
.aba-img {
  width: 52px; height: 34px;
  object-fit: contain; border-radius: 6px; flex-shrink: 0;
}

/* Card icon box */
.card-icon-box {
  width: 52px; height: 34px;
  background: linear-gradient(135deg, #1a1a2e, #16213e);
  border-radius: 6px;
  display: grid; place-items: center;
  flex-shrink: 0;
  color: #fff; font-size: 18px;
}

.method-text { flex: 1; min-width: 0; }
.method-text strong { display: block; font-size: 14px; font-weight: 700; color: #000; margin-bottom: 2px; }
.method-text span { font-size: 12px; color: #808080; }

.card-brand-icons { display: flex; gap: 4px; font-size: 18px; color: #808080; margin-top: 2px; align-items: center; }
.brand-img { height: 18px; width: auto; display: block; }

/* ── Preferred contact ── */
.contact-row {
  display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 12px;
}

.contact-opt {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 7px 14px; border: 1px solid #AABBAA; border-radius: 4px;
  cursor: pointer; font-size: 13px; font-weight: 600; color: #000;
  background: #fff; transition: border-color 0.15s, background 0.15s;
}
.contact-opt input { display: none; }
.contact-opt.selected { border-color: #000; background: #f5f5f5; }
.contact-opt:hover { border-color: #000; }
.contact-opt i { font-size: 14px; }

.contact-phone {
  width: 100%; height: 42px; border: 1px solid #e0e0e0; border-radius: 4px;
  padding: 0 14px; font-size: 14px; font-family: inherit; color: #000; outline: none;
}
.contact-phone:focus { border-color: #000; }

/* ── Order summary ── */
.summary-box {
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 20px;
  background: #fff;
}

.sum-row {
  display: flex; justify-content: space-between; align-items: center;
  font-size: 15px; font-weight: 700; margin-bottom: 8px;
}
.sum-row.muted { font-weight: 400; color: #555; font-size: 14px; }
.sum-row.bold-row { font-size: 16px; font-weight: 700; margin-bottom: 0; }

.sum-hr { border: none; border-top: 1px solid #e0e0e0; margin: 12px 0; }

.checkout-btn {
  width: 100%; height: 48px; margin-top: 16px;
  border: none; border-radius: 4px;
  background: #000; color: #fff;
  font-family: Helvetica, Arial, sans-serif;
  font-size: 15px; font-weight: 700; cursor: pointer;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  transition: background 0.15s;
}
.checkout-btn:hover:not(:disabled) { background: #222; }
.checkout-btn:disabled { background: #AABBAA; cursor: not-allowed; }

.checkout-error {
  margin: 10px 0 0; font-size: 13px; color: #DA292E; font-weight: 600; text-align: center;
}

/* ══════════════════════════════════════
   MODALS
══════════════════════════════════════ */
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
  position: relative;
}

.modal-head {
  display: flex; align-items: center; gap: 12px; margin-bottom: 20px;
}

.modal-timer {
  display: flex; align-items: center; gap: 6px;
  font-size: 15px; font-weight: 700; color: #555;
  margin-left: auto;
}
.timer-spin { font-size: 16px; color: #1890FF; }
.timer-warn { color: #DA292E; }

.modal-x {
  background: none; border: none; cursor: pointer;
  font-size: 22px; color: #808080; line-height: 1; padding: 0 4px;
  transition: color 0.15s;
}
.modal-x:hover { color: #000; }

/* ── ABA PAY modal ── */
.aba-badge { display: flex; align-items: center; gap: 8px; }

.aba-img-sm {
  width: 48px; height: 30px;
  object-fit: contain; border-radius: 5px;
}

.aba-amount {
  text-align: center; margin-bottom: 20px;
}
.amount-num { font-size: 48px; font-weight: 800; color: #000; letter-spacing: -0.02em; }
.amount-usd { font-size: 20px; font-weight: 400; color: #808080; margin-left: 6px; }

.qr-wrap { display: flex; flex-direction: column; align-items: center; gap: 12px; margin-bottom: 16px; }

.qr-frame {
  position: relative; padding: 16px;
  background: #f8f8f8; border-radius: 8px;
}

.qr-img { display: block; width: 300px; height: 300px; object-fit: contain; }
.qr-ph  { width: 300px; height: 300px; display: grid; place-items: center; }

/* Orange QR corner brackets */
.qr-corner {
  position: absolute; width: 20px; height: 20px;
  border-color: #f5a623; border-style: solid;
}
.qr-corner.tl { top: 8px;  left: 8px;  border-width: 3px 0 0 3px; border-radius: 3px 0 0 0; }
.qr-corner.tr { top: 8px;  right: 8px; border-width: 3px 3px 0 0; border-radius: 0 3px 0 0; }
.qr-corner.bl { bottom: 8px; left: 8px;  border-width: 0 0 3px 3px; border-radius: 0 0 0 3px; }
.qr-corner.br { bottom: 8px; right: 8px; border-width: 0 3px 3px 0; border-radius: 0 0 3px 0; }

.scan-label { font-size: 13px; color: #808080; text-align: center; margin: 0; }

.sim-btn {
  width: 100%; height: 36px; border: 1px dashed #AABBAA; border-radius: 4px;
  background: transparent; color: #808080; font-family: inherit;
  font-size: 12px; font-weight: 700; cursor: pointer;
  display: flex; align-items: center; justify-content: center; gap: 6px;
}
.sim-btn:hover:not(:disabled) { background: #f5f5f5; color: #000; }
.sim-btn:disabled { opacity: 0.5; cursor: not-allowed; }

/* ── Card modal ── */
.card-modal-title { margin: 0; font-size: 20px; font-weight: 700; color: #000; flex: 1; }

.card-form { margin-bottom: 20px; }

.field-wrap { display: flex; flex-direction: column; gap: 6px; margin-bottom: 14px; }

.field-label { font-size: 13px; color: #555; }

.card-input-row {
  display: flex; align-items: center;
  border: 1px solid #d0d0d0; border-radius: 4px; overflow: hidden; background: #fff;
}

.card-input {
  flex: 1; height: 42px; border: none; outline: none;
  padding: 0 12px; font-size: 14px; font-family: inherit; color: #000; background: transparent;
}
/* Standalone card input (expiry/cvv — not inside .card-input-row) */
.card-fields-row .field-wrap .card-input {
  border: 1px solid #d0d0d0; border-radius: 4px;
  height: 42px; width: 100%; flex: unset;
}

.inline-card-logos {
  display: flex; gap: 4px; padding: 0 10px;
  font-size: 18px; color: #808080; flex-shrink: 0;
  align-items: center;
}

.card-fields-row {
  display: grid; grid-template-columns: 1fr 1fr; gap: 12px;
}

.cvv-icon { padding: 0 10px; font-size: 16px; color: #808080; }

.security-note {
  margin: 0; font-size: 12px; color: #1890FF; line-height: 1.5;
}
.payway-link { color: #1890FF; font-weight: 700; text-decoration: none; }
.payway-link:hover { text-decoration: underline; }

.card-totals {
  background: #f8f8f8; border-radius: 4px; padding: 14px 16px; margin-bottom: 16px;
}

.ctotal-row {
  display: flex; justify-content: space-between; font-size: 14px; color: #555; margin-bottom: 4px;
}
.ctotal-row.bold { font-weight: 700; color: #000; font-size: 15px; margin-bottom: 0; }

.ctotal-hr { border: none; border-top: 1px solid #e0e0e0; margin: 8px 0; }

.card-pay-btn {
  width: 100%; height: 48px; border: none; border-radius: 4px;
  background: #888; color: #fff; font-family: Helvetica, Arial, sans-serif;
  font-size: 15px; font-weight: 700; cursor: pointer;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  transition: background 0.15s;
}
.card-pay-btn:not(:disabled) { background: #000; }
.card-pay-btn:not(:disabled):hover { background: #222; }
.card-pay-btn:disabled { opacity: 0.6; cursor: not-allowed; }

/* ── Responsive ── */
@media (max-width: 960px) {
  .page-layout { grid-template-columns: 1fr; }
  .cart-main { padding: 70px 0 60px; }
}

@media (max-width: 640px) {
  .container { padding: 0 16px; }
  .cart-item { grid-template-columns: 80px 1fr; }
  .item-price { grid-column: 1 / -1; text-align: right; }
  .card-fields-row { grid-template-columns: 1fr; }
  .contact-row { flex-direction: column; }
  .addr-row { flex-wrap: wrap; gap: 8px; }
  .section-title { font-size: 16px; }
}
</style>
