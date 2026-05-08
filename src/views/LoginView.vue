<template>
  <div class="auth-page">
    <!-- Full-screen background video -->
    <video ref="videoRef" class="bg-video" autoplay muted playsinline @ended="replayVideo">
      <source :src="bgVideo" type="video/mp4" />
    </video>
    <div class="bg-overlay"></div>

    <!-- Floating auth card -->
    <div class="auth-card">
      <!-- Logo -->
      <div class="card-logo">
        <img :src="logo" alt="Ubuyee" />
      </div>

      <!-- Tab switch -->
      <div class="tab-row">
        <button
          class="tab-btn"
          :class="{ active: mode === 'login' }"
          type="button"
          @click="switchMode('login')"
        >
          Sign In
        </button>
        <button
          class="tab-btn"
          :class="{ active: mode === 'register' }"
          type="button"
          @click="switchMode('register')"
        >
          Sign Up
        </button>
      </div>

      <!-- ── LOGIN FORM ── -->
      <Transition name="fade" mode="out-in">
        <form v-if="mode === 'login'" key="login" class="auth-form" @submit.prevent="handleLogin">
          <!-- Email / Username -->
          <div class="field" :class="{ 'field--error': loginErrors.email }">
            <label for="login-email">Email address</label>
            <div class="input-wrap">
              <svg class="input-icon" viewBox="0 0 20 20" fill="none">
                <path d="M2.5 6.5l7.5 5 7.5-5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                <rect x="2" y="4" width="16" height="12" rx="2" stroke="currentColor" stroke-width="1.5"/>
              </svg>
              <input
                id="login-email"
                v-model.trim="loginEmail"
                type="email"
                placeholder="you@example.com"
                autocomplete="email"
              />
            </div>
            <span v-if="loginErrors.email" class="err-msg">{{ loginErrors.email }}</span>
          </div>

          <!-- Password -->
          <div class="field" :class="{ 'field--error': loginErrors.password }">
            <div class="label-row">
              <label for="login-password">Password</label>
              <RouterLink to="/forgot-password" class="forgot-link">Forgot password?</RouterLink>
            </div>
            <div class="input-wrap">
              <svg class="input-icon" viewBox="0 0 20 20" fill="none">
                <rect x="4" y="9" width="12" height="8" rx="2" stroke="currentColor" stroke-width="1.5"/>
                <path d="M7 9V6a3 3 0 116 0v3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
              <input
                id="login-password"
                v-model="loginPassword"
                :type="showLoginPw ? 'text' : 'password'"
                placeholder="••••••••"
                autocomplete="current-password"
              />
              <button type="button" class="eye-btn" @click="showLoginPw = !showLoginPw">
                <svg v-if="!showLoginPw" viewBox="0 0 20 20" fill="none">
                  <path d="M2 10s3-6 8-6 8 6 8 6-3 6-8 6-8-6-8-6z" stroke="currentColor" stroke-width="1.5"/>
                  <circle cx="10" cy="10" r="2.5" stroke="currentColor" stroke-width="1.5"/>
                </svg>
                <svg v-else viewBox="0 0 20 20" fill="none">
                  <path d="M3 3l14 14M8.5 8.7A2.5 2.5 0 0012.3 12.5M5.6 5.8C3.9 7 2.5 9 2.5 10s3 5.5 7.5 5.5a8.5 8.5 0 004-1.1M8 4.6A8.8 8.8 0 0110 4.5c4.5 0 7.5 5.5 7.5 5.5a11 11 0 01-2 2.6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
              </button>
            </div>
            <span v-if="loginErrors.password" class="err-msg">{{ loginErrors.password }}</span>
          </div>

          <p v-if="loginErrors.general" class="general-err">{{ loginErrors.general }}</p>

          <button type="submit" class="submit-btn">Sign In</button>

          <p class="switch-text">
            Don't have an account?
            <button type="button" class="switch-link" @click="switchMode('register')">Sign up</button>
          </p>
        </form>

        <!-- ── REGISTER FORM ── -->
        <form v-else key="register" class="auth-form" @submit.prevent="handleRegister">
          <!-- Full name -->
          <div class="field" :class="{ 'field--error': regErrors.fullName }">
            <label for="reg-name">Full name</label>
            <div class="input-wrap">
              <svg class="input-icon" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="7" r="3" stroke="currentColor" stroke-width="1.5"/>
                <path d="M3 17c0-3.3 3.1-6 7-6s7 2.7 7 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
              <input
                id="reg-name"
                v-model.trim="regFullName"
                type="text"
                placeholder="Alex Johnson"
                autocomplete="name"
              />
            </div>
            <span v-if="regErrors.fullName" class="err-msg">{{ regErrors.fullName }}</span>
          </div>

          <!-- Email -->
          <div class="field" :class="{ 'field--error': regErrors.email }">
            <label for="reg-email">Email address</label>
            <div class="input-wrap">
              <svg class="input-icon" viewBox="0 0 20 20" fill="none">
                <path d="M2.5 6.5l7.5 5 7.5-5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                <rect x="2" y="4" width="16" height="12" rx="2" stroke="currentColor" stroke-width="1.5"/>
              </svg>
              <input
                id="reg-email"
                v-model.trim="regEmail"
                type="email"
                placeholder="you@example.com"
                autocomplete="email"
              />
            </div>
            <span v-if="regErrors.email" class="err-msg">{{ regErrors.email }}</span>
          </div>

          <!-- Password -->
          <div class="field" :class="{ 'field--error': regErrors.password }">
            <label for="reg-password">Password</label>
            <div class="input-wrap">
              <svg class="input-icon" viewBox="0 0 20 20" fill="none">
                <rect x="4" y="9" width="12" height="8" rx="2" stroke="currentColor" stroke-width="1.5"/>
                <path d="M7 9V6a3 3 0 116 0v3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
              <input
                id="reg-password"
                v-model="regPassword"
                :type="showRegPw ? 'text' : 'password'"
                placeholder="Min 8 characters"
                autocomplete="new-password"
              />
              <button type="button" class="eye-btn" @click="showRegPw = !showRegPw">
                <svg v-if="!showRegPw" viewBox="0 0 20 20" fill="none">
                  <path d="M2 10s3-6 8-6 8 6 8 6-3 6-8 6-8-6-8-6z" stroke="currentColor" stroke-width="1.5"/>
                  <circle cx="10" cy="10" r="2.5" stroke="currentColor" stroke-width="1.5"/>
                </svg>
                <svg v-else viewBox="0 0 20 20" fill="none">
                  <path d="M3 3l14 14M8.5 8.7A2.5 2.5 0 0012.3 12.5M5.6 5.8C3.9 7 2.5 9 2.5 10s3 5.5 7.5 5.5a8.5 8.5 0 004-1.1M8 4.6A8.8 8.8 0 0110 4.5c4.5 0 7.5 5.5 7.5 5.5a11 11 0 01-2 2.6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
              </button>
            </div>
            <span v-if="regErrors.password" class="err-msg">{{ regErrors.password }}</span>
          </div>

          <!-- Confirm password -->
          <div class="field" :class="{ 'field--error': regErrors.confirmPassword }">
            <label for="reg-confirm">Confirm password</label>
            <div class="input-wrap">
              <svg class="input-icon" viewBox="0 0 20 20" fill="none">
                <rect x="4" y="9" width="12" height="8" rx="2" stroke="currentColor" stroke-width="1.5"/>
                <path d="M7 9V6a3 3 0 116 0v3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
              <input
                id="reg-confirm"
                v-model="regConfirm"
                :type="showRegConfirm ? 'text' : 'password'"
                placeholder="Repeat password"
                autocomplete="new-password"
              />
              <button type="button" class="eye-btn" @click="showRegConfirm = !showRegConfirm">
                <svg v-if="!showRegConfirm" viewBox="0 0 20 20" fill="none">
                  <path d="M2 10s3-6 8-6 8 6 8 6-3 6-8 6-8-6-8-6z" stroke="currentColor" stroke-width="1.5"/>
                  <circle cx="10" cy="10" r="2.5" stroke="currentColor" stroke-width="1.5"/>
                </svg>
                <svg v-else viewBox="0 0 20 20" fill="none">
                  <path d="M3 3l14 14M8.5 8.7A2.5 2.5 0 0012.3 12.5M5.6 5.8C3.9 7 2.5 9 2.5 10s3 5.5 7.5 5.5a8.5 8.5 0 004-1.1M8 4.6A8.8 8.8 0 0110 4.5c4.5 0 7.5 5.5 7.5 5.5a11 11 0 01-2 2.6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
              </button>
            </div>
            <span v-if="regErrors.confirmPassword" class="err-msg">{{ regErrors.confirmPassword }}</span>
          </div>

          <!-- Terms -->
          <label class="checkbox-label" :class="{ 'field--error': regErrors.agree }">
            <input v-model="regAgree" type="checkbox" />
            <span>
              I agree to the
              <a href="#" class="terms-link">Terms of Service</a>
              and
              <a href="#" class="terms-link">Privacy Policy</a>
            </span>
          </label>
          <span v-if="regErrors.agree" class="err-msg" style="margin-top: -8px">{{ regErrors.agree }}</span>

          <p v-if="regErrors.general" class="general-err">{{ regErrors.general }}</p>

          <button type="submit" class="submit-btn">Create Account</button>

          <p class="switch-text">
            Already have an account?
            <button type="button" class="switch-link" @click="switchMode('login')">Sign in</button>
          </p>
        </form>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import {
  addStoredUser,
  getStoredUsers,
  isUserBlocked,
  markUserLoggedIn,
  setSession,
} from '@/utils/auth'
import {
  validateConfirmPassword,
  validateEmail,
  validatePassword,
  validateRequired,
} from '@/utils/validation'
import logo from '@/assets/logo.png'
import bgVideo from '@/assets/login_signup/login_signup.mp4'

