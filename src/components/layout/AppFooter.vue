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
          <span class="pay-badge"><i class="fa-brands fa-cc-visa"></i></span>
          <span class="pay-badge"><i class="fa-brands fa-cc-mastercard"></i></span>
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

defineProps<{
  footerColumns: FooterColumn[]
  socialLinks: SocialLink[]
}>()

function getFooterPath(slug: string): string {
  const mappedSlug = slug === 'orders' ? 'order-history' : slug
  const normalized = mappedSlug.startsWith('/') ? mappedSlug : `/${mappedSlug}`
  const supported = new Set([
    '/', '/home', '/sell', '/login', '/register', '/order-history', '/forgot-password',
  ])
  if (normalized === '/home') return '/'
  return supported.has(normalized) ? normalized : '/'
}
</script>

<style scoped>
/* ── Shared container ── */
.footer-container {
  width: min(1280px, 100%);
  margin: 0 auto;
  padding: 0 32px;
}

/* ══════════════════════════════════════════
   MAIN FOOTER
══════════════════════════════════════════ */
.footer-main {
  background: #f0f0f0;
  padding: 56px 0 48px;
}

.footer-main .footer-container {
  display: flex;
  gap: 48px;
  flex-wrap: wrap;
  align-items: flex-start;
}

/* Brand column */
.footer-brand {
  flex: 1 1 220px;
  max-width: 260px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.brand-name {
  margin: 0;
  font-size: 28px;
  font-weight: 900;
  color: #111;
  letter-spacing: -0.02em;
}

.brand-tagline {
  margin: 0;
  font-size: 14px;
  line-height: 1.7;
  color: #666;
}

.social-row {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.social-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid #ddd;
  background: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #111;
  text-decoration: none;
  transition: background 0.18s, border-color 0.18s, color 0.18s;
}

.social-btn:hover {
  background: #111;
  border-color: #111;
  color: #fff;
}

.social-btn i {
  font-size: 14px;
}

/* Link columns */
.footer-columns {
  display: flex;
  gap: 48px;
  flex-wrap: wrap;
  flex: 1 1 500px;
  justify-content: flex-end;
}

.footer-col {
  display: flex;
  flex-direction: column;
  gap: 0;
  min-width: 120px;
}

.col-title {
  margin: 0 0 20px;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: #111;
}

.col-links {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.footer-link {
  text-decoration: none;
  font-size: 14px;
  color: #555;
  transition: color 0.18s;
}

.footer-link:hover {
  color: #111;
}

/* ══════════════════════════════════════════
   BOTTOM BAR
══════════════════════════════════════════ */
.footer-bottom {
  background: #f0f0f0;
  border-top: 1px solid #ddd;
  padding: 20px 32px;
}

.bottom-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
}


.payment-icons {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.pay-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: #fff;
  font-size: 26px;
  line-height: 1;
  /* Let FontAwesome brand icons render their natural brand colors */
}

.pay-badge.google-pay {
  font-size: 11px;
  font-weight: 700;
  color: #333;
  letter-spacing: -0.02em;
  padding: 6px 10px;
}

/* ══════════════════════════════════════════
   RESPONSIVE
══════════════════════════════════════════ */
@media (max-width: 900px) {
  .footer-main .footer-container {
    flex-direction: column;
    gap: 36px;
  }

  .footer-brand {
    max-width: 100%;
  }

  .footer-columns {
    width: 100%;
    justify-content: flex-start;
    gap: 28px;
  }

  .footer-col {
    min-width: 140px;
  }

  .bottom-inner {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}

@media (max-width: 560px) {
  .footer-columns {
    gap: 20px;
  }
}
</style>
