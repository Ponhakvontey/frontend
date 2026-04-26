<template>
  <div class="detail-page">
    <AppHeader :nav-links="navLinks" :cart-count="cartCount" />

    <main v-if="product" class="detail-main">
      <div class="container">
        <nav class="breadcrumb">
          <span>HOME</span>
          <span>›</span>
          <span>COLLECTIONS</span>
          <span>›</span>
          <strong>{{ product.name.toUpperCase() }}</strong>
        </nav>

        <section class="hero-section">
          <div class="gallery-column">
            <button
              v-for="image in productGallery"
              :key="image.id"
              type="button"
              class="thumb-btn"
              :class="{ active: activeImage === image.url }"
              @click="activeImage = image.url"
            >
              <img :src="image.url" :alt="product.name" />
            </button>
          </div>

          <div class="main-image-card">
            <img :src="activeImage || product.image" :alt="product.name" class="main-image" />
          </div>

          <div class="product-panel">
            <span v-if="product.tagLabel" class="tag">{{ product.tagLabel }}</span>

            <h1 class="product-title">{{ product.name }}</h1>

            <div class="price-row">
              <p class="price">{{ formattedPrice }}</p>
              <div class="rating-row">
                <span class="stars">★★★★★</span>
                <span class="reviews">({{ product.reviewCount ?? 0 }} Reviews)</span>
              </div>
            </div>

            <div class="option-block">
              <div class="option-label-row">
                <span class="option-label">COLOR — {{ product.colorLabel ?? 'DEFAULT' }}</span>
              </div>
              <div class="swatch-row">
                <button class="swatch swatch-dark active" type="button"></button>
                <button class="swatch swatch-black" type="button"></button>
              </div>
            </div>

            <div v-if="productSizes.length" class="option-block">
              <div class="option-label-row">
                <span class="option-label">SELECT SIZE</span>
                <button type="button" class="size-guide">SIZE GUIDE</button>
              </div>

              <div class="size-grid">
                <button
                  v-for="size in productSizes"
                  :key="size.label"
                  type="button"
                  class="size-btn"
                  :class="{
                    active: selectedSize === size.label,
                    disabled: size.disabled,
                  }"
                  :disabled="size.disabled"
                  @click="selectedSize = size.label"
                >
                  {{ size.label }}
                </button>
              </div>
            </div>

            <div class="action-row">
              <div class="qty-control">
                <button type="button" @click="decreaseQty">−</button>
                <span>{{ quantity }}</span>
                <button type="button" @click="increaseQty">+</button>
              </div>

              <button class="add-btn" type="button" @click="addToCart">🛒 ADD TO CART</button>
            </div>

            <button class="wishlist-btn" type="button">WISHLIST THIS PIECE</button>

            <div v-for="benefit in productBenefits" :key="benefit.id" class="benefit-card">
              <div class="benefit-icon">✦</div>
              <div>
                <h4>{{ benefit.title }}</h4>
                <p>{{ benefit.description }}</p>
              </div>
            </div>
          </div>
        </section>

        <section class="narrative-section">
          <div class="narrative-left">
            <h2>Product Narrative</h2>
            <p class="narrative-text">
              {{ product.narrative ?? '' }}
            </p>

            <div class="meta-grid">
              <div class="meta-row">
                <span>COMPOSITION</span>
                <strong>{{ product.composition ?? '-' }}</strong>
              </div>
              <div class="meta-row">
                <span>ORIGIN</span>
                <strong>{{ product.origin ?? '-' }}</strong>
              </div>
              <div class="meta-row">
                <span>SKU</span>
                <strong>{{ product.sku ?? '-' }}</strong>
              </div>
            </div>
          </div>

          <div class="narrative-right">
            <div class="info-cards">
              <article v-for="card in productInfoCards" :key="card.id" class="info-card">
                <h4>{{ card.title }}</h4>
                <p>{{ card.description }}</p>
              </article>
            </div>

            <div v-if="product.editorialImage" class="editorial-media">
              <img :src="product.editorialImage" alt="Editorial workshop scene" />
              <button type="button" class="play-btn">▶</button>
            </div>
          </div>
        </section>

        <section v-if="productPairings.length" class="pairings-section">
          <div class="pairings-head">
            <div>
              <h2>Curated Pairings</h2>
              <p>Complete the silhouette with these recommended pieces.</p>
            </div>

            <div class="pairings-nav">
              <button type="button">←</button>
              <button type="button">→</button>
            </div>
          </div>

          <div class="pairings-grid">
            <article v-for="pair in productPairings" :key="pair.id" class="pair-card">
              <div class="pair-image-wrap">
                <img :src="pair.image" :alt="pair.name" />
              </div>
              <h4>{{ pair.name }}</h4>
              <div class="pair-meta">
                <span>{{ pair.material }}</span>
                <strong>{{ formatCurrency(pair.price) }}</strong>
              </div>
            </article>
          </div>
        </section>
      </div>
    </main>

    <main v-else class="empty-state">Product not found.</main>

    <AppFooter :footer-columns="footerColumns" :social-links="socialLinks" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import {
  getFooterColumns,
  getNavLinks,
  getSocialLinks,
  getTrendingProducts,
} from '@/services/homeService'
import type { FooterColumn, NavLink, Product, SocialLink } from '@/types/home'

