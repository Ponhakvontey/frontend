<template>
  <div class="cart-page">
    <main class="cart-main">
      <div class="cart-container">
        <header class="cart-header">
          <h1>Your Selection</h1>
          <p>{{ itemCountText }} — REVIEW SHIPPING & TAXES AT CHECKOUT</p>
        </header>

        <div v-if="items.length === 0" class="state-box">Your cart is empty.</div>

        <div v-else class="cart-layout">
          <section class="cart-list">
            <article v-for="item in items" :key="item.id" class="cart-card">
              <div class="product-left">
                <img :src="item.image" :alt="item.name" class="product-image" />
              </div>

              <div class="product-middle">
                <p class="brand">{{ item.brand }}</p>
                <h3 class="name">{{ item.name }}</h3>
                <p class="variant">{{ item.variant }}</p>

                <div class="qty-row">
                  <button type="button" class="qty-btn" @click="decreaseQty(item.id)">−</button>
                  <span class="qty-value">{{ item.quantity }}</span>
                  <button type="button" class="qty-btn" @click="increaseQty(item.id)">+</button>
                </div>
              </div>

              <div class="product-right">
                <p class="price">{{ formatPrice(item.price * item.quantity) }}</p>
                <button type="button" class="remove-btn" @click="removeItem(item.id)">
                  REMOVE
                </button>
              </div>
            </article>
          </section>

          <aside class="summary-card">
            <h2>Summary</h2>

            <div class="summary-row">
              <span>Subtotal</span>
              <span>{{ formatPrice(subtotal) }}</span>
            </div>

            <div class="summary-row">
              <span>Shipping</span>
              <span class="shipping-free">COMPLIMENTARY</span>
            </div>

            <div class="summary-row">
              <span>Estimated Tax</span>
              <span>{{ formatPrice(estimatedTax) }}</span>
            </div>

            <div class="summary-total">
              <span>Total</span>
              <strong>{{ formatPrice(total) }}</strong>
            </div>
          </aside>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

interface CartItem {
  id: number
  brand: string
  name: string
  variant: string
  price: number
  quantity: number
  image: string
}

const items = ref<CartItem[]>([])

function saveCart() {
  localStorage.setItem('cartItems', JSON.stringify(items.value))
}

function increaseQty(id: number) {
  const item = items.value.find((product) => product.id === id)
  if (item) {
    item.quantity++
    saveCart()
  }
}

function decreaseQty(id: number) {
  const item = items.value.find((product) => product.id === id)
  if (item && item.quantity > 1) {
    item.quantity--
    saveCart()
  }
}

function removeItem(id: number) {
  items.value = items.value.filter((product) => product.id !== id)
  saveCart()
}

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

onMounted(() => {
  const savedCart = localStorage.getItem('cartItems')
  items.value = savedCart ? JSON.parse(savedCart) : []
})
</script>

<style scoped>
.cart-page {
  min-height: 100vh;
  background: #f3f4f6;
  padding: 48px 20px;
  font-family: Inter, Arial, sans-serif;
}

.cart-container {
  width: min(100%, 1320px);
  margin: 0 auto;
}

.cart-header {
  margin-bottom: 28px;
}

.cart-header h1 {
  margin: 0 0 10px;
  font-size: 56px;
}

.cart-header p {
  margin: 0;
  font-size: 12px;
  letter-spacing: 0.18em;
  color: #9ca3af;
}

.cart-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 360px;
  gap: 28px;
  align-items: start;
}

.cart-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.cart-card,
.summary-card,
.state-box {
  background: #fff;
  border-radius: 18px;
  padding: 24px;
}

.cart-card {
  display: grid;
  grid-template-columns: 110px 1fr auto;
  gap: 20px;
}

.product-image {
  width: 96px;
  height: 112px;
  object-fit: cover;
  border-radius: 12px;
}

.brand {
  margin: 0 0 8px;
  font-size: 10px;
  letter-spacing: 0.16em;
  color: #3563e9;
  font-weight: 700;
}

.name {
  margin: 0 0 6px;
  font-size: 22px;
}

.variant {
  margin: 0 0 20px;
  font-size: 13px;
  color: #6b7280;
}

.qty-row {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: #eef1f4;
  border-radius: 999px;
  padding: 4px 10px;
}

.qty-btn {
  border: 0;
  background: transparent;
  cursor: pointer;
}

.product-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 28px;
}

.price {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
}

.remove-btn {
  border: 0;
  background: transparent;
  cursor: pointer;
}

.summary-row,
.summary-total {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
}

.shipping-free {
  color: #3563e9;
  font-weight: 700;
}

.summary-total {
  margin-top: 28px;
  padding-top: 18px;
  border-top: 1px solid #e5e7eb;
}

.summary-total strong {
  font-size: 32px;
}

@media (max-width: 1024px) {
  .cart-layout {
    grid-template-columns: 1fr;
  }
}
</style>
