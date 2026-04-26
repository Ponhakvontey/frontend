<template>
  <header class="top-nav">
    <div class="container nav-inner">
      <img :src="uiAssets.logo" alt="Ubuyee" class="brand" />
      <NavMenu :nav-links="navLinks" />
      <NavActions />
    </div>
  </header>
</template>

<script setup lang="ts">
import NavMenu from '@/components/layout/NavMenu.vue'
import NavActions from '@/components/layout/NavActions.vue'
import { uiAssets } from '@/data/home'
import type { NavLink } from '@/types/home'

defineProps<{
  navLinks: NavLink[]
}>()
</script>

<style scoped>
.top-nav {
  background: #f7f9fb;
  border-bottom: 1px solid #edf0f3;
}
.nav-inner {
  width: min(1440px, 100%);
  margin: 0 auto;
  padding: 0 32px;
  min-height: 84px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 32px;
}
.brand {
  width: 120px;
  height: 42px;
  object-fit: contain;
}
</style>
