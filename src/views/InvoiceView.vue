<template>
  <div class="invoice-page">
    <AppHeader :nav-links="navLinks" :cart-count="cartCount" />

    <main class="invoice-main">
      <div class="container">
        <section v-if="order" class="invoice-card">
          <div class="invoice-top">
            <div>
              <p class="eyebrow">INVOICE</p>
              <h1>#{{ order.orderNumber }}</h1>
              <p class="muted">Issued {{ order.placedDate }}</p>
            </div>

            <div class="invoice-actions">
              <button type="button" class="secondary-btn" @click="printInvoice">Print</button>
              <RouterLink to="/order-history" class="primary-btn">Order History</RouterLink>
            </div>
          </div>

          <div class="invoice-grid">
            <article class="detail-box">
              <h2>Billed To</h2>
              <p>{{ order.shippingInfo.firstName }} {{ order.shippingInfo.lastName }}</p>
              <p>{{ order.shippingInfo.address }}</p>
              <p>{{ order.shippingInfo.city }}, {{ order.shippingInfo.state }} {{ order.shippingInfo.zipCode }}</p>
            </article>

            <article class="detail-box">
              <h2>Payment</h2>
              <p>{{ paymentLabel }}</p>
              <p>Status: Paid</p>
              <p>Total: {{ formatPrice(order.total) }}</p>
            </article>
          </div>

          <div class="items-table">
            <div class="table-head">
              <span>Item</span>
              <span>Qty</span>
              <span>Price</span>
              <span>Total</span>
            </div>

            <div v-for="item in order.items" :key="item.lineId || item.id" class="table-row">
              <div class="item-cell">
                <img :src="item.image" :alt="item.name" />
                <div>
                  <strong>{{ item.name }}</strong>
                  <p>{{ item.variant }}</p>
                </div>
              </div>
              <span>{{ item.quantity }}</span>
              <span>{{ formatPrice(item.price) }}</span>
              <strong>{{ formatPrice(item.price * item.quantity) }}</strong>
            </div>
          </div>

          <div class="totals-box">
            <div><span>Subtotal</span><strong>{{ formatPrice(subtotal) }}</strong></div>
            <div><span>Shipping</span><strong>Free</strong></div>
            <div><span>Estimated Tax</span><strong>{{ formatPrice(tax) }}</strong></div>
            <div class="grand-total"><span>Total</span><strong>{{ formatPrice(order.total) }}</strong></div>
          </div>
        </section>

        <section v-else class="empty-card">
          <h1>Invoice not found</h1>
          <p>We could not find an order with this invoice reference.</p>
          <RouterLink to="/order-history" class="primary-btn">Back to Orders</RouterLink>
        </section>
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
import { loadCartItems } from '@/utils/commerce'
import { readStorage } from '@/utils/storage'
import type { FooterColumn, NavLink, SocialLink } from '@/types/home'

interface InvoiceOrder {
  orderNumber: string
  placedDate: string
  total: number
  items: Array<{ lineId?: string; id: number | string; name: string; variant: string; price: number; quantity: number; image: string }>
  shippingInfo: { firstName: string; lastName: string; address: string; city: string; state: string; zipCode: string }
  paymentInfo?: { method?: string; cardLast4?: string }
}

const route = useRoute()
const navLinks = ref<NavLink[]>([])
const footerColumns = ref<FooterColumn[]>([])
const socialLinks = ref<SocialLink[]>([])
const order = ref<InvoiceOrder | null>(null)
const cartItems = ref(loadCartItems())

const cartCount = computed(() => cartItems.value.reduce((sum, item) => sum + item.quantity, 0))
const subtotal = computed(() => order.value?.items.reduce((sum, item) => sum + item.price * item.quantity, 0) || 0)
const tax = computed(() => Math.max((order.value?.total || 0) - subtotal.value, 0))
const paymentLabel = computed(() => {
  if (!order.value?.paymentInfo?.method) return 'Payment method unavailable'
  if (order.value.paymentInfo.method === 'card') return `Card ending in ${order.value.paymentInfo.cardLast4 || '0000'}`
  return order.value.paymentInfo.method
})

