<template>
  <div class="success-page">
    <AppHeader :nav-links="navLinks" :cart-count="0" />

    <main class="success-main">
      <div class="container">

        <!-- Verifying -->
        <div v-if="verifying" class="state-box">
          <i class="fa-solid fa-spinner fa-spin state-icon spinner-icon"></i>
          <h2>Confirming your payment…</h2>
          <p>Please wait while we verify your payment with Stripe.</p>
        </div>

        <!-- Success -->
        <div v-else-if="status === 'PAID'" class="state-box">
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

        <!-- Error / not paid -->
        <div v-else class="state-box">
          <div class="fail-circle">
            <i class="fa-solid fa-xmark fail-icon"></i>
          </div>
          <h2>Payment Not Confirmed</h2>
          <p>{{ errorMsg || 'We could not verify your payment. Please try again or contact support.' }}</p>
          <div class="actions">
            <RouterLink to="/payment" class="primary-btn">Try Again</RouterLink>
            <RouterLink to="/cart" class="secondary-btn">Back to Cart</RouterLink>
          </div>
        </div>

      </div>
    </main>

    <AppFooter :footer-columns="footerColumns" :social-links="socialLinks" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import { getFooterColumns, getNavLinks, getSocialLinks } from '@/services/homeService'
import type { FooterColumn, NavLink, SocialLink } from '@/types/home'
import { api } from '@/services/apiClient'
import { writeStorage } from '@/utils/storage'

const route = useRoute()

const navLinks     = ref<NavLink[]>([])
const footerColumns = ref<FooterColumn[]>([])
const socialLinks  = ref<SocialLink[]>([])

const verifying = ref(true)
const status    = ref('')
const errorMsg  = ref('')

onMounted(async () => {
  navLinks.value      = await getNavLinks()
  footerColumns.value = await getFooterColumns()
  socialLinks.value   = await getSocialLinks()

  const sessionId = route.query.session_id as string | undefined
  if (!sessionId) {
    verifying.value = false
    errorMsg.value  = 'No payment session found.'
    return
  }

  try {
    const res = await api.get<{ status: string; orderId: number }>(`/api/stripe/verify/${sessionId}`)
    status.value = res.status
    if (res.status === 'PAID') {
      writeStorage('cartItems', [])
    }
  } catch (err: unknown) {
    errorMsg.value = err instanceof Error ? err.message : 'Verification failed.'
  } finally {
    verifying.value = false
  }
})
</script>

<style scoped>
.success-page { min-height: 100vh; background: #f7f9fb; font-family: Inter, Arial, sans-serif; }
.container { width: min(680px, 100%); margin: 0 auto; padding: 0 20px; }
.success-main { padding: 80px 0; }
.state-box { background: #fff; border: 1px solid #eef2f6; border-radius: 24px; padding: 48px 32px; display: flex; flex-direction: column; align-items: center; gap: 16px; text-align: center; }
.state-box h2 { margin: 0; font-size: 28px; font-weight: 600; color: #191c1e; }
.state-box p { margin: 0; font-size: 15px; color: #667085; max-width: 340px; line-height: 1.6; }
.state-icon { font-size: 44px; }
.spinner-icon { color: #513B3C; }
.success-circle { width: 72px; height: 72px; border-radius: 999px; background: #dcfce7; display: grid; place-items: center; }
.success-icon { font-size: 34px; color: #16a34a; }
.fail-circle { width: 72px; height: 72px; border-radius: 999px; background: #fee2e2; display: grid; place-items: center; }
.fail-icon { font-size: 34px; color: #d92d20; }
.actions { display: flex; gap: 12px; flex-wrap: wrap; justify-content: center; margin-top: 8px; }
.primary-btn { padding: 12px 28px; border-radius: 12px; background: #513B3C; color: #fff; font-weight: 700; font-size: 14px; text-decoration: none; }
.primary-btn:hover { background: #6b4f50; }
.secondary-btn { padding: 12px 28px; border-radius: 12px; background: #f4f6f9; color: #344054; font-weight: 600; font-size: 14px; text-decoration: none; }
.secondary-btn:hover { background: #e8ecf4; }
</style>
