<template>
  <header class="topbar">
    <img :src="logoSrc" alt="Ubuyee" class="brand-logo" />

    <div class="topbar-actions">
      <div class="search-box">
        <span>⌕</span>
        <input type="text" placeholder="Search analytics..." />
      </div>

      <button class="icon-btn" type="button" aria-label="Notifications">
        <i class="fa-regular fa-bell top-icon"></i>
      </button>

      <button class="icon-btn" type="button" aria-label="Settings">
        <i class="fa-solid fa-gear top-icon"></i>
      </button>

      <button class="icon-btn" type="button" aria-label="Profile">
        <i class="fa-regular fa-circle-user top-icon"></i>
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
import logoSrc from '@/assets/home/logo1.png'
</script>

<style scoped>
.topbar {
  height: 72px;
  background: #ffffff;
  border-bottom: 1px solid #ebeff5;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 28px;
}

.brand-logo {
  width: 90px;
  object-fit: contain;
}

.topbar-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.search-box {
  width: 240px;
  max-width: 100%;
  height: 38px;
  background: #f4f6fa;
  border-radius: 999px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 14px;
  color: #98a2b3;
}

.search-box input {
  width: 100%;
  border: 0;
  outline: 0;
  background: transparent;
}

.icon-btn {
  border: 0;
  background: transparent;
  cursor: pointer;
  padding: 0;
}

.top-icon {
  font-size: 17px;
  color: #667085;
}
</style>
