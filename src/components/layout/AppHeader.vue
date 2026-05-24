<template>
  <header class="top-nav" :class="{ hidden: isHeaderHidden }">
    <div class="container nav-inner">
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

withDefaults(
  defineProps<{
    navLinks: NavLink[]
    cartCount?: number
  }>(),
  {
    cartCount: 0,
  },
)

const isHeaderHidden = ref(false)
let lastScrollY = 0

function handleScroll() {
  const currentScrollY = window.scrollY

  if (currentScrollY <= 20) {
    isHeaderHidden.value = false
    lastScrollY = currentScrollY
    return
  }

  if (currentScrollY > lastScrollY + 8) {
    isHeaderHidden.value = true
  } else if (currentScrollY < lastScrollY - 8) {
    isHeaderHidden.value = false
  }

  lastScrollY = currentScrollY
}

onMounted(() => {
  lastScrollY = window.scrollY
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.top-nav {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
  background: rgba(7, 7, 7, 0.96);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(12px);
  transform: translateY(0);
  transition:
    transform 0.28s ease,
    background-color 0.28s ease;
}

.top-nav.hidden {
  transform: translateY(-100%);
}

.nav-inner {
  width: min(1440px, 100%);
  margin: 0 auto;
  padding: 0 32px;
  min-height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 32px;
}

.brand {
  width: 120px;
  height: 42px;
  object-fit: contain;
  filter: brightness(0) invert(1);
}
</style>
