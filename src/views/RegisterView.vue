<template>
  <div class="register-page">
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
              </div>
            </div>

            <div class="checkbox-group">
              <input id="agree" v-model="agree" type="checkbox" />
              <label for="agree">
                I agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
              </label>
            </div>

            <button class="create-btn" type="submit">Create Account</button>

            <p class="divider">OR JOIN WITH</p>

            <div class="social-row">
              <button type="button" class="social-btn">
                <img :src="googleIcon" alt="" class="icon" />
                <span>Google</span>
              </button>
              <button type="button" class="social-btn">
                <img :src="githubIcon" alt="" class="icon" />
                <span>GitHub</span>
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

    <p class="footer-text">
      © 2024 SCHOLAR COMMERCE INC. • ALL RIGHTS RESERVED • SECURE ENCRYPTED REGISTRATION
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import confirmIcon from '../assets/confirm.png'
import emailIcon from '../assets/message.png'
import githubIcon from '../assets/git.png'
import googleIcon from '../assets/google.png'
import logo from '../assets/logo.png'
import passwordIcon from '../assets/password.png'
import peopleIcon from '../assets/people.png'

const fullName = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const agree = ref(false)

function handleRegister() {
  if (!fullName.value || !email.value || !password.value || !confirmPassword.value) {
    alert('Please complete all required fields.')
    return
  }

  if (!agree.value) {
    alert('Please agree to the Terms of Service and Privacy Policy.')
    return
  }

  if (password.value !== confirmPassword.value) {
    alert('Passwords do not match.')
    return
  }

  alert('Register submitted!')
}
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.register-page {
  min-height: 100vh;
  background: #dfe1e5;
  padding: 40px 16px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 28px;
  font-family: Inter, Arial, sans-serif;
}

.register-card {
  width: min(100%, 1080px);
  min-height: 710px;
  border-radius: 12px;
  overflow: hidden;
  display: grid;
  grid-template-columns: 1fr 1fr;
  box-shadow: 0 30px 60px rgba(31, 41, 55, 0.08);
}

.left-panel {
  background: #f6f6f6;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 36px;
}

.logo {
  width: min(72%, 290px);
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
  margin: 0;
  text-align: center;
  font-size: 9px;
  letter-spacing: 0.16em;
  color: #97a0ac;
}

@media (max-width: 920px) {
  .register-card {
    grid-template-columns: 1fr;
    min-height: auto;
  }

  .left-panel {
    min-height: 240px;
  }

  .right-panel {
    padding: 32px 24px;
  }

  h1 {
    font-size: 34px;
  }

  .row {
    grid-template-columns: 1fr;
  }
}
</style>
