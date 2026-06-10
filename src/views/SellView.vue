<template>
  <div class="shop-page">
    <AppHeader :nav-links="navLinks" :cart-count="cartCount" />

    <main class="shop-main">
      <div class="shop-container">

        <!-- Mobile filter toggle -->
        <button class="mob-filter-btn" type="button" @click="filterOpen = !filterOpen">
          <i class="fa-solid fa-sliders"></i>
          {{ filterOpen ? 'Hide Filters' : 'Filters' }}
        </button>
        <div v-if="filterOpen" class="mob-filter-overlay" @click="filterOpen = false" />

        <!-- Top toolbar -->
        <div class="toolbar">
          <div class="toolbar-left">
            <span class="toolbar-label">Filters</span>
            <button type="button" class="clear-all-btn" @click="clearAll">Clear All</button>
          </div>
          <span class="toolbar-count">
            <template v-if="loading">Loading…</template>
            <template v-else>
              Showing {{ pageStart }}–{{ pageEnd }} Result from total {{ totalElements }}
            </template>
          </span>
          <div class="toolbar-right">
            <select v-model="sortBy" class="sort-select" @change="fetchProducts">
              <option value="popular">Popularity</option>
              <option value="newest">Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
            <i class="fa-solid fa-chevron-down sort-chevron"></i>
          </div>
        </div>

        <!-- Two-column layout -->
        <div class="shop-layout">

          <!-- ── Sidebar ── -->
          <aside class="sidebar" :class="{ 'mob-open': filterOpen }">

            <!-- Category -->
            <div class="filter-block">
              <button type="button" class="block-header" @click="toggleSection('category')">
                <span class="block-title">Category</span>
                <i :class="open.category ? 'fa-solid fa-chevron-up' : 'fa-solid fa-chevron-down'"></i>
              </button>
              <div v-show="open.category" class="block-body">
                <label
                  v-for="cat in showAllCats ? categories : categories.slice(0, 5)"
                  :key="cat.id"
                  class="filter-check"
                >
                  <input
                    type="checkbox"
                    :value="cat.id"
                    v-model="selectedCategoryIds"
                    @change="onFilterChange"
                  />
                  <span class="check-name">{{ cat.name }}</span>
                  <span class="check-count">({{ cat.productCount ?? 0 }})</span>
                </label>
                <button v-if="categories.length > 5" type="button" class="show-more-btn" @click="showAllCats = !showAllCats">
                  {{ showAllCats ? 'Show less' : 'Show more' }}
                </button>
              </div>
            </div>

            <div class="block-divider" />

            <!-- Ratings -->
            <div class="filter-block">
              <button type="button" class="block-header" @click="toggleSection('ratings')">
                <span class="block-title">Ratings</span>
                <i :class="open.ratings ? 'fa-solid fa-chevron-up' : 'fa-solid fa-chevron-down'"></i>
              </button>
              <div v-show="open.ratings" class="block-body">
                <label v-for="r in ratingOpts" :key="r.value" class="filter-radio">
                  <input
                    type="radio"
                    name="rating"
                    :value="r.value"
                    v-model="selectedRating"
                    @change="onFilterChange"
                  />
                  <span class="stars-sm">
                    <i v-for="n in 5" :key="n" :class="starClass(r.value, n)"></i>
                  </span>
                  <span class="radio-label">{{ r.label }}</span>
                  <span class="check-count">({{ r.count }})</span>
                </label>
              </div>
            </div>

            <div class="block-divider" />

            <!-- Brand -->
            <div class="filter-block">
              <button type="button" class="block-header" @click="toggleSection('brand')">
                <span class="block-title">Brand</span>
                <i :class="open.brand ? 'fa-solid fa-chevron-up' : 'fa-solid fa-chevron-down'"></i>
              </button>
              <div v-show="open.brand" class="block-body">
                <label
                  v-for="brand in showAllBrands ? sellers : sellers.slice(0, 5)"
                  :key="brand.name"
                  class="filter-check"
                >
                  <input type="checkbox" :value="brand.name" v-model="selectedBrands" />
                  <span class="check-name">{{ brand.name }}</span>
                  <span class="check-count">({{ brand.count }})</span>
                </label>
                <div v-if="!sellers.length" class="no-data">No brands yet</div>
                <button v-if="sellers.length > 5" type="button" class="show-more-btn" @click="showAllBrands = !showAllBrands">
                  {{ showAllBrands ? 'Show less' : 'Show more' }}
                </button>
              </div>
            </div>

            <div class="block-divider" />

            <!-- Price -->
            <div class="filter-block">
              <button type="button" class="block-header" @click="toggleSection('price')">
                <span class="block-title">Price</span>
                <i :class="open.price ? 'fa-solid fa-chevron-up' : 'fa-solid fa-chevron-down'"></i>
              </button>
              <div v-show="open.price" class="block-body">
                <div class="dual-range">
                  <div class="range-track">
                    <div class="range-fill" :style="priceFillStyle"></div>
                  </div>
                  <input type="range" class="range-thumb" :min="PRICE_MIN" :max="PRICE_MAX"
                         v-model.number="priceMin" @input="clampPriceMin" @change="onFilterChange" />
                  <input type="range" class="range-thumb" :min="PRICE_MIN" :max="PRICE_MAX"
                         v-model.number="priceMax" @input="clampPriceMax" @change="onFilterChange" />
                </div>
                <div class="range-inputs-row">
                  <input type="number" class="range-num" v-model.number="priceMin"
                         :min="PRICE_MIN" :max="priceMax - 1" @change="onFilterChange" />
                  <input type="number" class="range-num" v-model.number="priceMax"
                         :min="priceMin + 1" :max="PRICE_MAX" @change="onFilterChange" />
                </div>
              </div>
            </div>

            <div class="block-divider" />

            <!-- Size (UI only) -->
            <div class="filter-block">
              <button type="button" class="block-header" @click="toggleSection('size')">
                <span class="block-title">Size</span>
                <i :class="open.size ? 'fa-solid fa-chevron-up' : 'fa-solid fa-chevron-down'"></i>
              </button>
              <div v-show="open.size" class="block-body">
                <div class="dual-range">
                  <div class="range-track">
                    <div class="range-fill" :style="sizeFillStyle"></div>
                  </div>
                  <input type="range" class="range-thumb" :min="SIZE_MIN" :max="SIZE_MAX"
                         v-model.number="sizeMin" @input="clampSizeMin" />
                  <input type="range" class="range-thumb" :min="SIZE_MIN" :max="SIZE_MAX"
                         v-model.number="sizeMax" @input="clampSizeMax" />
                </div>
                <div class="range-inputs-row">
                  <input type="number" class="range-num" v-model.number="sizeMin"
                         :min="SIZE_MIN" :max="sizeMax - 1" />
                  <input type="number" class="range-num" v-model.number="sizeMax"
                         :min="sizeMin + 1" :max="SIZE_MAX" />
                </div>
              </div>
            </div>

          </aside>

          <!-- ── Catalog ── -->
          <section class="catalog">

            <!-- Search bar -->
            <form class="search-bar" @submit.prevent="runSearch">
              <i class="fa-solid fa-magnifying-glass search-ico"></i>
              <input v-model="searchText" type="search" class="search-inp" placeholder="Search products…" />
              <button type="submit" class="search-btn">Search</button>
            </form>

            <!-- States -->
            <div v-if="loading" class="state-msg">
              <i class="fa-solid fa-spinner fa-spin"></i> Loading products…
            </div>
            <div v-else-if="error" class="state-msg err">
              <i class="fa-solid fa-triangle-exclamation"></i> {{ error }}
            </div>
            <div v-else-if="!products.length" class="state-msg">
              <i class="fa-regular fa-folder-open"></i> No products found.
            </div>

            <!-- Product Grid -->
            <div v-else class="product-grid">
              <div v-for="product in filteredProducts" :key="product.id" class="product-card">

                <!-- Image + heart -->
                <div class="card-img-wrap">
                  <RouterLink :to="`/product/${product.id}`" class="img-link">
                    <img v-if="product.imageUrl" :src="product.imageUrl" :alt="product.name"
                         class="product-img" loading="lazy"
                         :style="{ objectPosition: product.imagePosition || 'center top' }" />
                    <div v-else class="img-placeholder">
                      <i class="fa-solid fa-image"></i>
                    </div>
                  </RouterLink>
                  <button
                    type="button"
                    class="heart-btn"
                    :class="{ active: isFav(product.id) }"
                    @click.prevent="toggleFav(product)"
                  >
                    <i :class="isFav(product.id) ? 'fa-solid fa-heart' : 'fa-regular fa-heart'"></i>
                  </button>
                </div>

                <!-- Body -->
                <div class="card-body">
                  <div class="name-price-row">
                    <RouterLink :to="`/product/${product.id}`" class="prod-name">{{ product.name }}</RouterLink>
                    <span class="prod-price">${{ Number(product.price).toFixed(2) }}</span>
                  </div>
                  <p class="prod-subtitle">
                    {{ product.sizes && product.sizes.length
                      ? product.sizes.length + ' types available'
                      : product.stockQuantity > 0 ? 'In stock' : 'Out of stock' }}
                  </p>
                  <div class="rating-row">
                    <span class="stars">
                      <i v-for="n in 5" :key="n" :class="starClass(product.averageRating ?? 0, n)"></i>
                    </span>
                    <span class="review-count">({{ product.reviewCount ?? 0 }})</span>
                  </div>
                  <div class="card-actions">
                    <button
                      type="button"
                      class="btn-cart"
                      :disabled="product.stockQuantity === 0"
                      @click.prevent="handleAddToCart(product)"
                    >
                      {{ product.stockQuantity === 0 ? 'Out of Stock' : 'Add To Cart' }}
                    </button>
                    <button type="button" class="btn-shortlist" @click.prevent="toggleFav(product)">
                      Add Shortlist
                    </button>
                  </div>
                </div>

              </div>
            </div>

            <!-- Pagination -->
            <div v-if="totalPages > 1" class="pagination">
              <button type="button" class="page-nav" :disabled="currentPage === 1" @click="goToPage(currentPage - 1)">
                <i class="fa-solid fa-arrow-left"></i> Previous
              </button>
              <div class="page-numbers">
                <template v-for="p in visiblePages" :key="String(p)">
                  <button v-if="p !== '...'" type="button" class="page-num"
                          :class="{ active: currentPage === p }" @click="goToPage(p as number)">{{ p }}</button>
                  <span v-else class="page-dots">…</span>
                </template>
              </div>
              <button type="button" class="page-nav" :disabled="currentPage === totalPages" @click="goToPage(currentPage + 1)">
                Next <i class="fa-solid fa-arrow-right"></i>
              </button>
            </div>

          </section>
        </div>
      </div>
    </main>

    <AppFooter :footer-columns="footerColumns" :social-links="socialLinks" />

    <!-- Size picker modal -->
    <Teleport to="body">
      <div v-if="sizePicker.product" class="modal-overlay" @click.self="sizePicker.product = null">
        <div class="size-modal">
          <h3 class="modal-title">Select a Size</h3>
          <p class="modal-product-name">{{ sizePicker.product.name }}</p>
          <div class="size-grid">
            <button
              v-for="s in sizePicker.product.sizes"
              :key="s"
              type="button"
              :class="['size-opt', { active: sizePicker.selected === s }]"
              @click="sizePicker.selected = s"
            >{{ s }}</button>
          </div>
          <div class="modal-actions">
            <button type="button" class="btn-cart" :disabled="!sizePicker.selected" @click="confirmCart">
              Add To Cart
            </button>
            <button type="button" class="btn-shortlist" @click="sizePicker.product = null">Cancel</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Toast -->
    <Teleport to="body">
      <transition name="toast-slide">
        <div v-if="toast.visible" class="toast" :class="`toast-${toast.type}`">{{ toast.message }}</div>
      </transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import { getFooterColumns, getNavLinks, getSocialLinks } from '@/services/homeService'
