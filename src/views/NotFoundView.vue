<template>
  <section class="not-found">
    <div class="inner">
      <div class="gif-box" aria-hidden="true">
        <h1 class="code">404</h1>
      </div>
      <div class="message">
        <h3>Look like you're lost</h3>
        <p>The page you are looking for is not available!</p>
        <RouterLink to="/" class="home-btn">Go to Home</RouterLink>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<style scoped>
* { box-sizing: border-box; }

.not-found {
  background: #fff;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: Helvetica, Arial, sans-serif;
  padding: 24px;
}

.inner {
  width: 100%;
  max-width: 640px;
  text-align: center;
}

.gif-box {
  background-image: url('https://cdn.dribbble.com/users/285475/screenshots/2083086/dribbble_1.gif');
  background-position: center;
  background-repeat: no-repeat;
  background-size: contain;
  height: 350px;
  display: flex;
  align-items: flex-start;
  justify-content: center;
}

.code {
  font-size: 80px;
  font-weight: 700;
  color: #000;
  margin: 0;
  padding-top: 28px;
  line-height: 1;
}

.message {
  margin-top: -40px;
}

.message h3 {
  font-size: 28px;
  font-weight: 700;
  color: #000;
  margin: 0 0 12px;
}

.message p {
  font-size: 15px;
  color: #333;
  margin: 0 0 24px;
}

.home-btn {
  display: inline-block;
  padding: 12px 28px;
  background: #111;
  color: #fff;
  font-family: Helvetica, Arial, sans-serif;
  font-size: 15px;
  font-weight: 700;
  border-radius: 6px;
  text-decoration: none;
  transition: background 0.15s;
}
.home-btn:hover { background: #333; }

@media (max-width: 480px) {
  .gif-box { height: 220px; }
  .code { font-size: 56px; }
  .message h3 { font-size: 22px; }
}
</style>
