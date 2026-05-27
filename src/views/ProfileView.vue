<template>
  <div class="profile-page">
    <AppHeader :nav-links="navLinks" :cart-count="cartCount" />

    <main class="profile-main">
      <div class="container">
        <div v-if="pageLoading" class="loading-state">
          <i class="fa-solid fa-spinner fa-spin" style="font-size:28px;color:#808080;"></i>
        </div>

        <div v-else class="profile-layout">
          <!-- ── Sidebar ── -->
          <aside class="sidebar">
            <button
              v-for="tab in tabs"
              :key="tab.key"
              class="sidebar-item"
              :class="{ active: activeTab === tab.key, 'is-logout': tab.key === 'logout' }"
              @click="handleTab(tab.key)"
            >
              {{ tab.label }}
            </button>
          </aside>

          <!-- ── Personal Information ── -->
          <section v-if="activeTab === 'personal'" class="panel">
            <div class="avatar-area">
              <div class="avatar">
                <img v-if="profilePicture" :src="profilePicture" alt="Profile picture" class="avatar-img" />
                <i v-else class="fa-solid fa-user avatar-icon"></i>
              </div>
            </div>

            <form @submit.prevent="saveProfile">
              <div class="field-row">
                <div class="field">
                  <label>First Name <span class="req">*</span></label>
                  <input v-model="profile.firstName" type="text" placeholder="First name" maxlength="60" />
                </div>
                <div class="field">
                  <label>Last Name <span class="req">*</span></label>
                  <input v-model="profile.lastName" type="text" placeholder="Last name" maxlength="60" />
                </div>
              </div>

              <div class="field">
                <label>Email <span class="req">*</span></label>
                <input v-model="profile.email" type="email" placeholder="example@gmail.com" />
              </div>

              <div class="field">
                <label>Phone <span class="req">*</span></label>
                <input v-model="profile.phone" type="tel" placeholder="+0123-456-789" maxlength="20" />
              </div>

              <div class="field">
                <label>Username</label>
                <input :value="profile.username" type="text" disabled class="input-disabled" />
                <p class="field-hint">Username cannot be changed.</p>
              </div>

              <div v-if="profileMsg" class="msg" :class="profileMsgType === 'ok' ? 'msg-ok' : 'msg-err'">
                <i :class="profileMsgType === 'ok' ? 'fa-solid fa-check' : 'fa-solid fa-triangle-exclamation'"></i>
                {{ profileMsg }}
              </div>

              <button type="submit" class="update-btn" :disabled="profileSaving">
                {{ profileSaving ? 'Saving…' : 'Update Changes' }}
              </button>
            </form>
          </section>

          <!-- ── My Orders ── -->
          <section v-else-if="activeTab === 'orders'" class="panel panel-center">
            <i class="fa-solid fa-bag-shopping panel-icon"></i>
            <p class="panel-label">View your order history and track deliveries.</p>
            <RouterLink to="/order-history" class="update-btn" style="text-decoration:none;">
              Go to My Orders
            </RouterLink>
          </section>

          <!-- ── Manage Address ── -->
          <section v-else-if="activeTab === 'address'" class="panel panel-center">
            <i class="fa-solid fa-location-dot panel-icon"></i>
            <p class="panel-label">Shipping address is entered at checkout for each order.</p>
            <RouterLink to="/order-history" class="update-btn" style="text-decoration:none;">
              View Orders
            </RouterLink>
          </section>

          <!-- ── Payment Method ── -->
          <section v-else-if="activeTab === 'payment'" class="panel panel-center">
            <i class="fa-solid fa-credit-card panel-icon"></i>
            <p class="panel-label">Payment is handled securely at checkout via Stripe.</p>
          </section>

          <!-- ── Password Manager ── -->
          <section v-else-if="activeTab === 'password'" class="panel">
            <h2 class="panel-title">Change Password</h2>
            <form @submit.prevent="changePassword">
              <div class="field">
                <label>Current Password</label>
                <div class="input-wrap">
                  <input
                    v-model="pwd.current"
                    :type="showCurrent ? 'text' : 'password'"
                    placeholder="Enter current password"
                    autocomplete="current-password"
                  />
                  <button type="button" class="eye-btn" @click="showCurrent = !showCurrent">
                    <i :class="showCurrent ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'"></i>
                  </button>
                </div>
              </div>

              <div class="field">
                <label>New Password</label>
                <div class="input-wrap">
                  <input
                    v-model="pwd.newPwd"
                    :type="showNew ? 'text' : 'password'"
                    placeholder="At least 8 characters"
                    autocomplete="new-password"
                    minlength="8"
                  />
                  <button type="button" class="eye-btn" @click="showNew = !showNew">
                    <i :class="showNew ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'"></i>
                  </button>
                </div>
              </div>

              <div v-if="pwdMsg" class="msg" :class="pwdMsgType === 'ok' ? 'msg-ok' : 'msg-err'">
                <i :class="pwdMsgType === 'ok' ? 'fa-solid fa-check' : 'fa-solid fa-triangle-exclamation'"></i>
                {{ pwdMsg }}
              </div>

              <button type="submit" class="update-btn" :disabled="pwdSaving">
                {{ pwdSaving ? 'Updating…' : 'Update Password' }}
              </button>
            </form>
          </section>
        </div>
      </div>
    </main>

    <AppFooter :footer-columns="footerColumns" :social-links="socialLinks" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import { getFooterColumns, getNavLinks, getSocialLinks } from '@/services/homeService'