function formatPrice(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(value)
}

function printInvoice() {
  window.print()
}

onMounted(async () => {
  const orderNumber = String(route.params.orderNumber || '')
  const orders = readStorage<InvoiceOrder[]>('orders', [])
  const confirmation = readStorage<InvoiceOrder | null>('orderConfirmation', null)
  order.value = orders.find((item) => item.orderNumber === orderNumber) || (confirmation?.orderNumber === orderNumber ? confirmation : null)

  navLinks.value = await getNavLinks()
  footerColumns.value = await getFooterColumns()
  socialLinks.value = await getSocialLinks()
})
</script>

<style scoped>
* { box-sizing: border-box; }

.invoice-page {
  min-height: 100vh;
  background: #f7f9fb;
  color: #191c1e;
  font-family: Inter, Arial, sans-serif;
}

.container {
  width: min(1100px, 100%);
  margin: 0 auto;
  padding: 0 20px;
}

.invoice-main { padding: 88px 0 80px; }

.invoice-card,
.empty-card {
  background: #fff;
  border: 1px solid #eef2f6;
  border-radius: 20px;
  padding: 28px;
}

.invoice-top,
.invoice-grid,
.table-head,
.table-row,
.totals-box div {
  display: grid;
  gap: 18px;
}

.invoice-top {
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: start;
  margin-bottom: 28px;
}

.eyebrow {
  margin: 0 0 10px;
  font-size: 10px;
  letter-spacing: 0.16em;
  color: #98a2b3;
}

.invoice-top h1,
.empty-card h1 {
  margin: 0 0 8px;
  font-size: 44px;
  line-height: 1.05;
  font-weight: 500;
}

.muted,
.detail-box p,
.item-cell p,
.empty-card p { margin: 0; color: #667085; }

.invoice-actions { display: flex; gap: 10px; }

.primary-btn,
.secondary-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 42px;
  border-radius: 14px;
  padding: 0 16px;
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;
}

.primary-btn { border: 0; background: #513B3C; color: #fff; }
.secondary-btn { border: 0; background: #ede6e7; color: #495467; }

.invoice-grid {
  grid-template-columns: 1fr 1fr;
  margin-bottom: 26px;
}

.detail-box {
  border-radius: 16px;
  background: #f7f9fb;
  padding: 18px;
}

.detail-box h2 {
  margin: 0 0 12px;
  font-size: 13px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.table-head,
.table-row {
  grid-template-columns: minmax(0, 1fr) 70px 120px 120px;
  align-items: center;
}

.table-head {
  padding: 14px 0;
  color: #98a2b3;
  font-size: 10px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  border-bottom: 1px solid #eef2f6;
}

.table-row {
  padding: 16px 0;
  border-bottom: 1px solid #eef2f6;
}

.item-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.item-cell img {
  width: 58px;
  height: 58px;
  border-radius: 12px;
  object-fit: cover;
  background: #eef2f6;
}

.item-cell strong { display: block; margin-bottom: 4px; }

.totals-box {
  width: min(360px, 100%);
  margin-left: auto;
  padding-top: 20px;
}

.totals-box div {
  grid-template-columns: 1fr auto;
  padding: 8px 0;
  color: #667085;
}

.totals-box .grand-total {
  margin-top: 10px;
  padding-top: 16px;
  border-top: 1px solid #eef2f6;
  color: #191c1e;
}

.grand-total strong { font-size: 28px; color: #513B3C; }

.empty-card { text-align: center; }
.empty-card .primary-btn { margin-top: 18px; }

@media print {
  .invoice-page :deep(header),
  .invoice-page :deep(footer),
  .invoice-actions { display: none; }
  .invoice-main { padding: 0; }
  .invoice-card { border: 0; }
}

@media (max-width: 760px) {
  .invoice-top,
  .invoice-grid,
  .table-head,
  .table-row { grid-template-columns: 1fr; }
  .invoice-actions { flex-direction: column; }
}
</style>