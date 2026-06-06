<template>
  <div class="invoice-page">
    <AppHeader :nav-links="navLinks" :cart-count="cartCount" />

    <main class="invoice-main">
      <div class="container">
        <section v-if="order" class="invoice-card">
          <div class="invoice-top">
            <div>
              <p class="eyebrow">INVOICE</p>
              <h1>Order #{{ order.orderNumber }}</h1>
              <p class="muted">Placed {{ order.placedDate }}</p>
            </div>

            <div class="invoice-actions">
              <button type="button" class="secondary-btn" @click="printInvoice">Print</button>
              <RouterLink to="/order-history" class="primary-btn">Order History</RouterLink>
            </div>
          </div>

          <div class="invoice-grid">
            <article class="detail-box">
              <h2>Billed To</h2>
              <p>{{ order.username }}</p>
              <p>{{ order.shippingAddress }}</p>
            </article>

            <article class="detail-box">
              <h2>Payment</h2>
              <p>Status: {{ order.status ?? 'Paid' }}</p>
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

            <div v-for="item in order.items" :key="item.id" class="table-row">
              <div class="item-cell">
                <img :src="item.image" :alt="item.name" />
                <div>
                  <strong>{{ item.name }}</strong>
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
import { api } from '@/services/apiClient'
import { loadCartItems } from '@/utils/commerce'
import type { FooterColumn, NavLink, SocialLink } from '@/types/home'

interface OrderItemDTO {
  id: number
  productId: string
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
  items: OrderItemDTO[]
  username: string
}

interface InvoiceOrder {
  orderNumber: string
  placedDate: string
  total: number
  shippingAddress: string
  username: string
  status?: string
  items: Array<{ id: number; name: string; image: string; quantity: number; price: number }>
}

const route = useRoute()
const navLinks = ref<NavLink[]>([])
const footerColumns = ref<FooterColumn[]>([])
const socialLinks = ref<SocialLink[]>([])
const order = ref<InvoiceOrder | null>(null)
const cartItems = ref(loadCartItems())

const cartCount = computed(() => cartItems.value.reduce((sum, item) => sum + item.quantity, 0))
const subtotal = computed(() => order.value?.items.reduce((sum, item) => sum + item.price * item.quantity, 0) ?? 0)
const tax = computed(() => 0) // Tax not stored on backend; show $0

function formatPrice(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(value)
}

function fmtDate(iso: string) {
  return iso ? new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'
}

function printInvoice() {
  window.print()
}

function toInvoiceOrder(dto: OrderDTO): InvoiceOrder {
  return {
    orderNumber: String(dto.id),
    placedDate: fmtDate(dto.orderDate),
    total: Number(dto.totalAmount),
    shippingAddress: dto.shippingAddress ?? '—',
    username: dto.username ?? '—',
    items: (dto.items ?? []).map((item) => ({
      id: item.id,
      name: item.productName ?? 'Product',
      image: item.productImageUrl ?? '',
      quantity: item.quantity,
      price: Number(item.price),
    })),
  }
}

onMounted(async () => {
  const orderId = String(route.params.orderNumber || '')

  ;[navLinks.value, footerColumns.value, socialLinks.value] = await Promise.all([
    getNavLinks(),
    getFooterColumns(),
    getSocialLinks(),
  ])

  if (!orderId) return
  try {
    const dto = await api.get<OrderDTO>(`/api/orders/${orderId}`)
    order.value = toInvoiceOrder(dto)
  } catch {
    order.value = null
  }
})
</script>

<style scoped>
* { box-sizing: border-box; }

.invoice-page {
  min-height: 100vh;
  background: #fff;
  color: #000;
  font-family: Helvetica, Arial, sans-serif;
}

.container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 20px;
}

.invoice-main { padding: 70px 0 60px; }

.invoice-card,
.empty-card {
  background: #fff;
  border: 1px solid #AABBAA;
  border-radius: 4px;
  padding: 28px;
  box-shadow: rgba(0,0,0,0.05) 0 2px 4px;
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
  margin: 0 0 8px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.12em;
  color: #808080;
  text-transform: uppercase;
}

.invoice-top h1,
.empty-card h1 {
  margin: 0 0 8px;
  font-size: 28px;
  font-weight: 700;
}

.muted,
.detail-box p,
.item-cell p,
.empty-card p { margin: 0; color: #808080; font-size: 14px; }

.invoice-actions { display: flex; gap: 8px; }

.primary-btn,
.secondary-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 36px;
  border-radius: 4px;
  padding: 0 14px;
  font-family: Helvetica, Arial, sans-serif;
  font-size: 12px;
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;
  transition: background 0.15s;
}

.primary-btn {
  border: none;
  background: #000;
  color: #fff;
}
.primary-btn:hover { background: #211E1E; }

.secondary-btn {
  border: 1px solid #000;
  background: #fff;
  color: #000;
}
.secondary-btn:hover { background: #AABBAA; }

.invoice-grid {
  grid-template-columns: 1fr 1fr;
  margin-bottom: 26px;
}

.detail-box {
  border-radius: 4px;
  background: #f5f5f5;
  border: 1px solid #AABBAA;
  padding: 18px;
}

.detail-box h2 {
  margin: 0 0 12px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #808080;
}

.table-head,
.table-row {
  grid-template-columns: minmax(0, 1fr) 70px 120px 120px;
  align-items: center;
}

.table-head {
  padding: 12px 0;
  color: #808080;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  border-bottom: 1px solid #AABBAA;
}

.table-row {
  padding: 16px 0;
  border-bottom: 1px solid #AABBAA;
}

.item-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.item-cell img {
  width: 58px;
  height: 58px;
  border-radius: 4px;
  object-fit: cover;
  background: #f5f5f5;
  border: 1px solid #AABBAA;
}

.item-cell strong { display: block; margin-bottom: 4px; font-size: 14px; }

.totals-box {
  width: min(360px, 100%);
  margin-left: auto;
  padding-top: 20px;
}

.totals-box div {
  grid-template-columns: 1fr auto;
  padding: 8px 0;
  color: #808080;
  font-size: 14px;
}

.totals-box .grand-total {
  margin-top: 10px;
  padding-top: 16px;
  border-top: 1px solid #AABBAA;
  color: #000;
}

.grand-total strong { font-size: 28px; color: #DA292E; }

.empty-card { text-align: center; }
.empty-card .primary-btn { margin-top: 18px; }

@media print {
  .invoice-page :deep(header),
  .invoice-page :deep(footer),
  .invoice-actions { display: none; }
  .invoice-main { padding: 0; }
  .invoice-card { border: 0; box-shadow: none; }
}

@media (max-width: 760px) {
  .invoice-top,
  .invoice-grid,
  .table-head,
  .table-row { grid-template-columns: 1fr; }
  .invoice-actions { flex-direction: column; }
}
</style>