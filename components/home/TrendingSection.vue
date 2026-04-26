<template>
  <section class="section-alt trending">
    <div class="container">
      <div class="trending-head">
        <p class="eyebrow">Ubuyee'S CHOICE</p>
        <h2>Trending This Month</h2>
        <p>The most sought-after pieces from our latest designer collaborations.</p>
      </div>
      <div class="product-grid">
        <ProductCard v-for="product in products" :key="product.id" :product="product" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import ProductCard from '@/components/product/ProductCard.vue'
import type { Product } from '@/types/home'

defineProps<{
  products: Product[]
}>()
</script>

<style scoped>
.section-alt {
  background: #f2f4f6;
}
.trending {
  padding-top: 96px;
  padding-bottom: 96px;
}
.container {
  width: min(1440px, 100%);
  margin: 0 auto;
  padding: 0 32px;
}
.eyebrow {
  margin: 0 0 10px;
  font-size: 11px;
  line-height: 16.5px;
  letter-spacing: 0.2em;
  color: #004ac6;
}
.trending-head {
  text-align: center;
  margin-bottom: 64px;
}
.trending-head h2 {
  margin: 0;
  font-weight: 400;
  font-size: 44px;
  line-height: 66px;
  letter-spacing: -0.025em;
}
.trending-head p:last-child {
  margin: 8px auto 0;
  max-width: 576px;
  color: #434655;
  font-size: 16px;
  line-height: 24px;
}
.product-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 32px;
}
@media (max-width: 1100px) {
  .product-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 760px) {
  .container {
    padding: 0 16px;
  }
  .product-grid {
    grid-template-columns: 1fr;
  }
  .trending-head h2 {
    font-size: 34px;
    line-height: 1.2;
  }
}
</style>
