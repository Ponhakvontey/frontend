<template>
  <aside class="sidebar">

    <div class="sidebar-brand">
      <span class="brand-dot"></span>
      <span class="brand-name">Ubuyee</span>
      <span class="brand-tag">Admin</span>
    </div>

    <nav class="sidebar-nav">
      <RouterLink to="/admin" class="nav-item" active-class="active" exact>
        <i class="fa-solid fa-gauge-high nav-icon"></i>
        <span>Dashboard</span>
      </RouterLink>
      <RouterLink to="/admin/orders" class="nav-item" active-class="active">
        <i class="fa-solid fa-receipt nav-icon"></i>
        <span>Orders</span>
      </RouterLink>
      <RouterLink to="/admin/users" class="nav-item" active-class="active">
        <i class="fa-solid fa-users nav-icon"></i>
        <span>Users</span>
      </RouterLink>
      <RouterLink to="/admin/inventory" class="nav-item" active-class="active">
        <i class="fa-solid fa-box-archive nav-icon"></i>
        <span>Inventory</span>
      </RouterLink>
      <RouterLink to="/admin/categories" class="nav-item" active-class="active">
        <i class="fa-solid fa-tags nav-icon"></i>
        <span>Categories</span>
      </RouterLink>
    </nav>

    <div class="sidebar-footer">
      <div class="user-row">
        <div class="user-avatar">{{ userInitial }}</div>
        <div class="user-info">
          <p class="user-name">{{ username }}</p>
          <p class="user-role">Administrator</p>
        </div>
      </div>
      <button class="logout-btn" type="button" @click="handleLogout">
        <i class="fa-solid fa-right-from-bracket"></i>
        Sign out
      </button>
    </div>

  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { getUser } from '@/services/apiClient'
import { logout } from '@/services/authService'

const router = useRouter()
const user = getUser()
const username = computed(() => user?.username ?? 'Admin')
const userInitial = computed(() => (user?.username?.[0] ?? 'A').toUpperCase())

async function handleLogout() {
  await logout()
  router.push('/login')
}
</script>

<style scoped>
.sidebar {
  background: #0f172a;
  padding: 24px 16px;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  position: sticky;
  top: 0;
  font-family: 'Inter', Arial, sans-serif;
}

.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 8px 24px;
  border-bottom: 1px solid rgba(255,255,255,0.07);
  margin-bottom: 20px;
}

.brand-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #513B3C;
  flex-shrink: 0;
}

.brand-name {
  font-size: 15px;
  font-weight: 700;
  color: #f1f5f9;
  letter-spacing: -0.02em;
}

.brand-tag {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.1em;
  color: #64748b;
  background: rgba(255,255,255,0.06);
  padding: 2px 7px;
  border-radius: 999px;
  text-transform: uppercase;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nav-item {
  height: 40px;
  border-radius: 10px;
  color: #94a3b8;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 12px;
  text-decoration: none;
  font-size: 13.5px;
  font-weight: 500;
  transition: background 0.15s, color 0.15s;
}

.nav-item:hover {
  background: rgba(255,255,255,0.06);
  color: #e2e8f0;
}

.nav-item.active {
  background: rgba(81,59,60,0.35);
  color: #fca5a5;
  font-weight: 600;
}

.nav-icon {
  width: 16px;
  text-align: center;
  flex-shrink: 0;
  font-size: 14px;
}

.sidebar-footer {
  margin-top: auto;
  padding-top: 20px;
  border-top: 1px solid rgba(255,255,255,0.07);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.user-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 4px;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #513B3C;
  color: #fff;
  display: grid;
  place-items: center;
  font-size: 13px;
  font-weight: 700;
  flex-shrink: 0;
}

.user-info { min-width: 0; }

.user-name {
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  color: #e2e8f0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-role {
  margin: 2px 0 0;
  font-size: 11px;
  color: #64748b;
}

.logout-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  height: 38px;
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 10px;
  background: transparent;
  color: #94a3b8;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  padding: 0 12px;
  transition: background 0.15s, color 0.15s, border-color 0.15s;
  font-family: 'Inter', Arial, sans-serif;
}

.logout-btn:hover {
  background: rgba(239,68,68,0.12);
  color: #fca5a5;
  border-color: rgba(239,68,68,0.2);
}
</style>
