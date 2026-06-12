<template>
  <Teleport to="body">
    <div v-if="visible" class="overlay" @click.self="emit('close')">
      <div class="dialog" role="dialog" aria-modal="true" aria-labelledby="otp-title">
        <button class="close-btn" aria-label="Close" @click="emit('close')">
          <i class="fa-solid fa-xmark" />
        </button>

        <div class="dialog-header">
          <div class="mail-icon"><i class="fa-regular fa-envelope" /></div>
          <h2 id="otp-title">Verify Your Email</h2>
          <p>Enter the 6-digit code sent to<br /><strong>{{ email }}</strong></p>
        </div>

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

        <button
          class="verify-btn"
          :disabled="loading || code.length < 6"
          @click="handleVerify"
        >
          <i v-if="loading" class="fa-solid fa-spinner fa-spin" />
          {{ loading ? 'Verifying…' : 'Verify Email' }}
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
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue'
import { sendOtp, verifyOtp } from '@/services/authService'

const props = defineProps<{
  visible: boolean
  email: string
}>()

const emit = defineEmits<{
  close: []
  verified: []
}>()

const digits = ref<string[]>(['', '', '', '', '', ''])
const inputRefs: HTMLInputElement[] = []
const loading = ref(false)
const hasError = ref(false)
const errorMsg = ref('')
const resendLoading = ref(false)
const cooldown = ref(0)
let cooldownTimer: ReturnType<typeof setInterval> | null = null

const code = computed(() => digits.value.join(''))

watch(() => props.visible, (v) => {
  if (v) reset()
})

function reset() {
  digits.value = ['', '', '', '', '', '']
  hasError.value = false
  errorMsg.value = ''
  loading.value = false
  cooldown.value = 30
  startCooldown()
}

function setRef(i: number, el: unknown) {
  if (el) inputRefs[i] = el as HTMLInputElement
}

function onInput(i: number, e: Event) {
  const raw = (e.target as HTMLInputElement).value.replace(/\D/g, '')
  digits.value[i] = raw.slice(-1)
  hasError.value = false

  if (raw && i < 5) {
    inputRefs[i + 1]?.focus()
  }
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
  if (code.value.length < 6) return
  loading.value = true
  hasError.value = false
  try {
    await verifyOtp(props.email, code.value)
    emit('verified')
  } catch {
    hasError.value = true
    errorMsg.value = 'Invalid or expired code. Please try again.'
    digits.value = ['', '', '', '', '', '']
    inputRefs[0]?.focus()
  } finally {
    loading.value = false
  }
}

async function handleResend() {
  if (cooldown.value > 0 || resendLoading.value) return
  resendLoading.value = true
  try {
    await sendOtp(props.email)
    digits.value = ['', '', '', '', '', '']
    hasError.value = false
    cooldown.value = 30
    startCooldown()
    inputRefs[0]?.focus()
  } catch {
    errorMsg.value = 'Failed to resend code. Please try again.'
    hasError.value = true
  } finally {
    resendLoading.value = false
  }
}

function startCooldown() {
  if (cooldownTimer) clearInterval(cooldownTimer)
  cooldownTimer = setInterval(() => {
    if (cooldown.value > 0) {
      cooldown.value--
    } else {
      clearInterval(cooldownTimer!)
    }
  }, 1000)
}

onUnmounted(() => {
  if (cooldownTimer) clearInterval(cooldownTimer)
})
</script>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  z-index: 200;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  animation: fadeIn 0.15s ease;
}

@keyframes fadeIn {
  from { opacity: 0 }
  to   { opacity: 1 }
}

.dialog {
  position: relative;
  background: #fff;
  border-radius: 16px;
  padding: 36px 32px 28px;
  width: 100%;
  max-width: 400px;
  font-family: Helvetica, Arial, sans-serif;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.18);
  animation: slideUp 0.18s ease;
}

@keyframes slideUp {
  from { transform: translateY(12px); opacity: 0 }
  to   { transform: translateY(0);    opacity: 1 }
}

.close-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  cursor: pointer;
  color: #888;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: background 0.12s, color 0.12s;
}
.close-btn:hover { background: #f0f0f0; color: #111; }

.dialog-header {
  text-align: center;
  margin-bottom: 24px;
}

.mail-icon {
  width: 52px;
  height: 52px;
  background: #f4f6f8;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 14px;
  font-size: 22px;
  color: #111;
}

.dialog-header h2 {
  margin: 0 0 8px;
  font-size: 20px;
  font-weight: 700;
  color: #111;
}

.dialog-header p {
  margin: 0;
  font-size: 13px;
  color: #666;
  line-height: 1.5;
}

.dialog-header strong {
  color: #111;
}

.otp-row {
  display: flex;
  gap: 8px;
  justify-content: center;
  margin-bottom: 16px;
}

.otp-box {
  width: 44px;
  height: 52px;
  border: 2px solid #d1d5db;
  border-radius: 10px;
  font-size: 22px;
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
  0%, 100% { transform: translateX(0) }
  25%       { transform: translateX(-4px) }
  75%       { transform: translateX(4px) }
}

.error-msg {
  margin: 0 0 12px;
  color: #d92d20;
  font-size: 12px;
  text-align: center;
}

.verify-btn {
  width: 100%;
  height: 46px;
  border: none;
  border-radius: 10px;
  background: #111;
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  font-family: Helvetica, Arial, sans-serif;
  cursor: pointer;
  transition: background 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.verify-btn:hover:not(:disabled) { background: #333; }
.verify-btn:disabled { opacity: 0.45; cursor: not-allowed; }

.resend-row {
  margin: 14px 0 0;
  text-align: center;
  font-size: 12px;
  color: #666;
}

.resend-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #111;
  font-size: 12px;
  font-weight: 700;
  font-family: Helvetica, Arial, sans-serif;
  text-decoration: underline;
  padding: 0;
  margin-left: 4px;
}

.resend-btn:disabled {
  color: #999;
  cursor: not-allowed;
  text-decoration: none;
}
</style>
