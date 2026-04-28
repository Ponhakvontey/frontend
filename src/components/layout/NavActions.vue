<template>
  <div class="nav-actions">
    <SearchBar
      :model-value="searchText"
      @update:model-value="emit('update:searchText', $event)"
      @enter="emit('searchEnter')"
    />

    <button class="icon-btn" type="button">
      <img :src="uiAssets.heartIcon" alt="Wishlist" />
    </button>

    <RouterLink to="/card" class="icon-btn cart-btn">
      <img :src="uiAssets.cartIcon" alt="Cart" />
      <span v-if="cartCount > 0" class="cart-badge">{{ cartCount }}</span>
    </RouterLink>

    <button class="icon-btn" type="button">
      <img :src="uiAssets.userIcon" alt="Account" />
    </button>
  </div>
</template>

<script setup lang="ts">
import SearchBar from '@/components/layout/SearchBar.vue'
import { uiAssets } from '@/data/home'

withDefaults(
  defineProps<{
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
</script>

<style scoped>
.nav-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.icon-btn {
  border: 0;
  background: transparent;
  width: 22px;
  height: 22px;
  padding: 0;
  cursor: pointer;
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
}

.icon-btn img {
  width: 100%;
  height: 100%;
}

.cart-btn {
  position: relative;
}

.cart-badge {
  position: absolute;
  top: -9px;
  right: -10px;
  min-width: 18px;
  height: 18px;
  border-radius: 999px;
  background: #3563e9;
  color: #fff;
  font-size: 10px;
  line-height: 18px;
  text-align: center;
  font-weight: 700;
  padding: 0 4px;
}
</style>