// ── Video ──
const videoRef = ref<HTMLVideoElement | null>(null)

function replayVideo() {
  const v = videoRef.value
  if (!v) return
  v.currentTime = 0
  v.play()
}

// ── Mode ──
const mode = ref<'login' | 'register'>('login')

function switchMode(next: 'login' | 'register') {
  mode.value = next
}

// ── Router ──
const router = useRouter()
const route = useRoute()
const redirectPath = computed(() => route.query.redirect?.toString() || '/')

// ── Login state ──
const loginEmail = ref('')
const loginPassword = ref('')
const showLoginPw = ref(false)
const loginErrors = ref({ email: '', password: '', general: '' })

function handleLogin() {
  loginErrors.value = { email: '', password: '', general: '' }
  const email = loginEmail.value.trim().toLowerCase()

  loginErrors.value.email = validateEmail(email)
  loginErrors.value.password = loginPassword.value ? '' : validatePassword(loginPassword.value)

  if (loginErrors.value.email || loginErrors.value.password) return

  if (email === 'admin@gmail.com' && loginPassword.value === 'admin123') {
    markUserLoggedIn(email)
    setSession('admin', email)
    router.push('/admin')
    return
  }

  if (isUserBlocked(email)) {
    loginErrors.value.general = 'This account is blocked. Please contact support.'
    return
  }

  const users = getStoredUsers()
  const matched = users.find((u) => u.email.toLowerCase() === email)

  if (!matched || matched.password !== loginPassword.value) {
    loginErrors.value.general = 'Incorrect email or password. Please try again.'
    return
  }

  markUserLoggedIn(email)
  setSession('customer', email)
  const safe = redirectPath.value.startsWith('/admin') ? '/' : redirectPath.value || '/'
  router.push(safe)
}

