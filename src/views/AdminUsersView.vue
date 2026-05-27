<template>
  <div class="admin-page">
    <AdminSidebar />

    <div class="main-shell">
      <AdminTopbar />

      <main class="users-main">
        <!-- Header -->
        <section class="page-header">
          <div>
            <h1><i class="fa-solid fa-users title-icon"></i> User Management</h1>
            <p>Manage accounts, roles, and access control across your platform.</p>
          </div>
        </section>

        <!-- Error -->
        <div v-if="error" class="error-banner">
          <i class="fa-solid fa-triangle-exclamation"></i> {{ error }}
        </div>

        <!-- Stats -->
        <section class="stats-grid">
          <article class="stat-card">
            <div class="stat-icon-wrap blue">
              <i class="fa-solid fa-users"></i>
            </div>
            <div class="stat-body">
              <p class="stat-label">TOTAL USERS</p>
              <h2>{{ loading ? '—' : stats.total }}</h2>
            </div>
          </article>

          <article class="stat-card">
            <div class="stat-icon-wrap purple">
              <i class="fa-solid fa-shield-halved"></i>
            </div>
            <div class="stat-body">
              <p class="stat-label">ADMINS</p>
              <h2>{{ loading ? '—' : stats.admins }}</h2>
            </div>
          </article>

          <article class="stat-card">
            <div class="stat-icon-wrap amber">
              <i class="fa-solid fa-store"></i>
            </div>
            <div class="stat-body">
              <p class="stat-label">SELLERS</p>
              <h2>{{ loading ? '—' : stats.sellers }}</h2>
            </div>
          </article>

          <article class="stat-card">
            <div class="stat-icon-wrap red">
              <i class="fa-solid fa-ban"></i>
            </div>
            <div class="stat-body">
              <p class="stat-label">BANNED</p>
              <h2>{{ loading ? '—' : stats.banned }}</h2>
            </div>
          </article>
        </section>

        <!-- Table Card -->
        <section class="table-card">
          <!-- Toolbar -->
          <div class="toolbar">
            <div class="tab-row">
              <button
                v-for="tab in TABS"
                :key="tab.value"
                type="button"
                class="tab-btn"
                :class="{ active: activeTab === tab.value }"
                @click="setTab(tab.value)"
              >
                {{ tab.label }}
                <span v-if="tab.count !== undefined" class="tab-count">{{ tab.count }}</span>
              </button>
            </div>

            <div class="search-wrap">
              <i class="fa-solid fa-magnifying-glass search-icon"></i>
              <input
                v-model="search"
                type="text"
                class="search-input"
                placeholder="Search username or email…"
                @input="currentPage = 1"
              />
            </div>
          </div>

          <!-- Table -->
          <div class="table-scroll">
            <div v-if="loading" class="table-empty">
              <i class="fa-solid fa-spinner fa-spin"></i> Loading users…
            </div>
            <div v-else-if="!filtered.length" class="table-empty">
              <i class="fa-regular fa-folder-open"></i> No users found.
            </div>
            <table v-else>
              <thead>
                <tr>
                  <th><i class="fa-solid fa-user col-icon"></i> User</th>
                  <th><i class="fa-solid fa-id-badge col-icon"></i> Role</th>
                  <th><i class="fa-solid fa-circle-half-stroke col-icon"></i> Status</th>
                  <th><i class="fa-solid fa-ellipsis col-icon"></i> Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="u in paginated" :key="u.id">
                  <!-- User cell -->
                  <td>
                    <div class="user-cell">
                      <span class="avatar">{{ initials(u) }}</span>
                      <div class="user-meta">
                        <span class="user-name">{{ u.username }}</span>
                        <span class="user-email">{{ u.email }}</span>
                      </div>
                    </div>
                  </td>

                  <!-- Role pill(s) -->
                  <td>
                    <div class="role-pills">
                      <span v-if="hasRole(u, 'ROLE_ADMIN')" class="pill pill-admin">
                        <i class="fa-solid fa-shield-halved"></i> Admin
                      </span>
                      <span v-if="hasRole(u, 'ROLE_SELLER')" class="pill pill-seller">
                        <i class="fa-solid fa-store"></i> Seller
                      </span>
                      <span v-if="hasRole(u, 'ROLE_USER') && !hasRole(u, 'ROLE_ADMIN') && !hasRole(u, 'ROLE_SELLER')" class="pill pill-customer">
                        <i class="fa-solid fa-user"></i> Customer
                      </span>
                    </div>
                  </td>

                  <!-- Status -->
                  <td>
                    <span class="status-chip" :class="u.enabled ? 'active' : 'banned'">
                      <i :class="u.enabled ? 'fa-solid fa-circle-check' : 'fa-solid fa-circle-xmark'"></i>
                      {{ u.enabled ? 'Active' : 'Banned' }}
                    </span>
                  </td>

                  <!-- Actions -->
                  <td>
                    <div class="action-row">
                      <button
                        v-if="u.enabled"
                        type="button"
                        class="action-btn ban"
                        :disabled="actionLoading === u.id"
                        @click="ban(u.id)"
                      >
                        <i class="fa-solid fa-ban"></i> Ban
                      </button>
                      <button
                        v-else
                        type="button"
                        class="action-btn unban"
                        :disabled="actionLoading === u.id"
                        @click="unban(u.id)"
                      >
                        <i class="fa-solid fa-circle-check"></i> Unban
                      </button>

                      <button
                        v-if="hasRole(u, 'ROLE_SELLER') && !hasRole(u, 'ROLE_ADMIN')"
                        type="button"
                        class="action-btn revoke"
                        :disabled="actionLoading === u.id"
                        @click="revokeSeller(u.id)"
                      >
                        <i class="fa-solid fa-store-slash"></i> Revoke Seller
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div class="table-footer">
            <span class="count-text">
              {{ filtered.length ? `${startItem}–${endItem} of ${filtered.length} users` : '0 users' }}
            </span>
            <div class="pagination">
              <button
                type="button"
                class="page-btn"
                :disabled="currentPage <= 1"
                @click="currentPage--"
              >
                <i class="fa-solid fa-chevron-left"></i>
              </button>
              <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>
              <button
                type="button"
                class="page-btn"
                :disabled="currentPage >= totalPages"
                @click="currentPage++"
              >
                <i class="fa-solid fa-chevron-right"></i>
              </button>
            </div>
          </div>
        </section>
      </main>

      <AdminFooter />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import AdminSidebar from '@/components/admin/layout/AdminSidebar.vue'
