<template>
  <div class="forgot-page">
    <div class="forgot-card">
      <div class="top-line"></div>

      <div class="icon-wrap">⟳</div>

      <h1>Reset Password</h1>
      <p class="subtitle">
        Enter your email address and we’ll send you a link to reset your password.
      </p>

      <form class="forgot-form" @submit.prevent="handleReset">
        <div class="field">
          <label>EMAIL ADDRESS</label>
          <div class="input-wrap">
            <span>✉</span>
            <input v-model="email" type="email" placeholder="name@university.edu" />
          </div>
          <p v-if="emailError" class="field-error">{{ emailError }}</p>
        </div>
        <p v-if="formMessage" class="field-error">{{ formMessage }}</p>

        <button type="submit" class="reset-btn">Reset Password</button>
      </form>

      <RouterLink to="/login" class="back-link">← Back to Login</RouterLink>
    </div>

    <p class="bottom-note">© 2024 CURATOR BRAND ASSETS • ENCRYPTION STANDARD AES-256</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { validateEmail } from '@/utils/validation'

const router = useRouter()
const email = ref('')
const emailError = ref('')
const formMessage = ref('')

function handleReset() {
  emailError.value = ''
  formMessage.value = ''
  const normalizedEmail = email.value.trim().toLowerCase()

  emailError.value = validateEmail(normalizedEmail)
  if (emailError.value) return

  sessionStorage.setItem('resetEmail', normalizedEmail)
  router.push('/verify-identity')
}
</script>

<style scoped>
* { box-sizing: border-box; }

.forgot-page {
  min-height: 100vh;
  background: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-family: Helvetica, Arial, sans-serif;
  color: #000;
  padding: 24px;
}

.forgot-card {
  width: 100%;
  max-width: 420px;
  background: #fff;
  border: 1px solid #AABBAA;
  border-radius: 4px;
  box-shadow: rgba(0,0,0,0.05) 0 2px 4px;
  padding: 0 24px 28px;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.top-line {
  height: 3px;
  background: #000;
  margin: 0 -24px 24px;
}

.icon-wrap {
  width: 44px;
  height: 44px;
  margin: 0 auto 16px;
  border-radius: 50%;
  background: #f5f5f5;
  border: 1px solid #AABBAA;
  color: #000;
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

.forgot-form { display: flex; flex-direction: column; gap: 16px; }

.field { text-align: left; }

.field-error { margin: 6px 0 0; color: #DA292E; font-size: 12px; }

.field label {
  display: block;
  margin-bottom: 6px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: #808080;
  text-transform: uppercase;
}

.input-wrap {
  height: 44px;
  border: 1px solid #808080;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 12px;
  transition: border-color 0.15s;
}
.input-wrap:focus-within { border-color: #1890FF; }

.input-wrap span { color: #808080; font-size: 14px; }

.input-wrap input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  color: #000;
  font-family: Helvetica, Arial, sans-serif;
  font-size: 14px;
}
.input-wrap input::placeholder { color: #808080; }

.reset-btn {
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
.reset-btn:hover { background: #211E1E; }

.back-link {
  display: inline-block;
  margin-top: 18px;
  color: #1890FF;
  text-decoration: none;
  font-size: 14px;
  font-weight: 700;
  transition: opacity 0.15s;
}
.back-link:hover { opacity: 0.7; }

.bottom-note {
  margin-top: 28px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.14em;
  color: #808080;
  text-align: center;
}
</style>
