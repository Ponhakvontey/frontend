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
  color: rgba(255, 255, 255, 0.88);
  font-size: 15px;
  line-height: 24px;
  border-bottom: 2px solid transparent;
  padding-bottom: 2px;
  transition: color 0.18s;
}

.menu-link:hover {
  color: rgba(255, 255, 255, 0.9);
}

.menu-link.active {
  color: #fff;
  border-bottom-color: var(--clr-plum);
}

@media (max-width: 760px) {
  .menu {
    display: none;
  }
}
</style>
