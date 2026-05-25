<template>
  <div class="shop-page">
    <AppHeader :nav-links="navLinks" :cart-count="cartCount" />

    <main class="shop-main">
      <div class="shop-container">

        <!-- Breadcrumb -->
        <nav class="breadcrumb">
          <RouterLink to="/" class="bc-link">Home</RouterLink>
          <i class="fa-solid fa-chevron-right bc-sep"></i>
          <span class="bc-current">{{ selectedCategoryName || 'All Products' }}</span>
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
                class="cat-item"
                :class="{ active: selectedCategoryId === null }"
                @click="selectCategory(null, 'All Products')"
              >
                <span>All Products</span>
                <i class="fa-solid fa-chevron-right"></i>
              </li>
              <li
                v-for="cat in categories"
                :key="cat.id"
                class="cat-item"
                :class="{ active: selectedCategoryId === cat.id }"
                @click="selectCategory(cat.id, cat.name)"
              >
                <span>{{ cat.name }}</span>
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

            <!-- Colors (UI only — no backend field) -->
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

            <!-- Size (UI only) -->
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

            <button type="button" class="apply-btn" @click="applyFilter">
              Apply Filter
            </button>

          </aside>

          <!-- ══ Catalog ══ -->
          <section class="catalog">

            <div class="catalog-header">
              <h1 class="catalog-title">{{ selectedCategoryName || 'All Products' }}</h1>
              <div class="catalog-meta">
                <span class="result-count">
                  <template v-if="loading">Loading…</template>
                  <template v-else>
                    Showing {{ startItem }}–{{ endItem }} of {{ totalElements }} Products
                  </template>
                </span>
                <div class="sort-wrap">
                  <span class="sort-label">Sort by:</span>
                  <select v-model="sortBy" class="sort-select" @change="fetchProducts">
                    <option value="popular">Most Popular</option>
                    <option value="newest">Newest Arrivals</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                  </select>
                </div>
              </div>

              <!-- Search bar -->
              <form class="search-bar" @submit.prevent="runSearch">
                <i class="fa-solid fa-magnifying-glass search-ico"></i>
                <input
                  v-model="searchText"
                  type="search"
                  class="search-inp"
                  placeholder="Search products…"
                />
                <button type="submit" class="search-btn">Search</button>
              </form>
            </div>

            <!-- Loading -->
            <div v-if="loading" class="state-msg">
              <i class="fa-solid fa-spinner fa-spin"></i> Loading products…
            </div>

            <!-- Error -->
            <div v-else-if="error" class="state-msg err">
              <i class="fa-solid fa-triangle-exclamation"></i> {{ error }}
            </div>

            <!-- Empty -->
            <div v-else-if="!products.length" class="state-msg">
              <i class="fa-regular fa-folder-open"></i> No products found.
            </div>

            <!-- Product Grid -->
            <div v-else class="product-grid">
              <RouterLink
                v-for="product in products"
                :key="product.id"
                :to="`/product/${product.id}`"
                class="product-card"
              >
                <div class="card-image">
                  <img
                    v-if="product.imageUrl"
                    :src="product.imageUrl"
                    :alt="product.name"
                    class="product-img"
                    loading="lazy"
                  />
                  <div v-else class="img-placeholder">
                    <i class="fa-solid fa-image"></i>
                  </div>
                </div>
                <div class="card-body">
                  <h3 class="product-name">{{ product.name }}</h3>
                  <div class="rating-row">
                    <div class="stars">
                      <i v-for="n in 5" :key="n" :class="getStarClass(product.averageRating ?? 0, n)"></i>
                    </div>
                    <span class="rating-text">
                      {{ product.averageRating ? product.averageRating.toFixed(1) : 'No ratings' }}
                    </span>
                  </div>
                  <div class="price-row">
                    <span class="price">${{ Number(product.price).toFixed(2) }}</span>
                    <span v-if="product.stockQuantity === 0" class="out-badge">Out of stock</span>
                  </div>
                </div>
              </RouterLink>
            </div>

            <!-- Pagination -->
            <div v-if="totalPages > 1" class="pagination">
              <button
                type="button"
                class="page-nav"
                :disabled="currentPage === 1"
                @click="goToPage(currentPage - 1)"
              >
                <i class="fa-solid fa-arrow-left"></i> Previous
              </button>

              <div class="page-numbers">
                <template v-for="p in visiblePages" :key="String(p)">
                  <button
                    v-if="p !== '...'"
                    type="button"
                    class="page-num"
                    :class="{ active: currentPage === p }"
                    @click="goToPage(p as number)"
                  >{{ p }}</button>
                  <span v-else class="page-dots">…</span>
                </template>
              </div>

              <button
                type="button"
                class="page-nav"
                :disabled="currentPage === totalPages"
                @click="goToPage(currentPage + 1)"
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

