<script setup lang="ts">
import { uiAssets } from '@/data/home'
</script>

<template>
  <footer class="dashboard-footer">
    <div class="footer-brand">
      <img :src="uiAssets.logo" alt="Ubuyee" class="brand-logo" />
    </div>

    <div class="footer-links">
      <span>PRIVACY POLICY</span>
      <span>TERMS OF SERVICE</span>
      <span>SHIPPING & RETURNS</span>
      <span>CONTACT US</span>
    </div>
  </footer>
</template>

<style scoped>
.dashboard-footer {
  margin-top: auto;
  background: #10161d;
  color: #dce5f3;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
  padding: 26px 28px;
}

.footer-links {
  display: flex;
  gap: 22px;
  flex-wrap: wrap;
  font-size: 11px;
  letter-spacing: 0.08em;
  color: #9bb0d4;
}

.footer-copy {
  font-size: 11px;
  letter-spacing: 0.08em;
  color: #9bb0d4;
  text-align: right;
}
.brand-logo {
  width: 120px;
  margin-bottom: 28px;
}
</style>
