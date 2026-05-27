<template>
  <div class="nav-actions">
    <RouterLink :to="accountRoute" class="icon-btn" aria-label="Account">
      <i class="fa-regular fa-user"></i>
    </RouterLink>
    <RouterLink :to="wishlistRoute" class="icon-btn" aria-label="Wishlist">
      <i class="fa-regular fa-heart"></i>
    </RouterLink>
    <button type="button" class="icon-btn" aria-label="Cart" @click="openSidebar">
      <i class="fa-solid fa-cart-shopping"></i>
      <span v-if="cartCount > 0" class="cart-badge">{{ cartCount }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { isLoggedIn } from '@/services/apiClient'
import { useCartSidebar } from '@/composables/useCartSidebar'

withDefaults(defineProps<{ cartCount?: number }>(), { cartCount: 0 })

const accountRoute = computed(() => isLoggedIn() ? '/profile' : '/login')
const wishlistRoute = computed(() => isLoggedIn() ? '/wishlist' : '/login?redirect=/wishlist')

const { openSidebar } = useCartSidebar()
</script>

<style scoped>
.nav-actions { display: flex; align-items: center; gap: 8px; }

@media (min-width: 769px) {
  .nav-actions { gap: 20px; }
}

.icon-btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 35px;
  background: transparent;
  border: none;
  text-decoration: none;
  cursor: pointer;
  transition: background 0.15s;
}
.icon-btn i { font-size: 16px; color: #211E1E; transition: color 0.15s; }
.icon-btn:hover { background: #AABBAA; }
.icon-btn:hover i { color: #000; }

.cart-badge {
  position: absolute;
  top: 4px;
  right: 4px;
  min-width: 16px;
  height: 16px;
  border-radius: 12px;
  background: #DA292E;
  color: #fff;
  font-family: Helvetica, Arial, sans-serif;
  font-size: 10px;
  font-weight: 700;
  line-height: 16px;
  text-align: center;
  padding: 0 4px;
}
</style>
