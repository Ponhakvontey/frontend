<template>
  <div class="cart-page">
    <AppHeader :nav-links="navLinks" :cart-count="cartCount" />

    <main class="cart-main">
      <div class="container">
        <section class="cart-heading">
          <h1>Your Selection</h1>
          <p>{{ itemCountText }} — REVIEW SHIPPING &amp; TAXES AT CHECKOUT</p>
        </section>

        <section v-if="items.length > 0" class="cart-layout">
          <div class="cart-list">
            <article v-for="item in items" :key="item.lineId" class="cart-item">
              <div class="item-image-wrap">
                <img :src="item.image" :alt="item.name" class="item-image" />
              </div>

              <div class="item-info">
                <div class="item-main">
                  <div class="item-copy">
                    <p class="item-brand">{{ item.brand }}</p>
                    <h3 class="item-name">{{ item.name }}</h3>
                    <p class="item-variant">{{ item.variant }}</p>
                  </div>

                  <p class="item-price">{{ formatPrice(item.price * item.quantity) }}</p>
                </div>

                <div class="item-actions">
                  <div class="qty-control">
                    <button type="button" @click="decreaseQty(item.lineId)">−</button>
                    <span>{{ item.quantity.toString().padStart(2, '0') }}</span>
                    <button type="button" @click="increaseQty(item.lineId)">+</button>
                  </div>

                  <button type="button" class="remove-btn" @click="removeItem(item.lineId)">
                    REMOVE
                  </button>
                </div>
              </div>
            </article>
          </div>

          <aside class="summary-column">
            <div class="summary-card">
              <h2>Summary</h2>

              <div class="summary-row">
                <span>Subtotal</span>
                <span>{{ formatPrice(subtotal) }}</span>
              </div>

              <div class="summary-row">
                <span>Shipping</span>
                <span class="summary-accent">COMPLIMENTARY</span>
              </div>

              <div class="summary-row">
                <span>Estimated Tax</span>
                <span>{{ formatPrice(estimatedTax) }}</span>
              </div>

              <div class="summary-total">
                <span>Total</span>
                <strong>{{ formatPrice(total) }}</strong>
              </div>

              <button type="button" class="checkout-btn" @click="goToCheckout">
                PROCEED TO CHECKOUT →
              </button>

              <div class="summary-notes">
                <p>🔒 Secure Payment Processing</p>
                <p>📦 Insured Global Shipping</p>
              </div>
            </div>

            <div class="promo-card">
              <p class="promo-label">HAVE A PROMOTIONAL CODE?</p>

              <div class="promo-row">
                <input v-model="promoCode" type="text" placeholder="Enter Code" />
                <button type="button">Apply</button>
              </div>
            </div>
          </aside>
        </section>

        <section v-else class="empty-card">
          <h2>Your cart is empty.</h2>
          <p>Add a piece from the collection to begin building your order.</p>
          <RouterLink to="/" class="shop-link">Continue Shopping</RouterLink>
        </section>
      </div>
    </main>

    <AppFooter :footer-columns="footerColumns" :social-links="socialLinks" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import { getFooterColumns, getNavLinks, getSocialLinks } from '@/services/homeService'
import type { FooterColumn, NavLink, SocialLink } from '@/types/home'
import { loadCartItems, saveCartItems, type CartItem } from '@/utils/commerce'

const navLinks = ref<NavLink[]>([])
const footerColumns = ref<FooterColumn[]>([])
const socialLinks = ref<SocialLink[]>([])

const items = ref<CartItem[]>([])
const promoCode = ref('')

const router = useRouter()

function goToCheckout() {
  if (items.value.length === 0) return
  router.push('/checkout')
}

function loadCart() {
  items.value = loadCartItems()
}

function saveCart() {
  saveCartItems(items.value)
}

function increaseQty(lineId: string) {
  const item = items.value.find((product) => product.lineId === lineId)
  if (!item) return
  item.quantity++
  saveCart()
}

function decreaseQty(lineId: string) {
  const item = items.value.find((product) => product.lineId === lineId)
  if (!item || item.quantity <= 1) return
  item.quantity--
  saveCart()
}

function removeItem(lineId: string) {
  items.value = items.value.filter((product) => product.lineId !== lineId)
  saveCart()
}

const cartCount = computed(() => {
  return items.value.reduce((sum, item) => sum + item.quantity, 0)
})

