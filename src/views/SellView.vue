<template>
  <div class="sell-page">
    <AppHeader
      :nav-links="navLinks"
      :cart-count="cartCount"
    />
    <main class="sell-main">
      <div class="container">
        <div class="sell-layout">
          <aside class="filters">
            <div class="filter-group">
              <p class="filter-label">SORT BY</p>
              <select class="sort-select" v-model="sortBy">
                <option>Newest Arrivals</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
              </select>
            </div>

            <div class="filter-group">
              <p class="filter-label">CATEGORIES</p>
              <label v-for="category in categories" :key="category" class="check-row">
                <input type="radio" name="category" :value="category" v-model="selectedCategory" />
                <span>{{ category }}</span>
              </label>
            </div>

            <div class="filter-group">
              <p class="filter-label">PRICE RANGE</p>
              <div class="range-box">
                <span>$0</span>
                <span>$5,000+</span>
              </div>
            </div>

            <div class="filter-group">
              <p class="filter-label">DESIGNERS</p>
              <label v-for="designer in designers" :key="designer" class="check-row">
                <input type="checkbox" :value="designer" v-model="selectedDesigners" />
                <span>{{ designer }}</span>
              </label>
            </div>
          </aside>

          <section class="catalog">
            <div class="product-grid">
              <RouterLink
                v-for="product in paginatedProducts"
                :key="product.id"
                :to="`/product/${product.id}`"
                class="product-card"
              >
                <div class="product-image-wrap">
                  <img :src="product.image" :alt="product.name" class="product-image" />
                </div>

                <p class="product-maker">{{ product.maker.toUpperCase() }}</p>

                <div class="product-meta">
                  <h3>{{ product.name }}</h3>
                  <strong>{{ formatPrice(product.price) }}</strong>
                </div>
              </RouterLink>
            </div>

            <div v-if="totalPages > 1" class="pagination">
              <button type="button" @click="prevPage" :disabled="currentPage === 1">‹</button>

              <template v-for="page in visiblePages" :key="page">
                <button
                  v-if="page !== '...'"
                  type="button"
                  :class="{ active: currentPage === page }"
                  @click="goToPage(page as number)"
                >
                  {{ page }}
                </button>

                <span v-else>…</span>
              </template>

              <button type="button" @click="nextPage" :disabled="currentPage === totalPages">
                ›
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
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import {
  getFooterColumns,
  getNavLinks,
  getSocialLinks,
  getTrendingProducts,
} from '@/services/homeService'
import type { FooterColumn, NavLink, Product, SocialLink } from '@/types/home'
import { readStorage } from '@/utils/storage'

interface CartItem {
  id: number
  quantity: number
}

const navLinks = ref<NavLink[]>([])
const footerColumns = ref<FooterColumn[]>([])
const socialLinks = ref<SocialLink[]>([])
const products = ref<Product[]>([])
const cartItems = ref<CartItem[]>([])

const searchText = ref('')
const route = useRoute()
const router = useRouter()
const sortBy = ref('Newest Arrivals')
const selectedCategory = ref('All')
const selectedDesigners = ref<string[]>([])

const currentPage = ref(1)
const itemsPerPage = ref(6)

const categories = ['All', 'Apparel', 'Accessories', 'Footwear', 'Objects']
const designers = computed(() => {
  return [...new Set(products.value.map((item) => item.maker))]
})

watch([searchText, selectedCategory, selectedDesigners, sortBy], () => {
  currentPage.value = 1
})

function loadCart() {
  cartItems.value = readStorage<CartItem[]>('cartItems', [])
}

const cartCount = computed(() => {
  return cartItems.value.reduce((sum, item) => sum + item.quantity, 0)
})

const filteredProducts = computed(() => {
  let result = [...products.value]

  if (searchText.value.trim()) {
    const keyword = searchText.value.toLowerCase()
    result = result.filter(
      (item) =>
        item.name.toLowerCase().includes(keyword) || item.maker.toLowerCase().includes(keyword),
    )
  }

  if (selectedDesigners.value.length) {
    result = result.filter((item) => selectedDesigners.value.includes(item.maker))
  }

  if (selectedCategory.value !== 'All') {
    result = result.filter((item) => {
      const name = `${item.name} ${item.slug}`.toLowerCase()
      if (selectedCategory.value === 'Apparel') return name.includes('jacket')
      if (selectedCategory.value === 'Accessories') return name.includes('diffuser') || name.includes('vase')
      if (selectedCategory.value === 'Footwear') return name.includes('boot')
      if (selectedCategory.value === 'Objects') return name.includes('lamp') || name.includes('stool')
      return true
    })
  }

  if (sortBy.value === 'Price: Low to High') {
    result.sort((a, b) => a.price - b.price)
  }

  if (sortBy.value === 'Price: High to Low') {
    result.sort((a, b) => b.price - a.price)
  }

  return result
})

