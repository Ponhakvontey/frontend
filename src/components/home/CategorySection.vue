<template>
  <section class="section categories">
    <div class="container">
      <div class="section-head">
        <div>
          <p class="eyebrow">CURATION</p>
          <h2>Shop by Category</h2>
        </div>
        <a href="#" class="head-link">All Categories</a>
      </div>

      <div class="category-grid">
        <template v-for="category in categories" :key="category.id">
          <article class="category-card" :class="{ 'category-large': category.featured }">
            <img :src="category.image" :alt="category.name" />
            <div class="overlay" :class="{ compact: !category.featured }">
              <h3>{{ category.name }}</h3>
              <p v-if="category.description">{{ category.description }}</p>
              <a v-if="category.ctaLabel" href="#">{{ category.ctaLabel }}</a>
            </div>
          </article>
        </template>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { Category } from '@/types/home'

defineProps<{
  categories: Category[]
}>()
</script>

<style scoped>
.section {
  padding: 96px 0;
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
  color: #513B3C;
}
.section-head {
  display: flex;
  justify-content: space-between;
  align-items: end;
  margin-bottom: 48px;
}
.section-head h2 {
  margin: 0;
  font-weight: 400;
  font-size: 24px;
  line-height: 36px;
}
.head-link {
  font-size: 14px;
  line-height: 20px;
  color: #513B3C;
  text-decoration: none;
  border-bottom: 2px solid #dbe1ff;
  padding-bottom: 6px;
}
.category-grid {
  height: 600px;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  grid-template-rows: repeat(2, minmax(0, 1fr));
  gap: 16px;
}
.category-card {
  position: relative;
  overflow: hidden;
  border-radius: 24px;
}
.category-large {
  grid-column: span 2;
  grid-row: span 2;
}
.category-card img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
}
.overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 32px;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.6), transparent 55%);
}
.overlay h3 {
  margin: 0;
  color: #fff;
  font-size: 24px;
  line-height: 32px;
  font-weight: 400;
}
.overlay p {
  margin: 8px 0 16px;
  color: #cbd5e1;
  font-size: 14px;
  line-height: 20px;
}
.overlay a {
  color: #fff;
  font-size: 12px;
  line-height: 16px;
  text-decoration: none;
  letter-spacing: 0.1em;
}
.overlay.compact {
  padding: 24px;
}
.overlay.compact h3 {
  font-size: 20px;
  line-height: 28px;
}
@media (max-width: 760px) {
  .container {
    padding: 0 16px;
  }
  .category-grid {
    height: auto;
    grid-template-columns: 1fr;
    grid-template-rows: none;
  }
  .category-large {
    grid-column: auto;
    grid-row: auto;
    min-height: 380px;
  }
  .category-card {
    min-height: 220px;
  }
}
</style>