import { getInventoryProducts } from '@/services/adminInventoryService'
import { api, isLoggedIn } from '@/services/apiClient'
import { isWishlisted, toggleWishlist } from '@/services/wishlistService'
import { useCartSidebar } from '@/composables/useCartSidebar'
import type { FooterColumn, NavLink, SocialLink } from '@/types/home'
import { readStorage } from '@/utils/storage'

const router = useRouter()
const { openSidebar } = useCartSidebar()

// ── Types ──────────────────────────────────────────────────────────────────

interface ProductDTO {
  id: string
  name: string
  price: number
  stockQuantity: number
  imageUrl: string | null
  imagePosition: string | null
  categoryId: number | null
  averageRating: number | null
  reviewCount: number | null
  sizes: string[] | null
  sellerName: string | null
}

interface Category { id: number; name: string; productCount: number }
interface Seller { name: string; count: number }
interface PagedResponse<T> { content: T[]; totalElements: number; totalPages: number }

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
const PER_PAGE      = 12
const searchText    = ref('')

// ── Categories + sellers ──────────────────────────────────────────────────

const categories         = ref<Category[]>([])
const sellers            = ref<Seller[]>([])
const selectedCategoryIds = ref<number[]>([])
const selectedBrands      = ref<string[]>([])
const showAllCats         = ref(false)
const showAllBrands       = ref(false)