const totalPages = computed(() => {
  return Math.max(1, Math.ceil(filteredProducts.value.length / itemsPerPage.value))
})

const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredProducts.value.slice(start, end)
})

const visiblePages = computed(() => {
  const pages: (number | string)[] = []

  if (totalPages.value <= 5) {
    for (let i = 1; i <= totalPages.value; i++) {
      pages.push(i)
    }
    return pages
  }

  pages.push(1)

  if (currentPage.value > 3) {
    pages.push('...')
  }

  const start = Math.max(2, currentPage.value - 1)
  const end = Math.min(totalPages.value - 1, currentPage.value + 1)

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  if (currentPage.value < totalPages.value - 2) {
    pages.push('...')
  }

  pages.push(totalPages.value)

  return pages
})

function goToPage(page: number) {
  currentPage.value = page
}

function prevPage() {
  if (currentPage.value > 1) currentPage.value--
}

function nextPage() {
  if (currentPage.value < totalPages.value) currentPage.value++
}

function formatPrice(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(value)
}

onMounted(async () => {
  loadCart()
  navLinks.value = await getNavLinks()
  footerColumns.value = await getFooterColumns()
  socialLinks.value = await getSocialLinks()
  products.value = await getTrendingProducts()

  const queryKeyword = route.query.q?.toString() || ''
  searchText.value = queryKeyword
})

watch(
  () => route.query.q,
  (q) => {
    searchText.value = q?.toString() || ''
  },
)

watch(searchText, (value) => {
  router.replace({
    path: '/sell',
    query: value.trim() ? { q: value.trim() } : {},
  })
})
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.sell-page {
  min-height: 100vh;
  background: #f7f9fb;
  color: #191c1e;
  font-family: Inter, Arial, sans-serif;
  padding: 50px 0 60px;
}

.container {
  width: min(1440px, 100%);
  margin: 0 auto;
  padding: 0 20px;
}

.sell-main {
  padding: 28px 0 60px;
}

.sell-layout {
  display: grid;
  grid-template-columns: 250px 1fr;
  gap: 26px;
  align-items: start;
}

.filters {
  padding-top: 6px;
}

.filter-group {
  margin-bottom: 28px;
}

.filter-label {
  margin: 0 0 12px;
  font-size: 10px;
  letter-spacing: 0.16em;
  color: #98a2b3;
}

.sort-select {
  width: 100%;
  height: 40px;
  border: 0;
  border-radius: 12px;
  background: #eef2f6;
  padding: 0 12px;
  color: #475467;
}

.check-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  font-size: 14px;
  color: #475467;
}

.range-box {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #98a2b3;
}

.catalog-toolbar {
  margin-bottom: 18px;
}

.search-bar {
  height: 44px;
  border-radius: 14px;
  background: #eef2f6;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 14px;
}

.search-bar input {
  width: 100%;
  border: 0;
  background: transparent;
  outline: none;
  color: #191c1e;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 24px 22px;
}

.product-card {
  display: block;
  text-decoration: none;
  color: inherit;
}

.product-image-wrap {
  background: #ffffff;
  border-radius: 18px;
  overflow: hidden;
  margin-bottom: 12px;
  aspect-ratio: 1 / 1.12;
  border: 1px solid #eef2f6;
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.product-maker {
  margin: 0 0 6px;
  font-size: 10px;
  letter-spacing: 0.14em;
  color: #98a2b3;
}

.product-meta {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: start;
}

.product-meta h3 {
  margin: 0;
  font-size: 16px;
  line-height: 1.3;
  font-weight: 500;
}

.product-meta strong {
  color: #513B3C;
  font-size: 14px;
  white-space: nowrap;
}

.pagination {
  margin-top: 36px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 14px;
  color: #98a2b3;
}

.pagination button {
  border: 0;
  background: transparent;
  width: 28px;
  height: 28px;
  border-radius: 999px;
  cursor: pointer;
}

.pagination button.active {
  background: #513B3C;
  color: #fff;
}

@media (max-width: 1100px) {
  .sell-layout {
    grid-template-columns: 1fr;
  }

  .product-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 700px) {
  .product-grid {
    grid-template-columns: 1fr;
  }
}
</style>
