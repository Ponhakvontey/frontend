<template>
  <div class="profile-page">
    <AppHeader :nav-links="navLinks" :cart-count="cartCount" />

    <main class="profile-main">
      <div class="container">
        <div class="profile-head">
          <p class="eyebrow">MEMBER DASHBOARD</p>
          <h1>My Profile</h1>
          <p class="subtitle">Manage your account information and password.</p>
        </div>

        <div v-if="pageLoading" class="card center-state">
          <i class="fa-solid fa-spinner fa-spin" style="font-size:28px;color:#513B3C;"></i>
          <p>Loading your profile…</p>
        </div>

        <template v-else>
          <!-- Profile info card -->
          <form class="card" @submit.prevent="saveProfile">
            <h2 class="card-title">
              <i class="fa-solid fa-circle-user"></i> Account Details
            </h2>

            <div class="field-row">
              <div class="field">
                <label>Full Name</label>
                <input v-model="profile.fullName" type="text" placeholder="Your full name" maxlength="100" />
              </div>
              <div class="field">
                <label>Phone</label>
                <input v-model="profile.phone" type="tel" placeholder="+855 12 345 678" maxlength="20" />
              </div>
            </div>

            <div class="field">
              <label>Email</label>
              <input v-model="profile.email" type="email" placeholder="your@email.com" />
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

            <button type="submit" class="primary-btn" :disabled="profileSaving">
              <i class="fa-solid fa-floppy-disk"></i>
              {{ profileSaving ? 'Saving…' : 'Save Changes' }}
            </button>
          </form>

          <!-- Change password card -->
          <form class="card" @submit.prevent="changePassword">
            <h2 class="card-title">
              <i class="fa-solid fa-lock"></i> Change Password
            </h2>

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

            <button type="submit" class="primary-btn" :disabled="pwdSaving">
              <i class="fa-solid fa-key"></i>
              {{ pwdSaving ? 'Updating…' : 'Update Password' }}
            </button>
          </form>
        </template>
      </div>
    </main>

    <AppFooter :footer-columns="footerColumns" :social-links="socialLinks" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import { getFooterColumns, getNavLinks, getSocialLinks } from '@/services/homeService'
import type { FooterColumn, NavLink, SocialLink } from '@/types/home'
import { readStorage } from '@/utils/storage'
import { api } from '@/services/apiClient'
import { useRouter } from 'vue-router'

const router = useRouter()

const navLinks      = ref<NavLink[]>([])
const footerColumns = ref<FooterColumn[]>([])
const socialLinks   = ref<SocialLink[]>([])
const cartItems     = ref<Array<{ id: number; quantity: number }>>([])
const cartCount     = computed(() => cartItems.value.reduce((s, i) => s + i.quantity, 0))

const pageLoading = ref(true)

const profile = reactive({
  username: '',
  email: '',
  fullName: '',
  phone: '',
})

const profileSaving  = ref(false)
const profileMsg     = ref('')
const profileMsgType = ref<'ok' | 'err'>('ok')

const pwd = reactive({ current: '', newPwd: '' })
const pwdSaving  = ref(false)
const pwdMsg     = ref('')
const pwdMsgType = ref<'ok' | 'err'>('ok')
const showCurrent = ref(false)
const showNew     = ref(false)

async function saveProfile() {
  profileMsg.value = ''
  profileSaving.value = true
  try {
    await api.put('/api/users/profile', {
      fullName: profile.fullName,
      phone: profile.phone,
      email: profile.email,
    })
    profileMsg.value = 'Profile updated successfully.'
    profileMsgType.value = 'ok'
  } catch (e: unknown) {
    profileMsg.value = e instanceof Error ? e.message : 'Failed to update profile.'
    profileMsgType.value = 'err'
  } finally {
    profileSaving.value = false
  }
}

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
    pwdMsg.value = 'Password updated. Please log in again.'
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

onMounted(async () => {
  cartItems.value = readStorage<Array<{ id: number; quantity: number }>>('cartItems', [])
  const [nav, footer, social] = await Promise.all([getNavLinks(), getFooterColumns(), getSocialLinks()])
  navLinks.value      = nav
  footerColumns.value = footer
  socialLinks.value   = social

  try {
    const res = await api.get<{
      username: string; email: string; fullName: string | null; phone: string | null
    }>('/api/users/profile')
    profile.username = res.username ?? ''
    profile.email    = res.email ?? ''
    profile.fullName = res.fullName ?? ''
    profile.phone    = res.phone ?? ''
  } catch {
    // handled by apiClient (401 → redirect to login)
  } finally {
    pageLoading.value = false
  }
})
</script>

<style scoped>
* { box-sizing: border-box; }

.profile-page {
  min-height: 100vh;
  background: #f7f9fb;
  color: #191c1e;
  font-family: Inter, Arial, sans-serif;
}

.container {
  width: min(720px, 100%);
  margin: 0 auto;
  padding: 0 20px;
}

.profile-main { padding: 40px 0 80px; }

.profile-head { margin-bottom: 28px; }
.eyebrow { margin: 0 0 10px; font-size: 10px; letter-spacing: 0.16em; color: #98a2b3; }
.profile-head h1 { margin: 0 0 8px; font-size: 44px; line-height: 1.08; font-weight: 500; }
.subtitle { margin: 0; color: #667085; }

.card {
  background: #fff;
  border: 1px solid #eef2f6;
  border-radius: 20px;
  padding: 28px;
  margin-bottom: 20px;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 22px;
  font-size: 16px;
  font-weight: 700;
  color: #191c1e;
}
.card-title i { color: #513B3C; }

.center-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 56px 40px;
  text-align: center;
}
.center-state p { margin: 0; color: #667085; }

.field-row { display: flex; gap: 16px; }
.field-row .field { flex: 1; }

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 16px;
}

.field label {
  font-size: 13px;
  font-weight: 600;
  color: #344054;
}

.field input {
  height: 42px;
  padding: 0 14px;
  border: 1px solid #d0d5dd;
  border-radius: 10px;
  font-size: 14px;
  font-family: inherit;
  color: #191c1e;
  outline: none;
  transition: border-color 0.15s;
}
.field input:focus { border-color: #513B3C; }

.input-disabled {
  background: #f8fafc;
  color: #94a3b8;
  cursor: not-allowed;
}

.field-hint { margin: 0; font-size: 12px; color: #98a2b3; }

.input-wrap { position: relative; display: flex; align-items: center; }
.input-wrap input { flex: 1; padding-right: 42px; }

.eye-btn {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  color: #94a3b8;
  display: flex;
  align-items: center;
}
.eye-btn:hover { color: #513B3C; }

.msg {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 16px;
}
.msg-ok  { background: #f0fdf4; color: #16a34a; }
.msg-err { background: #fff1f2; color: #be123c; }

.primary-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 44px;
  padding: 0 24px;
  border: none;
  border-radius: 12px;
  background: #513B3C;
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s, opacity 0.15s;
  font-family: inherit;
}
.primary-btn:hover:not(:disabled) { background: #6b4f50; }
.primary-btn:disabled { opacity: 0.55; cursor: not-allowed; }

@media (max-width: 600px) {
  .field-row { flex-direction: column; gap: 0; }
  .profile-head h1 { font-size: 32px; }
}
</style>
