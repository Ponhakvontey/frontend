<template>
  <div class="nav-actions">
    <SearchBar />
    <button class="icon-btn" type="button">
      <img :src="uiAssets.heartIcon" alt="Wishlist" />
    </button>
    <button class="icon-btn" type="button">
      <img :src="uiAssets.cartIcon" alt="Cart" />
    </button>
    <button class="icon-btn" type="button">
      <img :src="uiAssets.userIcon" alt="Account" />
    </button>
  </div>
</template>

<script setup lang="ts">
import SearchBar from '@/components/layout/SearchBar.vue'
import { uiAssets } from '@/data/home'
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
}
.icon-btn img {
  width: 100%;
  height: 100%;
}
</style>
