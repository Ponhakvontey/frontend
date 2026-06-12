<template>
  <RouterView v-slot="{ Component, route }">
    <Transition :name="route.meta.transition as string || 'page'" mode="out-in">
      <component :is="Component" :key="route.path" />
    </Transition>
  </RouterView>
  <CartSidebar />
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import CartSidebar from '@/components/layout/CartSidebar.vue'
import logoUrl from '@/assets/logo.png'

onMounted(() => {
  const link = document.getElementById('favicon') as HTMLLinkElement | null
  if (link) link.href = logoUrl
})
</script>

<style>
/* ── Error shake ── */
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  15%       { transform: translateX(-5px); }
  30%       { transform: translateX(5px); }
  45%       { transform: translateX(-4px); }
  60%       { transform: translateX(4px); }
  75%       { transform: translateX(-2px); }
  90%       { transform: translateX(2px); }
}

.field--error .input-wrap {
  animation: shake 0.45s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
}

/* ── Scroll reveal ── */
.sr-base {
  transition: opacity 0.65s cubic-bezier(0.22, 1, 0.36, 1),
              transform 0.65s cubic-bezier(0.22, 1, 0.36, 1);
  will-change: opacity, transform;
}
.sr-up    { opacity: 0; transform: translateY(40px); }
.sr-left  { opacity: 0; transform: translateX(-48px); }
.sr-right { opacity: 0; transform: translateX(48px); }
.sr-fade  { opacity: 0; transform: none; }
.sr-zoom  { opacity: 0; transform: scale(0.92); }

.sr-visible {
  opacity: 1 !important;
  transform: none !important;
}

/* ── Page transition ── */
.page-enter-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.page-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.page-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
.page-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
