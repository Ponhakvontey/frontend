<template>
  <div class="detail-page">
    <AppHeader :nav-links="navLinks" :cart-count="cartCount" />

    <main class="detail-main">
      <div class="container">

        <!-- Loading -->
        <div v-if="loading" class="state-msg">
          <i class="fa-solid fa-spinner fa-spin"></i> Loading product…
        </div>

        <!-- Error / Not Found -->
        <div v-else-if="error || !product" class="state-msg err">
          <i class="fa-solid fa-triangle-exclamation"></i>
          {{ error || 'Product not found.' }}
        </div>

        <!-- Product -->
        <template v-else>

          <!-- Breadcrumb -->
          <nav class="breadcrumb">
            <RouterLink to="/" class="bc-link">Home</RouterLink>
            <i class="fa-solid fa-chevron-right bc-sep"></i>
            <RouterLink to="/sell" class="bc-link">Shop</RouterLink>
            <i class="fa-solid fa-chevron-right bc-sep"></i>
            <span v-if="product.categoryName" class="bc-link bc-cat">{{ product.categoryName }}</span>
            <i v-if="product.categoryName" class="fa-solid fa-chevron-right bc-sep"></i>
            <span class="bc-current">{{ product.name }}</span>
          </nav>

          <!-- Hero -->
          <section class="hero">

            <!-- Thumbnail strip -->
            <div class="thumbs">
              <button
                type="button"
                class="thumb"
                :class="{ active: activeImg === product.imageUrl }"
                @click="activeImg = product.imageUrl ?? ''"
              >
                <img v-if="product.imageUrl" :src="product.imageUrl" :alt="product.name" />
                <div v-else class="thumb-placeholder"><i class="fa-solid fa-image"></i></div>
              </button>
            </div>

            <!-- Main image -->
            <div class="main-img-wrap">
              <img
                v-if="activeImg"
                :src="activeImg"
                :alt="product.name"
                class="main-img"
              />
              <div v-else class="main-img-placeholder">
                <i class="fa-solid fa-image"></i>
              </div>
            </div>

            <!-- Product panel -->
            <div class="panel">

              <h1 class="product-name">{{ product.name.toUpperCase() }}</h1>

              <!-- Rating -->
              <div class="rating-row">
                <div class="stars">
                  <i v-for="n in 5" :key="n" :class="starClass(product.averageRating ?? 0, n)"></i>
                </div>
                <span class="rating-val">{{ product.averageRating ? product.averageRating.toFixed(1) : '0.0' }}/5</span>
                <span class="review-count">({{ product.reviewCount ?? 0 }} Reviews)</span>
              </div>

              <!-- Price -->
              <div class="price-row">
                <span class="price">${{ Number(product.price).toFixed(2) }}</span>
                <span v-if="product.stockQuantity === 0" class="out-of-stock">Out of stock</span>
              </div>

              <hr class="divider" />

              <!-- Description -->
              <p v-if="product.description" class="description">{{ product.description }}</p>

              <hr class="divider" />

              <!-- Seller -->
              <div v-if="product.sellerName" class="meta-row">
                <span class="meta-label"><i class="fa-solid fa-store"></i> Sold by</span>
                <span class="meta-val">{{ product.sellerName }}</span>
              </div>

              <hr class="divider" />

              <!-- Quantity + Add to Cart -->
              <div class="action-row">
                <div class="qty-ctrl">
                  <button type="button" class="qty-btn" @click="qty > 1 && qty--">
                    <i class="fa-solid fa-minus"></i>
                  </button>
                  <span class="qty-val">{{ qty }}</span>
                  <button type="button" class="qty-btn" @click="qty++">
                    <i class="fa-solid fa-plus"></i>
                  </button>
                </div>

                <button
                  type="button"
                  class="add-btn"
                  :disabled="product.stockQuantity === 0"
                  @click="addToCart"
                >
                  Add to Cart
                </button>
              </div>

              <p v-if="cartMsg" class="cart-msg" :class="cartMsgType">{{ cartMsg }}</p>

            </div>
          </section>

          <!-- Related products -->
          <section v-if="related.length" class="related">
            <h2 class="related-title">You might also like</h2>
            <div class="related-grid">
              <RouterLink
                v-for="r in related"
                :key="r.id"
                :to="`/product/${r.id}`"
                class="related-card"
              >
                <div class="related-img-wrap">
                  <img v-if="r.imageUrl" :src="r.imageUrl" :alt="r.name" />
                  <div v-else class="related-placeholder"><i class="fa-solid fa-image"></i></div>
                </div>
                <p class="related-name">{{ r.name }}</p>
                <p class="related-price">${{ Number(r.price).toFixed(2) }}</p>
              </RouterLink>
            </div>
          </section>

        </template>
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
import { getFooterColumns, getNavLinks, getSocialLinks } from '@/services/homeService'
import type { FooterColumn, NavLink, SocialLink } from '@/types/home'
import { isLoggedIn } from '@/services/apiClient'
import { loadCartItems, saveCartItems, toLineId } from '@/utils/commerce'

