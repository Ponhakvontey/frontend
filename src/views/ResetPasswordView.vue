<template>
  <div class="reset-page">
    <div class="reset-card">
      <div class="icon-wrap">🔐</div>
      <h1>Create New Password</h1>
      <p class="subtitle">
        Set a new password for <strong>{{ resetEmail || 'your account' }}</strong
        >.
      </p>

      <form class="reset-form" @submit.prevent="handleSubmit">
        <div class="field">
          <label>NEW PASSWORD</label>
          <input v-model="password" type="password" placeholder="At least 8 characters" />
          <p v-if="errors.password" class="field-error">{{ errors.password }}</p>
        </div>

        <div class="field">
          <label>CONFIRM PASSWORD</label>
          <input v-model="confirmPassword" type="password" placeholder="Repeat your password" />
          <p v-if="errors.confirmPassword" class="field-error">{{ errors.confirmPassword }}</p>
        </div>

        <p v-if="errors.general" class="field-error">{{ errors.general }}</p>
        <button type="submit" class="reset-btn">Save New Password</button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { validateConfirmPassword, validatePassword } from '@/utils/validation'

const router = useRouter()
const resetEmail = sessionStorage.getItem('resetEmail')
const password = ref('')
const confirmPassword = ref('')
const errors = ref({
  password: '',
  confirmPassword: '',
  general: '',
})

if (!resetEmail) {
  router.replace('/forgot-password')
}

function handleSubmit() {
  errors.value = { password: '', confirmPassword: '', general: '' }

  errors.value.password = validatePassword(password.value)
  errors.value.confirmPassword = validateConfirmPassword(password.value, confirmPassword.value)

  if (errors.value.password || errors.value.confirmPassword) return

  // Note: password reset via email is not yet supported by the backend.
  // Use Change Password from the Profile page when logged in.
  errors.value.general = 'Password reset via email is not yet available. Please log in and use Change Password in your Profile.'
  sessionStorage.removeItem('resetEmail')
}
</script>

<style scoped>
* { box-sizing: border-box; }
.reset-page { min-height: 100vh; display: grid; place-items: center; background: #fff; padding: 20px; font-family: Helvetica, Arial, sans-serif; }
.reset-card { width: 100%; max-width: 420px; background: #fff; border: 1px solid #AABBAA; border-radius: 4px; padding: 28px 24px; box-shadow: rgba(0,0,0,0.05) 0 2px 4px; }
.icon-wrap { width: 44px; height: 44px; border-radius: 50%; background: #f5f5f5; border: 1px solid #AABBAA; display: grid; place-items: center; margin: 0 auto 14px; font-size: 20px; }
h1 { margin: 0 0 8px; text-align: center; font-size: 24px; font-weight: 700; color: #000; }
.subtitle { margin: 0 0 20px; text-align: center; color: #808080; font-size: 14px; }
.reset-form { display: flex; flex-direction: column; gap: 14px; }
.field { display: flex; flex-direction: column; gap: 6px; }
.field label { font-size: 11px; font-weight: 700; letter-spacing: 0.1em; color: #808080; text-transform: uppercase; }
.field input { height: 44px; border: 1px solid #808080; border-radius: 4px; background: #fff; padding: 0 14px; outline: none; font-family: Helvetica, Arial, sans-serif; font-size: 14px; color: #000; transition: border-color 0.15s; }
.field input:focus { border-color: #1890FF; }
.field-error { margin: 0; color: #DA292E; font-size: 12px; }
.reset-btn { height: 44px; border: none; border-radius: 4px; background: #000; color: #fff; font-family: Helvetica, Arial, sans-serif; font-size: 14px; font-weight: 700; cursor: pointer; transition: background 0.15s; }
.reset-btn:hover { background: #211E1E; }
</style>
