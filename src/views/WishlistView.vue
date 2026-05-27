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

        <div v-if="loading" class="empty-card">
          <i class="fa-solid fa-spinner fa-spin" style="font-size:28px;color:#808080;"></i>
        </div>

        <section v-else-if="wishlistProducts.length" class="wishlist-grid">
          <article v-for="product in wishlistProducts" :key="product.id" class="wishlist-card">
            <RouterLink :to="`/product/${product.id}`" class="image-link">
              <img :src="product.imageUrl" :alt="product.name" />
            </RouterLink>

            <div class="card-copy">
              <p>{{ product.sellerName }}</p>
              <h2>{{ product.name }}</h2>
              <strong>{{ formatPrice(product.price) }}</strong>
            </div>

            <div class="card-actions">
              <RouterLink :to="`/product/${product.id}`" class="primary-btn">View Product</RouterLink>
              <button type="button" class="secondary-btn" @click="removeFavorite(product.id)">Remove</button>
            </div>
          </article>
        </section>

        <section v-else-if="!loading" class="empty-card">
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
import { getFooterColumns, getNavLinks, getSocialLinks } from '@/services/homeService'
import { fetchFavorites, removeFromWishlist } from '@/services/wishlistService'
import type { WishlistProduct } from '@/services/wishlistService'
import { loadCartItems } from '@/utils/commerce'
import type { FooterColumn, NavLink, SocialLink } from '@/types/home'

const navLinks = ref<NavLink[]>([])
const footerColumns = ref<FooterColumn[]>([])
const socialLinks = ref<SocialLink[]>([])
const wishlistProducts = ref<WishlistProduct[]>([])
const loading = ref(true)
const cartItems = ref(loadCartItems())

const cartCount = computed(() => cartItems.value.reduce((sum, item) => sum + item.quantity, 0))

function removeFavorite(productId: number | string) {
  removeFromWishlist(productId)
  wishlistProducts.value = wishlistProducts.value.filter((p) => p.id !== String(productId))
}

function formatPrice(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(value)
}

onMounted(async () => {
  ;[wishlistProducts.value, navLinks.value, footerColumns.value, socialLinks.value] = await Promise.all([
    fetchFavorites(),
    getNavLinks(),
    getFooterColumns(),
    getSocialLinks(),
  ])
  loading.value = false
})
</script>

<style scoped>
* { box-sizing: border-box; }

.wishlist-page {
  min-height: 100vh;
  background: #fff;
  color: #000;
  font-family: Helvetica, Arial, sans-serif;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.wishlist-main { padding: 70px 0 60px; }

.page-head { margin-bottom: 32px; }

.eyebrow {
  margin: 0 0 8px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.12em;
  color: #808080;
  text-transform: uppercase;
}

.page-head h1 {
  margin: 0 0 8px;
  font-size: 28px;
  font-weight: 700;
  line-height: 44px;
}

.page-head p,
.card-copy p {
  margin: 0;
  font-size: 14px;
  color: #808080;
}

.wishlist-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.wishlist-card {
  background: #fff;
  border: 1px solid #AABBAA;
  border-radius: 4px;
  box-shadow: rgba(0,0,0,0.05) 0 2px 4px;
  overflow: hidden;
}

.image-link {
  display: block;
  background: #f5f5f5;
}

.image-link img {
  width: 100%;
  aspect-ratio: 3 / 4;
  object-fit: cover;
  display: block;
}

.card-copy { padding: 12px 16px 0; }

.card-copy p {
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #808080;
}

.card-copy h2 {
  margin: 6px 0 4px;
  font-size: 16px;
  font-weight: 700;
  color: #000;
}

.card-copy strong { color: #DA292E; font-size: 18px; font-weight: 700; }

.card-actions {
  display: flex;
  gap: 8px;
  padding: 12px 16px 16px;
}

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

.empty-card {
  background: #fff;
  border: 1px solid #AABBAA;
  border-radius: 4px;
  padding: 56px 40px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  box-shadow: rgba(0,0,0,0.05) 0 2px 4px;
}

.empty-card h2 { margin: 0; font-size: 24px; font-weight: 700; color: #000; }
.empty-card p  { margin: 0; font-size: 14px; color: #808080; }
.empty-card .primary-btn { margin-top: 8px; }

@media (max-width: 1000px) {
  .wishlist-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}

@media (max-width: 680px) {
  .wishlist-grid { grid-template-columns: 1fr; }
  .card-actions { flex-direction: column; }
}
</style>