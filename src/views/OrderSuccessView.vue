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
          <i class="fa-regular fa-circle-question state-icon" style="color: #98a2b3;"></i>
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
.success-page {
  min-height: 100vh;
  background: #f7f9fb;
  font-family: Inter, Arial, sans-serif;
}

.container {
  width: min(680px, 100%);
  margin: 0 auto;
  padding: 0 20px;
}

.success-main {
  padding: 80px 0 100px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.state-box {
  background: #fff;
  border: 1px solid #eef2f6;
  border-radius: 24px;
  padding: 56px 40px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.state-box h2 {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  color: #191c1e;
}

.state-box p {
  margin: 0;
  font-size: 15px;
  color: #667085;
  max-width: 420px;
}

/* Success */
.success-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #dcfce7;
  display: grid;
  place-items: center;
  margin-bottom: 8px;
}

.success-icon {
  font-size: 36px;
  color: #16a34a;
}

/* Fail */
.fail-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #fee2e2;
  display: grid;
  place-items: center;
  margin-bottom: 8px;
}

.fail-icon {
  font-size: 36px;
  color: #d92d20;
}

/* Spinner */
.state-icon {
  font-size: 52px;
  margin-bottom: 4px;
}

.spinner-icon {
  color: #003366;
}

/* Actions */
.actions {
  display: flex;
  gap: 14px;
  margin-top: 8px;
  flex-wrap: wrap;
  justify-content: center;
}

.primary-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 48px;
  padding: 0 28px;
  border-radius: 14px;
  background: #513B3C;
  color: #fff;
  font-weight: 700;
  font-size: 14px;
  text-decoration: none;
}

.secondary-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 48px;
  padding: 0 28px;
  border-radius: 14px;
  background: #f4f6f9;
  color: #191c1e;
  font-weight: 600;
  font-size: 14px;
  text-decoration: none;
}
</style>
