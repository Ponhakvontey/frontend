<template>
  <RouterLink :to="`/product/${product.id}`" class="product-link">
    <article class="product-card">
      <div class="image-wrap">
        <img :src="product.image" :alt="product.name" />
        <span v-if="product.badge" class="badge">{{ product.badge }}</span>
      </div>

      <h4>{{ product.name }}</h4>
      <p class="maker">{{ product.maker }}</p>
      <p class="price">{{ formattedPrice }}</p>
    </article>
  </RouterLink>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import type { Product } from '@/types/home'

const props = defineProps<{
  product: Product
}>()

const formattedPrice = computed(() => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: props.product.currency,
    minimumFractionDigits: 0,
  }).format(props.product.price)
})
</script>

<style scoped>
.product-link {
  display: block;
  text-decoration: none;
  color: inherit;
}

.product-card {
  display: flex;
  flex-direction: column;
  gap: 4px;
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
  background: #513B3C;
  color: #eeefff;
  border-radius: 999px;
  padding: 4px 12px;
  font-size: 11px;
  line-height: 16px;
  letter-spacing: 0.05em;
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
  color: #513B3C;
}
</style>