const API = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

// ── Types ────────────────────────────────────────────────────────────────────

interface ProductDTO {
  id: number
  name: string
  description: string | null
  price: number
  stockQuantity: number
  imageUrl: string | null
  categoryId: number | null
  categoryName: string | null
  sellerId: number | null
  sellerName: string | null
  averageRating: number | null
  reviewCount: number | null
}

interface PagedResponse<T> { content: T[] }

// ── State ────────────────────────────────────────────────────────────────────

const route  = useRoute()
const router = useRouter()

const navLinks      = ref<NavLink[]>([])
const footerColumns = ref<FooterColumn[]>([])
const socialLinks   = ref<SocialLink[]>([])

const product  = ref<ProductDTO | null>(null)
const related  = ref<ProductDTO[]>([])
const loading  = ref(true)
const error    = ref('')
const activeImg = ref('')

const qty        = ref(1)
const cartMsg    = ref('')
const cartMsgType = ref<'ok' | 'err'>('ok')

const cartItems  = computed(() => loadCartItems())
const cartCount  = computed(() => cartItems.value.reduce((s, i) => s + i.quantity, 0))

// ── Fetch ─────────────────────────────────────────────────────────────────────

async function loadProduct(id: string) {
  loading.value = true
  error.value = ''
  product.value = null
  related.value = []
  qty.value = 1
  cartMsg.value = ''

  try {
    const res = await fetch(`${API}/api/products/${id}`)
    if (res.status === 404) { error.value = 'Product not found.'; return }
    if (!res.ok) throw new Error(`Server error ${res.status}`)
    const dto: ProductDTO = await res.json()
    product.value = dto
    activeImg.value = dto.imageUrl ?? ''

    // Load related products (same category, or just recent products)
    const relUrl = `${API}/api/products/${id}/related`
    const relRes = await fetch(relUrl)
    if (relRes.ok) {
      const relData: ProductDTO[] = await relRes.json()
      related.value = relData.slice(0, 4)
    }
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'Failed to load product.'
  } finally {
    loading.value = false
  }
}

// reload when navigating between products (e.g. related products)
watch(() => route.params.id, (id) => { if (id) loadProduct(String(id)) })

// ── Cart ──────────────────────────────────────────────────────────────────────

