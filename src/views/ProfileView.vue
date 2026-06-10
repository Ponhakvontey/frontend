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
              :class="{ active: activeTab === tab.key, 'is-logout': tab.key === 'logout', 'is-delete': tab.key === 'delete' }"
              @click="handleTab(tab.key)"
            >
              <i :class="`fa-solid ${tab.icon} sidebar-tab-icon`"></i>
              {{ tab.label }}
            </button>
          </aside>

          <!-- ── Personal Information ── -->
          <section v-if="activeTab === 'personal'" class="panel">
            <h2 class="panel-title">Personal Information</h2>

            <div class="avatar-area">
              <div class="avatar">
                <img v-if="profilePicture" :src="profilePicture" alt="Profile picture" class="avatar-img" />
                <span v-else class="avatar-initials">{{ avatarInitials }}</span>
              </div>
              <div v-if="profilePicture" class="avatar-meta">
                <p class="avatar-hint">Photo from your Google account.</p>
              </div>
            </div>

            <form @submit.prevent="saveProfile">
              <div class="field-row">
                <div class="field">
                  <label>First Name <span class="req">*</span></label>
                  <input v-model="profile.firstName" type="text" placeholder="First name" maxlength="60" />
                </div>
                <div class="field">
                  <label>Last Name</label>
                  <input v-model="profile.lastName" type="text" placeholder="Last name" maxlength="60" />
                </div>
              </div>

              <div class="field">
                <label>Email <span class="req">*</span></label>
                <input v-model="profile.email" type="email" placeholder="example@gmail.com" />
                <p class="field-hint">Used for login and order notifications.</p>
              </div>

              <div class="field">
                <label>Phone</label>
                <input v-model="profile.phone" type="tel" placeholder="+0123-456-789" maxlength="20" />
              </div>

              <div class="addr-row">
                <div class="field">
                  <label>Delivery Address <span class="req">*</span></label>
                  <div class="address-input-wrap">
                    <input
                      ref="addressInputRef"
                      v-model="profile.address"
                      type="text"
                      placeholder="e.g. 123 Street, Sangkat Toul Kork"
                      maxlength="200"
                      autocomplete="off"
                    />
                    <button type="button" class="location-btn" :disabled="locating" title="Use current location" @click="useCurrentLocation">
                      <i v-if="locating" class="fa-solid fa-spinner fa-spin"></i>
                      <i v-else class="fa-solid fa-location-crosshairs"></i>
                    </button>
                  </div>
                  <p v-if="locationError" class="field-hint" style="color:#DA292E">{{ locationError }}</p>
                </div>

                <div class="field">
                  <label>City</label>
                  <input v-model="profile.city" type="text" placeholder="e.g. Phnom Penh" maxlength="100" />
                </div>
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

          <!-- ── History ── -->
          <section v-else-if="activeTab === 'history'" class="panel">
            <h2 class="panel-title">Order History</h2>

            <div v-if="historyLoading" class="panel-loading">
              <i class="fa-solid fa-spinner fa-spin"></i>
            </div>

            <div v-else-if="!historyOrders.length" class="panel-empty">
              <i class="fa-regular fa-folder-open" style="font-size:36px;"></i>
              <p>No completed orders yet.</p>
            </div>

            <div v-else class="history-list">
              <article v-for="order in historyOrders" :key="order.id" class="hist-card">
                <div class="hist-top">
                  <div>
                    <p class="hist-ref">Order #{{ order.id }}</p>
                    <p class="hist-date">{{ fmtDate(order.orderDate) }}</p>
                  </div>
                  <div class="hist-right">
                    <span class="status-pill" :class="pillClass(order.status)">{{ order.status }}</span>
                    <strong class="hist-total">{{ fmtMoney(order.totalAmount) }}</strong>
                  </div>
                </div>
                <div v-if="order.items?.length" class="hist-thumbs">
                  <img
                    v-for="item in order.items.slice(0, 4)"
                    :key="item.id"
                    :src="item.productImageUrl || ''"
                    :alt="item.productName"
                    class="hist-thumb"
                  />
                </div>
                <div class="hist-footer">
                  <RouterLink :to="`/invoice/${order.id}`" class="hist-invoice-btn">
                    <i class="fa-regular fa-file-lines"></i> View Invoice
                  </RouterLink>
                </div>
              </article>
            </div>
          </section>

          <!-- ── Delete Account ── -->
          <section v-else-if="activeTab === 'delete'" class="panel">
            <h2 class="panel-title">Delete Account</h2>
            <div class="danger-zone">
              <p class="danger-text">
                This action is <strong>permanent and irreversible</strong>. Your profile, wishlist,
                and cart will be deleted. Order records are kept for business history but unlinked from your account.
              </p>

              <div v-if="!deleteConfirming">
                <button type="button" class="danger-btn" @click="deleteConfirming = true">
                  I understand, delete my account
                </button>
              </div>

              <div v-else class="delete-confirm-box">
                <p class="danger-text" style="margin-bottom:8px;">Type <strong>DELETE</strong> to confirm:</p>
                <input v-model="deleteConfirmText" type="text" class="delete-input" placeholder="DELETE" />
                <div class="delete-actions">
                  <button type="button" class="cancel-del-btn" @click="deleteConfirming = false; deleteConfirmText = ''">
                    Cancel
                  </button>
                  <button
                    type="button"
                    class="danger-btn"
                    :disabled="deleteConfirmText !== 'DELETE' || deleteLoading"
                    @click="doDeleteAccount"
                  >
                    {{ deleteLoading ? 'Deleting…' : 'Permanently Delete' }}
                  </button>
                </div>
              </div>

              <div v-if="deleteError" class="msg msg-err" style="margin-top:16px;">
                <i class="fa-solid fa-triangle-exclamation"></i>
                {{ deleteError }}
              </div>
            </div>
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
                    placeholder="Min 8 chars, upper, lower, number, symbol"
                    autocomplete="new-password"
                  />
                  <button type="button" class="eye-btn" @click="showNew = !showNew">
                    <i :class="showNew ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'"></i>
                  </button>
                </div>
              </div>

              <div class="field">
                <label>Confirm New Password</label>
                <div class="input-wrap">
                  <input
                    v-model="pwd.confirmPwd"
                    :type="showConfirm ? 'text' : 'password'"
                    placeholder="Repeat new password"
                    autocomplete="new-password"
                  />
                  <button type="button" class="eye-btn" @click="showConfirm = !showConfirm">
                    <i :class="showConfirm ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'"></i>
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
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import { getFooterColumns, getNavLinks, getSocialLinks } from '@/services/homeService'
import type { FooterColumn, NavLink, SocialLink } from '@/types/home'
import { api, clearTokens } from '@/services/apiClient'
import { useCartSidebar } from '@/composables/useCartSidebar'
import { validateEmail, validatePassword, validateRequired } from '@/utils/validation'

