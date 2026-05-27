<template>
  <header class="top-nav" :class="{ hidden: isHeaderHidden }">
    <div class="nav-inner">
      <img :src="uiAssets.logo" alt="Ubuyee" class="brand" />
      <NavMenu :nav-links="navLinks" />
      <NavActions :cart-count="cartCount" />
    </div>
  </header>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import NavMenu from '@/components/layout/NavMenu.vue'
import NavActions from '@/components/layout/NavActions.vue'
import { uiAssets } from '@/data/home'
import type { NavLink } from '@/types/home'

withDefaults(defineProps<{ navLinks: NavLink[]; cartCount?: number }>(), { cartCount: 0 })

const isHeaderHidden = ref(false)
let lastScrollY = 0

function handleScroll() {
  const y = window.scrollY
  if (y <= 10) { isHeaderHidden.value = false; lastScrollY = y; return }
  if (y > lastScrollY + 8) isHeaderHidden.value = true
  else if (y < lastScrollY - 8) isHeaderHidden.value = false
  lastScrollY = y
}

onMounted(() => { lastScrollY = window.scrollY; window.addEventListener('scroll', handleScroll, { passive: true }) })
onBeforeUnmount(() => window.removeEventListener('scroll', handleScroll))
</script>

<style scoped>
.top-nav {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
  background: #fff;
  border-bottom: 1px solid #AABBAA;
  height: 50px;
  transform: translateY(0);
  transition: transform 0.25s ease;
}
.top-nav.hidden { transform: translateY(-100%); }

.nav-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 32px;
}

.brand {
  width: 100px;
  height: 36px;
  object-fit: contain;
}
</style>