import type { FooterColumn, NavLink, SocialLink } from '@/types/home'
import { readStorage } from '@/utils/storage'
import { api, clearTokens } from '@/services/apiClient'

// ─── Backend DTO shape ────────────────────────────────────────────────────────
interface UserProfileDTO {
  id: number
  username: string
  email: string
  fullName: string | null
  phone: string | null
  profilePicture: string | null
  roles: string[]
}

const router = useRouter()

const navLinks      = ref<NavLink[]>([])
const footerColumns = ref<FooterColumn[]>([])
const socialLinks   = ref<SocialLink[]>([])
const cartItems     = ref<Array<{ id: number; quantity: number }>>([])
const cartCount     = computed(() => cartItems.value.reduce((s, i) => s + i.quantity, 0))
const pageLoading   = ref(true)
const profilePicture = ref<string | null>(null)

// ─── Sidebar tabs ─────────────────────────────────────────────────────────────
type TabKey = 'personal' | 'orders' | 'address' | 'payment' | 'password' | 'logout'

const tabs: { key: TabKey; label: string }[] = [
  { key: 'personal', label: 'Personal Information' },
  { key: 'orders',   label: 'My Orders' },
  { key: 'address',  label: 'Manage Address' },
  { key: 'payment',  label: 'Payment Method' },
  { key: 'password', label: 'Password Manager' },
  { key: 'logout',   label: 'Logout' },
]

const activeTab = ref<TabKey>('personal')

function handleTab(key: TabKey) {
  if (key === 'logout') { doLogout(); return }
  activeTab.value = key
}

async function doLogout() {
  try { await api.post('/api/auth/logout', {}) } catch { /* ignore */ }
  clearTokens()
  router.push('/login')
}

// ─── Personal Information ─────────────────────────────────────────────────────
const profile = reactive({
  username: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
})

const profileSaving  = ref(false)
const profileMsg     = ref('')
const profileMsgType = ref<'ok' | 'err'>('ok')

async function saveProfile() {
  profileMsg.value = ''
  profileSaving.value = true
  try {
    const updated = await api.put<UserProfileDTO>('/api/users/profile', {
      fullName: [profile.firstName, profile.lastName].filter(Boolean).join(' ') || null,
      phone: profile.phone || null,
      email: profile.email || null,
    })
    // Refresh fields from what the server returned
    applyDTO(updated)
    profileMsg.value = 'Profile updated successfully.'
    profileMsgType.value = 'ok'
  } catch (e: unknown) {
    profileMsg.value = e instanceof Error ? e.message : 'Failed to update profile.'
    profileMsgType.value = 'err'
  } finally {
    profileSaving.value = false
  }
}

// ─── Password Manager ─────────────────────────────────────────────────────────
const pwd = reactive({ current: '', newPwd: '' })
const pwdSaving   = ref(false)
const pwdMsg      = ref('')
const pwdMsgType  = ref<'ok' | 'err'>('ok')
const showCurrent = ref(false)
const showNew     = ref(false)