const route = useRoute()
const router = useRouter()

const navLinks = ref<NavLink[]>([])
const footerColumns = ref<FooterColumn[]>([])
const socialLinks = ref<SocialLink[]>([])

const product = ref<Product | null>(null)
const quantity = ref(1)
const selectedSize = ref('')
const activeImage = ref('')

const cartItems = ref<any[]>([])

const productGallery = computed(() => product.value?.gallery ?? [])
const productSizes = computed(() => product.value?.sizes ?? [])
const productBenefits = computed(() => product.value?.benefits ?? [])
const productInfoCards = computed(() => product.value?.infoCards ?? [])
const productPairings = computed(() => product.value?.pairings ?? [])

const formattedPrice = computed(() => {
  if (!product.value) return ''
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: product.value.currency,
    minimumFractionDigits: 2,
  }).format(product.value.price)
})

const cartCount = computed(() => {
  return cartItems.value.reduce((sum, item) => sum + item.quantity, 0)
})

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(value)
}

function increaseQty() {
  quantity.value++
}

function decreaseQty() {
  if (quantity.value > 1) quantity.value--
}

function loadCart() {
  cartItems.value = JSON.parse(localStorage.getItem('cartItems') || '[]')
}

function addToCart() {
  if (!product.value) return

  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'

  if (!isLoggedIn) {
    router.push(`/login?redirect=/product/${product.value.id}`)
    return
  }

  const existing = cartItems.value.find((item) => item.id === product.value?.id)

  if (existing) {
    existing.quantity += quantity.value
    existing.size = selectedSize.value
  } else {
    cartItems.value.push({
      id: product.value.id,
      brand: product.value.maker,
      name: product.value.name,
      variant: `${product.value.colorLabel ?? 'Default'} | ${selectedSize.value || 'Default'}`,
      price: product.value.price,
      quantity: quantity.value,
      image: product.value.image,
    })
  }

  localStorage.setItem('cartItems', JSON.stringify(cartItems.value))
  router.push('/')
}