import AdminTopbar from '@/components/admin/layout/AdminTopbar.vue'
import AdminFooter from '@/components/admin/layout/AdminFooter.vue'
import { api } from '@/services/apiClient'

interface BackendUser {
  id: number
  username: string
  email: string
  fullName: string | null
  phone: string | null
  profilePicture: string | null
  enabled: boolean
  roles: string[]
}

interface PagedResponse<T> {
  content: T[]
  totalElements: number
}

// ── State ────────────────────────────────────────────────────────────────────

const users       = ref<BackendUser[]>([])
const loading     = ref(true)
const error       = ref('')
const actionLoading = ref<number | null>(null)

const activeTab   = ref<'all' | 'admins' | 'sellers' | 'customers' | 'banned'>('all')
const search      = ref('')
const currentPage = ref(1)
const PAGE_SIZE   = 10

// ── Load ─────────────────────────────────────────────────────────────────────

async function fetchUsers() {
  loading.value = true
  error.value = ''
  try {
    const res = await api.get<PagedResponse<BackendUser>>(
      '/api/admin/users?page=0&size=100',
    )
    users.value = res.content ?? []
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'Failed to load users.'
  } finally {
    loading.value = false
  }
}

onMounted(fetchUsers)

// ── Helpers ──────────────────────────────────────────────────────────────────

function hasRole(u: BackendUser, role: string) {
  return u.roles?.includes(role) ?? false
}

