<template>
  <header class="topbar">
    <h2 class="page-title">{{ pageTitle }}</h2>

    <div class="topbar-right">
      <span class="date-label">
        <i class="fa-regular fa-calendar-days"></i>
        {{ today }}
      </span>
      <div class="divider"></div>
      <div class="user-chip">
        <div class="chip-avatar">{{ userInitial }}</div>
        <span>{{ username }}</span>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { getUser } from '@/services/apiClient'

const route = useRoute()
const user = getUser()

const username = computed(() => user?.username ?? 'Admin')
const userInitial = computed(() => (user?.username?.[0] ?? 'A').toUpperCase())

const today = computed(() =>
  new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }),
)

const titleMap: Record<string, string> = {
  '/admin': 'Dashboard',
  '/admin/orders': 'Orders',
  '/admin/users': 'Users',
  '/admin/inventory': 'Inventory',
}

const pageTitle = computed(() => titleMap[route.path] ?? 'Admin')
</script>

<style scoped>
.topbar {
  height: 64px;
  background: #ffffff;
  border-bottom: 1px solid #e9eef5;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 28px;
  flex-shrink: 0;
  font-family: 'Inter', Arial, sans-serif;
}

.page-title {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: -0.02em;
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: 14px;
}

.date-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #94a3b8;
}

.divider {
  width: 1px;
  height: 20px;
  background: #e2e8f0;
}

.user-chip {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 999px;
  padding: 4px 12px 4px 4px;
  font-size: 13px;
  font-weight: 500;
  color: #334155;
}

.chip-avatar {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: #513B3C;
  color: #fff;
  display: grid;
  place-items: center;
  font-size: 11px;
  font-weight: 700;
}
</style>