const itemCountText = computed(() => {
  return `${items.value.length.toString().padStart(2, '0')} ITEMS`
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

onMounted(async () => {
  loadCart()
  navLinks.value = await getNavLinks()
  footerColumns.value = await getFooterColumns()
  socialLinks.value = await getSocialLinks()
})
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.cart-page {
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

.cart-main {
  padding: 70px 0 70px;
}

.cart-heading {
  margin-bottom: 30px;
  padding-top: 6px;
}

.cart-heading h1 {
  margin: 0 0 8px;
  font-size: 58px;
  line-height: 1.04;
  font-weight: 400;
  letter-spacing: -0.03em;
}

.cart-heading p {
  margin: 0;
  font-size: 11px;
  letter-spacing: 0.18em;
  color: #98a2b3;
}

.cart-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 340px;
  gap: 26px;
  align-items: start;
}

.cart-list {
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.cart-item {
  display: grid;
  grid-template-columns: 112px 1fr;
  gap: 18px;
  padding: 18px;
  background: #ffffff;
  border-radius: 18px;
  border: 1px solid #eef2f6;
}

.item-image-wrap {
  width: 112px;
  height: 140px;
  border-radius: 14px;
  background: #f2f4f7;
  overflow: hidden;
}

.item-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.item-info {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-width: 0;
}

.item-main {
  display: flex;
  justify-content: space-between;
  gap: 20px;
}

.item-copy {
  min-width: 0;
}

.item-brand {
  margin: 0 0 8px;
  font-size: 10px;
  line-height: 1.4;
  letter-spacing: 0.16em;
  color: #513B3C;
  font-weight: 700;
}

.item-name {
  margin: 0 0 6px;
  font-size: 24px;
  line-height: 1.1;
  font-weight: 500;
  color: #1f2937;
}

.item-variant {
  margin: 0;
  font-size: 13px;
  color: #7b8494;
}

.item-price {
  margin: 0;
  white-space: nowrap;
  font-size: 24px;
  font-weight: 700;
  color: #191c1e;
}

.item-actions {
  margin-top: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 14px;
}

.qty-control {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  min-height: 30px;
  padding: 0 10px;
  border-radius: 999px;
  background: #eef2f6;
}

.qty-control button {
  border: 0;
  background: transparent;
  color: #5b6474;
  font-size: 15px;
  cursor: pointer;
}

.qty-control span {
  min-width: 18px;
  text-align: center;
  font-size: 12px;
  font-weight: 600;
  color: #1f2937;
}

.remove-btn {
  border: 0;
  background: transparent;
  font-size: 11px;
  letter-spacing: 0.12em;
  color: #7b8494;
  cursor: pointer;
}

.summary-column {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.summary-card,
.promo-card,
.empty-card {
  background: #ffffff;
  border: 1px solid #eef2f6;
  border-radius: 18px;
}

.summary-card {
  padding: 22px;
}

.summary-card h2 {
  margin: 0 0 22px;
  font-size: 28px;
  line-height: 1.1;
  font-weight: 500;
  color: #1f2937;
}

.summary-row,
.summary-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.summary-row {
  margin-bottom: 16px;
  font-size: 14px;
  color: #667085;
}

.summary-accent {
  color: #513B3C;
  font-weight: 700;
}

.summary-total {
  margin-top: 24px;
  padding-top: 18px;
  border-top: 1px solid #e7ebf2;
}

.summary-total strong {
  font-size: 34px;
  color: #191c1e;
}

.checkout-btn {
  width: 100%;
  height: 52px;
  margin-top: 20px;
  border: 0;
  border-radius: 14px;
  background: #513B3C;
  color: #ffffff;
  font-weight: 700;
  cursor: pointer;
}

.summary-notes {
  margin-top: 16px;
}

.summary-notes p {
  margin: 8px 0 0;
  font-size: 12px;
  color: #7b8494;
}

.promo-card {
  padding: 18px 18px 20px;
}

.promo-label {
  margin: 0 0 12px;
  font-size: 11px;
  letter-spacing: 0.14em;
  color: #98a2b3;
}

.promo-row {
  display: flex;
  gap: 10px;
}

.promo-row input {
  flex: 1;
  height: 38px;
  border: 0;
  border-radius: 999px;
  background: #eef2f6;
  padding: 0 14px;
  outline: none;
  color: #1f2937;
}

.promo-row button {
  border: 0;
  border-radius: 999px;
  padding: 0 18px;
  background: #ede6e7;
  color: #495467;
  cursor: pointer;
}

.empty-card {
  padding: 48px 28px;
  text-align: center;
}

.empty-card h2 {
  margin: 0 0 10px;
  font-size: 28px;
  font-weight: 500;
}

.empty-card p {
  margin: 0 0 18px;
  color: #667085;
}

.shop-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 180px;
  height: 46px;
  padding: 0 18px;
  border-radius: 14px;
  background: #513B3C;
  color: #fff;
  text-decoration: none;
  font-weight: 700;
}

@media (max-width: 1100px) {
  .cart-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 760px) {
  .cart-heading h1 {
    font-size: 40px;
  }

  .cart-item {
    grid-template-columns: 1fr;
  }

  .item-image-wrap {
    width: 100%;
    height: 220px;
  }

  .item-main,
  .item-actions,
  .promo-row {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
