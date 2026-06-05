<template>
  <div class="auth-page">
    <video ref="videoRef" class="bg-video" autoplay muted playsinline @ended="replayVideo">
      <source :src="bgVideo" type="video/mp4" />
    </video>
    <div class="bg-overlay"></div>

    <div class="auth-card">
      <div class="card-logo">
        <img :src="logo" alt="Ubuyee" />
      </div>

      <!-- Invalid / missing token -->
      <div v-if="!token" class="status-block">
        <p class="status-title">Invalid link</p>
        <p class="status-desc">This password reset link is missing or malformed. Please request a new one.</p>
        <RouterLink to="/login" class="submit-btn">Back to Sign In</RouterLink>
      </div>

      <!-- Success -->
      <div v-else-if="success" class="status-block">
        <div class="success-icon">
          <svg viewBox="0 0 48 48" fill="none">
            <rect width="48" height="48" rx="24" fill="rgba(255,255,255,0.08)"/>
            <path d="M14 24l7 7 13-13" stroke="rgba(255,255,255,0.85)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <p class="status-title">Password updated!</p>
        <p class="status-desc">You can now sign in with your new password.</p>
        <RouterLink to="/login" class="submit-btn">Sign In</RouterLink>
      </div>

      <!-- Reset form -->
      <form v-else class="auth-form" @submit.prevent="handleSubmit">
        <div class="form-intro">
          <p class="form-title">Create new password</p>
          <p class="form-desc">Choose a strong password for your account.</p>
        </div>

        <div class="field" :class="{ 'field--error': errors.password }">
          <label for="new-password">New password</label>
          <div class="input-wrap">
            <svg class="input-icon" viewBox="0 0 20 20" fill="none">
              <rect x="4" y="9" width="12" height="8" rx="2" stroke="currentColor" stroke-width="1.5"/>
              <path d="M7 9V6a3 3 0 116 0v3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
            <input
              id="new-password"
              v-model="password"
              :type="showPw ? 'text' : 'password'"
              placeholder="Min 8 characters"
              autocomplete="new-password"
            />
            <button type="button" class="eye-btn" @click="showPw = !showPw">
              <svg v-if="!showPw" viewBox="0 0 20 20" fill="none">
                <path d="M2 10s3-6 8-6 8 6 8 6-3 6-8 6-8-6-8-6z" stroke="currentColor" stroke-width="1.5"/>
                <circle cx="10" cy="10" r="2.5" stroke="currentColor" stroke-width="1.5"/>
              </svg>
              <svg v-else viewBox="0 0 20 20" fill="none">
                <path d="M3 3l14 14M8.5 8.7A2.5 2.5 0 0012.3 12.5M5.6 5.8C3.9 7 2.5 9 2.5 10s3 5.5 7.5 5.5a8.5 8.5 0 004-1.1M8 4.6A8.8 8.8 0 0110 4.5c4.5 0 7.5 5.5 7.5 5.5a11 11 0 01-2 2.6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
            </button>
          </div>
          <span v-if="errors.password" class="err-msg">{{ errors.password }}</span>
        </div>

        <div class="field" :class="{ 'field--error': errors.confirmPassword }">
          <label for="confirm-password">Confirm password</label>
          <div class="input-wrap">
            <svg class="input-icon" viewBox="0 0 20 20" fill="none">
              <rect x="4" y="9" width="12" height="8" rx="2" stroke="currentColor" stroke-width="1.5"/>
              <path d="M7 9V6a3 3 0 116 0v3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
            <input
              id="confirm-password"
              v-model="confirmPassword"
              :type="showConfirm ? 'text' : 'password'"
              placeholder="Repeat password"
              autocomplete="new-password"
            />
            <button type="button" class="eye-btn" @click="showConfirm = !showConfirm">
              <svg v-if="!showConfirm" viewBox="0 0 20 20" fill="none">
                <path d="M2 10s3-6 8-6 8 6 8 6-3 6-8 6-8-6-8-6z" stroke="currentColor" stroke-width="1.5"/>
                <circle cx="10" cy="10" r="2.5" stroke="currentColor" stroke-width="1.5"/>
              </svg>
              <svg v-else viewBox="0 0 20 20" fill="none">
                <path d="M3 3l14 14M8.5 8.7A2.5 2.5 0 0012.3 12.5M5.6 5.8C3.9 7 2.5 9 2.5 10s3 5.5 7.5 5.5a8.5 8.5 0 004-1.1M8 4.6A8.8 8.8 0 0110 4.5c4.5 0 7.5 5.5 7.5 5.5a11 11 0 01-2 2.6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
            </button>
          </div>
          <span v-if="errors.confirmPassword" class="err-msg">{{ errors.confirmPassword }}</span>
        </div>

        <p v-if="errors.general" class="general-err">{{ errors.general }}</p>

        <button type="submit" class="submit-btn" :disabled="loading">
          {{ loading ? 'Saving…' : 'Save New Password' }}
        </button>

        <p class="switch-text">
          <RouterLink to="/login" class="switch-link">Back to Sign In</RouterLink>
        </p>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { resetPassword } from '@/services/authService'
