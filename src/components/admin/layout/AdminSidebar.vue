<template>
  <aside class="sidebar">
    <div class="sidebar-top">
      <div>
        <p class="sidebar-eyebrow">Admin Console</p>
        <p class="sidebar-subtitle">System Management</p>
      </div>
    </div>

    <nav class="sidebar-nav">
      <RouterLink to="/admin" class="nav-item" active-class="active" exact>
        <img :src="dashboardIcon" alt="" class="nav-icon" />
        <span>Dashboard</span>
      </RouterLink>
      <RouterLink to="/admin/inventory" class="nav-item" active-class="active">
        <img :src="inventoryIcon" alt="" class="nav-icon" />
        <span>Inventory</span>
      </RouterLink>
      <RouterLink to="/admin/orders" class="nav-item" active-class="active">
        <img :src="ordersIcon" alt="" class="nav-icon" />
        <span>Orders</span>
      </RouterLink>

      <RouterLink to="/admin/users" class="nav-item" active-class="active">
        <img :src="userIcon" alt="" class="nav-icon" />
        <span>Users</span>
      </RouterLink>
    </nav>

    <div class="sidebar-actions">
      <button class="report-btn" type="button">Generate Report</button>
    </div>

    <div class="sidebar-user">
      <div class="avatar">A</div>
      <div>
        <p class="user-name">Alex Sterling</p>
        <p class="user-role">Lead Curator</p>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
import dashboardIcon from '@/assets/admin/DashBoard.png'
import ordersIcon from '@/assets/admin/Orders.png'
import userIcon from '@/assets/admin/User.png'
import inventoryIcon from '@/assets/admin/inventory.png'
</script>

<style scoped>
.sidebar {
  background: #ffffff;
  border-right: 1px solid #ebeff5;
  padding: 18px 14px;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  position: sticky;
  top: 0;
}

.sidebar-top {
  margin-bottom: 28px;
}

.sidebar-eyebrow {
  margin: 0;
  font-size: 16px;
  color: #202636;
  font-weight: 600;
}

.sidebar-subtitle {
  margin: 4px 0 0;
  font-size: 10px;
  letter-spacing: 0.14em;
  color: #98a2b3;
  text-transform: uppercase;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.nav-item {
  height: 42px;
  border-radius: 12px;
  background: transparent;
  color: #4b5563;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 12px;
  cursor: pointer;
  text-align: left;
  text-decoration: none;
}

.nav-item.active {
  background: #f1f5ff;
  color: #3563e9;
  font-weight: 600;
}

.nav-icon {
  width: 16px;
  height: 16px;
  object-fit: contain;
}

.sidebar-actions {
  margin-top: auto;
  padding: 18px 6px 10px;
}

.report-btn {
  width: 100%;
  height: 42px;
  border: 0;
  border-radius: 12px;
  background: #3563e9;
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.sidebar-user {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background: #f7f9fc;
  border-radius: 14px;
}

.avatar {
  width: 34px;
  height: 34px;
  border-radius: 999px;
  background: #1f3a8a;
  color: #fff;
  display: grid;
  place-items: center;
  font-weight: 700;
}

.user-name {
  margin: 0;
  font-size: 13px;
  font-weight: 600;
}

.user-role {
  margin: 2px 0 0;
  font-size: 11px;
  color: #98a2b3;
}
</style>