function addToCart() {
  if (!product.value) return
  if (!isLoggedIn()) {
    router.push(`/login?redirect=/product/${product.value.id}`)
    return
  }
  if (product.value.stockQuantity === 0) {
    cartMsg.value = 'This product is out of stock.'
    cartMsgType.value = 'err'
    return
  }

  const items = loadCartItems()
  const lineId = toLineId(product.value.id, 'Default')
  const existing = items.find(i => i.lineId === lineId)

  if (existing) {
    existing.quantity += qty.value
  } else {
    items.push({
      lineId,
      id: product.value.id,
      brand: product.value.sellerName ?? '',
      name: product.value.name,
      variant: 'Default',
      price: Number(product.value.price),
      quantity: qty.value,
      image: product.value.imageUrl ?? '',
    })
  }

  saveCartItems(items)
  cartMsg.value = `Added ${qty.value} × "${product.value.name}" to cart!`
  cartMsgType.value = 'ok'
  setTimeout(() => { cartMsg.value = '' }, 3000)
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function starClass(rating: number, pos: number) {
  if (rating >= pos)       return 'fa-solid fa-star'
  if (rating >= pos - 0.5) return 'fa-solid fa-star-half-stroke'
  return 'fa-regular fa-star'
}

// ── Init ──────────────────────────────────────────────────────────────────────

onMounted(async () => {
  const [nav, footer, social] = await Promise.all([getNavLinks(), getFooterColumns(), getSocialLinks()])
  navLinks.value      = nav
  footerColumns.value = footer
  socialLinks.value   = social
  await loadProduct(String(route.params.id))
})
</script>

<style scoped>
.detail-page {
  min-height: 100vh;
  background: #fff;
  font-family: Inter, Arial, sans-serif;
  color: #111;
}

.detail-main { padding: 32px 0 80px; }

.container {
  width: min(1280px, 100%);
  margin: 0 auto;
  padding: 0 32px;
}

/* State messages */
.state-msg {
  min-height: 60vh; display: flex; align-items: center;
  justify-content: center; gap: 10px; font-size: 16px; color: #999;
}
.state-msg.err { color: #e85c6e; }

/* Breadcrumb */
.breadcrumb {
  display: flex; align-items: center; gap: 8px;
  font-size: 13px; color: #999; margin-bottom: 32px; flex-wrap: wrap;
}
.bc-link { color: #999; text-decoration: none; }
.bc-link:hover { color: #111; }
.bc-cat { color: #999; }
.bc-sep { font-size: 9px; color: #ccc; }
.bc-current { color: #111; font-weight: 600; }

/* Hero */
.hero {
  display: grid;
  grid-template-columns: 80px minmax(0, 560px) minmax(320px, 1fr);
  gap: 20px;
  align-items: start;
  margin-bottom: 80px;
}

/* Thumbnails */
.thumbs { display: flex; flex-direction: column; gap: 12px; }

.thumb {
  width: 72px; height: 72px; border-radius: 12px;
  border: 2px solid #e8e8e8; overflow: hidden;
  background: #f3f3f3; cursor: pointer; padding: 0;
  transition: border-color 0.15s;
}
.thumb.active { border-color: #111; }
.thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
.thumb-placeholder {
  width: 100%; height: 100%; display: grid; place-items: center;
  color: #ccc; font-size: 18px;
}

/* Main image */
.main-img-wrap {
  background: #f3f3f3; border-radius: 20px; overflow: hidden; aspect-ratio: 1;
}
.main-img { width: 100%; height: 100%; object-fit: cover; display: block; }
.main-img-placeholder {
  width: 100%; height: 100%; display: grid; place-items: center;
  color: #ccc; font-size: 48px; aspect-ratio: 1;
}

/* Product panel */
.panel { padding-top: 4px; }

.product-name {
  margin: 0 0 14px;
  font-size: 32px;
  font-weight: 800;
  color: #111;
  line-height: 1.1;
  letter-spacing: -0.02em;
}

/* Rating */
.rating-row {
  display: flex; align-items: center; gap: 8px; margin-bottom: 14px;
}
.stars { display: flex; gap: 2px; }
.stars i { font-size: 16px; color: #f5a623; }
.rating-val { font-size: 14px; font-weight: 700; color: #111; }
.review-count { font-size: 13px; color: #999; }

/* Price */
.price-row {
  display: flex; align-items: center; gap: 12px; margin-bottom: 20px;
}
.price { font-size: 28px; font-weight: 700; color: #111; }
.out-of-stock {
  font-size: 12px; font-weight: 600; color: #e85c6e;
  background: rgba(232,92,110,.1); border-radius: 4px; padding: 3px 10px;
}

/* Divider */
.divider { border: none; border-top: 1px solid #f0f0f0; margin: 16px 0; }

/* Description */
.description { margin: 0 0 4px; font-size: 14px; line-height: 1.7; color: #555; }

/* Meta row */
.meta-row { display: flex; align-items: center; justify-content: space-between; font-size: 13px; }
.meta-label { color: #999; display: flex; align-items: center; gap: 6px; }
.meta-val { font-weight: 600; color: #111; }

/* Action row */
.action-row {
  display: grid;
  grid-template-columns: 130px 1fr;
  gap: 12px;
  margin-top: 24px;
}

.qty-ctrl {
  height: 52px; border-radius: 62px; background: #f5f5f5;
  display: flex; align-items: center; justify-content: space-between; padding: 0 12px;
}
.qty-btn {
  border: 0; background: transparent; cursor: pointer;
  font-size: 13px; color: #111; width: 28px; height: 28px;
  display: grid; place-items: center;
}
.qty-val { font-size: 15px; font-weight: 600; color: #111; min-width: 24px; text-align: center; }

.add-btn {
  height: 52px; border: 0; border-radius: 62px;
  background: #111; color: #fff; font-size: 15px; font-weight: 600;
  cursor: pointer; font-family: inherit; transition: background .18s;
}
.add-btn:hover:not(:disabled) { background: #333; }
.add-btn:disabled { background: #ccc; cursor: default; }

.cart-msg {
  margin: 10px 0 0; font-size: 13px; font-weight: 500;
}
.cart-msg.ok { color: #16a34a; }
.cart-msg.err { color: #e85c6e; }

/* Related */
.related { border-top: 1px solid #f0f0f0; padding-top: 48px; }
.related-title {
  margin: 0 0 24px; font-size: 22px; font-weight: 800; color: #111; letter-spacing: -0.02em;
}
.related-grid {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px;
}
.related-card { text-decoration: none; color: inherit; display: block; }
.related-img-wrap {
  aspect-ratio: 3/4; border-radius: 16px; overflow: hidden;
  background: #f3f3f3; margin-bottom: 10px;
}
.related-img-wrap img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform .3s; }
.related-card:hover .related-img-wrap img { transform: scale(1.04); }
.related-placeholder {
  width: 100%; height: 100%; display: grid; place-items: center; color: #ccc; font-size: 28px;
}
.related-name {
  margin: 0 0 4px; font-size: 14px; font-weight: 600; color: #111;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.related-price { margin: 0; font-size: 14px; font-weight: 700; color: #111; }

/* Responsive */
@media (max-width: 1024px) {
  .hero { grid-template-columns: 72px 1fr; }
  .panel { grid-column: 1 / -1; }
  .related-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 640px) {
  .hero { grid-template-columns: 1fr; }
  .thumbs { flex-direction: row; }
  .product-name { font-size: 24px; }
  .action-row { grid-template-columns: 1fr; }
  .related-grid { grid-template-columns: repeat(2, 1fr); }
}
</style>
