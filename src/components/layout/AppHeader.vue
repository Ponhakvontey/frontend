<template>
  <header class="top-nav" :class="{ hidden: isHeaderHidden }">
    <div class="container nav-inner">
      <img :src="uiAssets.logo" alt="Ubuyee" class="brand" />
      <NavMenu :nav-links="navLinks" />
      <NavActions
        :cart-count="cartCount"
        :search-text="searchText"
        @update:search-text="emit('update:searchText', $event)"
        @search-enter="emit('searchEnter')"
      />
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
    searchText?: string
  }>(),
  {
    cartCount: 0,
    searchText: '',
  },
)

const emit = defineEmits<{
  (e: 'update:searchText', value: string): void
  (e: 'searchEnter'): void
}>()

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
  background: rgba(247, 249, 251, 0.96);
  border-bottom: 1px solid #edf0f3;
  backdrop-filter: blur(10px);
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
