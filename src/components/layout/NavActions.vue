<template>
  <div class="nav-actions">
    <button class="icon-btn" type="button" aria-label="Search" @click="goToSearch">
      <i class="fa-solid fa-magnifying-glass"></i>
    </button>

    <button class="icon-btn" type="button" aria-label="Account">
      <i class="fa-regular fa-user"></i>
    </button>

    <button class="icon-btn" type="button" aria-label="Wishlist">
      <i class="fa-regular fa-heart"></i>
    </button>

    <RouterLink to="/cart" class="icon-btn cart-btn" aria-label="Cart">
      <i class="fa-solid fa-cart-shopping"></i>
      <span v-if="cartCount > 0" class="cart-badge">{{ cartCount }}</span>
    </RouterLink>
  </div>
</template>

<script setup lang="ts">
import { RouterLink, useRouter } from 'vue-router'

withDefaults(
  defineProps<{
    cartCount?: number
  }>(),
  {
    cartCount: 0,
  },
)

const router = useRouter()

function goToSearch() {
  router.push('/sell')
}
</script>

<style scoped>
.nav-actions {
  display: flex;
  align-items: center;
  gap: 22px;
}

.icon-btn {
  border: 0;
  background: transparent;
  padding: 0;
  cursor: pointer;
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  width: 20px;
  height: 20px;
}

.icon-btn i {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.7);
  transition: color 0.18s;
}

.icon-btn:hover i {
  color: #fff;
}

.cart-btn {
  position: relative;
}

.cart-badge {
  position: absolute;
  top: -7px;
  right: -9px;
  min-width: 15px;
  height: 15px;
  border-radius: 999px;
  background: var(--clr-black);
  color: #fff;
  font-size: 9px;
  line-height: 15px;
  text-align: center;
  font-weight: 700;
  padding: 0 3px;
}
</style>