onMounted(async () => {
  loadCart()

  navLinks.value = await getNavLinks()
  footerColumns.value = await getFooterColumns()
  socialLinks.value = await getSocialLinks()

  const products = await getTrendingProducts()
  const productId = Number(route.params.id)
  product.value = products.find((item) => item.id === productId) || null

  const firstGalleryImage = product.value?.gallery?.[0]?.url

  if (firstGalleryImage) {
    activeImage.value = firstGalleryImage
  } else if (product.value) {
    activeImage.value = product.value.image
  }

  if (product.value?.sizes?.length) {
    const firstAvailable = product.value.sizes.find((size) => !size.disabled)
    selectedSize.value = firstAvailable?.label ?? ''
  }
})
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.detail-page {
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

.detail-main {
  padding: 20px 0 80px;
}

.breadcrumb {
  display: flex;
  gap: 10px;
  align-items: center;
  font-size: 11px;
  color: #98a2b3;
  letter-spacing: 0.08em;
  margin-bottom: 28px;
}

.hero-section {
  display: grid;
  grid-template-columns: 64px minmax(0, 680px) minmax(340px, 440px);
  gap: 28px;
  align-items: start;
}

.gallery-column {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.thumb-btn {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  border: 1px solid transparent;
  background: #fff;
  padding: 0;
  overflow: hidden;
  cursor: pointer;
}

.thumb-btn.active {
  border-color: #3563e9;
  box-shadow: 0 0 0 2px rgba(53, 99, 233, 0.12);
}

.thumb-btn img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.main-image-card {
  background: #111;
  border-radius: 24px;
  overflow: hidden;
}

.main-image {
  width: 100%;
  display: block;
  aspect-ratio: 1 / 1.22;
  object-fit: cover;
}

.product-panel {
  padding-top: 8px;
}

.tag {
  display: inline-block;
  padding: 6px 10px;
  border-radius: 999px;
  background: #e9eefb;
  color: #6d7ca3;
  font-size: 10px;
  letter-spacing: 0.08em;
  margin-bottom: 14px;
}

.product-title {
  margin: 0 0 12px;
  font-size: 54px;
  line-height: 1.05;
  font-weight: 400;
  letter-spacing: -0.03em;
}

.price-row {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 26px;
}

.price {
  margin: 0;
  color: #2563eb;
  font-size: 32px;
  font-weight: 700;
}

.rating-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}

.stars {
  color: #f59e0b;
}

.reviews {
  color: #6b7280;
}

.option-block {
  margin-bottom: 22px;
}

.option-label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.option-label {
  font-size: 11px;
  color: #6b7280;
  letter-spacing: 0.08em;
}

.size-guide {
  border: 0;
  background: transparent;
  color: #2563eb;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
}

.swatch-row {
  display: flex;
  gap: 10px;
}

.swatch {
  width: 34px;
  height: 34px;
  border-radius: 999px;
  border: 2px solid transparent;
  cursor: pointer;
}

.swatch.active {
  border-color: #cfd7ea;
}

.swatch-dark {
  background: #4b5563;
}

.swatch-black {
  background: #111827;
}

.size-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.size-btn {
  height: 48px;
  border-radius: 14px;
  border: 1px solid #e5e7eb;
  background: #fff;
  color: #111827;
  cursor: pointer;
  font-weight: 500;
}

.size-btn.active {
  border-color: #3563e9;
  color: #3563e9;
  box-shadow: 0 0 0 1px #3563e9 inset;
}

.size-btn.disabled {
  color: #c4c4c4;
  background: #f7f7f7;
  cursor: not-allowed;
}

.action-row {
  display: grid;
  grid-template-columns: 100px 1fr;
  gap: 12px;
  margin: 24px 0 12px;
}

.qty-control {
  height: 52px;
  border-radius: 14px;
  background: #f1f3f6;
  display: flex;
  align-items: center;
  justify-content: space-around;
}

.qty-control button {
  border: 0;
  background: transparent;
  font-size: 18px;
  cursor: pointer;
}

.add-btn {
  height: 52px;
  border: 0;
  border-radius: 14px;
  background: #3563e9;
  color: #fff;
  font-weight: 700;
  cursor: pointer;
}

.wishlist-btn {
  width: 100%;
  height: 50px;
  border-radius: 14px;
  border: 1px solid #d9dfeb;
  background: transparent;
  color: #111827;
  font-weight: 600;
  margin-bottom: 18px;
  cursor: pointer;
}

.benefit-card {
  display: flex;
  gap: 12px;
  background: #f8fafc;
  border-radius: 18px;
  padding: 16px;
  margin-bottom: 12px;
}

.benefit-icon {
  font-size: 16px;
  line-height: 1;
  margin-top: 3px;
}

.benefit-card h4 {
  margin: 0 0 6px;
  font-size: 14px;
}

.benefit-card p {
  margin: 0;
  font-size: 12px;
  line-height: 1.6;
  color: #6b7280;
}

.narrative-section {
  display: grid;
  grid-template-columns: 340px 1fr;
  gap: 34px;
  margin-top: 80px;
}

.narrative-left h2,
.pairings-head h2 {
  margin: 0 0 12px;
  font-size: 34px;
  font-weight: 500;
}

.narrative-text {
  margin: 0 0 28px;
  color: #5b6474;
  line-height: 1.9;
  font-size: 15px;
}

.meta-grid {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.meta-row {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  border-top: 1px solid #e7ebf2;
  padding-top: 14px;
  font-size: 12px;
}

.meta-row span {
  color: #98a2b3;
  letter-spacing: 0.08em;
}

.meta-row strong {
  color: #111827;
  font-weight: 600;
}

.narrative-right {
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.info-cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
}

.info-card {
  background: #f5f7fa;
  border-radius: 22px;
  padding: 24px;
}

.info-card h4 {
  margin: 0 0 10px;
  font-size: 20px;
}

.info-card p {
  margin: 0;
  color: #6b7280;
  line-height: 1.8;
  font-size: 14px;
}

.editorial-media {
  position: relative;
  border-radius: 24px;
  overflow: hidden;
}

.editorial-media img {
  width: 100%;
  height: 360px;
  object-fit: cover;
  display: block;
}

.play-btn {
  position: absolute;
  inset: 50% auto auto 50%;
  transform: translate(-50%, -50%);
  width: 64px;
  height: 64px;
  border-radius: 999px;
  border: 0;
  background: rgba(255, 255, 255, 0.95);
  font-size: 20px;
  cursor: pointer;
}

.pairings-section {
  margin-top: 80px;
}

.pairings-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 26px;
}

.pairings-head p {
  margin: 6px 0 0;
  color: #6b7280;
}

.pairings-nav {
  display: flex;
  gap: 10px;
}

.pairings-nav button {
  width: 42px;
  height: 42px;
  border-radius: 999px;
  border: 1px solid #d8deea;
  background: #fff;
  cursor: pointer;
}

.pairings-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 22px;
}

