<template>
  <div class="shop-page">
    <AppHeader :nav-links="navLinks" :cart-count="cartCount" />

    <main class="shop-main">
      <div class="shop-container">

        <!-- Breadcrumb -->
        <nav class="breadcrumb">
          <RouterLink to="/" class="bc-link">Home</RouterLink>
          <i class="fa-solid fa-chevron-right bc-sep"></i>
          <span class="bc-current">Casual</span>
        </nav>

        <div class="shop-layout">

          <!-- ══ Sidebar ══ -->
          <aside class="sidebar">

            <div class="sidebar-header">
              <span class="sidebar-title">Filters</span>
              <i class="fa-solid fa-sliders"></i>
            </div>

            <hr class="divider" />

            <!-- Categories -->
            <ul class="cat-list">
              <li
                v-for="cat in categories"
                :key="cat"
                class="cat-item"
                :class="{ active: selectedCategory === cat }"
                @click="selectedCategory = cat"
              >
                <span>{{ cat }}</span>
                <i class="fa-solid fa-chevron-right"></i>
              </li>
            </ul>

            <hr class="divider" />

            <!-- Price Range -->
            <div class="filter-section">
              <div class="fs-header">
                <span class="fs-title">Price</span>
                <i class="fa-solid fa-chevron-up"></i>
              </div>

              <div class="price-range">
                <div class="price-track">
                  <div class="price-fill" :style="rangeFillStyle"></div>
                </div>
                <input
                  type="range" :min="PRICE_MIN" :max="PRICE_MAX"
                  v-model.number="priceMin" @input="clampMin"
                  class="range-input"
                />
                <input
                  type="range" :min="PRICE_MIN" :max="PRICE_MAX"
                  v-model.number="priceMax" @input="clampMax"
                  class="range-input"
                />
              </div>

              <div class="price-labels">
                <span>${{ priceMin }}</span>
                <span>${{ priceMax }}</span>
              </div>
            </div>

            <hr class="divider" />

            <!-- Colors -->
            <div class="filter-section">
              <div class="fs-header">
                <span class="fs-title">Colors</span>
                <i class="fa-solid fa-chevron-up"></i>
              </div>
              <div class="color-swatches">
                <button
                  v-for="color in colors"
                  :key="color.value"
                  type="button"
                  class="color-swatch"
                  :class="{ selected: selectedColors.includes(color.value), light: color.light }"
                  :style="{ background: color.value }"
                  :aria-label="color.label"
                  @click="toggleColor(color.value)"
                >
                  <i v-if="selectedColors.includes(color.value)" class="fa-solid fa-check"></i>
                </button>
              </div>
            </div>

            <hr class="divider" />

            <!-- Size -->
            <div class="filter-section">
              <div class="fs-header">
                <span class="fs-title">Size</span>
                <i class="fa-solid fa-chevron-up"></i>
              </div>
              <div class="size-pills">
                <button
                  v-for="size in sizes"
                  :key="size"
                  type="button"
                  class="size-pill"
                  :class="{ selected: selectedSizes.includes(size) }"
                  @click="toggleSize(size)"
                >
                  {{ size }}
                </button>
              </div>
            </div>

            <hr class="divider" />

            <!-- Dress Style -->
            <div class="filter-section">
              <div class="fs-header">
                <span class="fs-title">Dress Style</span>
                <i class="fa-solid fa-chevron-up"></i>
              </div>
              <ul class="style-list">
                <li v-for="style in dressStyles" :key="style" class="style-item">
                  <span>{{ style }}</span>
                  <i class="fa-solid fa-chevron-right"></i>
                </li>
              </ul>
            </div>

            <button type="button" class="apply-btn" @click="applyFilter">
              Apply Filter
            </button>

          </aside>

          <!-- ══ Catalog ══ -->
          <section class="catalog">

            <div class="catalog-header">
              <h1 class="catalog-title">Casual</h1>
              <div class="catalog-meta">
                <span class="result-count">
                  Showing 1–{{ paginatedProducts.length }} of 100 Products
                </span>
                <div class="sort-wrap">
                  <span class="sort-label">Sort by:</span>
                  <select v-model="sortBy" class="sort-select">
                    <option>Most Popular</option>
                    <option>Newest Arrivals</option>
                    <option>Price: Low to High</option>
                    <option>Price: High to Low</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Product Grid -->
            <div class="product-grid">
              <RouterLink
                v-for="product in paginatedProducts"
                :key="product.id"
                :to="`/product/${product.id}`"
                class="product-card"
              >
                <div class="card-image">
                  <div class="img-skeleton"></div>
                </div>
                <div class="card-body">
                  <h3 class="product-name">{{ product.name }}</h3>
                  <div class="rating-row">
                    <div class="stars">
                      <i v-for="n in 5" :key="n" :class="getStarClass(product.rating, n)"></i>
                    </div>
                    <span class="rating-text">{{ product.rating }}/5</span>
                  </div>
                  <div class="price-row">
                    <span class="price">${{ product.price }}</span>
                    <template v-if="product.originalPrice">
                      <span class="original-price">${{ product.originalPrice }}</span>
                      <span class="discount-badge">-{{ product.discount }}%</span>
                    </template>
                  </div>
                </div>
              </RouterLink>
            </div>

            <!-- Pagination -->
            <div class="pagination">
              <button
                type="button"
                class="page-nav"
                :disabled="currentPage === 1"
                @click="prevPage"
              >
                <i class="fa-solid fa-arrow-left"></i> Previous
              </button>

              <div class="page-numbers">
                <template v-for="page in visiblePages" :key="String(page)">
                  <button
                    v-if="page !== '...'"
                    type="button"
                    class="page-num"
                    :class="{ active: currentPage === page }"
                    @click="goToPage(page as number)"
                  >{{ page }}</button>
                  <span v-else class="page-dots">…</span>
                </template>
              </div>

              <button
                type="button"
                class="page-nav"
                :disabled="currentPage === totalPages"
                @click="nextPage"
              >
                Next <i class="fa-solid fa-arrow-right"></i>
              </button>
            </div>

          </section>
        </div>
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
import type { FooterColumn, NavLink, SocialLink } from '@/types/home'
import { readStorage } from '@/utils/storage'

