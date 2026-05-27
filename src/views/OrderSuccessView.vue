<template>
  <div class="success-page">
    <AppHeader :nav-links="navLinks" :cart-count="0" />

    <main class="success-main">
      <div class="container">
        <!-- Polling / loading -->
        <div v-if="polling" class="state-box">
          <i class="fa-solid fa-spinner fa-spin state-icon spinner-icon"></i>
          <h2>Confirming your payment…</h2>
          <p>Please wait while we verify your payment with ABA PayWay.</p>
        </div>

        <!-- Success -->
        <div v-else-if="status === 'COMPLETED'" class="state-box">
          <div class="success-circle">
            <i class="fa-solid fa-check success-icon"></i>
          </div>
          <h2>Payment Successful!</h2>
          <p>Your order has been placed. You'll receive a confirmation shortly.</p>
          <div class="actions">
            <RouterLink to="/order-history" class="primary-btn">View My Orders</RouterLink>
            <RouterLink to="/sell" class="secondary-btn">Continue Shopping</RouterLink>
          </div>
        </div>

        <!-- Failed / cancelled -->
        <div v-else-if="status === 'FAILED'" class="state-box">
          <div class="fail-circle">
            <i class="fa-solid fa-xmark fail-icon"></i>
          </div>
          <h2>Payment Failed</h2>
          <p>Your payment was not completed. No charge was made.</p>
          <div class="actions">
            <RouterLink to="/payment" class="primary-btn">Try Again</RouterLink>
            <RouterLink to="/cart" class="secondary-btn">Back to Cart</RouterLink>
          </div>
        </div>

        <!-- No tran_id — direct navigation -->
        <div v-else class="state-box">
          <i class="fa-regular fa-circle-question state-icon" style="color: #808080;"></i>
          <h2>Nothing to show here</h2>
          <p>This page is shown after a PayWay payment. Start shopping to place an order.</p>
          <RouterLink to="/sell" class="primary-btn" style="margin-top: 8px;">Browse Products</RouterLink>
        </div>
      </div>
    </main>

    <AppFooter :footer-columns="footerColumns" :social-links="socialLinks" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import { getFooterColumns, getNavLinks, getSocialLinks } from '@/services/homeService'
import type { FooterColumn, NavLink, SocialLink } from '@/types/home'
import { api, isLoggedIn } from '@/services/apiClient'
import { saveCartItems } from '@/utils/commerce'

const route = useRoute()

const navLinks = ref<NavLink[]>([])
const footerColumns = ref<FooterColumn[]>([])
const socialLinks = ref<SocialLink[]>([])

const polling = ref(false)
const status = ref<'COMPLETED' | 'FAILED' | null>(null)

let pollInterval: ReturnType<typeof setInterval> | null = null

async function checkStatus(tranId: string) {
  try {
    const res = await api.get<{ status: string }>(`/api/payment/status/${tranId}`)
    if (res.status === 'COMPLETED') {
      status.value = 'COMPLETED'
      polling.value = false
      // Clear frontend cart since backend order is now created
      saveCartItems([])
      if (pollInterval) clearInterval(pollInterval)
    } else if (res.status === 'FAILED') {
      status.value = 'FAILED'
      polling.value = false
      if (pollInterval) clearInterval(pollInterval)
    }
    // If still PENDING, keep polling
  } catch {
    // Network error — keep polling
  }
}

onMounted(async () => {
  navLinks.value = await getNavLinks()
  footerColumns.value = await getFooterColumns()
  socialLinks.value = await getSocialLinks()

  const tranId = route.query.tran_id as string | undefined

  if (tranId && isLoggedIn()) {
    polling.value = true
    // Check immediately, then every 3 seconds. Stop after 2 minutes.
    await checkStatus(tranId)
    if (polling.value) {
      pollInterval = setInterval(() => checkStatus(tranId), 3000)
      setTimeout(() => {
        if (pollInterval) {
          clearInterval(pollInterval)
          polling.value = false
          if (!status.value) status.value = 'FAILED'
        }
      }, 120_000)
    }
  }
})

onUnmounted(() => {
  if (pollInterval) clearInterval(pollInterval)
})
</script>

<style scoped>
* { box-sizing: border-box; }

.success-page {
  min-height: 100vh;
  background: #fff;
  color: #000;
  font-family: Helvetica, Arial, sans-serif;
}

.container {
  max-width: 640px;
  margin: 0 auto;
  padding: 0 20px;
}

.success-main { padding: 70px 0 80px; }

.state-box {
  background: #fff;
  border: 1px solid #AABBAA;
  border-radius: 4px;
  padding: 56px 40px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  box-shadow: rgba(0,0,0,0.05) 0 2px 4px;
}

.state-box h2 { margin: 0; font-size: 24px; font-weight: 700; color: #000; }
.state-box p  { margin: 0; font-size: 14px; color: #808080; max-width: 420px; }

.success-circle {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: #f0fdf4;
  border: 1px solid #AABBAA;
  display: grid;
  place-items: center;
  margin-bottom: 4px;
}
.success-icon { font-size: 32px; color: #16a34a; }

.fail-circle {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: #fff1f2;
  border: 1px solid #AABBAA;
  display: grid;
  place-items: center;
  margin-bottom: 4px;
}
.fail-icon { font-size: 32px; color: #DA292E; }

.state-icon { font-size: 44px; margin-bottom: 4px; }
.spinner-icon { color: #808080; }

.actions {
  display: flex;
  gap: 10px;
  margin-top: 8px;
  flex-wrap: wrap;
  justify-content: center;
}

.primary-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 44px;
  padding: 0 24px;
  border-radius: 4px;
  background: #000;
  color: #fff;
  font-family: Helvetica, Arial, sans-serif;
  font-weight: 700;
  font-size: 14px;
  text-decoration: none;
  transition: background 0.15s;
}
.primary-btn:hover { background: #211E1E; }

.secondary-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 44px;
  padding: 0 24px;
  border-radius: 4px;
  background: #fff;
  color: #000;
  font-family: Helvetica, Arial, sans-serif;
  font-weight: 700;
  font-size: 14px;
  text-decoration: none;
  border: 1px solid #000;
  transition: background 0.15s;
}
.secondary-btn:hover { background: #AABBAA; }
</style>