// ── Register state ──
const regFullName = ref('')
const regEmail = ref('')
const regPassword = ref('')
const regConfirm = ref('')
const regAgree = ref(false)
const showRegPw = ref(false)
const showRegConfirm = ref(false)
const regErrors = ref({
  fullName: '',
  email: '',
  password: '',
  confirmPassword: '',
  agree: '',
  general: '',
})

function handleRegister() {
  regErrors.value = { fullName: '', email: '', password: '', confirmPassword: '', agree: '', general: '' }
  const email = regEmail.value.trim().toLowerCase()

  regErrors.value.fullName = validateRequired(regFullName.value, 'Full name')
  regErrors.value.email = validateEmail(email)
  regErrors.value.password = validatePassword(regPassword.value)
  regErrors.value.confirmPassword = validateConfirmPassword(regPassword.value, regConfirm.value)
  if (!regAgree.value) regErrors.value.agree = 'You must agree to continue.'

  if (Object.values(regErrors.value).some(Boolean)) return

  const users = getStoredUsers()
  if (users.some((u) => u.email.toLowerCase() === email)) {
    regErrors.value.general = 'An account with this email already exists.'
    return
  }

  addStoredUser({ fullName: regFullName.value.trim(), email, password: regPassword.value })
  switchMode('login')
}
</script>

<style scoped>
*,
*::before,
*::after {
  box-sizing: border-box;
}

/* ── Page ── */
.auth-page {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Inter', Arial, sans-serif;
  overflow: hidden;
}

/* ── Video background ── */
.bg-video {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 0;
}

.bg-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.30) 0%, rgba(0, 0, 0, 0.18) 100%);
  z-index: 1;
}