import { validatePassword, validateConfirmPassword } from '@/utils/validation'
import logo from '@/assets/home/logo1.png'
import bgVideo from '@/assets/login_signup/login_signup.mp4'

const route = useRoute()
const token = route.query.token as string | undefined

const videoRef = ref<HTMLVideoElement | null>(null)
function replayVideo() {
  const v = videoRef.value
  if (!v) return
  v.currentTime = 0
  v.play()
}

const password = ref('')
const confirmPassword = ref('')
const showPw = ref(false)
const showConfirm = ref(false)
const loading = ref(false)
const success = ref(false)
const errors = ref({ password: '', confirmPassword: '', general: '' })

async function handleSubmit() {
  errors.value = { password: '', confirmPassword: '', general: '' }

  errors.value.password = validatePassword(password.value)
  errors.value.confirmPassword = validateConfirmPassword(password.value, confirmPassword.value)
  if (errors.value.password || errors.value.confirmPassword) return

  loading.value = true
  try {
    await resetPassword(token!, password.value)
    success.value = true
  } catch (err: any) {
    errors.value.general = err?.message ?? 'This link has expired or is invalid. Please request a new one.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
*,
*::before,
*::after {
  box-sizing: border-box;
}

.auth-page {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: Helvetica, Arial, sans-serif;
  overflow: hidden;
}

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
  background: linear-gradient(135deg, rgba(0,0,0,0.30) 0%, rgba(0,0,0,0.18) 100%);
  z-index: 1;
}

.auth-card {
  position: relative;
  z-index: 2;
  width: min(420px, calc(100vw - 32px));
  padding: 36px 40px 32px;
  border-radius: 20px;
  background: rgba(10, 10, 22, 0.52);
  backdrop-filter: blur(28px);
  -webkit-backdrop-filter: blur(28px);
  border: 1px solid rgba(255,255,255,0.12);
  box-shadow: 0 32px 64px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.08);
}

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

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-intro {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 4px;
}

.form-title {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #fff;
}

.form-desc {
  margin: 0;
  font-size: 13px;
  color: rgba(255,255,255,0.45);
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field label {
  font-size: 12px;
  font-weight: 500;
  color: rgba(255,255,255,0.6);
  letter-spacing: 0.02em;
}

.input-wrap {
  height: 46px;
  border-radius: 10px;
  background: rgba(255,255,255,0.07);
  border: 1px solid rgba(255,255,255,0.12);
  padding: 0 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: border-color 0.18s, background 0.18s, box-shadow 0.18s;
}

.input-wrap:focus-within {
  border-color: rgba(255,255,255,0.38);
  background: rgba(255,255,255,0.1);
  box-shadow: 0 0 0 3px rgba(255,255,255,0.06);
}

.field--error .input-wrap {
  border-color: rgba(239,68,68,0.6);
}

.input-icon {
  width: 16px;
  height: 16px;
  color: rgba(255,255,255,0.35);
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
  color: rgba(255,255,255,0.28);
}

.eye-btn {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  color: rgba(255,255,255,0.35);
  display: flex;
  align-items: center;
  flex-shrink: 0;
  transition: color 0.15s;
}

.eye-btn:hover { color: rgba(255,255,255,0.7); }
.eye-btn svg { width: 16px; height: 16px; }

.err-msg {
  font-size: 11.5px;
  color: #f87171;
}

.general-err {
  margin: 0;
  font-size: 12.5px;
  color: #fca5a5;
  text-align: center;
  background: rgba(239,68,68,0.12);
  border: 1px solid rgba(239,68,68,0.25);
  border-radius: 8px;
  padding: 8px 12px;
}

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
  box-shadow: 0 4px 16px rgba(255,255,255,0.12);
  transition: opacity 0.18s, transform 0.12s;
  margin-top: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
}

.submit-btn:hover { opacity: 0.92; transform: translateY(-1px); }
.submit-btn:active { transform: translateY(0); opacity: 1; }
.submit-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

.switch-text {
  margin: 0;
  text-align: center;
  font-size: 13px;
  color: rgba(255,255,255,0.4);
}

.switch-link {
  font-size: 13px;
  font-weight: 600;
  color: rgba(255,255,255,0.8);
  text-decoration: underline;
  text-underline-offset: 2px;
  transition: color 0.15s;
}

.switch-link:hover { color: #fff; }

/* Status blocks (invalid token / success) */
.status-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  text-align: center;
}

.success-icon { display: flex; justify-content: center; }

.status-title {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #fff;
}

.status-desc {
  margin: 0;
  font-size: 13px;
  color: rgba(255,255,255,0.5);
  line-height: 1.6;
}

@media (max-width: 460px) {
  .auth-card {
    padding: 28px 20px 24px;
    border-radius: 16px;
  }
}
</style>