const API = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

// ── Types ──────────────────────────────────────────────────────────────────

interface ProductDTO {
  id: number
  name: string
  price: number
  stockQuantity: number
  imageUrl: string | null
  categoryId: number | null
  averageRating: number | null
  reviewCount: number | null
}

interface Category { id: number; name: string }

interface PagedResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
}

// ── Layout data ────────────────────────────────────────────────────────────

const navLinks      = ref<NavLink[]>([])
const footerColumns = ref<FooterColumn[]>([])
const socialLinks   = ref<SocialLink[]>([])

// ── Cart ──────────────────────────────────────────────────────────────────

interface CartItem { id: number; quantity: number }
const cartItems = ref<CartItem[]>([])
const cartCount = computed(() => cartItems.value.reduce((s, i) => s + i.quantity, 0))

// ── Products ──────────────────────────────────────────────────────────────

const products      = ref<ProductDTO[]>([])
const totalElements = ref(0)
const totalPages    = ref(1)
const loading       = ref(false)
const error         = ref('')
const currentPage   = ref(1)
const PER_PAGE      = 9
const searchText    = ref('')

// ── Categories ────────────────────────────────────────────────────────────

const categories          = ref<Category[]>([])
const selectedCategoryId  = ref<number | null>(null)
const selectedCategoryName = ref('')

// ── Price range ───────────────────────────────────────────────────────────

const PRICE_MIN = 0
const PRICE_MAX = 2000
const priceMin = ref(0)
const priceMax = ref(2000)

function clampMin() { if (priceMin.value >= priceMax.value) priceMin.value = priceMax.value - 1 }
function clampMax() { if (priceMax.value <= priceMin.value) priceMax.value = priceMin.value + 1 }

