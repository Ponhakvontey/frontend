<template>
  <div class="verify-page">
    <div class="verify-card">
      <!-- Icon -->
      <div class="mail-icon">
        <i class="fa-regular fa-envelope" />
      </div>

      <h1>Check your email</h1>
      <p class="subtitle">
        We sent a 6-digit verification code to<br />
        <strong>{{ email }}</strong>
      </p>

      <!-- OTP inputs -->
      <div class="otp-row" @paste.prevent="onPaste">
        <input
          v-for="i in 6"
          :key="i"
          :ref="(el) => setRef(i - 1, el)"
          v-model="digits[i - 1]"
          type="text"
          inputmode="numeric"
          maxlength="1"
          class="otp-box"
          :class="{ 'otp-box--error': hasError }"
          @input="onInput(i - 1, $event)"
          @keydown.backspace="onBackspace(i - 1)"
        />
      </div>

      <p v-if="hasError" class="error-msg">{{ errorMsg }}</p>
      <p v-if="successMsg" class="success-msg">{{ successMsg }}</p>

      <button
        class="verify-btn"
        :disabled="loading || code.length < 6"
        @click="handleVerify"
      >
        <i v-if="loading" class="fa-solid fa-spinner fa-spin" />
        {{ loading ? 'Verifying…' : 'Verify & Create Account' }}
      </button>

      <p class="resend-row">
        Didn't receive the code?
        <button
          class="resend-btn"
          :disabled="resendLoading || cooldown > 0"
          @click="handleResend"
        >
          {{ cooldown > 0 ? `Resend in ${cooldown}s` : resendLoading ? 'Sending…' : 'Resend code' }}
        </button>
      </p>

      <RouterLink to="/register" class="back-link">
        <i class="fa-solid fa-arrow-left" /> Back to sign up
      </RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { login, register, sendOtp, verifyOtp } from '@/services/authService'

const router = useRouter()

// ── Registration data stored by RegisterView before routing here ──
interface PendingReg {
  email: string
  username: string
  password: string
  fullName: string
}

const pending = ref<PendingReg | null>(null)
const email = computed(() => pending.value?.email ?? '')

onMounted(() => {
  const raw = sessionStorage.getItem('pending_reg')
  if (!raw) {
    router.replace('/register')
    return
  }
  try {
    pending.value = JSON.parse(raw) as PendingReg
  } catch {
    router.replace('/register')
  }

  startCooldown()
  setTimeout(() => inputRefs[0]?.focus(), 50)
})

// ── OTP state ──
const digits = ref<string[]>(['', '', '', '', '', ''])
const inputRefs: HTMLInputElement[] = []
const loading = ref(false)
const hasError = ref(false)
const errorMsg = ref('')
const successMsg = ref('')
const resendLoading = ref(false)
const cooldown = ref(30)
let cooldownTimer: ReturnType<typeof setInterval> | null = null

const code = computed(() => digits.value.join(''))

function setRef(i: number, el: unknown) {
  if (el) inputRefs[i] = el as HTMLInputElement
}

function onInput(i: number, e: Event) {
  const raw = (e.target as HTMLInputElement).value.replace(/\D/g, '')
  digits.value[i] = raw.slice(-1)
  hasError.value = false
  if (raw && i < 5) inputRefs[i + 1]?.focus()
}

function onBackspace(i: number) {
  if (!digits.value[i] && i > 0) {
    digits.value[i - 1] = ''
    inputRefs[i - 1]?.focus()
  }
}

function onPaste(e: ClipboardEvent) {
  const text = e.clipboardData?.getData('text') ?? ''
  const nums = text.replace(/\D/g, '').slice(0, 6).split('')
  nums.forEach((n, i) => { digits.value[i] = n })
  inputRefs[Math.min(nums.length, 5)]?.focus()
}

async function handleVerify() {
  if (code.value.length < 6 || !pending.value) return
  loading.value = true
  hasError.value = false
  try {
    await verifyOtp(pending.value.email, code.value)
    await register(pending.value)
    // Auto-login so the user lands on the home page immediately
    await login({ username: pending.value.username, password: pending.value.password })
    sessionStorage.removeItem('pending_reg')
    router.push('/')
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : ''
    if (msg.toLowerCase().includes('invalid') || msg.toLowerCase().includes('expired') || msg.toLowerCase().includes('verified')) {
      hasError.value = true
      errorMsg.value = 'Invalid or expired code. Please try again.'
      digits.value = ['', '', '', '', '', '']
      inputRefs[0]?.focus()
    } else {
      hasError.value = true
      errorMsg.value = msg || 'Registration failed. Please try again.'
    }
  } finally {
    loading.value = false
  }
}

