<template>
  <footer class="site-footer">

    <!-- ── Main Footer ── -->
    <div class="footer-main">
      <div class="footer-container">

        <!-- Brand column -->
        <div class="footer-brand">
          <p class="brand-name">UBUYEE</p>
          <p class="brand-tagline">
            We have clothes that suits your style and which you're proud to wear.
            From women to men.
          </p>
          <div class="social-row">
            <a
              v-for="s in socialLinks"
              :key="s.id"
              :href="s.href"
              :aria-label="s.platform"
              class="social-btn"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i :class="s.icon"></i>
            </a>
          </div>
        </div>

        <!-- Link columns -->
        <div class="footer-columns">
          <div
            v-for="col in footerColumns"
            :key="col.id"
            class="footer-col"
          >
            <h4 class="col-title">{{ col.title.toUpperCase() }}</h4>
            <ul class="col-links">
              <li v-for="link in col.links" :key="link.slug">
                <RouterLink :to="getFooterPath(link.slug)" class="footer-link">
                  {{ link.label }}
                </RouterLink>
              </li>
            </ul>
          </div>
        </div>

      </div>
    </div>

    <!-- ── Bottom Bar ── -->
    <div class="footer-bottom">
      <div class="footer-container bottom-inner">
<div class="payment-icons">
          <span class="pay-badge"><img src="https://cdn.simpleicons.org/visa" alt="Visa" class="pay-img" /></span>
          <span class="pay-badge"><img src="https://cdn.simpleicons.org/mastercard" alt="Mastercard" class="pay-img" /></span>
          <span class="pay-badge"><img :src="abaLogo" alt="ABA Pay" class="pay-img" /></span>
          <span class="pay-badge"><i class="fa-brands fa-cc-paypal"></i></span>
          <span class="pay-badge"><i class="fa-brands fa-cc-apple-pay"></i></span>
          <span class="pay-badge google-pay">G Pay</span>
        </div>
      </div>
    </div>

  </footer>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
import type { FooterColumn, SocialLink } from '@/types/home'
import abaLogo from '@/assets/aba.png'

defineProps<{
  footerColumns: FooterColumn[]
  socialLinks: SocialLink[]
}>()

function getFooterPath(slug: string): string {
  const mappedSlug = slug === 'orders' ? 'order-history' : slug
  const normalized = mappedSlug.startsWith('/') ? mappedSlug : `/${mappedSlug}`
  const supported = new Set([
    '/', '/home', '/sell', '/login', '/register', '/order-history', '/forgot-password', '/about'
  ])
  if (normalized === '/home') return '/'
  return supported.has(normalized) ? normalized : '/'
}
</script>

<style scoped>
* { box-sizing: border-box; }

/* ── Shared container ── */
.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* ══════════════════════════════════════════
   MAIN FOOTER
══════════════════════════════════════════ */
.footer-main {
  background: #f5f5f5;
  border-top: 1px solid #AABBAA;
  padding: 48px 0 40px;
  font-family: Helvetica, Arial, sans-serif;
}

.footer-main .footer-container {
  display: flex;
  gap: 40px;
  flex-wrap: wrap;
  align-items: flex-start;
}

/* Brand column */
.footer-brand {
  flex: 1 1 200px;
  max-width: 240px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.brand-name {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #000;
  letter-spacing: 0.08em;
}

.brand-tagline {
  margin: 0;
  font-size: 13px;
  line-height: 1.7;
  color: #808080;
}

.social-row { display: flex; gap: 10px; flex-wrap: wrap; }

.social-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1px solid #AABBAA;
  background: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #000;
  text-decoration: none;
  transition: background 0.15s, border-color 0.15s, color 0.15s;
}
.social-btn:hover { background: #000; border-color: #000; color: #fff; }
.social-btn i { font-size: 13px; }

/* Link columns */
.footer-columns {
  display: flex;
  gap: 40px;
  flex-wrap: wrap;
  flex: 1 1 480px;
  justify-content: flex-end;
}

.footer-col {
  display: flex;
  flex-direction: column;
  gap: 0;
  min-width: 110px;
}

.col-title {
  margin: 0 0 16px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: #000;
  text-transform: uppercase;
}

.col-links {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.footer-link {
  text-decoration: none;
  font-size: 13px;
  color: #808080;
  transition: color 0.15s;
}
.footer-link:hover { color: #000; }

/* ══════════════════════════════════════════
   BOTTOM BAR
══════════════════════════════════════════ */
.footer-bottom {
  background: #f5f5f5;
  border-top: 1px solid #AABBAA;
  padding: 16px 20px;
  font-family: Helvetica, Arial, sans-serif;
}

.bottom-inner {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
}

.payment-icons { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }

.pay-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 3px 8px;
  border: 1px solid #AABBAA;
  border-radius: 4px;
  background: #fff;
  font-size: 22px;
  line-height: 1;
}

.pay-img {
  height: 22px;
  width: auto;
  display: block;
}

.pay-badge.google-pay {
  font-size: 10px;
  font-weight: 700;
  color: #000;
  letter-spacing: -0.02em;
  padding: 5px 8px;
  font-family: Helvetica, Arial, sans-serif;
}

/* ══════════════════════════════════════════
   RESPONSIVE
══════════════════════════════════════════ */
@media (max-width: 900px) {
  .footer-main .footer-container { flex-direction: column; gap: 28px; }
  .footer-brand { max-width: 100%; }
  .footer-columns { width: 100%; justify-content: flex-start; gap: 24px; }
  .footer-col { min-width: 130px; }
  .bottom-inner { flex-direction: column; align-items: flex-start; gap: 10px; }
}

@media (max-width: 560px) {
  .footer-columns { gap: 18px; }
}
</style>
