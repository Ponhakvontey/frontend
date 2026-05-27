<template>
  <div class="wishlist-page">
    <AppHeader :nav-links="navLinks" :cart-count="cartCount" />

    <main class="wishlist-main">
      <div class="container">
        <section class="page-head">
          <p class="eyebrow">MEMBER COLLECTION</p>
          <h1>Your Wishlist</h1>
          <p>Keep track of pieces you are considering before checkout.</p>
        </section>

        <section v-if="wishlistProducts.length" class="wishlist-grid">
          <article v-for="product in wishlistProducts" :key="product.id" class="wishlist-card">
            <RouterLink :to="`/product/${product.id}`" class="image-link">
              <img :src="product.image" :alt="product.name" />
            </RouterLink>

            <div class="card-copy">
              <p>{{ product.maker }}</p>
              <h2>{{ product.name }}</h2>
              <strong>{{ formatPrice(product.price) }}</strong>
            </div>

            <div class="card-actions">
              <RouterLink :to="`/product/${product.id}`" class="primary-btn">View Product</RouterLink>
              <button type="button" class="secondary-btn" @click="removeFavorite(product.id)">Remove</button>
            </div>
          </article>
        </section>

        <section v-else class="empty-card">
          <h2>No saved pieces yet</h2>
          <p>Use the heart button on product cards or product detail pages to save favorites here.</p>
          <RouterLink to="/sell" class="primary-btn">Browse Collection</RouterLink>
        </section>
      </div>
    </main>

    <AppFooter :footer-columns="footerColumns" :social-links="socialLinks" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import { getFooterColumns, getNavLinks, getSocialLinks, getTrendingProducts } from '@/services/homeService'
import { getWishlistIds, removeFromWishlist } from '@/services/wishlistService'
import { loadCartItems } from '@/utils/commerce'
import type { FooterColumn, NavLink, Product, SocialLink } from '@/types/home'

const navLinks = ref<NavLink[]>([])
const footerColumns = ref<FooterColumn[]>([])
const socialLinks = ref<SocialLink[]>([])
const products = ref<Product[]>([])
const wishlistIds = ref<string[]>([])
const cartItems = ref(loadCartItems())

const wishlistProducts = computed(() => {
  return products.value.filter((product) => wishlistIds.value.includes(String(product.id)))
})

const cartCount = computed(() => cartItems.value.reduce((sum, item) => sum + item.quantity, 0))

function removeFavorite(productId: number | string) {
  wishlistIds.value = removeFromWishlist(productId)
}

function formatPrice(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(value)
}

onMounted(async () => {
  wishlistIds.value = getWishlistIds()
  products.value = await getTrendingProducts()
  navLinks.value = await getNavLinks()
  footerColumns.value = await getFooterColumns()
  socialLinks.value = await getSocialLinks()
})
</script>

<style scoped>
* { box-sizing: border-box; }

.wishlist-page {
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

.wishlist-main { padding: 88px 0 80px; }

.page-head { margin-bottom: 30px; }

.eyebrow {
  margin: 0 0 10px;
  font-size: 10px;
  letter-spacing: 0.16em;
  color: #98a2b3;
}

.page-head h1 {
  margin: 0 0 10px;
  font-size: 56px;
  line-height: 1.04;
  font-weight: 400;
  letter-spacing: -0.03em;
}

.page-head p,
.empty-card p,
.card-copy p {
  margin: 0;
  color: #667085;
}

.wishlist-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 22px;
}

.wishlist-card,
.empty-card {
  background: #fff;
  border: 1px solid #eef2f6;
  border-radius: 18px;
}

.wishlist-card { overflow: hidden; }

.image-link {
  display: block;
  background: #eef2f6;
}

.image-link img {
  width: 100%;
  aspect-ratio: 1 / 1.05;
  object-fit: cover;
  display: block;
}

.card-copy { padding: 18px 18px 0; }

.card-copy p {
  font-size: 10px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.card-copy h2 {
  margin: 8px 0;
  font-size: 22px;
  font-weight: 500;
}

.card-copy strong { color: #3563e9; }

.card-actions {
  display: flex;
  gap: 10px;
  padding: 18px;
}

.primary-btn,
.secondary-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 42px;
  border-radius: 14px;
  padding: 0 16px;
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;
}

.primary-btn {
  border: 0;
  background: #513B3C;
  color: #fff;
}

.secondary-btn {
  border: 0;
  background: #ede6e7;
  color: #495467;
}

.empty-card {
  padding: 48px 28px;
  text-align: center;
}

.empty-card h2 {
  margin: 0 0 10px;
  font-size: 30px;
  font-weight: 500;
}

.empty-card .primary-btn { margin-top: 20px; }

@media (max-width: 1000px) {
  .wishlist-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}

@media (max-width: 680px) {
  .page-head h1 { font-size: 40px; }
  .wishlist-grid { grid-template-columns: 1fr; }
  .card-actions { flex-direction: column; }
}
</style>