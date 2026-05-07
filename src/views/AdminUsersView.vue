<template>
  <div class="admin-page">
    <AdminSidebar />

    <div class="main-shell">
      <AdminTopbar />

      <main class="users-main">
        <section class="users-header">
          <div class="users-header-left">
            <h1>User Directory</h1>
            <p class="header-text">Manage and review your platform users.</p>
          </div>

          <div class="header-actions">
            <button type="button" class="filter-btn">Filters</button>
          </div>
        </section>

        <section class="stats-grid">
          <article class="stat-card">
            <div class="stat-top">
              <span class="stat-icon blue">👥</span>
              <span class="stat-badge green">+12%</span>
            </div>
            <p class="stat-label">TOTAL USERS</p>
            <h2>{{ stats.totalUsers }}</h2>
          </article>

          <article class="stat-card">
            <div class="stat-top">
              <span class="stat-icon gray">🛡️</span>
              <span class="stat-badge neutral">Stable</span>
            </div>
            <p class="stat-label">ADMINS</p>
            <h2>{{ stats.admins }}</h2>
          </article>

          <article class="stat-card">
            <div class="stat-top">
              <span class="stat-icon orange">📈</span>
              <span class="stat-badge green">New</span>
            </div>
            <p class="stat-label">NEW TODAY</p>
            <h2>{{ stats.newToday }}</h2>
          </article>

          <article class="stat-card">
            <div class="stat-top">
              <span class="stat-icon red">🚫</span>
              <span class="stat-badge red">Flagged</span>
            </div>
            <p class="stat-label">BLOCKED</p>
            <h2>{{ stats.blocked }}</h2>
          </article>
        </section>

        <section class="users-table-card">
          <div class="users-table-top">
            <div class="table-tabs">
              <button
                v-for="tab in tabs"
                :key="tab.value"
                type="button"
                class="tab-btn"
                :class="{ active: activeTab === tab.value }"
                @click="setActiveTab(tab.value)"
              >
                {{ tab.label }}
              </button>
            </div>

            <p class="viewing-text">
              Viewing {{ startItem }}-{{ endItem }} of {{ filteredUsers.length }}
            </p>
          </div>

          <div class="table-scroll">
            <table class="users-table">
              <thead>
                <tr>
                  <th>USER</th>
                  <th>ACCOUNT TYPE</th>
                  <th>JOIN DATE</th>
                  <th>STATUS</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>

              <tbody>
                <tr v-for="user in paginatedUsers" :key="user.id">
                  <td>
                    <div class="user-cell">
                      <div class="user-avatar initials">{{ user.initials }}</div>

                      <div class="user-meta">
                        <p class="user-name">{{ user.fullName }}</p>
                        <p class="user-email">{{ user.email }}</p>
                      </div>
                    </div>
                  </td>

                  <td>
                    <span class="type-pill" :class="user.role">{{ user.roleLabel }}</span>
                  </td>

                  <td class="join-date">{{ user.joinDate }}</td>

                  <td>
                    <span class="status-text" :class="user.statusClass">
                      <span class="status-dot"></span>
                      {{ user.statusLabel }}
                    </span>
                  </td>

                  <td>
                    <button
                      type="button"
                      class="block-btn"
                      :class="{ unblock: user.status === 'blocked' }"
                      @click="toggleBlocked(user.id)"
                    >
                      {{ user.status === 'blocked' ? 'Unblock' : 'Block' }}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="table-footer">
            <div class="rows-per-page">
              <span>Rows per page:</span>
              <button type="button" class="rows-btn">{{ pageSize }}</button>
            </div>

            <div class="pagination">
              <span>Page {{ currentPage }} of {{ totalPages }}</span>
            </div>
          </div>
        </section>
      </main>

      <AdminFooter />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import AdminSidebar from '@/components/admin/layout/AdminSidebar.vue'
import AdminTopbar from '@/components/admin/layout/AdminTopbar.vue'
import AdminFooter from '@/components/admin/layout/AdminFooter.vue'
import { getStoredUsers } from '@/utils/auth'
import { readStorage, writeStorage } from '@/utils/storage'

type UserRow = {
  id: string
  fullName: string
  email: string
  joinDate: string
  role: 'customer' | 'admin'
  roleLabel: string
  status: 'active' | 'blocked'
  statusLabel: string
  statusClass: 'active' | 'blocked'
  initials: string
  avatar?: string
  lastLoginAt: string | null
}

const tabs = [
  { label: 'All Users', value: 'all' },
  { label: 'Customers', value: 'customer' },
  { label: 'Administrators', value: 'admin' },
] as const

const activeTab = ref<'all' | 'customer' | 'admin'>('all')
const currentPage = ref(1)
const pageSize = 4

const blockedEmails = ref<string[]>(readStorage<string[]>('blockedUsers', []))