/* ── Floating card ── */
.auth-card {
  position: relative;
  z-index: 2;
  width: 420px;
  padding: 36px 40px 32px;
  border-radius: 20px;
  background: rgba(10, 10, 22, 0.52);
  backdrop-filter: blur(28px);
  -webkit-backdrop-filter: blur(28px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 32px 64px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.08);
  max-height: 92vh;
  overflow-y: auto;
  scrollbar-width: none;
}

.auth-card::-webkit-scrollbar {
  display: none;
}

/* ── Logo ── */
.card-logo {
  display: flex;
  justify-content: center;
  margin-bottom: 24px;
}

.card-logo img {
  height: 64px;
  object-fit: contain;
  filter: brightness(0) invert(1);
  opacity: 0.95;
}

/* ── Tab row ── */
.tab-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  background: rgba(255, 255, 255, 0.07);
  border-radius: 10px;
  padding: 3px;
  margin-bottom: 28px;
}

.tab-btn {
  height: 36px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: rgba(255, 255, 255, 0.45);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.2s, color 0.2s;
}

.tab-btn.active {
  background: rgba(255, 255, 255, 0.14);
  color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
}

/* ── Form ── */
.auth-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field label {
  font-size: 12px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.6);
  letter-spacing: 0.02em;
}

.label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.forgot-link {
  font-size: 12px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.5);
  text-decoration: none;
  transition: color 0.15s;
}

.forgot-link:hover {
  color: #fff;
}

/* ── Input wrap ── */
.input-wrap {
  height: 46px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.07);
  border: 1px solid rgba(255, 255, 255, 0.12);
  padding: 0 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: border-color 0.18s, background 0.18s, box-shadow 0.18s;
}

.input-wrap:focus-within {
  border-color: rgba(255, 255, 255, 0.38);
  background: rgba(255, 255, 255, 0.1);
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.06);
}

.field--error .input-wrap {
  border-color: rgba(239, 68, 68, 0.6);
}

.input-icon {
  width: 16px;
  height: 16px;
  color: rgba(255, 255, 255, 0.35);
  flex-shrink: 0;
}

.input-wrap input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  color: #fff;
  font-size: 14px;
  font-family: inherit;
  min-width: 0;
}

.input-wrap input::placeholder {
  color: rgba(255, 255, 255, 0.28);
}

.eye-btn {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.35);
  display: flex;
  align-items: center;
  flex-shrink: 0;
  transition: color 0.15s;
}

.eye-btn:hover {
  color: rgba(255, 255, 255, 0.7);
}

.eye-btn svg {
  width: 16px;
  height: 16px;
}

/* ── Errors ── */
.err-msg {
  font-size: 11.5px;
  color: #f87171;
}

.general-err {
  margin: 0;
  font-size: 12.5px;
  color: #fca5a5;
  text-align: center;
  background: rgba(239, 68, 68, 0.12);
  border: 1px solid rgba(239, 68, 68, 0.25);
  border-radius: 8px;
  padding: 8px 12px;
}

/* ── Checkbox ── */
.checkbox-label {
  display: flex;
  align-items: flex-start;
  gap: 9px;
  cursor: pointer;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  line-height: 1.5;
}

.checkbox-label input[type='checkbox'] {
  margin-top: 2px;
  accent-color: rgba(255, 255, 255, 0.8);
  flex-shrink: 0;
  cursor: pointer;
}

.terms-link {
  color: rgba(255, 255, 255, 0.75);
  text-decoration: underline;
  text-underline-offset: 2px;
}

/* ── Submit button ── */
.submit-btn {
  height: 48px;
  border: none;
  border-radius: 10px;
  background: #fff;
  color: #0d0d1a;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.02em;
  cursor: pointer;
  font-family: inherit;
  box-shadow: 0 4px 16px rgba(255, 255, 255, 0.12);
  transition: opacity 0.18s, transform 0.12s;
  margin-top: 2px;
}

.submit-btn:hover {
  opacity: 0.92;
  transform: translateY(-1px);
}

.submit-btn:active {
  transform: translateY(0);
  opacity: 1;
}

/* ── Switch text ── */
.switch-text {
  margin: 0;
  text-align: center;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.4);
}

.switch-link {
  background: none;
  border: none;
  padding: 0;
  font-size: 13px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  font-family: inherit;
  text-decoration: underline;
  text-underline-offset: 2px;
  transition: color 0.15s;
}

.switch-link:hover {
  color: #fff;
}

/* ── Transition ── */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(6px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