// ── Rating filter ─────────────────────────────────────────────────────────

const selectedRating = ref<number | null>(null)

const ratingOpts = [
  { value: 4.5, label: '4.5 & up', count: 0 },
  { value: 4.0, label: '4.0 & up', count: 0 },
  { value: 3.5, label: '3.5 & up', count: 0 },
  { value: 3.0, label: '3.0 & up', count: 0 },
]

// ── Price range ───────────────────────────────────────────────────────────

const PRICE_MIN = 0
const PRICE_MAX = 2000
const priceMin  = ref(0)
const priceMax  = ref(2000)

function clampPriceMin() { if (priceMin.value >= priceMax.value) priceMin.value = priceMax.value - 1 }
function clampPriceMax() { if (priceMax.value <= priceMin.value) priceMax.value = priceMin.value + 1 }

const priceFillStyle = computed(() => {
  const l = ((priceMin.value - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100
  const r = ((priceMax.value - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100
  return { left: `${l}%`, width: `${r - l}%` }
})

// ── Size range (UI only) ──────────────────────────────────────────────────

const SIZE_MIN = 0
const SIZE_MAX = 20
const sizeMin  = ref(0)
const sizeMax  = ref(20)

function clampSizeMin() { if (sizeMin.value >= sizeMax.value) sizeMin.value = sizeMax.value - 1 }
function clampSizeMax() { if (sizeMax.value <= sizeMin.value) sizeMax.value = sizeMin.value + 1 }

const sizeFillStyle = computed(() => {
  const l = ((sizeMin.value - SIZE_MIN) / (SIZE_MAX - SIZE_MIN)) * 100
  const r = ((sizeMax.value - SIZE_MIN) / (SIZE_MAX - SIZE_MIN)) * 100
  return { left: `${l}%`, width: `${r - l}%` }
})

// ── Sections open/close ───────────────────────────────────────────────────

const open = reactive({ category: true, ratings: true, brand: true, price: true, size: true })
function toggleSection(key: keyof typeof open) { open[key] = !open[key] }

// ── Sort + mobile filter ──────────────────────────────────────────────────

const sortBy    = ref('newest')
const filterOpen = ref(false)

function sortParams() {
  switch (sortBy.value) {
    case 'popular':    return 'sortBy=averageRating&sortDir=desc'
    case 'price_asc':  return 'sortBy=price&sortDir=asc'
    case 'price_desc': return 'sortBy=price&sortDir=desc'
    default:           return 'sortBy=createdAt&sortDir=desc'
  }
}

// ── Pagination ────────────────────────────────────────────────────────────

const pageStart = computed(() => totalElements.value ? (currentPage.value - 1) * PER_PAGE + 1 : 0)
const pageEnd   = computed(() => Math.min(currentPage.value * PER_PAGE, totalElements.value))

const visiblePages = computed((): (number | string)[] => {
  const t = totalPages.value
  if (t <= 7) return Array.from({ length: t }, (_, i) => i + 1)
  const c = currentPage.value
  if (c <= 4) return [1, 2, 3, 4, 5, '...', t]
  if (c >= t - 3) return [1, '...', t - 4, t - 3, t - 2, t - 1, t]
  return [1, '...', c - 1, c, c + 1, '...', t]
})

function goToPage(page: number) {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
  fetchProducts()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// ── Brand filter (client-side on current page) ────────────────────────────

const filteredProducts = computed(() => {
  if (!selectedBrands.value.length) return products.value
  return products.value.filter(p => p.sellerName && selectedBrands.value.includes(p.sellerName))
})

// ── Star helper ───────────────────────────────────────────────────────────

function starClass(rating: number, pos: number): string {
  if (rating >= pos)           return 'fa-solid fa-star'
  if (rating >= pos - 0.5)     return 'fa-solid fa-star-half-stroke'
  return 'fa-regular fa-star'
}

// ── Favorites ─────────────────────────────────────────────────────────────

function isFav(productId: string): boolean { return isWishlisted(productId) }

function toggleFav(product: ProductDTO) {
  if (!isLoggedIn()) { router.push(`/login?redirect=/sell`); return }
  toggleWishlist(product.id)
}

// ── Cart ──────────────────────────────────────────────────────────────────

const sizePicker = reactive<{ product: ProductDTO | null; selected: string | null }>({
  product: null,
  selected: null,
})

async function handleAddToCart(product: ProductDTO) {
  if (!isLoggedIn()) { router.push('/login?redirect=/sell'); return }
  if (product.sizes && product.sizes.length > 0) {
    sizePicker.product = product
    sizePicker.selected = null
    return
  }
  await doAddToCart(product.id, null)
}

async function confirmCart() {
  if (!sizePicker.product || !sizePicker.selected) return
  const id = sizePicker.product.id
  const size = sizePicker.selected
  sizePicker.product = null
  sizePicker.selected = null
  await doAddToCart(id, size)
}

async function doAddToCart(productId: string, size: string | null) {
  try {
    await api.post('/api/cart/add', { productId, quantity: 1, size: size ?? undefined })
    showToast('Added to cart!', 'success')
    openSidebar()
  } catch (e: any) {
    showToast(e?.message ?? 'Failed to add to cart', 'error')
  }
}

// ── Toast ─────────────────────────────────────────────────────────────────

const toast = reactive({ visible: false, message: '', type: 'success' })
let toastTimer: ReturnType<typeof setTimeout> | null = null

function showToast(message: string, type: 'success' | 'error' = 'success') {
  if (toastTimer) clearTimeout(toastTimer)
  toast.message = message
  toast.type = type
  toast.visible = true
  toastTimer = setTimeout(() => { toast.visible = false }, 2500)
}

// ── Fetch products ────────────────────────────────────────────────────────

async function fetchProducts() {
  loading.value = true
  error.value = ''

  const params = new URLSearchParams()
  params.set('page', String(currentPage.value - 1))
  params.set('size', String(PER_PAGE))

  selectedCategoryIds.value.forEach(id => params.append('categoryId', String(id)))
  if (priceMin.value > PRICE_MIN) params.set('minPrice', String(priceMin.value))
  if (priceMax.value < PRICE_MAX) params.set('maxPrice', String(priceMax.value))
  if (searchText.value.trim())    params.set('name', searchText.value.trim())
  if (selectedRating.value !== null) params.set('minRating', String(selectedRating.value))

  const sortStr = sortParams()
  const useSearch = selectedCategoryIds.value.length > 0
    || priceMin.value > PRICE_MIN
    || priceMax.value < PRICE_MAX
    || searchText.value.trim() !== ''
    || selectedRating.value !== null

  const url = useSearch
    ? `/api/products/search?${params}&${sortStr}`
    : `/api/products?${params}&${sortStr}`

  try {
    const data = await api.get<PagedResponse<ProductDTO>>(url)
    products.value      = data.content ?? []
    totalElements.value = data.totalElements ?? 0
    totalPages.value    = data.totalPages ?? 1
  } catch {
    await loadLocalFallback()
  } finally {
    loading.value = false
  }
}

async function loadLocalFallback() {
  const { products: local } = await getInventoryProducts()
  const q = searchText.value.trim().toLowerCase()
  let filtered = local.filter(p => {
    const matchCat  = !selectedCategoryIds.value.length || selectedCategoryIds.value.includes(p.categoryId as number)
    const matchPrice = p.price >= priceMin.value && p.price <= priceMax.value
    const matchSearch = !q || p.name.toLowerCase().includes(q)
    return matchCat && matchPrice && matchSearch
  })
  if (sortBy.value === 'price_asc')  filtered.sort((a, b) => a.price - b.price)
  if (sortBy.value === 'price_desc') filtered.sort((a, b) => b.price - a.price)
  const start = (currentPage.value - 1) * PER_PAGE
  products.value      = filtered.slice(start, start + PER_PAGE).map(p => ({
    id: p.id, name: p.name, price: p.price, stockQuantity: p.stock,
    imageUrl: p.imageUrl, imagePosition: p.imagePosition ?? null,
    categoryId: p.categoryId, averageRating: null,
    reviewCount: null, sizes: null, sellerName: null,
  }))
  totalElements.value = filtered.length
  totalPages.value    = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
}

// ── Fetch categories + sellers ────────────────────────────────────────────

async function fetchCategories() {
  try {
    const data = await api.get<PagedResponse<Category>>('/api/categories?page=0&size=100')
    categories.value = data.content ?? []
  } catch { /* optional */ }
}

async function fetchSellers() {
  try {
    const data = await api.get<Array<{ name: string; count: number }>>('/api/products/sellers')
    sellers.value = data ?? []
  } catch { /* optional */ }
}

// ── Actions ───────────────────────────────────────────────────────────────

function onFilterChange() {
  currentPage.value = 1
  fetchProducts()
}

function runSearch() {
  currentPage.value = 1
  fetchProducts()
}

function clearAll() {
  selectedCategoryIds.value = []
  selectedBrands.value      = []
  selectedRating.value      = null
  priceMin.value = PRICE_MIN
  priceMax.value = PRICE_MAX
  sizeMin.value  = SIZE_MIN
  sizeMax.value  = SIZE_MAX
  searchText.value = ''
  currentPage.value = 1
  fetchProducts()
}

// ── Init ──────────────────────────────────────────────────────────────────

onMounted(async () => {
  cartItems.value = readStorage<CartItem[]>('cartItems', [])
  const [nav, footer, social] = await Promise.all([getNavLinks(), getFooterColumns(), getSocialLinks()])
  navLinks.value      = nav
  footerColumns.value = footer
  socialLinks.value   = social
  await Promise.all([fetchCategories(), fetchSellers(), fetchProducts()])
})
</script>

<style scoped>
* { box-sizing: border-box; }

.shop-page {
  min-height: 100vh;
  background: #f8f9fa;
  font-family: Helvetica, Arial, sans-serif;
  color: #111;
}

/* ── Container ── */
.shop-main { padding: 40px 0 80px; }
.shop-container { max-width: 1280px; margin: 0 auto; padding: 0 20px; }

/* ── Mobile filter button ── */
.mob-filter-btn {
  display: none;
  align-items: center; gap: 8px;
  height: 38px; padding: 0 16px;
  margin-bottom: 14px;
  border: 1.5px solid #111; border-radius: 6px;
  background: #fff; color: #111;
  font-size: 13px; font-weight: 700;
  cursor: pointer; font-family: inherit;
}
.mob-filter-overlay {
  display: none; position: fixed; inset: 0;
  background: rgba(0,0,0,0.35); z-index: 490;
}

/* ── Toolbar ── */
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 18px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  margin-bottom: 20px;
}

.toolbar-left {
  display: flex; align-items: center; gap: 12px;
}

.toolbar-label {
  font-size: 16px; font-weight: 700; color: #111;
}

.clear-all-btn {
  padding: 5px 14px;
  border: 1px solid #d1d5db;
  border-radius: 20px;
  background: #fff;
  font-size: 13px; color: #555;
  cursor: pointer; font-family: inherit;
  transition: border-color 0.15s, color 0.15s;
}
.clear-all-btn:hover { border-color: #111; color: #111; }

.toolbar-count { font-size: 14px; color: #555; flex: 1; text-align: center; }

.toolbar-right {
  display: flex; align-items: center; gap: 4px; position: relative;
}

.sort-select {
  appearance: none;
  padding: 6px 28px 6px 12px;
  border: 1px solid #d1d5db;
  border-radius: 20px;
  background: #fff;
  font-size: 13px; font-weight: 700; color: #111;
  cursor: pointer; font-family: inherit;
  outline: none;
}

.sort-chevron {
  position: absolute; right: 10px;
  font-size: 10px; color: #555; pointer-events: none;
}

/* ── Layout ── */
.shop-layout {
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: 20px;
  align-items: start;
}

/* ════════════════════════════
   SIDEBAR
════════════════════════════ */
.sidebar {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  position: sticky;
  top: 76px;
}

.filter-block { padding: 16px 20px; }

.block-header {
  display: flex; align-items: center; justify-content: space-between;
  width: 100%; background: none; border: none;
  padding: 0; cursor: pointer; font-family: inherit;
}

.block-title { font-size: 15px; font-weight: 700; color: #111; }
.block-header > i { font-size: 11px; color: #888; }

.block-body { margin-top: 14px; display: flex; flex-direction: column; gap: 10px; }

.block-divider { height: 1px; background: #e5e7eb; margin: 0; }

/* Checkboxes */
.filter-check {
  display: flex; align-items: center; gap: 8px;
  cursor: pointer; font-size: 14px; color: #333;
}

.filter-check input[type="checkbox"] {
  width: 16px; height: 16px; accent-color: #1e3a5f;
  cursor: pointer; flex-shrink: 0;
}

.check-name { flex: 1; }
.check-count { font-size: 12px; color: #888; flex-shrink: 0; }

/* Radio buttons (ratings) */
.filter-radio {
  display: flex; align-items: center; gap: 8px;
  cursor: pointer; font-size: 14px; color: #333;
}

.filter-radio input[type="radio"] {
  width: 16px; height: 16px; accent-color: #1e3a5f;
  cursor: pointer; flex-shrink: 0;
}

.stars-sm { display: flex; gap: 2px; }
.stars-sm i { font-size: 12px; color: #f5a623; }
.radio-label { font-size: 13px; color: #333; }

.show-more-btn {
  background: none; border: none;
  padding: 0; font-size: 13px;
  color: #1e3a5f; cursor: pointer;
  font-family: inherit; font-weight: 600;
  text-align: left;
}
.show-more-btn:hover { text-decoration: underline; }

.no-data { font-size: 13px; color: #aaa; }

/* Dual range sliders */
.dual-range {
  position: relative; height: 24px;
  margin-bottom: 12px;
}

.range-track {
  position: absolute; top: 50%; left: 0; right: 0;
  height: 4px; background: #e5e7eb;
  border-radius: 4px; transform: translateY(-50%);
}

.range-fill {
  position: absolute; height: 100%;
  background: #1e3a5f; border-radius: 4px;
}

.range-thumb {
  position: absolute; width: 100%; top: 50%;
  transform: translateY(-50%); height: 4px;
  background: transparent; -webkit-appearance: none; appearance: none;
  pointer-events: none; outline: none;
}

.range-thumb::-webkit-slider-thumb {
  -webkit-appearance: none; pointer-events: all;
  width: 18px; height: 18px; border-radius: 50%;
  background: #1e3a5f; cursor: pointer;
  border: 3px solid #fff;
  box-shadow: 0 0 0 1.5px #1e3a5f;
}

.range-thumb::-moz-range-thumb {
  pointer-events: all; width: 12px; height: 12px;
  border-radius: 50%; background: #1e3a5f;
  cursor: pointer; border: 3px solid #fff;
  box-shadow: 0 0 0 1.5px #1e3a5f;
}

.range-inputs-row {
  display: flex; gap: 8px;
}

.range-num {
  flex: 1; padding: 6px 10px;
  border: 1px solid #e5e7eb; border-radius: 6px;
  font-size: 13px; color: #111;
  font-family: inherit; outline: none;
  background: #fff;
}

.range-num:focus { border-color: #1e3a5f; }

/* ════════════════════════════
   CATALOG
════════════════════════════ */
.catalog {}

/* Search bar */
.search-bar {
  display: flex; align-items: center;
  border: 1px solid #d1d5db; border-radius: 8px;
  background: #fff; overflow: hidden;
  margin-bottom: 20px;
}
.search-ico { padding: 0 12px; color: #888; font-size: 13px; }
.search-inp {
  flex: 1; height: 42px; border: none; outline: none;
  font-size: 14px; font-family: inherit; color: #111;
  background: transparent; min-width: 0;
}
.search-inp::placeholder { color: #aaa; }
.search-btn {
  height: 42px; padding: 0 18px; border: none;
  background: #1e3a5f; color: #fff;
  font-size: 13px; font-weight: 700;
  cursor: pointer; font-family: inherit;
  transition: background 0.15s;
}
.search-btn:hover { background: #152d4d; }

/* States */
.state-msg {
  padding: 80px 20px; text-align: center;
  color: #888; font-size: 14px;
  display: flex; align-items: center; justify-content: center; gap: 10px;
}
.state-msg.err { color: #dc2626; }

/* ── Product Grid ── */
.product-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.product-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  transition: box-shadow 0.2s;
}
.product-card:hover { box-shadow: 0 8px 24px rgba(0,0,0,0.1); }

/* Image */
.card-img-wrap {
  position: relative;
  aspect-ratio: 1 / 1;
  background: #f3f4f6;
  overflow: hidden;
}

.img-link { display: block; width: 100%; height: 100%; }

.product-img {
  width: 100%; height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}
.product-card:hover .product-img { transform: scale(1.04); }

.img-placeholder {
  width: 100%; height: 100%;
  display: flex; align-items: center; justify-content: center;
  color: #d1d5db; font-size: 36px;
  background: linear-gradient(90deg, #f3f4f6 25%, #e9eaec 50%, #f3f4f6 75%);
  background-size: 600px 100%;
  animation: shimmer 1.6s infinite linear;
}

@keyframes shimmer {
  0%   { background-position: -300px 0; }
  100% { background-position:  300px 0; }
}

/* Heart button */
.heart-btn {
  position: absolute; top: 10px; right: 10px;
  width: 34px; height: 34px; border-radius: 50%;
  background: rgba(255,255,255,0.9);
  border: 1px solid #e5e7eb;
  color: #555;
  display: grid; place-items: center;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
  z-index: 1;
}
.heart-btn:hover { background: #fff; color: #e53e3e; border-color: #e53e3e; }
.heart-btn.active { background: #e53e3e; color: #fff; border-color: #e53e3e; }

/* Card body */
.card-body { padding: 12px 14px 14px; }

.name-price-row {
  display: flex; align-items: flex-start;
  justify-content: space-between; gap: 8px;
  margin-bottom: 4px;
}

.prod-name {
  font-size: 14px; font-weight: 700; color: #111;
  text-decoration: none; line-height: 1.3;
  overflow: hidden; display: -webkit-box;
  -webkit-line-clamp: 2; -webkit-box-orient: vertical;
  flex: 1;
}
.prod-name:hover { color: #1e3a5f; }

.prod-price {
  font-size: 14px; font-weight: 700; color: #111;
  white-space: nowrap; flex-shrink: 0;
}

.prod-subtitle {
  margin: 0 0 6px;
  font-size: 12px; color: #888;
}

.rating-row {
  display: flex; align-items: center; gap: 6px;
  margin-bottom: 10px;
}

.stars { display: flex; gap: 2px; }
.stars i { font-size: 12px; color: #f5a623; }
.review-count { font-size: 12px; color: #888; }

/* Action buttons */
.card-actions { display: flex; gap: 8px; }

.btn-cart {
  flex: 1; padding: 9px 0;
  background: #1e3a5f; color: #fff;
  border: none; border-radius: 8px;
  font-size: 13px; font-weight: 700;
  cursor: pointer; font-family: inherit;
  transition: background 0.15s;
  white-space: nowrap;
}
.btn-cart:hover:not(:disabled) { background: #152d4d; }
.btn-cart:disabled { opacity: 0.5; cursor: default; }

.btn-shortlist {
  flex: 1; padding: 9px 0;
  background: #fff; color: #1e3a5f;
  border: 1.5px solid #1e3a5f; border-radius: 8px;
  font-size: 13px; font-weight: 700;
  cursor: pointer; font-family: inherit;
  transition: background 0.15s, color 0.15s;
  white-space: nowrap;
}
.btn-shortlist:hover { background: #1e3a5f; color: #fff; }

/* ── Pagination ── */
.pagination {
  margin-top: 40px;
  display: flex; align-items: center; justify-content: space-between;
  gap: 12px; flex-wrap: wrap;
}

.page-nav {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 8px 18px;
  border: 1px solid #e5e7eb; border-radius: 8px;
  background: #fff; font-size: 13px; font-weight: 700; color: #111;
  cursor: pointer; font-family: inherit;
  transition: border-color 0.15s;
}
.page-nav:hover:not(:disabled) { border-color: #1e3a5f; color: #1e3a5f; }
.page-nav:disabled { opacity: 0.4; cursor: default; }

.page-numbers { display: flex; align-items: center; gap: 4px; }

.page-num {
  width: 36px; height: 36px; border-radius: 8px; border: none;
  background: transparent; font-size: 13px; color: #555;
  cursor: pointer; font-family: inherit;
  transition: background 0.15s, color 0.15s;
}
.page-num:hover { background: #f3f4f6; color: #111; }
.page-num.active { background: #1e3a5f; color: #fff; }
.page-dots { padding: 0 4px; color: #aaa; font-size: 13px; }

/* ════════════════════════════
   SIZE PICKER MODAL
════════════════════════════ */
.modal-overlay {
  position: fixed; inset: 0; z-index: 900;
  background: rgba(0,0,0,0.45);
  display: flex; align-items: center; justify-content: center;
}

.size-modal {
  background: #fff; border-radius: 16px;
  padding: 28px; width: 340px; max-width: 90vw;
}

.modal-title {
  margin: 0 0 6px; font-size: 18px; font-weight: 700; color: #111;
}

.modal-product-name {
  margin: 0 0 16px; font-size: 14px; color: #888;
}

.size-grid {
  display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 20px;
}

.size-opt {
  padding: 8px 16px; border-radius: 8px;
  border: 1.5px solid #e5e7eb;
  background: #f3f4f6; font-size: 13px; color: #333;
  cursor: pointer; font-family: inherit;
  transition: background 0.15s, border-color 0.15s;
}
.size-opt:hover { border-color: #1e3a5f; color: #1e3a5f; }
.size-opt.active { background: #1e3a5f; color: #fff; border-color: #1e3a5f; }

.modal-actions { display: flex; gap: 10px; }

/* ════════════════════════════
   TOAST
════════════════════════════ */
.toast {
  position: fixed; bottom: 30px; right: 30px;
  padding: 12px 22px; border-radius: 10px;
  font-size: 14px; font-weight: 700; color: #fff;
  z-index: 9999; pointer-events: none;
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
}

.toast-success { background: #16a34a; }
.toast-error   { background: #dc2626; }

.toast-slide-enter-active { transition: all 0.25s ease; }
.toast-slide-leave-active { transition: all 0.25s ease; }
.toast-slide-enter-from   { opacity: 0; transform: translateY(16px); }
.toast-slide-leave-to     { opacity: 0; transform: translateY(16px); }

/* ── Responsive ── */
@media (max-width: 1024px) {
  .shop-layout { grid-template-columns: 220px 1fr; }
  .product-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 768px) {
  .mob-filter-btn { display: inline-flex; }
  .mob-filter-overlay { display: block; }
  .shop-layout { grid-template-columns: 1fr; }
  .product-grid { grid-template-columns: repeat(2, 1fr); }
  .toolbar { flex-wrap: wrap; gap: 8px; }
  .toolbar-count { order: 3; width: 100%; text-align: left; }

  .sidebar {
    display: none;
    position: fixed;
    top: 0; left: 0;
    height: 100dvh; width: 300px; max-width: 88vw;
    z-index: 500;
    overflow-y: auto;
    border-radius: 0;
    border-right: 1px solid #e5e7eb;
    box-shadow: 4px 0 24px rgba(0,0,0,0.12);
  }
  .sidebar.mob-open { display: block; }
}

@media (max-width: 480px) {
  .product-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 360px) {
  .product-grid { grid-template-columns: 1fr; }
}
</style>