const users = computed<UserRow[]>(() => {
  const storedUsers = getStoredUsers()
  return storedUsers.map((user, index) => {
    const fullName = (user.fullName || `User ${index + 1}`).trim()
    const email = user.email.trim().toLowerCase()
    const role = user.role === 'admin' ? 'admin' : 'customer'
    const isBlocked = blockedEmails.value.includes(email)

    const nameParts = fullName.split(' ')
    const first = nameParts[0] || 'U'
    const last = nameParts[1] || 'S'

    return {
      id: user.id || `user-${index + 1}`,
      fullName,
      email,
      joinDate: user.joinDate || 'Apr 23, 2026',
      role,
      roleLabel: role === 'admin' ? 'ADMIN' : 'CUSTOMER',
      status: isBlocked ? 'blocked' : 'active',
      statusLabel: isBlocked ? 'Blocked' : 'Active',
      statusClass: isBlocked ? 'blocked' : 'active',
      initials: `${first.charAt(0)}${last.charAt(0)}`.toUpperCase(),
      avatar: '',
      lastLoginAt: user.lastLoginAt ?? null,
    }
  })
})

const filteredUsers = computed(() => {
  if (activeTab.value === 'all') return users.value
  return users.value.filter((user) => user.role === activeTab.value)
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredUsers.value.length / pageSize)))

const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredUsers.value.slice(start, start + pageSize)
})

const startItem = computed(() => {
  if (!filteredUsers.value.length) return 0
  return (currentPage.value - 1) * pageSize + 1
})

const endItem = computed(() => Math.min(currentPage.value * pageSize, filteredUsers.value.length))

const stats = computed(() => {
  const totalUsers = users.value.length
  const admins = users.value.filter((user) => user.role === 'admin').length
  const blocked = users.value.filter((user) => user.status === 'blocked').length

  return {
    totalUsers,
    admins,
    newToday: totalUsers,
    blocked,
  }
})

function setActiveTab(tab: 'all' | 'customer' | 'admin') {
  activeTab.value = tab
  currentPage.value = 1
}

function toggleBlocked(id: string) {
  const targetUser = users.value.find((user) => user.id === id)
  if (!targetUser) return

  const email = targetUser.email.toLowerCase()
  const exists = blockedEmails.value.includes(email)

  if (exists) {
    blockedEmails.value = blockedEmails.value.filter((item) => item !== email)
  } else {
    blockedEmails.value = [...blockedEmails.value, email]
  }

  writeStorage('blockedUsers', blockedEmails.value)
}
</script>

<style scoped>
.admin-page {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 250px minmax(0, 1fr);
  min-width: 1240px;
  background: #f6f8fb;
}

.main-shell {
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 100vh;
}

.users-main {
  padding: 22px 28px 34px;
  background: #f6f8fb;
  min-width: 0;
}

.users-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
  margin-bottom: 20px;
}

.users-header h1 {
  margin: 0 0 8px;
  font-size: 48px;
  line-height: 1;
  letter-spacing: -0.04em;
  color: #1b2233;
}

.header-text {
  margin: 0;
  font-size: 15px;
  color: #667085;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.filter-btn {
  height: 40px;
  border: 0;
  border-radius: 14px;
  padding: 0 18px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  background: #edf2ff;
  color: #62719a;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 22px;
}

.stat-card {
  background: #fff;
  border-radius: 20px;
  padding: 18px;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.05);
}

.stat-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.stat-label {
  margin: 0 0 8px;
  font-size: 10px;
  letter-spacing: 0.18em;
  color: #98a2b3;
  font-weight: 700;
}

.stat-card h2 {
  margin: 0;
  font-size: 38px;
  line-height: 1;
  color: #1b2233;
}

.users-table-card {
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.05);
  overflow: hidden;
  margin-bottom: 22px;
}

.users-table-top,
.table-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px;
}

.table-tabs {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.tab-btn {
  height: 30px;
  border: 0;
  border-radius: 999px;
  padding: 0 14px;
  background: transparent;
  color: #667085;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
}

.tab-btn.active {
  background: #3563e9;
  color: #fff;
}

.users-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 700px;
}

.table-scroll {
  overflow-x: auto;
}

.users-table th,
.users-table td {
  padding: 14px 18px;
  border-top: 1px solid #eef2f6;
  text-align: left;
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-avatar.initials {
  width: 32px;
  height: 32px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  font-size: 11px;
  font-weight: 700;
  color: #3563e9;
  background: #e8efff;
}

.user-name,
.user-email {
  margin: 0;
}

.type-pill {
  display: inline-flex;
  align-items: center;
  height: 20px;
  padding: 0 10px;
  border-radius: 999px;
  font-size: 9px;
  font-weight: 700;
}

.type-pill.customer {
  background: #eef2ff;
  color: #7b8ab8;
}

.type-pill.admin {
  background: #3563e9;
  color: #fff;
}

.status-text {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 999px;
}

.status-text.active .status-dot {
  background: #22c55e;
}

.status-text.blocked .status-dot {
  background: #dc2626;
}

.block-btn {
  height: 30px;
  border: 0;
  border-radius: 999px;
  padding: 0 14px;
  background: #ffe9e9;
  color: #dc2626;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
}

.block-btn.unblock {
  background: #eaf8ef;
  color: #16a34a;
}
</style>
