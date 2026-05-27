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
const email = sessionStorage.getItem('resetEmail') || 'your@email.com'

if (!sessionStorage.getItem('resetEmail')) {
  router.replace('/forgot-password')
}

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

  formMessage.value = 'Verification successful. Redirecting to reset password...'
  router.push('/reset-password')
}
</script>

<style scoped>
* { box-sizing: border-box; }

.verify-page {
  min-height: 100vh;
  background: #fff;
  padding: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24px;
  font-family: Helvetica, Arial, sans-serif;
  color: #000;
}

.verify-card {
  width: 100%;
  max-width: 420px;
  background: #fff;
  border: 1px solid #AABBAA;
  border-radius: 4px;
  box-shadow: rgba(0,0,0,0.05) 0 2px 4px;
  padding: 28px 24px 32px;
  text-align: center;
}

.icon-wrap {
  width: 44px;
  height: 44px;
  margin: 0 auto 16px;
  border-radius: 50%;
  background: #f5f5f5;
  border: 1px solid #AABBAA;
  display: grid;
  place-items: center;
  font-size: 20px;
}

h1 {
  margin: 0 0 10px;
  font-size: 24px;
  font-weight: 700;
  color: #000;
}

.subtitle {
  margin: 0 auto 24px;
  max-width: 300px;
  color: #808080;
  line-height: 1.6;
  font-size: 14px;
}

.verify-form { display: flex; flex-direction: column; gap: 16px; }

.code-row { display: flex; justify-content: center; gap: 8px; }

.field-error { margin: 0; color: #DA292E; font-size: 12px; }
.success-message { margin: 0; color: #16a34a; font-size: 12px; }

.code-input {
  width: 44px;
  height: 44px;
  border: 1px solid #808080;
  border-radius: 4px;
  background: #fff;
  text-align: center;
  font-size: 18px;
  font-weight: 700;
  color: #000;
  font-family: Helvetica, Arial, sans-serif;
  outline: none;
  transition: border-color 0.15s;
}
.code-input:focus { border-color: #1890FF; }

.verify-btn {
  height: 44px;
  border: none;
  border-radius: 4px;
  background: #000;
  color: #fff;
  font-family: Helvetica, Arial, sans-serif;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s;
}
.verify-btn:hover { background: #211E1E; }

.resend-box { margin-top: 16px; }
.resend-box p { margin: 0 0 6px; font-size: 11px; font-weight: 700; letter-spacing: 0.1em; color: #808080; text-transform: uppercase; }

.resend-btn {
  border: none;
  background: transparent;
  color: #1890FF;
  font-family: Helvetica, Arial, sans-serif;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.15s;
}
.resend-btn:hover { opacity: 0.7; }
.resend-btn span { color: #808080; font-weight: 500; }

.back-link {
  display: inline-block;
  margin-top: 20px;
  color: #1890FF;
  text-decoration: none;
  font-size: 14px;
  font-weight: 700;
  transition: opacity 0.15s;
}
.back-link:hover { opacity: 0.7; }

.footer-text {
  margin: 0;
  text-align: center;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.14em;
  color: #808080;
}
</style>
