<template>
  <section class="hero-row">
    <div>
      <p class="hero-eyebrow">{{ greeting }},</p>
      <h1>{{ username }}</h1>
    </div>
    <RouterLink to="/admin/inventory/new" class="primary-btn">
      <i class="fa-solid fa-plus"></i>
      Add Product
    </RouterLink>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { getUser } from '@/services/apiClient'

const user = getUser()
const username = computed(() => user?.username ?? 'Admin')

const greeting = computed(() => {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
})
</script>

<style scoped>
.hero-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  margin-bottom: 24px;
  font-family: Helvetica, Arial, sans-serif;
}

.hero-eyebrow {
  margin: 0 0 4px;
  font-size: 13px;
  color: #94a3b8;
  font-weight: 500;
}

h1 {
  margin: 0;
  font-size: 36px;
  font-weight: 800;
  letter-spacing: -0.03em;
  color: #0f172a;
  text-transform: capitalize;
}

.primary-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 40px;
  padding: 0 20px;
  border-radius: 10px;
  background: #000000;
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
  white-space: nowrap;
  transition: opacity 0.15s;
  font-family: Helvetica, Arial, sans-serif;
}

.primary-btn:hover { opacity: 0.85; }
</style>
