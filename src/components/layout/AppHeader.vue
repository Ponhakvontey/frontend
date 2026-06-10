<template>
  <header class="top-nav" :class="{ hidden: isHeaderHidden }">
    <div class="nav-inner">
      <RouterLink to="/" class="brand-link">
        <img :src="uiAssets.logo" alt="Ubuyee" class="brand" />
      </RouterLink>
      <NavMenu :nav-links="navLinks" />
      <div class="right-group">
        <NavActions :cart-count="cartCount" />
        <button
          class="hamburger"
          type="button"
          :class="{ open: menuOpen }"
          aria-label="Toggle navigation"
          @click="menuOpen = !menuOpen"
        >
          <span /><span /><span />
        </button>
      </div>
    </div>
  </header>

  <!-- Mobile drawer — teleported so header's transform doesn't clip it -->
  <Teleport to="body">
    <Transition name="mob-fade">
      <div v-if="menuOpen" class="mob-overlay" @click="menuOpen = false" />
    </Transition>
    <Transition name="mob-slide">
      <div v-if="menuOpen" class="mob-drawer" role="dialog" aria-label="Navigation menu">
        <div class="mob-head">
          <img :src="uiAssets.logo" alt="Ubuyee" class="mob-logo" />
          <button type="button" class="mob-close" @click="menuOpen = false" aria-label="Close">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
        <RouterLink
          v-for="link in navLinks"
          :key="link.id"
          :to="link.slug === 'home' ? '/' : `/${link.slug}`"
          class="mob-link"
          @click="menuOpen = false"
        >
          {{ link.label }}
          <i class="fa-solid fa-chevron-right mob-chevron"></i>
        </RouterLink>

        <div class="mob-divider" />

        <RouterLink to="/profile" class="mob-link" @click="menuOpen = false">
          <span><i class="fa-solid fa-user" style="margin-right:10px;"></i>Account</span>
          <i class="fa-solid fa-chevron-right mob-chevron"></i>
        </RouterLink>

        <button v-if="loggedIn" type="button" class="mob-link mob-logout" @click="handleLogout">
          <span><i class="fa-solid fa-right-from-bracket" style="margin-right:10px;"></i>Sign Out</span>
        </button>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { clearTokens, getUser } from '@/services/apiClient'
import NavMenu from '@/components/layout/NavMenu.vue'
import NavActions from '@/components/layout/NavActions.vue'
import { uiAssets } from '@/data/home'
import type { NavLink } from '@/types/home'

withDefaults(defineProps<{ navLinks: NavLink[]; cartCount?: number }>(), { cartCount: 0 })

const route = useRoute()
const router = useRouter()
const isHeaderHidden = ref(false)
const menuOpen = ref(false)
let lastScrollY = 0

const loggedIn = computed(() => !!getUser())

async function handleLogout() {
  menuOpen.value = false
  try { await fetch(`${import.meta.env.VITE_API_BASE_URL ?? ''}/api/auth/logout`, { method: 'POST', credentials: 'include' }) } catch { /* ignore */ }
  clearTokens()
  router.push('/login')
}

// Close drawer when navigating
watch(() => route.path, () => { menuOpen.value = false })

function handleScroll() {
  const y = window.scrollY
  if (y <= 10) { isHeaderHidden.value = false; lastScrollY = y; return }
  if (y > lastScrollY + 8) isHeaderHidden.value = true
  else if (y < lastScrollY - 8) isHeaderHidden.value = false
  lastScrollY = y
}

onMounted(() => { lastScrollY = window.scrollY; window.addEventListener('scroll', handleScroll, { passive: true }) })
onBeforeUnmount(() => window.removeEventListener('scroll', handleScroll))
</script>

<style scoped>
/* ── Header bar ── */
.top-nav {
  position: fixed;
  top: 0; left: 0;
  width: 100%;
  z-index: 900;
  background: #fff;
  border-bottom: 1px solid #AABBAA;
  height: 50px;
  transform: translateY(0);
  transition: transform 0.25s ease;
}
.top-nav.hidden { transform: translateY(-100%); }

.nav-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 32px;
}

.brand-link { display: flex; align-items: center; flex-shrink: 0; }

.brand {
  width: 100px;
  height: 36px;
  object-fit: contain;
}

.right-group {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

/* ── Hamburger (mobile only) ── */
.hamburger {
  display: none;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 5px;
  width: 40px;
  height: 40px;
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: background 0.15s;
}
.hamburger:hover { background: #f0f0f0; }

.hamburger span {
  display: block;
  width: 22px;
  height: 2px;
  background: #211E1E;
  border-radius: 2px;
  transition: transform 0.25s ease, opacity 0.25s ease;
  transform-origin: center;
}
.hamburger.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
.hamburger.open span:nth-child(2) { opacity: 0; transform: scaleX(0); }
.hamburger.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

@media (max-width: 768px) {
  .hamburger { display: flex; }
  .nav-inner { gap: 12px; }
}

/* ── Mobile overlay ── */
.mob-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.42);
  z-index: 1998;
}

/* ── Mobile drawer ── */
.mob-drawer {
  position: fixed;
  top: 0; left: 0;
  height: 100dvh;
  width: 280px;
  max-width: 85vw;
  background: #fff;
  z-index: 1999;
  display: flex;
  flex-direction: column;
  box-shadow: 4px 0 32px rgba(0, 0, 0, 0.14);
  overflow-y: auto;
  font-family: Helvetica, Arial, sans-serif;
}

.mob-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  border-bottom: 1px solid #e5e5e5;
  flex-shrink: 0;
}

.mob-logo { height: 30px; object-fit: contain; }

.mob-close {
  width: 32px; height: 32px;
  border: none; background: transparent;
  cursor: pointer; border-radius: 6px;
  display: grid; place-items: center;
  color: #808080; font-size: 17px;
  transition: background 0.15s;
}
.mob-close:hover { background: #f0f0f0; }

.mob-link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  font-size: 15px;
  font-weight: 500;
  color: #211E1E;
  text-decoration: none;
  border-bottom: 1px solid #f0f0f0;
  transition: background 0.15s;
}
.mob-link:hover { background: #f8f8f8; }
.mob-chevron { font-size: 10px; color: #AABBAA; }

.mob-divider { height: 1px; background: #f0f0f0; margin: 8px 0; }

.mob-logout {
  width: 100%;
  background: none;
  border: none;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  font-size: 15px;
  font-weight: 500;
  color: #DA292E;
  cursor: pointer;
  font-family: Helvetica, Arial, sans-serif;
  text-align: left;
  transition: background 0.15s;
}
.mob-logout:hover { background: #fff1f2; }

/* ── Transitions ── */
.mob-fade-enter-active, .mob-fade-leave-active { transition: opacity 0.25s ease; }
.mob-fade-enter-from, .mob-fade-leave-to { opacity: 0; }

.mob-slide-enter-active, .mob-slide-leave-active { transition: transform 0.3s ease; }
.mob-slide-enter-from, .mob-slide-leave-to { transform: translateX(-100%); }
</style>
