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
                v-for="(img, idx) in allImages"
                :key="idx"
                type="button"
                class="thumb"
                :class="{ active: activeImg === img }"
                @click="activeImg = img"
              >
                <img :src="img" :alt="`${product.name} image ${idx + 1}`" />
              </button>
              <button
                v-if="!allImages.length"
                type="button"
                class="thumb active"
              >
                <div class="thumb-placeholder"><i class="fa-solid fa-image"></i></div>
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

              <!-- Size selector -->
              <div v-if="product.sizes && product.sizes.length > 0" class="size-section">
                <p class="size-label">
                  Size <span v-if="!selectedSize" class="size-required">(required)</span>
                  <span v-else class="size-chosen">{{ selectedSize }}</span>
                </p>
                <div class="size-grid">
                  <button
                    v-for="s in product.sizes"
                    :key="s"
                    type="button"
                    class="size-btn"
                    :class="{ active: selectedSize === s }"
                    @click="selectedSize = s"
                  >{{ s }}</button>
                </div>
              </div>

              <!-- Qty + Add to Cart -->
              <div class="action-row">
                <div class="qty-ctrl">
                  <button type="button" class="qty-btn" @click="qty > 1 && qty--">
                    <i class="fa-solid fa-minus"></i>
                  </button>
                  <span class="qty-val">{{ qty }}</span>
                  <button type="button" class="qty-btn" @click="qty < product.stockQuantity && qty++">
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

          <!-- ── Comments & Reviews ── -->
          <section class="comments-section">
            <h2 class="comments-title">Reviews</h2>

            <!-- Submit form -->
            <div class="comment-form">
              <div class="star-picker">
                <button
                  v-for="n in 5" :key="n"
                  type="button"
                  class="star-pick-btn"
                  @click="newRating = newRating === n ? null : n"
                >
                  <i :class="newRating && newRating >= n ? 'fa-solid fa-star' : 'fa-regular fa-star'"></i>
                </button>
                <span class="star-pick-label">{{ newRating ? `${newRating}/5` : 'No rating' }}</span>
              </div>
              <textarea
                v-model="newComment"
                class="comment-textarea"
                placeholder="Share your thoughts about this product…"
                maxlength="1000"
                rows="3"
              />
              <div class="comment-form-footer">
                <span class="char-count">{{ newComment.length }}/1000</span>
                <button
                  type="button"
                  class="submit-comment-btn"
                  :disabled="!newComment.trim() || commentSubmitting"
                  @click="submitComment"
                >
                  {{ commentSubmitting ? 'Posting…' : 'Post Review' }}
                </button>
              </div>
              <p v-if="commentError" class="comment-error">{{ commentError }}</p>
            </div>

            <!-- Comment list -->
            <div v-if="commentsLoading" class="comments-loading">
              <i class="fa-solid fa-spinner fa-spin"></i>
            </div>
            <div v-else-if="!comments.length" class="no-comments">
              No reviews yet. Be the first!
            </div>
            <div v-else class="comments-list">
              <article v-for="c in comments" :key="c.id" class="comment-card">
                <div class="comment-header">
                  <img v-if="c.userProfilePicture" :src="c.userProfilePicture" class="comment-avatar" :alt="c.username" />
                  <span v-else class="comment-avatar-initials">{{ c.username?.[0]?.toUpperCase() ?? '?' }}</span>
                  <div class="comment-meta">
                    <strong class="comment-username">{{ c.username }}</strong>
                    <span class="comment-date">{{ fmtCommentDate(c.createdAt) }}</span>
                  </div>
                  <div v-if="c.rating" class="comment-stars">
                    <i v-for="n in 5" :key="n" :class="n <= c.rating ? 'fa-solid fa-star' : 'fa-regular fa-star'"></i>
                  </div>
                </div>
                <p class="comment-body">{{ c.content }}</p>

                <!-- Replies -->
                <div v-if="c.replies?.length" class="replies">
                  <article v-for="r in c.replies" :key="r.id" class="reply-card">
                    <div class="comment-header">
                      <img v-if="r.userProfilePicture" :src="r.userProfilePicture" class="comment-avatar sm" :alt="r.username" />
                      <span v-else class="comment-avatar-initials sm">{{ r.username?.[0]?.toUpperCase() ?? '?' }}</span>
                      <div class="comment-meta">
                        <strong class="comment-username">{{ r.username }}</strong>
                        <span class="comment-date">{{ fmtCommentDate(r.createdAt) }}</span>
                      </div>
                    </div>
                    <p class="comment-body">{{ r.content }}</p>
                  </article>
                </div>
              </article>
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
import { api, isLoggedIn } from '@/services/apiClient'
import { isWishlisted, toggleWishlist } from '@/services/wishlistService'
import { useCartSidebar } from '@/composables/useCartSidebar'

// ── Types ────────────────────────────────────────────────────────────────────