// ─── Backend DTO shape ────────────────────────────────────────────────────────
interface UserProfileDTO {
  id: number
  username: string
  email: string
  fullName: string | null
  phone: string | null
  address: string | null
  city: string | null
  profilePicture: string | null
  roles: string[]
}

const router = useRouter()

const navLinks      = ref<NavLink[]>([])
const footerColumns = ref<FooterColumn[]>([])
const socialLinks   = ref<SocialLink[]>([])
const { state: cartState } = useCartSidebar()
const cartCount     = computed(() => cartState.items.reduce((s, i) => s + i.quantity, 0))
const pageLoading   = ref(true)
const profilePicture = ref<string | null>(null)

// ─── Sidebar tabs ─────────────────────────────────────────────────────────────
type TabKey = 'personal' | 'orders' | 'history' | 'password' | 'delete' | 'logout'

const tabs: { key: TabKey; label: string; icon: string }[] = [
  { key: 'personal', label: 'Personal Info',  icon: 'fa-user' },
  { key: 'orders',   label: 'My Orders',      icon: 'fa-bag-shopping' },
  { key: 'history',  label: 'History',        icon: 'fa-clock-rotate-left' },
  { key: 'password', label: 'Password',       icon: 'fa-lock' },
  { key: 'delete',   label: 'Delete Account', icon: 'fa-trash' },
  { key: 'logout',   label: 'Logout',         icon: 'fa-right-from-bracket' },
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
  address: '',
  city: '',
})

