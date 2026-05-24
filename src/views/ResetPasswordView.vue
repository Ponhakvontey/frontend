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
import { clearResetEmail, getResetEmail, updateStoredUserPassword } from '@/utils/auth'
import { validateConfirmPassword, validatePassword } from '@/utils/validation'

const router = useRouter()
const resetEmail = getResetEmail()
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

  const updated = updateStoredUserPassword(resetEmail, password.value)
  if (!updated) {
    errors.value.general = 'Unable to reset password for this account.'
    return
  }

  clearResetEmail()
  router.push('/login')
}
</script>

<style scoped>
.reset-page { min-height: 100vh; display: grid; place-items: center; background: #f4f6fb; padding: 20px; }
.reset-card { width: 100%; max-width: 420px; background: #fff; border-radius: 14px; padding: 28px 24px; box-shadow: 0 12px 30px rgba(15, 23, 42, 0.06); }
.icon-wrap { width: 44px; height: 44px; border-radius: 999px; background: #f0eaeb; color: #513B3C; display: grid; place-items: center; margin: 0 auto 14px; }
h1 { margin: 0 0 8px; text-align: center; font-size: 30px; }
.subtitle { margin: 0 0 20px; text-align: center; color: #6b7280; font-size: 14px; }
.reset-form { display: flex; flex-direction: column; gap: 14px; }
.field { display: flex; flex-direction: column; gap: 8px; }
.field label { font-size: 10px; letter-spacing: 0.1em; color: #6b7280; }
.field input { height: 44px; border: 0; border-radius: 10px; background: #f3f4f6; padding: 0 12px; }
.field-error { margin: 0; color: #d92d20; font-size: 12px; }
.reset-btn { height: 46px; border: 0; border-radius: 10px; background: #513B3C; color: #fff; font-weight: 600; cursor: pointer; }
</style>