interface ProductDTO {
  id: string
  name: string
  description: string | null
  price: number
  stockQuantity: number
  imageUrl: string | null
  imageUrls: string[] | null
  sizes: string[]
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

const allImages = computed((): string[] => {
  if (!product.value) return []
  const list = product.value.imageUrls?.filter(Boolean) ?? []
  if (list.length) return list
  return product.value.imageUrl ? [product.value.imageUrl] : []
})

const qty          = ref(1)
const selectedSize = ref('')
const cartMsg      = ref('')
const cartMsgType  = ref<'ok' | 'err'>('ok')
const isFavorite   = ref(false)

const { state: cartState, openSidebar, refreshCart } = useCartSidebar()
const cartCount = computed(() => cartState.items.reduce((s, i) => s + i.quantity, 0))

// ── Fetch ─────────────────────────────────────────────────────────────────────

async function loadProduct(id: string) {
  loading.value = true
  error.value = ''
  product.value = null
  related.value = []
  qty.value = 1
  selectedSize.value = ''
  cartMsg.value = ''

  try {
    const dto = await api.get<ProductDTO>(`/api/products/${id}`)
    product.value = dto
    const imgs = dto.imageUrls?.filter(Boolean) ?? []
    activeImg.value = imgs[0] ?? dto.imageUrl ?? ''
    isFavorite.value = isWishlisted(dto.id)
    if (isLoggedIn()) {
      api.getSilent<{ favorite: boolean }>(`/api/favorites/check/${dto.id}`)
        .then(r => { isFavorite.value = r.favorite })
        .catch(() => {})
    }

    try {
      const relData = await api.get<ProductDTO[]>(`/api/products/${id}/related`)
      related.value = relData.slice(0, 4)
    } catch { /* related products are non-critical */ }
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'Failed to load product.'
  } finally {
    loading.value = false
  }
}

// ── Comments ──────────────────────────────────────────────────────────────────

interface CommentDTO {
  id: number
  content: string
  userId: number
  username: string
  userProfilePicture: string | null
  rating: number | null
  createdAt: string
  replies: CommentDTO[]
}

const comments         = ref<CommentDTO[]>([])
const commentsLoading  = ref(false)
const newComment       = ref('')
const newRating        = ref<number | null>(null)
const commentSubmitting = ref(false)
const commentError     = ref('')

async function loadComments(id: string) {
  commentsLoading.value = true
  try {
    comments.value = await api.get<CommentDTO[]>(`/api/products/${id}/comments`)
  } catch { comments.value = [] }
  finally { commentsLoading.value = false }
}

watch(() => route.params.id, (id) => { if (id) { loadProduct(String(id)); loadComments(String(id)) } }, { immediate: true })

async function submitComment() {
  if (!product.value || !newComment.value.trim()) return
  if (!isLoggedIn()) { router.push(`/login?redirect=/product/${product.value.id}`); return }
  commentSubmitting.value = true
  commentError.value = ''
  try {
    const created = await api.post<CommentDTO>(`/api/products/${product.value.id}/comments`, {
      content: newComment.value.trim(),
      rating: newRating.value ?? undefined,
    })
    comments.value.unshift(created)
    newComment.value = ''
    newRating.value  = null
  } catch (e: unknown) {
    commentError.value = e instanceof Error ? e.message : 'Failed to post review.'
  } finally {
    commentSubmitting.value = false
  }
}

function fmtCommentDate(iso: string) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

// ── Actions ───────────────────────────────────────────────────────────────────

function toggleFavorite() {
  if (!product.value) return
  if (!isLoggedIn()) { router.push(`/login?redirect=/product/${product.value.id}`); return }
  toggleWishlist(product.value.id)
  isFavorite.value = isWishlisted(product.value.id)
}

function validateBeforeAdd(): boolean {
  if (!product.value) return false
  if (!isLoggedIn()) { router.push(`/login?redirect=/product/${product.value.id}`); return false }
  if (product.value.stockQuantity === 0) {
    cartMsg.value = 'This product is out of stock.'
    cartMsgType.value = 'err'
    return false
  }
  const hasSizes = product.value.sizes && product.value.sizes.length > 0
  if (hasSizes && !selectedSize.value) {
    cartMsg.value = 'Please select a size before adding to cart.'
    cartMsgType.value = 'err'
    return false
  }
  cartMsg.value = ''
  return true
}

async function addToCart() {
  if (!validateBeforeAdd()) return
  try {
    await api.post('/api/cart/add', {
      productId: product.value!.id,
      quantity: qty.value,
      size: selectedSize.value || undefined,
    })
    qty.value = 1
    await openSidebar()
  } catch (e: unknown) {
    cartMsg.value = e instanceof Error ? e.message : 'Failed to add to cart.'
    cartMsgType.value = 'err'
  }
}

async function buyNow() {
  if (!validateBeforeAdd()) return
  try {
    await api.post('/api/cart/add', {
      productId: product.value!.id,
      quantity: qty.value,
      size: selectedSize.value || undefined,
    })
    router.push('/checkout')
  } catch (e: unknown) {
    cartMsg.value = e instanceof Error ? e.message : 'Failed to add to cart.'
    cartMsgType.value = 'err'
  }
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
  refreshCart()
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

/* ── Size selector ── */
.size-section { margin: 0 0 20px; }

.size-label {
  font-size: 14px; font-weight: 700; color: #000;
  margin: 0 0 10px; display: flex; align-items: center; gap: 6px;
}
.size-required { font-weight: 400; color: #DA292E; font-size: 12px; }
.size-chosen   { font-weight: 600; color: #000; font-size: 13px; }

.size-grid { display: flex; flex-wrap: wrap; gap: 8px; }

.size-btn {
  min-width: 46px; height: 38px; padding: 0 12px;
  border: 1.5px solid #AABBAA;
  border-radius: 6px;
  background: #fff;
  color: #000;
  font-family: Helvetica, Arial, sans-serif;
  font-size: 13px; font-weight: 600;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s, color 0.15s;
}
.size-btn:hover { border-color: #000; }
.size-btn.active { border-color: #000; background: #000; color: #fff; }

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

/* ── Comments ── */
.comments-section {
  border-top: 1px solid #AABBAA;
  padding-top: 40px;
  margin-bottom: 40px;
}
.comments-title { margin: 0 0 24px; font-size: 20px; font-weight: 700; color: #000; }

.comment-form { margin-bottom: 32px; }

.star-picker {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 12px;
}
.star-pick-btn {
  border: none; background: transparent; cursor: pointer;
  padding: 2px; font-size: 20px; color: #f5a623;
  transition: transform 0.1s;
}
.star-pick-btn:hover { transform: scale(1.2); }
.star-pick-label { font-size: 12px; color: #808080; margin-left: 6px; }

.comment-textarea {
  width: 100%;
  border: 1.5px solid #ddd;
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 14px;
  font-family: Helvetica, Arial, sans-serif;
  resize: vertical;
  outline: none;
  transition: border-color 0.15s;
  box-sizing: border-box;
}
.comment-textarea:focus { border-color: #000; }

.comment-form-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 8px;
}
.char-count { font-size: 12px; color: #aaa; }

.submit-comment-btn {
  height: 38px;
  padding: 0 20px;
  background: #000;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  font-family: Helvetica, Arial, sans-serif;
  cursor: pointer;
  transition: background 0.15s;
}
.submit-comment-btn:hover:not(:disabled) { background: #333; }
.submit-comment-btn:disabled { background: #aaa; cursor: default; }

.comment-error { margin: 8px 0 0; font-size: 12px; color: #DA292E; }
.login-to-review { font-size: 14px; color: #555; margin-bottom: 24px; }
.login-to-review a { color: #000; font-weight: 600; }

.comments-loading { padding: 24px 0; text-align: center; color: #808080; font-size: 20px; }
.no-comments { padding: 24px 0; text-align: center; color: #808080; font-size: 14px; }

.comments-list { display: flex; flex-direction: column; gap: 20px; }

.comment-card {
  border: 1px solid #f0f0f0;
  border-radius: 10px;
  padding: 16px;
  background: #fafafa;
}
.comment-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  flex-wrap: wrap;
}
.comment-avatar {
  width: 36px; height: 36px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}
.comment-avatar.sm { width: 28px; height: 28px; }
.comment-avatar-initials {
  width: 36px; height: 36px;
  border-radius: 50%;
  background: #111;
  color: #fff;
  font-size: 15px;
  font-weight: 700;
  display: grid; place-items: center;
  flex-shrink: 0;
}
.comment-avatar-initials.sm { width: 28px; height: 28px; font-size: 12px; }
.comment-meta { display: flex; flex-direction: column; gap: 1px; flex: 1; }
.comment-username { font-size: 14px; font-weight: 700; color: #000; }
.comment-date { font-size: 12px; color: #aaa; }
.comment-stars { display: flex; gap: 2px; margin-left: auto; }
.comment-stars i { font-size: 13px; color: #f5a623; }
.comment-body { margin: 0; font-size: 14px; color: #333; line-height: 1.6; }

.replies {
  margin-top: 12px;
  padding-left: 16px;
  border-left: 2px solid #e5e5e5;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.reply-card {
  background: #fff;
  border-radius: 8px;
  padding: 12px;
  border: 1px solid #f0f0f0;
}

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
  .detail-main { padding: 24px 0 56px; }
}

@media (max-width: 640px) {
  .container { padding: 0 16px; }
  .detail-main { padding: 16px 0 48px; }
  .hero { grid-template-columns: 1fr; gap: 12px; }
  .thumbs { flex-direction: row; overflow-x: auto; }
  .thumb { flex-shrink: 0; }
  .product-name { font-size: 22px; }
  .price { font-size: 22px; }
  .action-row { grid-template-columns: 1fr; }
  .related-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
  .breadcrumb { margin-bottom: 16px; }
}

@media (max-width: 380px) {
  .related-grid { grid-template-columns: 1fr; }
}
</style>
