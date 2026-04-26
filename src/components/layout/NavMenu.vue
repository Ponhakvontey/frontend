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

defineProps<{
  navLinks: NavLink[]
}>()

const route = useRoute()

function getLinkPath(slug: string) {
  if (slug === 'home') return '/'
  return `/${slug}`
}

function isActive(slug: string) {
  if (slug === 'home') return route.path === '/'
  return route.path === `/${slug}`
}
</script>

<style scoped>
.menu {
  display: flex;
  gap: 32px;
}

.menu-link {
  text-decoration: none;
  color: #64748b;
  font-size: 16px;
  line-height: 24px;
  border-bottom: 2px solid transparent;
  padding-bottom: 2px;
}

.menu-link.active {
  color: #2563eb;
  border-bottom-color: #2563eb;
}

@media (max-width: 760px) {
  .menu {
    display: none;
  }
}
</style>