const rangeFillStyle = computed(() => {
  const left  = ((priceMin.value - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100
  const right = ((priceMax.value - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100
  return { left: `${left}%`, width: `${right - left}%` }
})

// ── Colors / Sizes (UI only) ──────────────────────────────────────────────

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
const selectedSizes = ref<string[]>([])
function toggleSize(s: string) {
  const i = selectedSizes.value.indexOf(s)
  i === -1 ? selectedSizes.value.push(s) : selectedSizes.value.splice(i, 1)
}

// ── Sort ──────────────────────────────────────────────────────────────────

const sortBy = ref('newest')

function sortParams() {
  switch (sortBy.value) {
    case 'popular':    return 'sortBy=averageRating&sortDir=desc'
    case 'price_asc':  return 'sortBy=price&sortDir=asc'
    case 'price_desc': return 'sortBy=price&sortDir=desc'
    default:           return 'sortBy=createdAt&sortDir=desc'
  }
}

// ── Pagination ────────────────────────────────────────────────────────────

const startItem = computed(() => totalElements.value ? (currentPage.value - 1) * PER_PAGE + 1 : 0)
const endItem   = computed(() => Math.min(currentPage.value * PER_PAGE, totalElements.value))

const visiblePages = computed((): (number | string)[] => {
  const t = totalPages.value
  if (t <= 7) return Array.from({ length: t }, (_, i) => i + 1)
  const cur = currentPage.value
  if (cur <= 4) return [1, 2, 3, 4, 5, '...', t]
  if (cur >= t - 3) return [1, '...', t - 4, t - 3, t - 2, t - 1, t]
  return [1, '...', cur - 1, cur, cur + 1, '...', t]
})

function goToPage(page: number) {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
  fetchProducts()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// ── Fetch products ────────────────────────────────────────────────────────

async function fetchProducts() {
  loading.value = true
  error.value = ''

  const params = new URLSearchParams()
  params.set('page', String(currentPage.value - 1))
  params.set('size', String(PER_PAGE))

  if (selectedCategoryId.value !== null) params.set('categoryId', String(selectedCategoryId.value))
  if (priceMin.value > PRICE_MIN)        params.set('minPrice', String(priceMin.value))
  if (priceMax.value < PRICE_MAX)        params.set('maxPrice', String(priceMax.value))
  if (searchText.value.trim())           params.set('name', searchText.value.trim())

  // search endpoint supports name/categoryId/price filters; plain products endpoint only supports sort
  const useSearch = selectedCategoryId.value !== null
    || priceMin.value > PRICE_MIN
    || priceMax.value < PRICE_MAX
    || searchText.value.trim() !== ''

  const sortStr = sortParams()
  const url = useSearch
    ? `${API}/api/products/search?${params}&${sortStr}`
    : `${API}/api/products?${params}&${sortStr}`

  try {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`Server error ${res.status}`)
    const data: PagedResponse<ProductDTO> = await res.json()
    products.value      = data.content ?? []
    totalElements.value = data.totalElements ?? 0
    totalPages.value    = data.totalPages ?? 1
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'Failed to load products.'
  } finally {
    loading.value = false
  }
}

// ── Fetch categories ──────────────────────────────────────────────────────

async function fetchCategories() {
  try {
    const res = await fetch(`${API}/api/categories?page=0&size=100`)
    if (!res.ok) return
    const data: PagedResponse<Category> = await res.json()
    categories.value = data.content ?? []
  } catch {
    // categories are optional; silently ignore
  }
}

// ── Actions ───────────────────────────────────────────────────────────────

function selectCategory(id: number | null, name: string) {
  selectedCategoryId.value   = id
  selectedCategoryName.value = name === 'All Products' ? '' : name
  currentPage.value = 1
  fetchProducts()
}

function applyFilter() {
  currentPage.value = 1
  fetchProducts()
}

function runSearch() {
  currentPage.value = 1
  fetchProducts()
}

// ── Stars ─────────────────────────────────────────────────────────────────

function getStarClass(rating: number, pos: number): string {
  if (rating >= pos)       return 'fa-solid fa-star'
  if (rating >= pos - 0.5) return 'fa-solid fa-star-half-stroke'
  return 'fa-regular fa-star'
}

// ── Init ──────────────────────────────────────────────────────────────────

onMounted(async () => {
  cartItems.value = readStorage<CartItem[]>('cartItems', [])
  const [nav, footer, social] = await Promise.all([getNavLinks(), getFooterColumns(), getSocialLinks()])
  navLinks.value      = nav
  footerColumns.value = footer
  socialLinks.value   = social
  await Promise.all([fetchCategories(), fetchProducts()])
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

.cat-item i { font-size: 11px; color: #bbb; }
.cat-item:hover, .cat-item.active { color: #111; font-weight: 600; }
.cat-item.active i { color: #555; }

/* Filter sections */
.filter-section { margin: 0; }

.fs-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.fs-title { font-size: 18px; font-weight: 700; color: #111; }
.fs-header > i { font-size: 12px; color: #555; }

/* Price range */
.price-range {
  position: relative;
  height: 24px;
  margin-bottom: 10px;
}

.price-track {
  position: absolute;
  top: 50%; left: 0; right: 0;
  height: 4px; background: #e0e0e0;
  border-radius: 4px; transform: translateY(-50%);
}

.price-fill {
  position: absolute;
  height: 100%;
  background: #111;
  border-radius: 4px;
}

.range-input {
  position: absolute; width: 100%; top: 50%;
  transform: translateY(-50%); height: 4px;
  background: transparent; -webkit-appearance: none; appearance: none;
  pointer-events: none; outline: none;
}

.range-input::-webkit-slider-thumb {
  -webkit-appearance: none; pointer-events: all;
  width: 22px; height: 22px; border-radius: 50%;
  background: #111; cursor: pointer;
  border: 3px solid #fff; box-shadow: 0 0 0 1.5px #bbb;
}

.range-input::-moz-range-thumb {
  pointer-events: all; width: 16px; height: 16px; border-radius: 50%;
  background: #111; cursor: pointer;
  border: 3px solid #fff; box-shadow: 0 0 0 1.5px #bbb;
}

.price-labels {
  display: flex; justify-content: space-between;
  font-size: 14px; font-weight: 500; color: #111; padding: 0 4px;
}

/* Color swatches */
.color-swatches { display: flex; flex-wrap: wrap; gap: 10px; }

.color-swatch {
  width: 36px; height: 36px; border-radius: 50%;
  border: 2px solid transparent; cursor: pointer;
  display: inline-flex; align-items: center; justify-content: center;
  transition: border-color 0.15s; padding: 0;
}

.color-swatch i { font-size: 13px; color: #fff; }
.color-swatch.light i { color: #333; }
.color-swatch.selected { border-color: #111; box-shadow: 0 0 0 2px #fff inset; }
.color-swatch[style*="FFFFFF"], .color-swatch[style*="ffffff"] { border-color: #ddd; }

/* Size pills */
.size-pills { display: flex; flex-wrap: wrap; gap: 8px; }

.size-pill {
  padding: 8px 16px; border-radius: 62px;
  border: 1px solid #e8e8e8; background: #f0f0f0;
  font-size: 13px; color: #555; cursor: pointer;
  font-family: inherit; transition: background 0.15s, color 0.15s, border-color 0.15s;
}

.size-pill:hover { border-color: #bbb; color: #111; }
.size-pill.selected { background: #111; color: #fff; border-color: #111; }

/* Apply button */
.apply-btn {
  width: 100%; margin-top: 20px; padding: 14px;
  background: #111; color: #fff; border: none;
  border-radius: 62px; font-size: 15px; font-weight: 600;
  cursor: pointer; font-family: inherit; transition: background 0.18s;
}

.apply-btn:hover { background: #333; }

/* ════════════════════════════
   CATALOG
════════════════════════════ */
.catalog-header { margin-bottom: 24px; }

.catalog-title { font-size: 32px; font-weight: 800; margin: 0 0 10px; color: #111; }

.catalog-meta {
  display: flex; align-items: center;
  justify-content: space-between; flex-wrap: wrap; gap: 8px;
}

.result-count { font-size: 14px; color: #999; }

.sort-wrap { display: flex; align-items: center; gap: 6px; font-size: 14px; color: #555; }

.sort-select {
  border: none; background: transparent;
  font-size: 14px; font-weight: 600; color: #111;
  cursor: pointer; font-family: inherit; outline: none;
}

/* Search bar */
.search-bar {
  display: flex; align-items: center; gap: 0;
  border: 1px solid #e8e8e8; border-radius: 62px;
  background: #fff; overflow: hidden; margin-top: 16px;
}
.search-ico {
  padding: 0 12px 0 16px; color: #999; font-size: 14px; flex-shrink: 0;
}
.search-inp {
  flex: 1; height: 44px; border: none; outline: none;
  font-size: 14px; font-family: inherit; color: #111; background: transparent;
  min-width: 0;
}
.search-inp::placeholder { color: #bbb; }
.search-btn {
  height: 44px; padding: 0 22px; border: none; background: #111;
  color: #fff; font-size: 14px; font-weight: 600;
  cursor: pointer; font-family: inherit; flex-shrink: 0;
  transition: background .15s;
}
.search-btn:hover { background: #333; }

/* State messages */
.state-msg {
  padding: 64px 20px;
  text-align: center;
  color: #999;
  font-size: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}
.state-msg.err { color: #e85c6e; }

/* Product grid */
.product-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.product-card { text-decoration: none; color: inherit; display: block; }

/* Product image */
.card-image {
  background: #f3f3f3;
  border-radius: 16px;
  overflow: hidden;
  aspect-ratio: 3 / 4;
  margin-bottom: 12px;
}

.product-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.product-card:hover .product-img { transform: scale(1.04); }

.img-placeholder {
  width: 100%; height: 100%;
  display: flex; align-items: center; justify-content: center;
  color: #ccc; font-size: 32px;
  background: linear-gradient(90deg, #ececec 25%, #e0e0e0 50%, #ececec 75%);
  background-size: 1200px 100%;
  animation: shimmer 1.6s infinite linear;
}

@keyframes shimmer {
  0%   { background-position: -600px 0; }
  100% { background-position:  600px 0; }
}

.card-body { display: flex; flex-direction: column; gap: 6px; }

.product-name {
  margin: 0; font-size: 15px; font-weight: 600; color: #111;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}

.rating-row { display: flex; align-items: center; gap: 6px; }
.stars { display: flex; gap: 2px; }
.stars i { font-size: 13px; color: #f5a623; }
.rating-text { font-size: 12px; color: #888; }

.price-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.price { font-size: 20px; font-weight: 700; color: #111; }
.out-badge {
  font-size: 11px; font-weight: 600; color: #e85c6e;
  background: rgba(232,92,110,.1); border-radius: 4px; padding: 2px 7px;
}

/* ── Pagination ── */
.pagination {
  margin-top: 48px;
  display: flex; align-items: center; justify-content: space-between;
  gap: 12px; flex-wrap: wrap;
}

.page-nav {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 10px 20px; border: 1px solid #e8e8e8; border-radius: 8px;
  background: #fff; font-size: 14px; font-weight: 500; color: #111;
  cursor: pointer; font-family: inherit; transition: border-color 0.15s;
}

.page-nav:hover:not(:disabled) { border-color: #111; }
.page-nav:disabled { opacity: 0.4; cursor: default; }

.page-numbers { display: flex; align-items: center; gap: 4px; }

.page-num {
  width: 36px; height: 36px; border-radius: 8px; border: none;
  background: transparent; font-size: 14px; color: #555;
  cursor: pointer; font-family: inherit; transition: background 0.15s, color 0.15s;
}

.page-num:hover { background: #f5f5f5; }
.page-num.active { background: #111; color: #fff; }
.page-dots { padding: 0 4px; color: #aaa; font-size: 14px; }

/* ── Responsive ── */
@media (max-width: 1024px) {
  .shop-layout { grid-template-columns: 220px 1fr; }
  .product-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 768px) {
  .shop-layout { grid-template-columns: 1fr; }
  .sidebar { position: static; }
  .product-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 480px) {
  .product-grid { grid-template-columns: 1fr; }
}
</style>