function initials(u: BackendUser) {
  const name = u.fullName?.trim() || u.username || '?'
  const parts = name.split(' ')
  if (parts.length >= 2) return ((parts[0]?.charAt(0) ?? '') + (parts[1]?.charAt(0) ?? '')).toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

// ── Stats ─────────────────────────────────────────────────────────────────────

const stats = computed(() => ({
  total:   users.value.length,
  admins:  users.value.filter(u => hasRole(u, 'ROLE_ADMIN')).length,
  sellers: users.value.filter(u => hasRole(u, 'ROLE_SELLER') && !hasRole(u, 'ROLE_ADMIN')).length,
  banned:  users.value.filter(u => !u.enabled).length,
}))

// ── Tabs ──────────────────────────────────────────────────────────────────────

const TABS = computed(() => [
  { label: 'All',       value: 'all',       count: users.value.length },
  { label: 'Admins',    value: 'admins',    count: stats.value.admins },
  { label: 'Sellers',   value: 'sellers',   count: stats.value.sellers },
  { label: 'Customers', value: 'customers', count: users.value.filter(u => hasRole(u, 'ROLE_USER') && !hasRole(u, 'ROLE_ADMIN') && !hasRole(u, 'ROLE_SELLER')).length },
  { label: 'Banned',    value: 'banned',    count: stats.value.banned },
] as const)

function setTab(v: typeof activeTab.value) {
  activeTab.value = v
  currentPage.value = 1
}

// ── Filter + search ───────────────────────────────────────────────────────────

const filtered = computed(() => {
  let list = users.value

  if (activeTab.value === 'admins')    list = list.filter(u => hasRole(u, 'ROLE_ADMIN'))
  else if (activeTab.value === 'sellers')   list = list.filter(u => hasRole(u, 'ROLE_SELLER') && !hasRole(u, 'ROLE_ADMIN'))
  else if (activeTab.value === 'customers') list = list.filter(u => hasRole(u, 'ROLE_USER') && !hasRole(u, 'ROLE_ADMIN') && !hasRole(u, 'ROLE_SELLER'))
  else if (activeTab.value === 'banned')    list = list.filter(u => !u.enabled)

  const q = search.value.trim().toLowerCase()
  if (q) list = list.filter(u =>
    u.username?.toLowerCase().includes(q) ||
    u.email?.toLowerCase().includes(q),
  )

  return list
})

// ── Pagination ────────────────────────────────────────────────────────────────

const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / PAGE_SIZE)))
const paginated  = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE
  return filtered.value.slice(start, start + PAGE_SIZE)
})
const startItem  = computed(() => filtered.value.length ? (currentPage.value - 1) * PAGE_SIZE + 1 : 0)
const endItem    = computed(() => Math.min(currentPage.value * PAGE_SIZE, filtered.value.length))

// ── Actions ───────────────────────────────────────────────────────────────────

async function ban(id: number) {
  actionLoading.value = id
  try {
    const updated = await api.post<BackendUser>(`/api/admin/users/${id}/ban`, {})
    updateUser(updated)
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'Failed to ban user.'
  } finally {
    actionLoading.value = null
  }
}

async function unban(id: number) {
  actionLoading.value = id
  try {
    const updated = await api.post<BackendUser>(`/api/admin/users/${id}/unban`, {})
    updateUser(updated)
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'Failed to unban user.'
  } finally {
    actionLoading.value = null
  }
}

async function revokeSeller(id: number) {
  actionLoading.value = id
  try {
    const updated = await api.post<BackendUser>(`/api/admin/users/${id}/revoke-seller`, {})
    updateUser(updated)
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'Failed to revoke seller role.'
  } finally {
    actionLoading.value = null
  }
}

function updateUser(updated: BackendUser) {
  const idx = users.value.findIndex(u => u.id === updated.id)
  if (idx !== -1) users.value[idx] = updated
}
</script>

<style scoped>
.admin-page {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 230px minmax(0, 1fr);
  background: #f8fafc;
}

.main-shell {
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 100vh;
}

.users-main {
  flex: 1;
  padding: 28px 32px;
  overflow-x: auto;
  font-family: Helvetica, Arial, sans-serif;
}

/* ── Header ── */
.page-header {
  margin-bottom: 24px;
}

.page-header h1 {
  margin: 0 0 6px;
  font-size: 22px;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: -0.02em;
  display: flex;
  align-items: center;
  gap: 10px;
}