interface CartItem  { id: number; quantity: number }
interface ShopProduct {
  id: number; name: string; rating: number; price: number
  originalPrice?: number; discount?: number
}

// ── Layout data ──
const navLinks      = ref<NavLink[]>([])
const footerColumns = ref<FooterColumn[]>([])
const socialLinks   = ref<SocialLink[]>([])

// ── Cart ──
const cartItems = ref<CartItem[]>([])
const cartCount = computed(() => cartItems.value.reduce((s, i) => s + i.quantity, 0))
function loadCart() { cartItems.value = readStorage<CartItem[]>('cartItems', []) }

// ── Mock products ──
const products: ShopProduct[] = [
  { id: 1, name: 'Gradient Graphic T-shirt',  rating: 3.5, price: 145 },
  { id: 2, name: 'Polo with Tipping Details', rating: 4.5, price: 180 },
  { id: 3, name: 'Black Striped T-shirt',      rating: 5.0, price: 120, originalPrice: 150, discount: 30 },
  { id: 4, name: 'Skinny Fit Jeans',           rating: 3.5, price: 240, originalPrice: 260, discount: 20 },
  { id: 5, name: 'Checkered Shirt',            rating: 4.5, price: 180 },
  { id: 6, name: 'Sleeve Striped T-shirt',     rating: 4.5, price: 130, originalPrice: 160, discount: 30 },
  { id: 7, name: 'Vertical Striped Shirt',     rating: 5.0, price: 212, originalPrice: 232, discount: 20 },
  { id: 8, name: 'Courage Graphic T-shirt',    rating: 4.0, price: 145 },
  { id: 9, name: 'Loose Fit Bermuda Shorts',   rating: 3.0, price: 80 },
]

// ── Filters ──
const categories       = ['T-shirts', 'Shorts', 'Shirts', 'Hoodie', 'Jeans']
const selectedCategory = ref<string | null>(null)

const PRICE_MIN = 0
const PRICE_MAX = 500
const priceMin = ref(50)
const priceMax = ref(200)
function clampMin() { if (priceMin.value >= priceMax.value) priceMin.value = priceMax.value - 10 }
function clampMax() { if (priceMax.value <= priceMin.value) priceMax.value = priceMin.value + 10 }