const avatarInitials = computed(() => {
  const f = profile.firstName?.[0]?.toUpperCase() ?? ''
  const l = profile.lastName?.[0]?.toUpperCase() ?? ''
  return f + l || '?'
})

const profileSaving  = ref(false)
const profileMsg     = ref('')
const profileMsgType = ref<'ok' | 'err'>('ok')
let profileMsgTimer: ReturnType<typeof setTimeout> | null = null
let pwdMsgTimer:     ReturnType<typeof setTimeout> | null = null
let navTimer:        ReturnType<typeof setTimeout> | null = null

// ─── Address autofill ─────────────────────────────────────────────────────────
const addressInputRef = ref<HTMLInputElement | null>(null)
const locating        = ref(false)
const locationError   = ref('')

async function useCurrentLocation() {
  if (!navigator.geolocation) {
    locationError.value = 'Geolocation is not supported by your browser.'
    return
  }
  locating.value = true
  locationError.value = ''
  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      try {
        const { latitude: lat, longitude: lon } = pos.coords
        const res  = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
          { headers: { 'Accept-Language': 'en' } }
        )
        const data = await res.json()
        const addr = data.address ?? {}
        const street = [addr.house_number, addr.road].filter(Boolean).join(' ')
        const area   = addr.neighbourhood || addr.suburb || addr.village || ''
        profile.address = [street, area].filter(Boolean).join(', ') || data.display_name || ''
        profile.city    = addr.city || addr.town || addr.county || ''
      } catch {
        locationError.value = 'Could not retrieve address. Please enter it manually.'
      } finally {
        locating.value = false
      }
    },
    (err) => {
      locating.value = false
      locationError.value = err.code === 1
        ? 'Location access denied. Please enter your address manually.'
        : 'Could not get your location. Please enter it manually.'
    },
    { timeout: 10000 }
  )
}

