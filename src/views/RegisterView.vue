<template>
  <div class="register-page">
    <div class="register-shell">
      <div class="register-card">
        <section class="left-panel">
          <img :src="logo" alt="Ubuyee logo" class="logo" />
        </section>

        <section class="right-panel">
          <div class="form-container">
            <h1>Create Account</h1>
            <p class="subtitle">Start your curated journey today.</p>

            <form class="register-form" @submit.prevent="handleRegister">
              <div class="form-group">
                <label for="full-name">FULL NAME</label>
                <div class="input-box">
                  <img :src="peopleIcon" alt="" class="icon" />
                  <input
                    id="full-name"
                    v-model.trim="fullName"
                    type="text"
                    placeholder="E.g. Alexander Pierce"
                  />
                </div>
                <p v-if="errors.fullName" class="field-error">{{ errors.fullName }}</p>
              </div>

              <div class="form-group">
                <label for="email">EMAIL ADDRESS</label>
                <div class="input-box">
                  <img :src="emailIcon" alt="" class="icon" />
                  <input
                    id="email"
                    v-model.trim="email"
                    type="email"
                    placeholder="name@scholar.com"
                  />
                </div>
                <p v-if="errors.email" class="field-error">{{ errors.email }}</p>
              </div>

              <div class="row">
                <div class="form-group">
                  <label for="password">PASSWORD</label>
                  <div class="input-box">
                    <img :src="passwordIcon" alt="" class="icon" />
                    <input
                      id="password"
                      v-model="password"
                      type="password"
                      placeholder="••••••••"
                      autocomplete="new-password"
                    />
                  </div>
                  <p v-if="errors.password" class="field-error">{{ errors.password }}</p>
                </div>

                <div class="form-group">
                  <label for="confirm-password">CONFIRM PASSWORD</label>
                  <div class="input-box">
                    <img :src="confirmIcon" alt="" class="icon" />
                    <input
                      id="confirm-password"
                      v-model="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      autocomplete="new-password"
                    />
                  </div>
                  <p v-if="errors.confirmPassword" class="field-error">
                    {{ errors.confirmPassword }}
                  </p>
                </div>
              </div>

              <div class="checkbox-group">
                <input id="agree" v-model="agree" type="checkbox" />
                <label for="agree">
                  I agree to the <a href="#">Terms of Service</a> and
                  <a href="#">Privacy Policy</a>.
                </label>
              </div>
              <p v-if="errors.agree" class="field-error">{{ errors.agree }}</p>
              <p v-if="errors.general" class="form-error">{{ errors.general }}</p>

              <button class="create-btn" type="submit">Create Account</button>

              <p class="divider">OR JOIN WITH</p>

              <div class="social-row">
                <button type="button" class="social-btn">
                  <img :src="googleIcon" alt="" class="icon" />
                  <span>Google</span>
                </button>
              </div>

              <p class="login-text">
                Already have an account?
                <RouterLink to="/login">Login</RouterLink>
              </p>
            </form>
          </div>
        </section>
      </div>
    </div>

    <p class="footer-text">
      © 2024 SCHOLAR COMMERCE INC. • ALL RIGHTS RESERVED • SECURE ENCRYPTED REGISTRATION
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { addStoredUser, getStoredUsers } from '@/utils/auth'
import { validateConfirmPassword, validateEmail, validatePassword, validateRequired } from '@/utils/validation'
import confirmIcon from '../assets/confirm.png'
import emailIcon from '../assets/message.png'
import googleIcon from '../assets/google.png'
import logo from '../assets/logo.png'
import passwordIcon from '../assets/password.png'
import peopleIcon from '../assets/people.png'

const fullName = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const agree = ref(false)
const router = useRouter()
const errors = ref({
  fullName: '',
  email: '',
  password: '',
  confirmPassword: '',
  agree: '',
  general: '',
})

function clearErrors() {
  errors.value = {
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agree: '',
    general: '',
  }
}

function handleRegister() {
  clearErrors()
  const normalizedEmail = email.value.trim().toLowerCase()

  errors.value.fullName = validateRequired(fullName.value, 'Full name')
  errors.value.email = validateEmail(normalizedEmail)
  errors.value.password = validatePassword(password.value)
  errors.value.confirmPassword = validateConfirmPassword(password.value, confirmPassword.value)
  if (!agree.value) errors.value.agree = 'You must agree to continue.'

  if (Object.values(errors.value).some(Boolean)) return

  const users = getStoredUsers()
  if (users.some((user) => user.email.toLowerCase() === normalizedEmail)) {
    errors.value.general = 'An account with this email already exists.'
    return
  }

  addStoredUser({
    fullName: fullName.value.trim(),
    email: normalizedEmail,
    password: password.value,
  })
  router.push('/login')
}
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.register-page {
  min-height: 100vh;
  background: #dfe1e5;
  padding: 24px 16px 20px;
  font-family: Inter, Arial, sans-serif;
  overflow-x: auto;
  overflow-y: auto;
}

.register-shell {
  width: max-content;
  min-width: 100%;
  display: flex;
  justify-content: center;
}

.register-card {
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

.register-form {
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

.row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.checkbox-group {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-top: 4px;
}

.checkbox-group input {
  margin-top: 2px;
}

.checkbox-group label {
  margin: 0;
  font-size: 12px;
  line-height: 1.45;
  color: #616777;
}

.checkbox-group a,
.login-text a {
  color: #2f5bea;
  text-decoration: none;
}

.create-btn {
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

.create-btn:hover {
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

.login-text {
  margin: 0;
  text-align: center;
  font-size: 12px;
  color: #666d7d;
}

.footer-text {
  margin: 20px 0 0;
  text-align: center;
  font-size: 9px;
  letter-spacing: 0.16em;
  color: #97a0ac;
}
</style>
