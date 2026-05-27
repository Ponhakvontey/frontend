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
* { box-sizing: border-box; }
.success-page { min-height: 100vh; background: #fff; color: #000; font-family: Helvetica, Arial, sans-serif; }
.container { max-width: 640px; margin: 0 auto; padding: 0 20px; }
.success-main { padding: 70px 0 80px; }
.state-box { background: #fff; border: 1px solid #AABBAA; border-radius: 4px; padding: 48px 32px; display: flex; flex-direction: column; align-items: center; gap: 14px; text-align: center; box-shadow: rgba(0,0,0,0.05) 0 2px 4px; }
.state-box h2 { margin: 0; font-size: 24px; font-weight: 700; color: #000; }
.state-box p { margin: 0; font-size: 14px; color: #808080; max-width: 340px; line-height: 1.6; }
.state-icon { font-size: 40px; }
.spinner-icon { color: #808080; }
.success-circle { width: 68px; height: 68px; border-radius: 50%; background: #f0fdf4; border: 1px solid #AABBAA; display: grid; place-items: center; }
.success-icon { font-size: 30px; color: #16a34a; }
.fail-circle { width: 68px; height: 68px; border-radius: 50%; background: #fff1f2; border: 1px solid #AABBAA; display: grid; place-items: center; }
.fail-icon { font-size: 30px; color: #DA292E; }
.actions { display: flex; gap: 10px; flex-wrap: wrap; justify-content: center; margin-top: 6px; }
.primary-btn { display: inline-flex; align-items: center; justify-content: center; height: 44px; padding: 0 24px; border-radius: 4px; background: #000; color: #fff; font-family: Helvetica, Arial, sans-serif; font-weight: 700; font-size: 14px; text-decoration: none; transition: background 0.15s; }
.primary-btn:hover { background: #211E1E; }
.secondary-btn { display: inline-flex; align-items: center; justify-content: center; height: 44px; padding: 0 24px; border-radius: 4px; background: #fff; color: #000; font-family: Helvetica, Arial, sans-serif; font-weight: 700; font-size: 14px; text-decoration: none; border: 1px solid #000; transition: background 0.15s; }
.secondary-btn:hover { background: #AABBAA; }
</style>
