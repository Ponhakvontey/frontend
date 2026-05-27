<template>
  <article class="product-card">
    <RouterLink :to="`/product/${product.id}`" class="product-link">
      <div class="image-wrap">
        <img :src="product.image" :alt="product.name" />
        <span v-if="product.badge" class="badge">{{ product.badge }}</span>
      </div>

      <h4>{{ product.name }}</h4>
      <p class="maker">{{ product.maker }}</p>
      <p class="price">{{ formattedPrice }}</p>
    </RouterLink>

    <button
      type="button"
      class="favorite-btn"
      :class="{ active: favorite }"
      :aria-label="favorite ? 'Remove from wishlist' : 'Add to wishlist'"
      @click="toggleFavorite"
    >
      <i :class="favorite ? 'fa-solid fa-heart' : 'fa-regular fa-heart'"></i>
    </button>
  </article>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import type { Product } from '@/types/home'
import { isLoggedIn } from '@/services/apiClient'
import { isWishlisted, toggleWishlist } from '@/services/wishlistService'

const props = defineProps<{
  product: Product
}>()

const router = useRouter()
const favorite = ref(false)

const formattedPrice = computed(() => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: props.product.currency,
    minimumFractionDigits: 0,
  }).format(props.product.price)
})

function toggleFavorite() {
  if (!isLoggedIn()) {
    router.push(`/login?redirect=/product/${props.product.id}`)
    return
  }

  toggleWishlist(props.product.id)
  favorite.value = isWishlisted(props.product.id)
}

onMounted(() => {
  favorite.value = isWishlisted(props.product.id)
})
</script>

<style scoped>
.product-card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.product-link {
  display: block;
  text-decoration: none;
  color: inherit;
}

.image-wrap {
  position: relative;
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 40px 60px -15px rgba(25, 28, 30, 0.04);
}

.image-wrap img {
  width: 100%;
  height: 373px;
  object-fit: cover;
  display: block;
}

.badge {
  position: absolute;
  top: 16px;
  left: 16px;
  background: #2563eb;
  color: #eeefff;
  border-radius: 999px;
  padding: 4px 12px;
  font-size: 11px;
  line-height: 16px;
  letter-spacing: 0.05em;
}

.favorite-btn {
  position: absolute;
  top: 14px;
  right: 14px;
  width: 38px;
  height: 38px;
  border: 0;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.92);
  color: #513B3C;
  display: grid;
  place-items: center;
  cursor: pointer;
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.1);
}

.favorite-btn.active {
  background: #513B3C;
  color: #fff;
}

.product-card h4 {
  margin: 8px 0 0;
  font-size: 16px;
  line-height: 24px;
  font-weight: 400;
}

.maker {
  margin: 0;
  font-size: 12px;
  line-height: 16px;
  color: #434655;
}

.price {
  margin: 0;
  font-size: 16px;
  line-height: 24px;
  color: #004ac6;
}
</style>