.pair-card {
  background: transparent;
}

.pair-image-wrap {
  background: #eef1ee;
  border-radius: 22px;
  overflow: hidden;
  margin-bottom: 12px;
}

.pair-image-wrap img {
  width: 100%;
  height: 320px;
  object-fit: cover;
  display: block;
}

.pair-card h4 {
  margin: 0 0 8px;
  font-size: 16px;
  font-weight: 500;
}

.pair-meta {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  font-size: 12px;
  color: #6b7280;
}

.pair-meta strong {
  color: #111827;
}

.empty-state {
  min-height: 60vh;
  display: grid;
  place-items: center;
  font-size: 22px;
  color: #6b7280;
}

@media (max-width: 1200px) {
  .hero-section {
    grid-template-columns: 64px 1fr;
  }

  .product-panel {
    grid-column: 1 / -1;
  }

  .narrative-section {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 900px) {
  .product-title {
    font-size: 40px;
  }

  .info-cards,
  .pairings-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 640px) {
  .hero-section {
    grid-template-columns: 1fr;
  }

  .gallery-column {
    flex-direction: row;
  }

  .size-grid,
  .info-cards,
  .pairings-grid {
    grid-template-columns: 1fr;
  }

  .action-row {
    grid-template-columns: 1fr;
  }

  .product-title {
    font-size: 32px;
  }
}
</style>
