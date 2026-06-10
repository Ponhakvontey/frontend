<template>
  <section class="new-arrivals">
    <div class="container">
      <h2 class="section-title">NEW ARRIVALS</h2>

      <div class="product-grid">
        <template v-if="loading">
          <article v-for="n in 4" :key="n" class="product-card">
            <div class="card-image"><div class="img-skeleton"></div></div>
            <div class="card-body">
              <div class="skeleton-line w60"></div>
              <div class="skeleton-line w40"></div>
            </div>
          </article>
        </template>

        <template v-else>
          <RouterLink
            v-for="product in products"
            :key="product.id"
            :to="`/product/${product.id}`"
            class="product-card"
          >
            <div class="card-image">
              <img v-if="product.imageUrl" :src="product.imageUrl" :alt="product.name"
                   :style="{ objectPosition: product.imagePosition || 'center top' }" />
              <div v-else class="img-skeleton"></div>
            </div>

            <div class="card-body">
              <h3 class="product-name">{{ product.name }}</h3>
              <div v-if="product.averageRating" class="rating-row">
                <div class="stars">
                  <i v-for="n in 5" :key="n" :class="starClass(product.averageRating, n)"></i>
                </div>
                <span class="rating-text">{{ product.averageRating.toFixed(1) }}/5</span>
              </div>
              <div class="price-row">
                <span class="price">${{ product.price.toFixed(2) }}</span>
              </div>
            </div>
          </RouterLink>
        </template>
      </div>

      <div class="view-all-wrap">
        <RouterLink to="/sell" class="view-all-btn">View All</RouterLink>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { getInventoryProducts } from '@/services/adminInventoryService'
import type { InventoryProduct } from '@/types/inventory'

const products = ref<InventoryProduct[]>([])
const loading = ref(true)

onMounted(async () => {
  const { products: all } = await getInventoryProducts()
  products.value = all.slice(0, 4)
  loading.value = false
})

function starClass(rating: number, position: number): string {
  if (rating >= position) return 'fa-solid fa-star'
  if (rating >= position - 0.5) return 'fa-solid fa-star-half-stroke'
  return 'fa-regular fa-star'
}
</script>

<style scoped>
.new-arrivals {
  background: #fff;
  padding: 72px 0 80px;
}

.container {
  width: min(1280px, 100%);
  margin: 0 auto;
  padding: 0 32px;
}

.section-title {
  text-align: center;
  font-size: 36px;
  font-weight: 800;
  letter-spacing: -0.01em;
  color: #111;
  margin: 0 0 48px;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.product-card {
  background: #fff;
  border-radius: 14px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  text-decoration: none;
  color: inherit;
  display: block;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.09);
}

.card-image {
  background: #f3f3f3;
  border-radius: 12px;
  overflow: hidden;
  aspect-ratio: 3 / 4;
  margin: 12px 12px 0;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

@keyframes shimmer {
  0%   { background-position: -600px 0; }
  100% { background-position:  600px 0; }
}

.img-skeleton {
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, #ececec 25%, #e0e0e0 50%, #ececec 75%);
  background-size: 1200px 100%;
  animation: shimmer 1.6s infinite linear;
}

.skeleton-line {
  height: 14px;
  border-radius: 4px;
  background: linear-gradient(90deg, #ececec 25%, #e0e0e0 50%, #ececec 75%);
  background-size: 1200px 100%;
  animation: shimmer 1.6s infinite linear;
  margin-bottom: 8px;
}

.w60 { width: 60%; }
.w40 { width: 40%; }

.card-body {
  padding: 14px 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.product-name {
  margin: 0;
  font-size: 15px;
  font-weight: 500;
  color: #111;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.rating-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.stars { display: flex; gap: 2px; }
.stars i { font-size: 13px; color: #f5a623; }
.rating-text { font-size: 12px; color: #888; }

.price-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.price {
  font-size: 20px;
  font-weight: 700;
  color: #111;
}

.view-all-wrap {
  display: flex;
  justify-content: center;
  margin-top: 48px;
}

.view-all-btn {
  padding: 13px 40px;
  font-size: 14px;
  font-weight: 500;
  color: #111;
  background: transparent;
  border: 1px solid #c8c8c8;
  border-radius: 8px;
  cursor: pointer;
  font-family: inherit;
  text-decoration: none;
  transition: border-color 0.18s, color 0.18s;
}

.view-all-btn:hover {
  border-color: #111;
  color: #111;
}

@media (max-width: 1024px) {
  .product-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 560px) {
  .product-grid { grid-template-columns: 1fr 1fr; gap: 12px; }
  .section-title { font-size: 26px; }
}
</style>
