<template>
  <section class="benefits section-alt">
    <div class="container benefit-grid">
      <article v-for="item in benefits" :key="item.id" class="benefit-item">
        <span class="benefit-icon">
          <img :src="item.icon" alt="" />
        </span>
        <div>
          <h4>{{ item.title }}</h4>
          <p>{{ item.description }}</p>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { Benefit } from '@/types/home'

defineProps<{
  benefits: Benefit[]
}>()
</script>

<style scoped>
.section-alt {
  background: #f2f4f6;
  padding: 48px 0;
}
.container {
  width: min(1440px, 100%);
  margin: 0 auto;
  padding: 0 32px;
}
.benefit-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 48px;
}
.benefit-item {
  display: flex;
  gap: 16px;
  align-items: center;
}
.benefit-icon {
  width: 48px;
  height: 48px;
  border-radius: 999px;
  background: #fff;
  display: grid;
  place-items: center;
  flex-shrink: 0;
}
.benefit-icon img {
  width: 22px;
  height: 22px;
}
.benefit-item h4 {
  margin: 0 0 2px;
  font-size: 14px;
  line-height: 20px;
  font-weight: 400;
}
.benefit-item p {
  margin: 0;
  font-size: 12px;
  line-height: 16px;
  color: #434655;
}
@media (max-width: 1100px) {
  .benefit-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 760px) {
  .container {
    padding: 0 16px;
  }
  .benefit-grid {
    grid-template-columns: 1fr;
  }
}
</style>
