<template>
  <nav class="menu">
    <RouterLink
      v-for="link in navLinks"
      :key="link.id"
      :to="getLinkPath(link.slug)"
      class="menu-link"
      :class="{ active: isActive(link.slug) }"
    >
      {{ link.label }}
    </RouterLink>
  </nav>
</template>

<script setup lang="ts">
import { RouterLink, useRoute } from 'vue-router'
import type { NavLink } from '@/types/home'

defineProps<{ navLinks: NavLink[] }>()

const route = useRoute()

function getLinkPath(slug: string) {
  return slug === 'home' ? '/' : `/${slug}`
}

function isActive(slug: string) {
  return slug === 'home' ? route.path === '/' : route.path === `/${slug}`
}
</script>

<style scoped>
.menu { display: flex; gap: 28px; }

.menu-link {
  text-decoration: none;
  color: #211E1E;
  font-family: Helvetica, Arial, sans-serif;
  font-size: 16px;
  font-weight: 400;
  line-height: 25px;
  transition: color 0.15s;
}
.menu-link:hover { color: #1890FF; }
.menu-link.active { color: #000; font-weight: 700; }

@media (max-width: 760px) { .menu { display: none; } }
</style>
