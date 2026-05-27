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
            <RouterLink to="/sell" class="bc-link">Product Listing</RouterLink>
            <i class="fa-solid fa-chevron-right bc-sep"></i>
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
              <img v-if="activeImg" :src="activeImg" :alt="product.name" class="main-img" />
              <div v-else class="main-img-placeholder">
                <i class="fa-solid fa-image"></i>
              </div>
            </div>

            <!-- Product panel -->
            <div class="panel">

              <!-- Name + wishlist heart -->
              <div class="name-row">
                <h1 class="product-name">{{ product.name }}</h1>
                <button type="button" class="heart-btn" :class="{ active: isFavorite }" @click="toggleFavorite" :title="isFavorite ? 'Remove from wishlist' : 'Add to wishlist'">
                  <i :class="isFavorite ? 'fa-solid fa-heart' : 'fa-regular fa-heart'"></i>
                </button>
              </div>

              <!-- Price | Stars (reviews) -->
              <div class="price-rating-row">
                <span class="price">${{ Number(product.price).toFixed(2) }}</span>
                <span class="pr-sep">|</span>
                <div class="stars">
                  <i v-for="n in 5" :key="n" :class="starClass(product.averageRating ?? 0, n)"></i>
                </div>
                <span class="review-count">( {{ product.reviewCount ?? 0 }} review )</span>
              </div>

              <hr class="divider" />

              <!-- Description -->
              <p v-if="product.description" class="description">{{ product.description }}</p>

              <!-- Seller -->
              <div v-if="product.sellerName" class="meta-row">
                <span class="meta-label">Sold by</span>
                <span class="meta-val">{{ product.sellerName }}</span>
              </div>

              <!-- Out of stock badge -->
              <p v-if="product.stockQuantity === 0" class="out-of-stock">Out of stock</p>

              <!-- Qty + Add to Cart -->
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

              <button
                type="button"
                class="buy-btn"
                :disabled="product.stockQuantity === 0"
                @click="buyNow"
              >
                Buy Now
              </button>

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
import { isWishlisted, toggleWishlist } from '@/services/wishlistService'
import { loadCartItems, saveCartItems, toLineId } from '@/utils/commerce'

const API = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

// ── Types ────────────────────────────────────────────────────────────────────

interface ProductDTO {
  id: string
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

const product   = ref<ProductDTO | null>(null)
const related   = ref<ProductDTO[]>([])
const loading   = ref(true)
const error     = ref('')
const activeImg = ref('')

const qty         = ref(1)
const cartMsg     = ref('')
const cartMsgType = ref<'ok' | 'err'>('ok')
const isFavorite  = ref(false)

const cartItems = computed(() => loadCartItems())
const cartCount = computed(() => cartItems.value.reduce((s, i) => s + i.quantity, 0))

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
    isFavorite.value = isWishlisted(dto.id)

