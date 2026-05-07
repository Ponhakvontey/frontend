<template>
  <div class="login-page">
    <div class="login-shell">
      <div class="login-card-layout">
        <section class="left-panel">
          <img :src="logo" alt="Ubuyee logo" class="logo" />
        </section>

        <section class="right-panel">
          <div class="form-container">
            <h1>Welcome Back</h1>
            <p class="subtitle">Please enter your details to sign in.</p>

            <form class="login-form" @submit.prevent="handleLogin">
              <div class="form-group">
                <label for="email">EMAIL ADDRESS</label>
                <div class="input-box">
                  <img :src="emailIcon" alt="" class="icon" />
                  <input
                    id="email"
                    v-model.trim="email"
                    type="email"
                    placeholder="scholar@institution.edu"
                  />
                </div>
                <p v-if="errors.email" class="field-error">{{ errors.email }}</p>
              </div>

              <div class="form-group">
                <div class="password-row">
                  <label for="password">PASSWORD</label>
                  <RouterLink to="/forgot-password" class="forgot"> Forgot Password? </RouterLink>
                </div>

                <div class="input-box">
                  <img :src="passwordIcon" alt="" class="icon" />
                  <input
                    id="password"
                    v-model="password"
                    type="password"
                    placeholder="••••••••"
                    autocomplete="current-password"
                  />
                  <img :src="eyeIcon" alt="" class="icon eye" />
                </div>
                <p v-if="errors.password" class="field-error">{{ errors.password }}</p>
              </div>

              <p v-if="errors.general" class="form-error">{{ errors.general }}</p>

              <button class="sign-in-btn" type="submit">Sign In →</button>

              <p class="divider">OR CONTINUE WITH</p>

              <div class="social-row">
                <button type="button" class="social-btn">
                  <img :src="googleIcon" alt="" class="icon" />
                  <span>Google</span>
                </button>
              </div>

              <p class="register-text">
                Don’t have an account?
                <RouterLink to="/register">Register Now</RouterLink>
              </p>
            </form>
          </div>
        </section>
      </div>
    </div>

    <p class="footer-text">© 2024 CURATOR BRAND ASSETS • ENCRYPTION STANDARD AES-256</p>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { getStoredUsers, isUserBlocked, markUserLoggedIn, setSession } from '@/utils/auth'
import { validateEmail, validatePassword } from '@/utils/validation'
import eyeIcon from '../assets/confirm.png'
import emailIcon from '../assets/message.png'
import googleIcon from '../assets/google.png'
import logo from '../assets/logo.png'
import passwordIcon from '../assets/password.png'

const email = ref('')
const password = ref('')
const router = useRouter()
const route = useRoute()
const errors = ref({
  email: '',
  password: '',
  general: '',
})

const redirectPath = computed(() => route.query.redirect?.toString() || '/')

function resetErrors() {
  errors.value = { email: '', password: '', general: '' }
}

function handleLogin() {
  resetErrors()
  const normalizedEmail = email.value.trim().toLowerCase()

  errors.value.email = validateEmail(normalizedEmail)
  errors.value.password = password.value ? '' : validatePassword(password.value)

  if (errors.value.email || errors.value.password) return

  if (normalizedEmail === 'admin@gmail.com' && password.value === 'admin123') {
    markUserLoggedIn(normalizedEmail)
    setSession('admin', normalizedEmail)
    router.push('/admin')
    return
  }
  if (isUserBlocked(normalizedEmail)) {
    errors.value.general = 'This account is blocked. Please contact support.'
    return
  }


  const users = getStoredUsers()
  const matched = users.find((user) => user.email.toLowerCase() === normalizedEmail)

  if (!matched || matched.password !== password.value) {
    errors.value.general = 'Incorrect email or password. Please try again.'
    return
  }

  markUserLoggedIn(normalizedEmail)
  setSession('customer', normalizedEmail)
  const safeRedirect = redirectPath.value.startsWith('/admin') ? '/' : redirectPath.value || '/'
  router.push(safeRedirect)
}
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.login-page {
  min-height: 100vh;
  background: #dfe1e5;
  padding: 24px 16px 20px;
  font-family: Inter, Arial, sans-serif;
  overflow-x: auto;
  overflow-y: auto;
}

.login-shell {
  width: max-content;
  min-width: 100%;
  display: flex;
  justify-content: center;
}

.login-card-layout {
  width: 1280px;
  min-width: 1280px;
  min-height: 720px;
  border-radius: 12px;
  overflow: hidden;
  display: grid;
  grid-template-columns: 1fr 1fr;
  box-shadow: 0 30px 60px rgba(31, 41, 55, 0.08);
  flex-shrink: 0;
}

.left-panel {
  background: #f6f6f6;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.logo {
  width: 240px;
  object-fit: contain;
}

.right-panel {
  background: #d2d5da;
  padding: 56px 52px;
  display: flex;
  align-items: center;
}

.form-container {
  width: 100%;
  max-width: 420px;
  margin: 0 auto;
}

h1 {
  margin: 0;
  font-size: 42px;
  line-height: 1.08;
  color: #202833;
  font-weight: 800;
}

.subtitle {
  margin: 10px 0 24px;
  font-size: 14px;
  color: #5f6674;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field-error {
  margin: 0;
  color: #d92d20;
  font-size: 12px;
}

.form-error {
  margin: 0;
  color: #d92d20;
  font-size: 12px;
  text-align: center;
}

.form-group label {
  font-size: 10px;
  font-weight: 700;
  color: #5f6674;
  letter-spacing: 0.09em;
}

.input-box {
  height: 44px;
  border-radius: 12px;
  background: #e8eaed;
  padding: 0 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.icon {
  width: 14px;
  height: 14px;
  object-fit: contain;
  opacity: 0.72;
}

.input-box input {
  width: 100%;
  border: 0;
  outline: 0;
  background: transparent;
  color: #1f2937;
  font-size: 13px;
}

.input-box input::placeholder {
  color: #8b93a2;
}

.password-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.forgot {
  color: #2f5bea;
  text-decoration: none;
  font-size: 11px;
  font-weight: 600;
}

.sign-in-btn {
  margin-top: 2px;
  height: 46px;
  border: 0;
  border-radius: 12px;
  background: #2f5bea;
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 8px 18px rgba(47, 91, 234, 0.24);
}

.sign-in-btn:hover {
  background: #264cd0;
}

.divider {
  margin: 0;
  text-align: center;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.18em;
  color: #6f7685;
}

.social-row {
  display: flex;
  gap: 10px;
}

.social-btn {
  flex: 1;
  height: 40px;
  border: 0;
  border-radius: 12px;
  background: #edf0f3;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: #293241;
  cursor: pointer;
}

.social-btn:hover {
  background: #e6e9ed;
}

.register-text {
  margin: 0;
  text-align: center;
  font-size: 12px;
  color: #666d7d;
}

.register-text a {
  color: #2f5bea;
  text-decoration: none;
}

.eye {
  width: 12px;
  height: 12px;
}

.footer-text {
  margin: 20px 0 0;
  text-align: center;
  font-size: 9px;
  letter-spacing: 0.16em;
  color: #97a0ac;
}
</style>
