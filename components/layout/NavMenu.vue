<template>
  <nav class="menu">
    <template v-for="link in navLinks" :key="link.id">
      <a href="#" :class="{ active: link.active }">
        {{ link.label }}
      </a>
    </template>
  </nav>
</template>

<script setup lang="ts">
import type { NavLink } from '@/types/home'

defineProps<{
  navLinks: NavLink[]
}>()
</script>

<style scoped>
.menu {
  display: flex;
  gap: 32px;
}
.menu a {
  text-decoration: none;
  color: #64748b;
  font-size: 16px;
  line-height: 24px;
  border-bottom: 2px solid transparent;
  padding-bottom: 2px;
}
.menu a.active {
  color: #2563eb;
  border-bottom-color: #2563eb;
}
@media (max-width: 760px) {
  .menu {
    display: none;
  }
}
</style>
