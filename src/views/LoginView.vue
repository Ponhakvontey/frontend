<template>
  <div class="login-page">
    <div class="login-layout">
      <section class="left-panel">
        <img :src="logo" alt="Ubuyee logo" class="logo" />
      </section>

      <section class="right-panel">
        <div class="login-card">
          <h1>Welcome Back</h1>
          <p class="subtitle">Please enter your details to sign in.</p>

          <form class="form" @submit.prevent="handleLogin">
            <div class="group">
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
            </div>

            <div class="group">
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
            </div>

            <button type="submit" class="btn">Sign In →</button>

            <p class="divider">OR CONTINUE WITH</p>

            <div class="social-row">
              <button type="button" class="social-btn">
                <img :src="googleIcon" class="icon" alt="" />
                <span>Google</span>
              </button>
              <button type="button" class="social-btn">
                <img :src="ssoIcon" class="icon" alt="" />
                <span>GitHub</span>
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

    <p class="footer-text">© 2024 CURATOR BRAND ASSETS • ENCRYPTION STANDARD AES-256</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import eyeIcon from '../assets/confirm.png'
import emailIcon from '../assets/message.png'
import googleIcon from '../assets/google.png'
import logo from '../assets/logo.png'
import passwordIcon from '../assets/password.png'
import ssoIcon from '../assets/git.png'

const email = ref('')
const password = ref('')
const router = useRouter()

function handleLogin() {
  if (!email.value || !password.value) {
    alert('Please enter email and password.')
    return
  }

  if (email.value === 'admin@gmail.com' && password.value === 'admin123') {
    localStorage.setItem('isLoggedIn', 'true')
    localStorage.setItem('userRole', 'admin')
    router.push('/admin')
    return
  }

  localStorage.setItem('isLoggedIn', 'true')
  localStorage.setItem('userRole', 'user')
  router.push('/')
}
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.login-page {
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

.login-layout {
  width: min(100%, 1080px);
  min-height: 700px;
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
  max-width: unset;
}

.login-card {
  width: 100%;
  max-width: 420px;
  margin: 0 auto;
  background: transparent;
  border-radius: 0;
  padding: 0;
  box-shadow: none;
}

h1 {
  margin: 0;
  font-size: 38px;
  line-height: 1.08;
  color: #222a35;
  font-weight: 800;
}

.subtitle {
  margin: 8px 0 24px;
  color: #5f6674;
  font-size: 14px;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.group label {
  font-size: 10px;
  font-weight: 700;
  color: #5f6674;
  letter-spacing: 0.09em;
}

.input-box {
  height: 44px;
  border-radius: 12px;
  background: #ffffff;
  border: 0.5px solid rgba(0, 0, 0, 0.1);
  padding: 0 12px;
  display: flex;
  align-items: center;
  gap: 8px;
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

.btn {
  margin-top: 8px;
  height: 46px;
  border: 0;
  border-radius: 12px;
  background: #2f5bea;
  color: white;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 8px 18px rgba(47, 91, 234, 0.24);
}

.btn:hover {
  background: #264cd0;
}

.divider {
  margin: 4px 0 0;
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
  height: 36px;
  border: 0;
  border-radius: 10px;
  background: #ffffff;
  border: 0.5px solid rgba(0, 0, 0, 0.1);
  color: #293241;
  font-size: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: pointer;
}

.social-btn:hover {
  background: #e6e9ed;
}

.register-text {
  margin: 2px 0 0;
  text-align: center;
  font-size: 12px;
  color: #666d7d;
}

.register-text a {
  color: #2f5bea;
  text-decoration: none;
}

.icon {
  width: 13px;
  height: 13px;
  object-fit: contain;
  opacity: 0.72;
}

.icon.eye {
  width: 12px;
  height: 12px;
}

.footer-text {
  margin: 0;
  text-align: center;
  font-size: 9px;
  letter-spacing: 0.16em;
  color: #97a0ac;
}

@media (max-width: 980px) {
  .login-layout {
    grid-template-columns: 1fr;
    gap: 24px;
    min-height: auto;
  }

  .right-panel {
    max-width: 460px;
    margin: 0 auto;
  }

  .logo {
    width: min(70%, 340px);
  }

  h1 {
    font-size: 32px;
  }
}
</style>
