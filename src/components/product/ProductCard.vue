<template>
  <article class="product-card">
    <RouterLink :to="`/product/${product.id}`" class="product-link">
      <div class="image-wrap">
        <img :src="product.image" :alt="product.name" loading="lazy" />
        <span v-if="product.badge" class="badge">{{ product.badge }}</span>
      </div>
      <div class="card-body">
        <p class="maker">{{ product.maker }}</p>
        <h4 class="name">{{ product.name }}</h4>
        <p class="price">{{ formattedPrice }}</p>
      </div>
    </RouterLink>

    <button
      type="button"
      class="fav-btn"
      :class="{ active: favorite }"
      :aria-label="favorite ? 'Remove from wishlist' : 'Add to wishlist'"
      @click="toggleFavorite"
    >
      <i :class="favorite ? 'fa-solid fa-heart' : 'fa-regular fa-heart'"></i>
    </button>
  </article>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import type { Product } from '@/types/home'
import { isLoggedIn } from '@/services/apiClient'
import { isWishlisted, toggleWishlist } from '@/services/wishlistService'

const props = defineProps<{ product: Product }>()
const router = useRouter()
const favorite = ref(false)

const formattedPrice = computed(() =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: props.product.currency, minimumFractionDigits: 0 })
    .format(props.product.price)
)

function toggleFavorite() {
  if (!isLoggedIn()) { router.push(`/login?redirect=/product/${props.product.id}`); return }
  toggleWishlist(props.product.id)
  favorite.value = isWishlisted(props.product.id)
}

function syncFav() { favorite.value = isWishlisted(props.product.id) }

onMounted(() => {
  syncFav()
  window.addEventListener('wishlist:changed', syncFav)
})

onUnmounted(() => {
  window.removeEventListener('wishlist:changed', syncFav)
})
</script>

<style scoped>
* { box-sizing: border-box; }

.product-card {
  position: relative;
  display: flex;
  flex-direction: column;
  background: #fff;
  border: 1px solid #AABBAA;
  border-radius: 4px;
  box-shadow: rgba(0,0,0,0.05) 0 2px 4px;
  overflow: hidden;
  transition: box-shadow 0.2s;
}
.product-card:hover {
  box-shadow: rgba(0,0,0,0.12) 0 3px 6px -4px;
}

.product-link { display: block; text-decoration: none; color: inherit; }

.image-wrap {
  position: relative;
  background: #f5f5f5;
  aspect-ratio: 3 / 4;
  overflow: hidden;
}
.image-wrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.badge {
  position: absolute;
  top: 12px;
  left: 12px;
  background: #DA292E;
  color: #fff;
  border-radius: 12px;
  padding: 4px 12px;
  font-family: Helvetica, Arial, sans-serif;
  font-size: 12px;
  font-weight: 700;
}

.card-body { padding: 12px 16px 16px; }

.maker {
  margin: 0 0 4px;
  font-family: Helvetica, Arial, sans-serif;
  font-size: 12px;
  color: #808080;
}

.name {
  margin: 0 0 6px;
  font-family: Helvetica, Arial, sans-serif;
  font-size: 16px;
  font-weight: 700;
  color: #000;
  line-height: 1.3;
}

.price {
  margin: 0;
  font-family: Helvetica, Arial, sans-serif;
  font-size: 18px;
  font-weight: 700;
  color: #DA292E;
}

.fav-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 36px;
  height: 36px;
  border-radius: 35px;
  background: rgba(255,255,255,0.9);
  border: 1px solid #AABBAA;
  color: #211E1E;
  display: grid;
  place-items: center;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}
.fav-btn:hover { background: #AABBAA; }
.fav-btn.active { background: #DA292E; color: #fff; border-color: #DA292E; }
</style>