.title-icon { color: #94a3b8; font-size: 18px; }

.page-header p {
  margin: 0;
  font-size: 13px;
  color: #94a3b8;
}

/* ── Error ── */
.error-banner {
  background: #fff1f2;
  border: 1px solid #fecaca;
  color: #be123c;
  border-radius: 10px;
  padding: 12px 16px;
  font-size: 13px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* ── Stats ── */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: #fff;
  border-radius: 16px;
  border: 1px solid #e9eef5;
  padding: 18px 20px;
  display: flex;
  align-items: center;
  gap: 14px;
}

.stat-icon-wrap {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  font-size: 16px;
  flex-shrink: 0;
}

.stat-icon-wrap.blue   { background: #eff6ff; color: #2563eb; }
.stat-icon-wrap.purple { background: #f5f3ff; color: #7c3aed; }
.stat-icon-wrap.amber  { background: #fffbeb; color: #d97706; }
.stat-icon-wrap.red    { background: #fff1f2; color: #be123c; }

.stat-body { min-width: 0; }

.stat-label {
  margin: 0 0 4px;
  font-size: 10px;
  letter-spacing: 0.1em;
  color: #94a3b8;
  font-weight: 600;
  text-transform: uppercase;
}

.stat-card h2 {
  margin: 0;
  font-size: 30px;
  font-weight: 700;
  color: #0f172a;
  line-height: 1;
}

/* ── Table card ── */
.table-card {
  background: #fff;
  border-radius: 16px;
  border: 1px solid #e9eef5;
  overflow: hidden;
}

/* ── Toolbar ── */
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 18px 14px;
  gap: 16px;
  flex-wrap: wrap;
  border-bottom: 1px solid #f1f5f9;
}

.tab-row {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.tab-btn {
  height: 30px;
  border: 0;
  border-radius: 999px;
  padding: 0 12px;
  background: transparent;
  color: #64748b;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-family: Helvetica, Arial, sans-serif;
}

.tab-btn.active {
  background: #000000;
  color: #fff;
}

.tab-count {
  background: rgba(0,0,0,0.08);
  color: inherit;
  border-radius: 999px;
  padding: 1px 6px;
  font-size: 10px;
  font-weight: 700;
}

.tab-btn.active .tab-count { background: rgba(255,255,255,0.2); }

.search-wrap {
  position: relative;
  flex-shrink: 0;
}

.search-icon {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  font-size: 12px;
  pointer-events: none;
}

.search-input {
  height: 34px;
  width: 240px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 0 12px 0 30px;
  font-size: 13px;
  color: #334155;
  outline: none;
  font-family: Helvetica, Arial, sans-serif;
  background: #f8fafc;
}

.search-input:focus { border-color: #000000; background: #fff; }

/* ── Table ── */
.table-scroll { overflow-x: auto; }

.table-empty {
  padding: 48px;
  text-align: center;
  color: #94a3b8;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

table {
  width: 100%;
  border-collapse: collapse;
  min-width: 680px;
}

thead th {
  text-align: left;
  font-size: 11px;
  letter-spacing: 0.08em;
  color: #94a3b8;
  padding: 12px 18px 10px;
  font-weight: 600;
  text-transform: uppercase;
}

.col-icon { margin-right: 4px; font-size: 10px; }

tbody tr { border-top: 1px solid #f1f5f9; }
tbody tr:hover { background: #fafbfc; }

tbody td {
  padding: 12px 18px;
  font-size: 13.5px;
  color: #334155;
  vertical-align: middle;
}

/* ── User cell ── */
.user-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #e0e7ff;
  color: #4338ca;
  display: grid;
  place-items: center;
  font-size: 11px;
  font-weight: 700;
  flex-shrink: 0;
}

.user-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.user-name {
  font-weight: 600;
  color: #0f172a;
  font-size: 13.5px;
}

.user-email {
  font-size: 12px;
  color: #94a3b8;
}

/* ── Role pills ── */
.role-pills {
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
}

.pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 22px;
  padding: 0 9px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.04em;
}

.pill-admin    { background: #000000; color: #fff; }
.pill-seller   { background: #fffbeb; color: #d97706; }
.pill-customer { background: #eff6ff; color: #2563eb; }

/* ── Status chip ── */
.status-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 22px;
  padding: 0 10px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.04em;
}

.status-chip.active { background: #f0fdf4; color: #16a34a; }
.status-chip.banned { background: #fff1f2; color: #be123c; }

/* ── Actions ── */
.action-row {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.action-btn {
  height: 28px;
  border: 0;
  border-radius: 6px;
  padding: 0 10px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-family: Helvetica, Arial, sans-serif;
  transition: opacity 0.15s;
}

.action-btn:disabled { opacity: 0.5; cursor: default; }

.action-btn.ban    { background: #fff1f2; color: #be123c; }
.action-btn.unban  { background: #f0fdf4; color: #16a34a; }
.action-btn.revoke { background: #fffbeb; color: #d97706; }

/* ── Footer ── */
.table-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 18px;
  border-top: 1px solid #f1f5f9;
}

.count-text {
  font-size: 12px;
  color: #94a3b8;
}

.pagination {
  display: flex;
  align-items: center;
  gap: 8px;
}

.page-btn {
  width: 30px;
  height: 30px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: #fff;
  color: #64748b;
  font-size: 11px;
  cursor: pointer;
  display: grid;
  place-items: center;
}

.page-btn:disabled { opacity: 0.4; cursor: default; }
.page-btn:not(:disabled):hover { border-color: #000000; color: #000000; }

.page-info {
  font-size: 12px;
  color: #64748b;
  min-width: 48px;
  text-align: center;
}
</style>
