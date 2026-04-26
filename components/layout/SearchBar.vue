<template>
  <label class="search-box">
    <img :src="uiAssets.searchIcon" alt="" />
    <input type="text" :placeholder="placeholder" />
  </label>
</template>

<script setup lang="ts">
import { uiAssets } from '@/data/home'

withDefaults(
  defineProps<{
    placeholder?: string
  }>(),
  {
    placeholder: 'Search objects...',
  },
)
</script>

<style scoped>
.search-box {
  background: #eceef0;
  border-radius: 16px;
  height: 50px;
  width: 248px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: text;
}
.search-box img {
  width: 18px;
  height: 11px;
}
.search-box input {
  border: 0;
  background: transparent;
  width: 100%;
  font-size: 14px;
  color: #6b7280;
  outline: none;
  font-family: inherit;
}
@media (max-width: 760px) {
  .search-box {
    display: none;
  }
}
</style>