const rangeFillStyle = computed(() => {
  const left  = ((priceMin.value - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100
  const right = ((priceMax.value - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100
  return { left: `${left}%`, width: `${right - left}%` }
})

const colors = [
  { label: 'Green',  value: '#00C12B', light: false },
  { label: 'Red',    value: '#F50606', light: false },
  { label: 'Yellow', value: '#F5DD06', light: true  },
  { label: 'Orange', value: '#F57906', light: false },
  { label: 'Cyan',   value: '#06CAF4', light: false },
  { label: 'Blue',   value: '#063AF4', light: false },
  { label: 'Purple', value: '#7D06F4', light: false },
  { label: 'Pink',   value: '#F406CB', light: false },
  { label: 'White',  value: '#FFFFFF', light: true  },
  { label: 'Black',  value: '#000000', light: false },
]
const selectedColors = ref<string[]>([])
function toggleColor(val: string) {
  const i = selectedColors.value.indexOf(val)
  i === -1 ? selectedColors.value.push(val) : selectedColors.value.splice(i, 1)
}

const sizes = ['XX-Small', 'X-Small', 'Small', 'Medium', 'Large', 'X-Large', 'XX-Large', '3X-Large', '4X-Large']
const selectedSizes = ref<string[]>(['Large'])
function toggleSize(s: string) {
  const i = selectedSizes.value.indexOf(s)
  i === -1 ? selectedSizes.value.push(s) : selectedSizes.value.splice(i, 1)
}

const dressStyles = ['Casual', 'Formal', 'Party', 'Gym']
function applyFilter() { /* filters applied */ }

// ── Sort / Pagination ──
const sortBy      = ref('Most Popular')
const currentPage = ref(1)
const PER_PAGE    = 9

const totalPages = computed(() => Math.max(1, Math.ceil(products.length / PER_PAGE)))

const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * PER_PAGE
  return products.slice(start, start + PER_PAGE)
})

const visiblePages = computed((): (number | string)[] => {
  const t = totalPages.value
  if (t <= 7) return Array.from({ length: t }, (_, i) => i + 1)
  return [1, 2, 3, '...', t - 2, t - 1, t]
})

function goToPage(page: number) { currentPage.value = page }
function prevPage() { if (currentPage.value > 1) currentPage.value-- }
function nextPage() { if (currentPage.value < totalPages.value) currentPage.value++ }

// ── Stars ──
function getStarClass(rating: number, pos: number): string {
  if (rating >= pos)       return 'fa-solid fa-star'
  if (rating >= pos - 0.5) return 'fa-solid fa-star-half-stroke'
  return 'fa-regular fa-star'
}

onMounted(async () => {
  loadCart()
  const [nav, footer, social] = await Promise.all([getNavLinks(), getFooterColumns(), getSocialLinks()])
  navLinks.value      = nav
  footerColumns.value = footer
  socialLinks.value   = social
})
</script>

<style scoped>
* { box-sizing: border-box; }

.shop-page {
  min-height: 100vh;
  background: #fff;
  font-family: Inter, Arial, sans-serif;
  color: #111;
}

/* ── Container ── */
.shop-main { padding: 24px 0 80px; }

.shop-container {
  width: min(1280px, 100%);
  margin: 0 auto;
  padding: 0 32px;
}

/* ── Breadcrumb ── */
.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 24px;
  font-size: 13px;
  color: #999;
}

.bc-link { text-decoration: none; color: #999; }
.bc-link:hover { color: #111; }
.bc-sep { font-size: 10px; }
.bc-current { color: #111; font-weight: 500; }

/* ── Two-column layout ── */
.shop-layout {
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: 24px;
  align-items: start;
}

/* ════════════════════════════
   SIDEBAR
════════════════════════════ */
.sidebar {
  border: 1px solid #e8e8e8;
  border-radius: 20px;
  padding: 20px 24px 24px;
  background: #fff;
  position: sticky;
  top: 100px;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0;
}

.sidebar-title {
  font-size: 20px;
  font-weight: 700;
  color: #111;
}

.sidebar-header i {
  font-size: 18px;
  color: #555;
}

.divider {
  border: none;
  border-top: 1px solid #f0f0f0;
  margin: 16px 0;
}

/* Categories */
.cat-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.cat-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 4px;
  font-size: 15px;
  color: #555;
  cursor: pointer;
  border-radius: 6px;
  transition: color 0.15s;
}

.cat-item i {
  font-size: 11px;
  color: #bbb;
}

.cat-item:hover,
.cat-item.active {
  color: #111;
}

.cat-item.active i { color: #555; }

/* Filter sections */
.filter-section { margin: 0; }

.fs-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.fs-title {
  font-size: 18px;
  font-weight: 700;
  color: #111;
}

.fs-header > i {
  font-size: 12px;
  color: #555;
}

/* Price range */
.price-range {
  position: relative;
  height: 24px;
  margin-bottom: 10px;
}

.price-track {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 4px;
  background: #e0e0e0;
  border-radius: 4px;
  transform: translateY(-50%);
}

.price-fill {
  position: absolute;
  height: 100%;
  background: #111;
  border-radius: 4px;
}

.range-input {
  position: absolute;
  width: 100%;
  top: 50%;
  transform: translateY(-50%);
  height: 4px;
  background: transparent;
  -webkit-appearance: none;
  appearance: none;
  pointer-events: none;
  outline: none;
}

.range-input::-webkit-slider-thumb {
  -webkit-appearance: none;
  pointer-events: all;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #111;
  cursor: pointer;
  border: 3px solid #fff;
  box-shadow: 0 0 0 1.5px #bbb;
}

.range-input::-moz-range-thumb {
  pointer-events: all;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #111;
  cursor: pointer;
  border: 3px solid #fff;
  box-shadow: 0 0 0 1.5px #bbb;
}

.price-labels {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  font-weight: 500;
  color: #111;
  padding: 0 4px;
}

/* Color swatches */
.color-swatches {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.color-swatch {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: border-color 0.15s;
  padding: 0;
}

.color-swatch i {
  font-size: 13px;
  color: #fff;
}

.color-swatch.light i { color: #333; }

.color-swatch.selected {
  border-color: #111;
  box-shadow: 0 0 0 2px #fff inset;
}

/* White swatch needs a border */
.color-swatch[style*="FFFFFF"],
.color-swatch[style*="ffffff"] {
  border-color: #ddd;
}

/* Size pills */
.size-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.size-pill {
  padding: 8px 16px;
  border-radius: 62px;
  border: 1px solid #e8e8e8;
  background: #f0f0f0;
  font-size: 13px;
  color: #555;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.15s, color 0.15s, border-color 0.15s;
}

.size-pill:hover {
  border-color: #bbb;
  color: #111;
}

.size-pill.selected {
  background: #111;
  color: #fff;
  border-color: #111;
}

/* Dress style list */
.style-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.style-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 4px;
  font-size: 15px;
  color: #555;
  cursor: pointer;
}

.style-item i { font-size: 11px; color: #bbb; }
.style-item:hover { color: #111; }

/* Apply button */
.apply-btn {
  width: 100%;
  margin-top: 20px;
  padding: 14px;
  background: #111;
  color: #fff;
  border: none;
  border-radius: 62px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.18s;
}

.apply-btn:hover { background: var(--clr-plum); }

/* ════════════════════════════
   CATALOG
════════════════════════════ */
.catalog-header {
  margin-bottom: 24px;
}

.catalog-title {
  font-size: 32px;
  font-weight: 800;
  margin: 0 0 10px;
  color: #111;
}

.catalog-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
}

.result-count {
  font-size: 14px;
  color: #999;
}

.sort-wrap {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #555;
}

.sort-select {
  border: none;
  background: transparent;
  font-size: 14px;
  font-weight: 600;
  color: #111;
  cursor: pointer;
  font-family: inherit;
  outline: none;
}

/* Product grid */
.product-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.product-card {
  text-decoration: none;
  color: inherit;
  display: block;
}

/* Skeleton image */
.card-image {
  background: #f3f3f3;
  border-radius: 16px;
  overflow: hidden;
  aspect-ratio: 3 / 4;
  margin-bottom: 12px;
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
  transition: filter 0.2s;
}

.product-card:hover .img-skeleton { filter: brightness(0.94); }

.card-body {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.product-name {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
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

.original-price {
  font-size: 15px;
  color: #aaa;
  text-decoration: line-through;
}

.discount-badge {
  font-size: 11px;
  font-weight: 600;
  color: #e85c6e;
  background: rgba(232, 92, 110, 0.1);
  border-radius: 4px;
  padding: 2px 7px;
}

/* ── Pagination ── */
.pagination {
  margin-top: 48px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.page-nav {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  background: #fff;
  font-size: 14px;
  font-weight: 500;
  color: #111;
  cursor: pointer;
  font-family: inherit;
  transition: border-color 0.15s;
}

.page-nav:hover:not(:disabled) { border-color: #111; }
.page-nav:disabled { opacity: 0.4; cursor: default; }

.page-numbers {
  display: flex;
  align-items: center;
  gap: 4px;
}

.page-num {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: none;
  background: transparent;
  font-size: 14px;
  color: #555;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.15s, color 0.15s;
}

.page-num:hover { background: #f5f5f5; }

.page-num.active {
  background: #111;
  color: #fff;
}

.page-dots {
  padding: 0 4px;
  color: #aaa;
  font-size: 14px;
}

/* ── Responsive ── */
@media (max-width: 1024px) {
  .shop-layout {
    grid-template-columns: 220px 1fr;
  }

  .product-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .shop-layout {
    grid-template-columns: 1fr;
  }

  .sidebar {
    position: static;
  }

  .product-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .product-grid {
    grid-template-columns: 1fr;
  }
}
</style>