function initGooglePlaces() {
  const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined
  if (!key || !addressInputRef.value) return

  const setup = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const g = (window as any).google
    if (!g || !addressInputRef.value) return
    const ac = new g.maps.places.Autocomplete(addressInputRef.value, {
      types: ['address'],
      fields: ['address_components', 'formatted_address'],
    })
    ac.addListener('place_changed', () => {
      const place = ac.getPlace()
      if (!place.address_components) return
      let number = '', route = '', city = '', sub = ''
      for (const c of place.address_components as { long_name: string; types: string[] }[]) {
        const t = c.types[0]
        if      (t === 'street_number')                        number = c.long_name
        else if (t === 'route')                                route  = c.long_name
        else if (t === 'locality')                             city   = c.long_name
        else if (t === 'administrative_area_level_1' && !city) city   = c.long_name
        else if (t === 'sublocality_level_1')                  sub    = c.long_name
      }
      profile.address = [[number, route].filter(Boolean).join(' '), sub].filter(Boolean).join(', ')
                        || place.formatted_address || ''
      profile.city = city
    })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((window as any).google) {
    setup()
  } else {
    const script = document.createElement('script')
    script.src   = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places`
    script.async = true
    script.onload = setup
    document.head.appendChild(script)
  }
}

function showProfileMsg(msg: string, type: 'ok' | 'err') {
  profileMsg.value     = msg
  profileMsgType.value = type
  if (profileMsgTimer) clearTimeout(profileMsgTimer)
  if (type === 'ok') profileMsgTimer = setTimeout(() => { profileMsg.value = '' }, 4000)
}

async function saveProfile() {
  profileMsg.value = ''

  const firstNameErr = validateRequired(profile.firstName, 'First name')
  const emailErr     = validateEmail(profile.email)
  const addressErr   = validateRequired(profile.address, 'Address')
  if (firstNameErr || emailErr || addressErr) {
    showProfileMsg(firstNameErr || emailErr || addressErr, 'err')
    return
  }

  profileSaving.value = true
  try {
    const updated = await api.put<UserProfileDTO>('/api/users/profile', {
      fullName: [profile.firstName, profile.lastName].filter(Boolean).join(' ') || null,
      phone:    profile.phone   || null,
      email:    profile.email   || null,
      address:  profile.address || null,
      city:     profile.city    || null,
    })
    applyDTO(updated)
    showProfileMsg('Profile updated successfully.', 'ok')
  } catch (e: unknown) {
    showProfileMsg(e instanceof Error ? e.message : 'Failed to update profile.', 'err')
  } finally {
    profileSaving.value = false
  }
}

// ─── Password Manager ─────────────────────────────────────────────────────────
const pwd = reactive({ current: '', newPwd: '', confirmPwd: '' })
const pwdSaving     = ref(false)
const pwdMsg        = ref('')
const pwdMsgType    = ref<'ok' | 'err'>('ok')
const showCurrent   = ref(false)
const showNew       = ref(false)
const showConfirm   = ref(false)

function showPwdMsg(msg: string, type: 'ok' | 'err') {
  pwdMsg.value     = msg
  pwdMsgType.value = type
  if (pwdMsgTimer) clearTimeout(pwdMsgTimer)
  if (type === 'ok') pwdMsgTimer = setTimeout(() => { pwdMsg.value = '' }, 4000)
}

async function changePassword() {
  pwdMsg.value = ''
  if (!pwd.current) {
    showPwdMsg('Current password is required.', 'err'); return
  }
  const policyErr = validatePassword(pwd.newPwd)
  if (policyErr) {
    showPwdMsg(policyErr, 'err'); return
  }
  if (pwd.newPwd !== pwd.confirmPwd) {
    showPwdMsg('New passwords do not match.', 'err'); return
  }
  pwdSaving.value = true
  try {
    await api.post('/api/auth/change-password', {
      currentPassword: pwd.current,
      newPassword:     pwd.newPwd,
    })
    showPwdMsg('Password updated. Redirecting to login…', 'ok')
    pwd.current = ''
    pwd.newPwd = ''
    pwd.confirmPwd = ''
    if (navTimer) clearTimeout(navTimer)
    navTimer = setTimeout(() => router.push('/login'), 2000)
  } catch (e: unknown) {
    showPwdMsg(e instanceof Error ? e.message : 'Failed to update password.', 'err')
  } finally {
    pwdSaving.value = false
  }
}

// ─── History ──────────────────────────────────────────────────────────────────
interface HistOrderItem { id: number; productName: string; productImageUrl: string }
interface HistOrder { id: number; orderDate: string; status: string; totalAmount: number; items: HistOrderItem[] }

const historyOrders  = ref<HistOrder[]>([])
const historyLoading = ref(false)
let   historyLoaded  = false

async function loadHistory() {
  if (historyLoaded) return
  historyLoading.value = true
  try {
    const res = await api.get<{ content: HistOrder[] }>('/api/orders/my?page=0&size=100')
    const done = new Set(['DELIVERED', 'REFUNDED', 'CANCELLED'])
    historyOrders.value = (res.content ?? []).filter(o => done.has(o.status))
    historyLoaded = true
  } catch { /* show empty */ }
  finally { historyLoading.value = false }
}

function fmtDate(iso: string) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}
function fmtMoney(v: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v)
}
function pillClass(status: string): string {
  return ({ PENDING: 'pill-amber', PAID: 'pill-blue', SHIPPED: 'pill-purple',
            DELIVERED: 'pill-green', CANCELLED: 'pill-red', RETURN_REQUESTED: 'pill-amber',
            REFUNDED: 'pill-gray' } as Record<string, string>)[status] ?? 'pill-gray'
}

watch(activeTab, (tab) => { if (tab === 'history') loadHistory() })

// ─── Delete Account ───────────────────────────────────────────────────────────
const deleteConfirming  = ref(false)
const deleteConfirmText = ref('')
const deleteLoading     = ref(false)
const deleteError       = ref('')

async function doDeleteAccount() {
  if (deleteConfirmText.value !== 'DELETE') return
  deleteLoading.value = true
  deleteError.value   = ''
  try {
    await api.delete('/api/users/profile')
    clearTokens()
    router.push('/')
  } catch (e: unknown) {
    deleteError.value   = e instanceof Error ? e.message : 'Failed to delete account.'
    deleteLoading.value = false
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
  profile.address   = dto.address ?? ''
  profile.city      = dto.city ?? ''
  profilePicture.value = dto.profilePicture ?? null
}

// ─── Boot ─────────────────────────────────────────────────────────────────────
onMounted(async () => {
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

  initGooglePlaces()
})

onBeforeUnmount(() => {
  if (profileMsgTimer) clearTimeout(profileMsgTimer)
  if (pwdMsgTimer)     clearTimeout(pwdMsgTimer)
  if (navTimer)        clearTimeout(navTimer)
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
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 13px 18px;
  text-align: left;
  font-size: 13.5px;
  font-weight: 500;
  color: #000;
  background: none;
  border: none;
  border-bottom: 1px solid #AABBAA;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
  font-family: Helvetica, Arial, sans-serif;
}

.sidebar-tab-icon { width: 16px; text-align: center; flex-shrink: 0; opacity: 0.7; }
.sidebar-item:last-child { border-bottom: none; }
.sidebar-item:hover:not(.active) { background: #f5f5f5; }
.sidebar-item.active {
  background: #000;
  color: #fff;
  font-weight: 700;
}
.sidebar-item.is-logout { color: #DA292E; }
.sidebar-item.is-logout:hover:not(.active) { background: #fff1f2; }
.sidebar-item.is-delete { color: #DA292E; }
.sidebar-item.is-delete:hover:not(.active) { background: #fff1f2; }

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
.avatar-area { display: flex; align-items: center; gap: 16px; margin-bottom: 28px; }

.avatar {
  flex-shrink: 0;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #f5f5f5;
  border: 1px solid #AABBAA;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.avatar-img { width: 100%; height: 100%; object-fit: cover; }

.avatar-initials {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #1a1a1a;
  color: #fff;
  font-size: 26px;
  font-weight: 700;
  letter-spacing: 0.04em;
}

.avatar-meta { display: flex; flex-direction: column; gap: 4px; }
.avatar-hint { margin: 0; font-size: 12px; color: #808080; }

/* ── Fields ── */
.field-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
}

.field-row .field,
.addr-row .field { margin-bottom: 0; }

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

.addr-row {
  display: grid;
  grid-template-columns: 3fr 2fr;
  gap: 16px;
  margin-bottom: 16px;
}

.address-input-wrap { position: relative; display: flex; align-items: center; }
.address-input-wrap input { flex: 1; padding-right: 44px; }

.location-btn {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  color: #808080;
  display: flex;
  align-items: center;
  font-size: 16px;
  transition: color 0.15s;
}
.location-btn:hover:not(:disabled) { color: #1890FF; }
.location-btn:disabled { opacity: 0.4; cursor: not-allowed; }

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

/* ── Status pills (used in history) ── */
.status-pill {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
.pill-amber  { background: #fffbeb; color: #d97706; }
.pill-blue   { background: #e6f4ff; color: #1890FF; }
.pill-purple { background: #f5f3ff; color: #7c3aed; }
.pill-green  { background: #f0fdf4; color: #16a34a; }
.pill-red    { background: #fff1f2; color: #DA292E; }
.pill-gray   { background: #f5f5f5; color: #808080; }

/* ── Panel states ── */
.panel-loading { display: flex; justify-content: center; padding: 48px 0; color: #808080; font-size: 28px; }
.panel-empty { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 48px 0; color: #808080; font-size: 14px; text-align: center; }

/* ── History ── */
.history-list { display: flex; flex-direction: column; gap: 12px; }

.hist-card {
  border: 1px solid #AABBAA;
  border-radius: 4px;
  padding: 16px;
  background: #fff;
  box-shadow: rgba(0,0,0,0.04) 0 2px 4px;
}

.hist-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;
}
.hist-ref  { margin: 0 0 3px; font-size: 12px; font-weight: 700; color: #808080; text-transform: uppercase; letter-spacing: 0.08em; }
.hist-date { margin: 0; font-size: 13px; color: #808080; }
.hist-right { display: flex; flex-direction: column; align-items: flex-end; gap: 6px; flex-shrink: 0; }
.hist-total { font-size: 16px; font-weight: 700; color: #000; }

.hist-thumbs { display: flex; gap: 8px; margin-bottom: 12px; flex-wrap: wrap; }
.hist-thumb { width: 52px; height: 52px; border-radius: 4px; object-fit: cover; border: 1px solid #AABBAA; background: #f5f5f5; }

.hist-footer { border-top: 1px solid #f0f0f0; padding-top: 10px; }
.hist-invoice-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 32px;
  padding: 0 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 700;
  color: #000;
  border: 1px solid #000;
  text-decoration: none;
  transition: background 0.15s;
  font-family: Helvetica, Arial, sans-serif;
}
.hist-invoice-btn:hover { background: #f5f5f5; }

/* ── Danger zone (delete account) ── */
.danger-zone {
  border: 1px solid #fecaca;
  border-radius: 4px;
  padding: 24px;
  background: #fff5f5;
}
.danger-text { margin: 0 0 16px; font-size: 14px; color: #7f1d1d; line-height: 1.6; }
.danger-btn {
  height: 40px;
  padding: 0 20px;
  border: none;
  border-radius: 4px;
  background: #DA292E;
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  font-family: Helvetica, Arial, sans-serif;
  transition: background 0.15s;
}
.danger-btn:hover:not(:disabled) { background: #b91c1c; }
.danger-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.delete-confirm-box { display: flex; flex-direction: column; gap: 12px; }
.delete-input {
  height: 40px;
  padding: 0 12px;
  border: 1px solid #fca5a5;
  border-radius: 4px;
  font-size: 14px;
  font-family: Helvetica, Arial, sans-serif;
  color: #000;
  background: #fff;
  outline: none;
  max-width: 200px;
}
.delete-input:focus { border-color: #DA292E; }
.delete-actions { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
.cancel-del-btn {
  height: 40px;
  padding: 0 20px;
  border: 1px solid #808080;
  border-radius: 4px;
  background: #fff;
  color: #000;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  font-family: Helvetica, Arial, sans-serif;
  transition: background 0.15s;
}
.cancel-del-btn:hover { background: #f5f5f5; }

/* ── Mobile responsive ── */
@media (max-width: 768px) {
  .profile-main { padding: 70px 0 40px; }

  .profile-layout {
    grid-template-columns: 1fr;
    gap: 0;
  }

  /* Sidebar becomes a horizontal scrollable tab strip */
  .sidebar {
    display: flex;
    flex-direction: row;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    border-bottom: 1px solid #AABBAA;
    border-radius: 0;
    box-shadow: none;
    position: sticky;
    top: 50px;
    z-index: 10;
    background: #fff;
  }
  .sidebar::-webkit-scrollbar { display: none; }

  .sidebar-item {
    flex-shrink: 0;
    width: auto;
    flex-direction: column;
    gap: 4px;
    padding: 10px 14px;
    border-bottom: 3px solid transparent;
    border-right: none;
    font-size: 10px;
    white-space: nowrap;
    text-align: center;
  }
  .sidebar-item.active {
    background: transparent;
    color: #000;
    border-bottom: 3px solid #000;
  }
  .sidebar-item.is-logout.active,
  .sidebar-item.is-delete.active { border-bottom-color: #DA292E; }
  .sidebar-tab-icon { font-size: 15px; }

  .panel { padding: 20px 16px; border-left: none; border-right: none; border-radius: 0; }
  .panel-center { padding: 40px 16px; }

  .field-row,
  .addr-row { grid-template-columns: 1fr; margin-bottom: 0; }
  .field-row .field,
  .addr-row .field { margin-bottom: 16px; }

  .update-btn { width: 100%; }

  .hist-top { flex-direction: column; gap: 8px; }
  .hist-right { align-items: flex-start; flex-direction: row; flex-wrap: wrap; gap: 8px; }
}
</style>