async function changePassword() {
  pwdMsg.value = ''
  if (!pwd.current || !pwd.newPwd) {
    pwdMsg.value = 'Both fields are required.'
    pwdMsgType.value = 'err'
    return
  }
  if (pwd.newPwd.length < 8) {
    pwdMsg.value = 'New password must be at least 8 characters.'
    pwdMsgType.value = 'err'
    return
  }
  pwdSaving.value = true
  try {
    await api.post('/api/auth/change-password', {
      currentPassword: pwd.current,
      newPassword: pwd.newPwd,
    })
    pwdMsg.value = 'Password updated. Redirecting to login…'
    pwdMsgType.value = 'ok'
    pwd.current = ''
    pwd.newPwd = ''
    setTimeout(() => router.push('/login'), 2000)
  } catch (e: unknown) {
    pwdMsg.value = e instanceof Error ? e.message : 'Failed to update password.'
    pwdMsgType.value = 'err'
  } finally {
    pwdSaving.value = false
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function applyDTO(dto: UserProfileDTO) {
  const parts = (dto.fullName ?? '').trim().split(/\s+/)
  profile.username  = dto.username ?? ''
  profile.firstName = parts[0] ?? ''
  profile.lastName  = parts.slice(1).join(' ')
  profile.email     = dto.email ?? ''
  profile.phone     = dto.phone ?? ''
  profilePicture.value = dto.profilePicture ?? null
}

// ─── Boot ─────────────────────────────────────────────────────────────────────
onMounted(async () => {
  cartItems.value = readStorage<Array<{ id: number; quantity: number }>>('cartItems', [])

  const [nav, footer, social] = await Promise.all([
    getNavLinks(),
    getFooterColumns(),
    getSocialLinks(),
  ])
  navLinks.value      = nav
  footerColumns.value = footer
  socialLinks.value   = social

  try {
    const dto = await api.get<UserProfileDTO>('/api/users/profile')
    applyDTO(dto)
  } catch {
    // 401 → apiClient redirects to login automatically
  } finally {
    pageLoading.value = false
  }
})
</script>

<style scoped>
* { box-sizing: border-box; }

.profile-page {
  min-height: 100vh;
  background: #fff;
  color: #000;
  font-family: Helvetica, Arial, sans-serif;
}

.container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 20px;
}

.profile-main { padding: 60px 0 60px; }

/* ── Loading ── */
.loading-state {
  display: flex;
  justify-content: center;
  padding: 80px 0;
}

/* ── Layout ── */
.profile-layout {
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: 20px;
  align-items: start;
}

/* ── Sidebar ── */
.sidebar {
  background: #fff;
  border: 1px solid #AABBAA;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: rgba(0,0,0,0.05) 0 2px 4px;
}

.sidebar-item {
  display: block;
  width: 100%;
  padding: 14px 20px;
  text-align: left;
  font-size: 14px;
  font-weight: 500;
  color: #000;
  background: none;
  border: none;
  border-bottom: 1px solid #AABBAA;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
  font-family: Helvetica, Arial, sans-serif;
}
.sidebar-item:last-child { border-bottom: none; }
.sidebar-item:hover:not(.active) { background: #f5f5f5; }
.sidebar-item.active {
  background: #000;
  color: #fff;
  font-weight: 700;
}
.sidebar-item.is-logout { color: #DA292E; }
.sidebar-item.is-logout:hover { background: #fff1f2; }

/* ── Panel ── */
.panel {
  background: #fff;
  border: 1px solid #AABBAA;
  border-radius: 4px;
  padding: 28px;
  box-shadow: rgba(0,0,0,0.05) 0 2px 4px;
}

.panel-title {
  margin: 0 0 20px;
  font-size: 18px;
  font-weight: 700;
  color: #000;
}

.panel-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 56px 28px;
  gap: 12px;
}

.panel-icon { font-size: 40px; color: #808080; }
.panel-label { margin: 0; color: #808080; font-size: 14px; }

/* ── Avatar ── */
.avatar-area { margin-bottom: 24px; }

.avatar {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  background: #f5f5f5;
  border: 1px solid #AABBAA;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.avatar-img { width: 100%; height: 100%; object-fit: cover; }

.avatar-icon { font-size: 40px; color: #808080; }

/* ── Fields ── */
.field-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 16px;
}

.field label {
  font-size: 13px;
  font-weight: 700;
  color: #000;
  letter-spacing: 0.04em;
}

.req { color: #DA292E; }

.field input {
  height: 44px;
  padding: 0 14px;
  border: 1px solid #808080;
  border-radius: 4px;
  font-size: 14px;
  font-family: Helvetica, Arial, sans-serif;
  color: #000;
  background: #fff;
  outline: none;
  transition: border-color 0.15s;
}
.field input:focus { border-color: #1890FF; box-shadow: 0 0 0 2px rgba(24,144,255,0.15); }

.input-disabled {
  background: #f5f5f5 !important;
  color: #808080 !important;
  cursor: not-allowed;
}

.field-hint { margin: 0; font-size: 12px; color: #808080; }

.input-wrap { position: relative; display: flex; align-items: center; }
.input-wrap input { flex: 1; padding-right: 42px; }

.eye-btn {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  color: #808080;
  display: flex;
  align-items: center;
}
.eye-btn:hover { color: #1890FF; }

/* ── Messages ── */
.msg {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 16px;
}
.msg-ok  { background: #f0fdf4; color: #16a34a; }
.msg-err { background: #fff1f2; color: #DA292E; }

/* ── Button ── */
.update-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 44px;
  padding: 0 28px;
  border: none;
  border-radius: 4px;
  background: #000;
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  font-family: Helvetica, Arial, sans-serif;
  transition: background 0.15s;
  text-decoration: none;
}
.update-btn:hover:not(:disabled) { background: #211E1E; }
.update-btn:disabled { opacity: 0.5; cursor: not-allowed; box-shadow: none; }

/* ── Responsive ── */
@media (max-width: 780px) {
  .profile-layout { grid-template-columns: 1fr; }
  .sidebar { display: flex; flex-wrap: wrap; }
  .sidebar-item {
    flex: 1 1 auto;
    border-bottom: none;
    border-right: 1px solid #AABBAA;
    text-align: center;
    padding: 12px 8px;
    font-size: 12px;
  }
  .sidebar-item:last-child { border-right: none; }
  .field-row { grid-template-columns: 1fr; gap: 0; }
}
</style>