async function handleResend() {
  if (cooldown.value > 0 || resendLoading.value || !pending.value) return
  resendLoading.value = true
  hasError.value = false
  try {
    await sendOtp(pending.value.email)
    digits.value = ['', '', '', '', '', '']
    successMsg.value = 'A new code was sent to your email.'
    setTimeout(() => { successMsg.value = '' }, 4000)
    cooldown.value = 30
    startCooldown()
    inputRefs[0]?.focus()
  } catch (e: unknown) {
    hasError.value = true
    errorMsg.value = e instanceof Error ? e.message : 'Failed to resend code.'
  } finally {
    resendLoading.value = false
  }
}

function startCooldown() {
  if (cooldownTimer) clearInterval(cooldownTimer)
  cooldownTimer = setInterval(() => {
    if (cooldown.value > 0) cooldown.value--
    else clearInterval(cooldownTimer!)
  }, 1000)
}

onUnmounted(() => { if (cooldownTimer) clearInterval(cooldownTimer) })
</script>

<style scoped>
.verify-page {
  min-height: 100vh;
  background: #dfe1e5;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 16px;
  font-family: Helvetica, Arial, sans-serif;
}

.verify-card {
  background: #fff;
  border-radius: 16px;
  padding: 48px 40px 40px;
  width: 100%;
  max-width: 440px;
  text-align: center;
  box-shadow: 0 20px 50px rgba(31, 41, 55, 0.10);
}

.mail-icon {
  width: 64px;
  height: 64px;
  background: #f4f6f8;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  font-size: 26px;
  color: #111;
}

h1 {
  margin: 0 0 10px;
  font-size: 26px;
  font-weight: 800;
  color: #111;
}

.subtitle {
  margin: 0 0 32px;
  font-size: 14px;
  color: #666;
  line-height: 1.6;
}

.subtitle strong {
  color: #111;
}

/* ── OTP boxes ── */
.otp-row {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-bottom: 20px;
}

.otp-box {
  width: 48px;
  height: 56px;
  border: 2px solid #d1d5db;
  border-radius: 10px;
  font-size: 24px;
  font-weight: 700;
  text-align: center;
  color: #111;
  background: #fff;
  outline: none;
  transition: border-color 0.15s;
  font-family: Helvetica, Arial, sans-serif;
}

.otp-box:focus {
  border-color: #111;
}

.otp-box--error {
  border-color: #d92d20;
  animation: shake 0.25s ease;
}

@keyframes shake {
  0%,100% { transform: translateX(0) }
  25%      { transform: translateX(-5px) }
  75%      { transform: translateX(5px) }
}

/* ── Messages ── */
.error-msg {
  margin: 0 0 16px;
  color: #d92d20;
  font-size: 13px;
}

.success-msg {
  margin: 0 0 16px;
  color: #16a34a;
  font-size: 13px;
}

/* ── Verify button ── */
.verify-btn {
  width: 100%;
  height: 48px;
  border: none;
  border-radius: 10px;
  background: #111;
  color: #fff;
  font-size: 15px;
  font-weight: 700;
  font-family: Helvetica, Arial, sans-serif;
  cursor: pointer;
  transition: background 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 20px;
}

.verify-btn:hover:not(:disabled) { background: #333; }
.verify-btn:disabled { opacity: 0.45; cursor: not-allowed; }

/* ── Resend row ── */
.resend-row {
  margin: 0 0 24px;
  font-size: 13px;
  color: #666;
}

.resend-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #111;
  font-size: 13px;
  font-weight: 700;
  font-family: Helvetica, Arial, sans-serif;
  text-decoration: underline;
  padding: 0;
  margin-left: 4px;
}

.resend-btn:disabled {
  color: #aaa;
  cursor: default;
  text-decoration: none;
}

/* ── Back link ── */
.back-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #666;
  text-decoration: none;
  transition: color 0.15s;
}

.back-link:hover { color: #111; }
</style>
