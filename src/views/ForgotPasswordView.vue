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
import { getStoredUsers } from '@/utils/auth'
import { isValidEmail } from '@/utils/validation'

const router = useRouter()
const email = ref('')
const emailError = ref('')
const formMessage = ref('')

function handleReset() {
  emailError.value = ''
  formMessage.value = ''
  const normalizedEmail = email.value.trim().toLowerCase()

  if (!normalizedEmail) {
    emailError.value = 'Email is required.'
    return
  }

  if (!isValidEmail(normalizedEmail)) {
    emailError.value = 'Please enter a valid email address.'
    return
  }

  const exists = getStoredUsers().some((user) => user.email.toLowerCase() === normalizedEmail)
  if (!exists) {
    formMessage.value = 'No account found for this email.'
    return
  }

  localStorage.setItem('resetEmail', normalizedEmail)
  router.push('/verify-identity')
}
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.forgot-page {
  min-height: 100vh;
  background: #f4f6fb;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-family: Inter, Arial, sans-serif;
  color: #1f2937;
  padding: 24px;
}

.forgot-card {
  width: 100%;
  max-width: 420px;
  background: #ffffff;
  border-radius: 14px;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.06);
  padding: 0 22px 28px;
  text-align: center;
  position: relative;
}

.top-line {
  height: 3px;
  background: #3563e9;
  border-radius: 14px 14px 0 0;
  margin: 0 -22px 22px;
}

.icon-wrap {
  width: 44px;
  height: 44px;
  margin: 0 auto 18px;
  border-radius: 999px;
  background: #eef3ff;
  color: #3563e9;
  display: grid;
  place-items: center;
  font-size: 22px;
}

h1 {
  margin: 0 0 10px;
  font-size: 34px;
  font-weight: 700;
}

.subtitle {
  margin: 0 auto 24px;
  max-width: 280px;
  color: #6b7280;
  line-height: 1.6;
  font-size: 14px;
}

.forgot-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.field {
  text-align: left;
}

.field-error {
  margin: 8px 0 0;
  color: #d92d20;
  font-size: 12px;
}

.field label {
  display: block;
  margin-bottom: 8px;
  font-size: 10px;
  letter-spacing: 0.12em;
  color: #6b7280;
}

.input-wrap {
  height: 44px;
  border-radius: 10px;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 12px;
}

.input-wrap span {
  color: #6b7280;
  font-size: 14px;
}

.input-wrap input {
  width: 100%;
  border: 0;
  outline: 0;
  background: transparent;
  color: #111827;
}

.reset-btn {
  height: 46px;
  border: 0;
  border-radius: 10px;
  background: #3563e9;
  color: #fff;
  font-weight: 600;
  cursor: pointer;
}

.back-link {
  display: inline-block;
  margin-top: 18px;
  color: #3563e9;
  text-decoration: none;
  font-size: 14px;
}

.bottom-note {
  margin-top: 34px;
  font-size: 10px;
  letter-spacing: 0.16em;
  color: #9ca3af;
  text-align: center;
}
</style>