    const relRes = await fetch(`${API}/api/products/${id}/related`)
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

watch(() => route.params.id, (id) => { if (id) loadProduct(String(id)) })

// ── Actions ───────────────────────────────────────────────────────────────────

function toggleFavorite() {
  if (!product.value) return
  if (!isLoggedIn()) { router.push(`/login?redirect=/product/${product.value.id}`); return }
  toggleWishlist(product.value.id)
  isFavorite.value = isWishlisted(product.value.id)
}

function addToCart() {
  if (!product.value) return
  if (!isLoggedIn()) { router.push(`/login?redirect=/product/${product.value.id}`); return }
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

function buyNow() {
  addToCart()
  if (cartMsgType.value !== 'err') router.push('/cart')
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
* { box-sizing: border-box; }

.detail-page {
  min-height: 100vh;
  background: #fff;
  font-family: Helvetica, Arial, sans-serif;
  color: #000;
}

.detail-main { padding: 32px 0 72px; }

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 32px;
}

/* ── State ── */
.state-msg {
  min-height: 60vh;
  display: flex; align-items: center; justify-content: center;
  gap: 10px; font-size: 14px; color: #808080;
}
.state-msg.err { color: #DA292E; }

/* ── Breadcrumb ── */
.breadcrumb {
  display: flex; align-items: center; gap: 8px;
  font-size: 13px; color: #808080; margin-bottom: 28px; flex-wrap: wrap;
}
.bc-link { color: #808080; text-decoration: none; }
.bc-link:hover { color: #000; }
.bc-sep { font-size: 9px; color: #AABBAA; }
.bc-current { color: #000; font-weight: 600; }

/* ── Hero grid ── */
.hero {
  display: grid;
  grid-template-columns: 88px 1fr 440px;
  gap: 20px;
  align-items: start;
  margin-bottom: 64px;
}

/* ── Thumbnails ── */
.thumbs { display: flex; flex-direction: column; gap: 12px; }

.thumb {
  width: 80px; height: 80px; border-radius: 8px;
  border: 1.5px solid #AABBAA; overflow: hidden;
  background: #f5f5f5; cursor: pointer; padding: 0;
  transition: border-color 0.15s;
}
.thumb.active { border-color: #000; border-width: 2px; }
.thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
.thumb-placeholder {
  width: 100%; height: 100%; display: grid; place-items: center;
  color: #AABBAA; font-size: 18px;
}

/* ── Main image ── */
.main-img-wrap {
  border-radius: 12px; overflow: hidden;
  background: #f0f0f0;
  aspect-ratio: 3 / 4;
}
.main-img { width: 100%; height: 100%; object-fit: cover; display: block; }
.main-img-placeholder {
  width: 100%; height: 100%; display: grid; place-items: center;
  color: #AABBAA; font-size: 56px;
}

/* ── Product panel ── */
.panel { padding-top: 8px; }

.name-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 14px;
}

.product-name {
  margin: 0;
  font-size: 26px;
  font-weight: 700;
  color: #000;
  line-height: 1.25;
  flex: 1;
}

.heart-btn {
  flex-shrink: 0;
  width: 36px; height: 36px;
  border: 1.5px solid #AABBAA;
  border-radius: 50%;
  background: #fff;
  cursor: pointer;
  display: grid; place-items: center;
  color: #AABBAA;
  font-size: 16px;
  transition: border-color 0.15s, color 0.15s;
}
.heart-btn:hover { border-color: #DA292E; color: #DA292E; }
.heart-btn.active { border-color: #DA292E; color: #DA292E; }

/* ── Price + rating ── */
.price-rating-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.price {
  font-size: 26px;
  font-weight: 700;
  color: #000;
}

.pr-sep {
  font-size: 18px;
  color: #AABBAA;
  font-weight: 300;
}

.stars { display: flex; gap: 3px; }
.stars i { font-size: 13px; color: #b0b0b0; }

.review-count { font-size: 13px; color: #808080; }

/* ── Divider ── */
.divider { border: none; border-top: 1px solid #AABBAA; margin: 16px 0; }

/* ── Description ── */
.description {
  margin: 0 0 16px;
  font-size: 14px;
  line-height: 1.75;
  color: #434655;
}

/* ── Meta row (seller) ── */
.meta-row {
  display: flex; align-items: center; gap: 6px;
  font-size: 13px; margin-bottom: 16px;
}
.meta-label { color: #808080; }
.meta-val { font-weight: 700; color: #000; }

/* ── Out of stock ── */
.out-of-stock {
  font-size: 12px; font-weight: 700; color: #DA292E;
  margin: 0 0 16px;
}

/* ── Action row ── */
.action-row {
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 12px;
  margin-top: 8px;
  margin-bottom: 12px;
}

.qty-ctrl {
  height: 50px;
  border-radius: 50px;
  border: 1.5px solid #AABBAA;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 14px;
}
.qty-btn {
  border: none; background: transparent; cursor: pointer;
  font-size: 13px; color: #000; width: 22px; height: 22px;
  display: grid; place-items: center;
  transition: color 0.15s;
}
.qty-btn:hover { color: #555; }
.qty-val { font-size: 15px; font-weight: 600; color: #000; min-width: 20px; text-align: center; }

.add-btn {
  height: 50px;
  border: none;
  border-radius: 50px;
  background: #000;
  color: #fff;
  font-family: Helvetica, Arial, sans-serif;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s;
}
.add-btn:hover:not(:disabled) { background: #222; }
.add-btn:disabled { background: #AABBAA; cursor: default; }

.buy-btn {
  width: 100%;
  height: 50px;
  border: 1.5px solid #000;
  border-radius: 50px;
  background: #fff;
  color: #000;
  font-family: Helvetica, Arial, sans-serif;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s;
}
.buy-btn:hover:not(:disabled) { background: #f5f5f5; }
.buy-btn:disabled { border-color: #AABBAA; color: #AABBAA; cursor: default; }

.cart-msg { margin: 10px 0 0; font-size: 13px; font-weight: 600; }
.cart-msg.ok { color: #16a34a; }
.cart-msg.err { color: #DA292E; }

/* ── Related ── */
.related { border-top: 1px solid #AABBAA; padding-top: 48px; }
.related-title { margin: 0 0 24px; font-size: 20px; font-weight: 700; color: #000; }
.related-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
.related-card { text-decoration: none; color: inherit; display: block; }
.related-img-wrap {
  aspect-ratio: 3/4; border-radius: 8px; overflow: hidden;
  background: #f5f5f5; margin-bottom: 10px;
}
.related-img-wrap img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform .3s; }
.related-card:hover .related-img-wrap img { transform: scale(1.04); }
.related-placeholder {
  width: 100%; height: 100%; display: grid; place-items: center; color: #AABBAA; font-size: 28px;
}
.related-name { margin: 0 0 4px; font-size: 13px; font-weight: 700; color: #000; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.related-price { margin: 0; font-size: 14px; font-weight: 700; color: #DA292E; }

/* ── Responsive ── */
@media (max-width: 1024px) {
  .hero { grid-template-columns: 80px 1fr; }
  .panel { grid-column: 1 / -1; }
  .related-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 640px) {
  .container { padding: 0 16px; }
  .hero { grid-template-columns: 1fr; }
  .thumbs { flex-direction: row; }
  .product-name { font-size: 22px; }
  .action-row { grid-template-columns: 1fr; }
  .related-grid { grid-template-columns: repeat(2, 1fr); }
}
</style>
