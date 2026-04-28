<template>
  <div class="verify-page">
    <div class="verify-card">
      <div class="icon-wrap">🛡️</div>

      <h1>Verify Your Identity</h1>
      <p class="subtitle">
        We've sent a 6-digit verification code to your email
        <strong>{{ maskedEmail }}</strong
        >. Please enter it below to continue.
      </p>

      <form class="verify-form" @submit.prevent="handleVerify">
        <div class="code-row">
          <input
            v-for="(digit, index) in code"
            :key="index"
            v-model="code[index]"
            class="code-input"
            type="text"
            maxlength="1"
            inputmode="numeric"
            @input="onDigitInput(index, $event)"
          />
        </div>
        <p v-if="codeError" class="field-error">{{ codeError }}</p>
        <p v-if="formMessage" class="success-message">{{ formMessage }}</p>

        <button type="submit" class="verify-btn">Verify &amp; Continue</button>
      </form>

      <div class="resend-box">
        <p>DIDN’T RECEIVE A CODE?</p>
        <button type="button" class="resend-btn">Resend Code <span>in 0:59</span></button>
      </div>

      <RouterLink to="/login" class="back-link">← Back to Login</RouterLink>
    </div>

    <p class="footer-text">© 2024 CURATOR BRAND ASSETS • ENCRYPTION STANDARD AES-256</p>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'

const router = useRouter()
const email = localStorage.getItem('resetEmail') || 'your@email.com'

const code = ref(['', '', '', '', '', ''])
const codeError = ref('')
const formMessage = ref('')

const maskedEmail = computed(() => {
  const [name = '', domain = ''] = email.split('@')
  if (!name || !domain) return email

  if (name.length <= 2) return `**@${domain}`

  return `${name.slice(0, 2)}***@${domain}`
})

function onDigitInput(index: number, event: Event) {
  const target = event.target as HTMLInputElement
  const normalized = target.value.replace(/[^0-9]/g, '')
  code.value[index] = normalized
}

function handleVerify() {
  codeError.value = ''
  formMessage.value = ''
  const fullCode = code.value.join('')

  if (!/^\d{6}$/.test(fullCode)) {
    codeError.value = 'Please enter a valid 6-digit verification code.'
    return
  }

  formMessage.value = 'Verification successful. Redirecting to login...'
  router.push('/login')
}
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.verify-page {
  min-height: 100vh;
  background: #f3f5fb;
  padding: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 30px;
  font-family: Inter, Arial, sans-serif;
}

.verify-card {
  width: 100%;
  max-width: 420px;
  background: #ffffff;
  border-radius: 14px;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.06);
  padding: 28px 26px 32px;
  text-align: center;
}

.icon-wrap {
  width: 42px;
  height: 42px;
  margin: 0 auto 18px;
  border-radius: 999px;
  background: #eef3ff;
  color: #3563e9;
  display: grid;
  place-items: center;
  font-size: 20px;
}

h1 {
  margin: 0 0 10px;
  font-size: 34px;
  line-height: 1.1;
  color: #1f2937;
  font-weight: 800;
}

.subtitle {
  margin: 0 auto 24px;
  max-width: 300px;
  color: #6b7280;
  line-height: 1.6;
  font-size: 14px;
}

.verify-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.code-row {
  display: flex;
  justify-content: center;
  gap: 10px;
}

.field-error {
  margin: 0;
  color: #d92d20;
  font-size: 12px;
}

.success-message {
  margin: 0;
  color: #0f766e;
  font-size: 12px;
}

.code-input {
  width: 44px;
  height: 44px;
  border: 0;
  border-radius: 10px;
  background: #f3f4f6;
  text-align: center;
  font-size: 18px;
  font-weight: 700;
  color: #111827;
  outline: none;
}

.verify-btn {
  height: 46px;
  border: 0;
  border-radius: 10px;
  background: #3563e9;
  color: #ffffff;
  font-weight: 700;
  cursor: pointer;
}

.resend-box {
  margin-top: 18px;
}

.resend-box p {
  margin: 0 0 8px;
  font-size: 10px;
  letter-spacing: 0.12em;
  color: #9ca3af;
}

.resend-btn {
  border: 0;
  background: transparent;
  color: #3563e9;
  font-weight: 600;
  cursor: pointer;
}

.resend-btn span {
  color: #6b7280;
  font-weight: 500;
}

.back-link {
  display: inline-block;
  margin-top: 22px;
  color: #6b7280;
  text-decoration: none;
  font-size: 14px;
}

.footer-text {
  margin: 0;
  text-align: center;
  font-size: 9px;
  letter-spacing: 0.16em;
  color: #97a0ac;
}
</style>
