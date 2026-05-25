<template>
  <footer class="dashboard-footer">
    <span class="footer-copy">
      <i class="fa-regular fa-copyright"></i>
      {{ year }} Ubuyee. All rights reserved.
    </span>
    <span class="footer-env">
      <i class="fa-solid fa-circle env-dot"></i>
      Admin Console
    </span>
  </footer>
</template>

<script setup lang="ts">
const year = new Date().getFullYear()
</script>

<style scoped>
.dashboard-footer {
  background: #0f172a;
  color: #64748b;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 28px;
  font-family: 'Inter', Arial, sans-serif;
  font-size: 12px;
  flex-shrink: 0;
}

.footer-copy {
  display: flex;
  align-items: center;
  gap: 6px;
}

.footer-env {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 500;
}

.env-dot {
  font-size: 8px;
  color: #16a34a;
}
</style>
