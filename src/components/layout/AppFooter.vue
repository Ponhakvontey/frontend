<template>
  <footer class="site-footer">
    <div class="footer-inner">
      <div class="footer-brand">
        <img :src="uiAssets.logo" alt="Ubuyee" class="brand-logo" />
        <p class="brand-text">
          EDITORIAL RETAIL FOR THE DISCERNING MODERN HOME. WE CURATE OBJECTS THAT COMMAND TRUST
          THROUGH PRECISION.
        </p>
      </div>

      <div class="footer-columns">
        <div v-for="column in footerColumns" :key="column.id" class="footer-column">
          <h4>{{ column.title }}</h4>

          <RouterLink
            v-for="link in column.links"
            :key="link.slug"
            :to="getFooterPath(link.slug)"
            class="footer-link"
          >
            {{ link.label }}
          </RouterLink>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { uiAssets } from '@/data/home'
import type { FooterColumn } from '@/types/home'

defineProps<{
  footerColumns: FooterColumn[]
}>()

function getFooterPath(slug: string) {
  const normalized = slug.startsWith('/') ? slug : `/${slug}`
  const supportedPaths = new Set([
    '/',
    '/home',
    '/sell',
    '/login',
    '/register',
    '/order-history',
    '/forgot-password',
  ])
  if (normalized === '/home') return '/'
  return supportedPaths.has(normalized) ? normalized : '/'
}
</script>

<style scoped>
.site-footer {
  background: #10161d;
  color: #d7e1f2;
  padding: 70px 32px 50px;
  overflow-x: hidden;
}

.footer-inner {
  max-width: 1440px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 40px;
  flex-wrap: wrap;
}

.footer-brand {
  flex: 1 1 320px;
  max-width: 420px;
}

.brand-logo {
  width: 120px;
  margin-bottom: 28px;
}

.brand-text {
  font-size: 16px;
  line-height: 2;
  letter-spacing: 0.08em;
  color: #9bb0d4;
  word-break: break-word;
}

.footer-columns {
  display: flex;
  gap: 60px;
  flex-wrap: wrap;
  flex: 1 1 500px;
  justify-content: flex-end;
}

.footer-column {
  display: flex;
  flex-direction: column;
  gap: 18px;
  min-width: 140px;
}

.footer-column h4 {
  margin: 0 0 14px;
  font-size: 16px;
  letter-spacing: 0.12em;
  color: #ffffff;
}

.footer-link {
  color: #9bb0d4;
  text-decoration: none;
  font-size: 16px;
  letter-spacing: 0.08em;
}

.footer-link:hover {
  color: #ffffff;
}

@media (max-width: 900px) {
  .site-footer {
    padding: 50px 20px 36px;
  }

  .footer-inner {
    flex-direction: column;
    gap: 32px;
  }

  .footer-columns {
    width: 100%;
    justify-content: flex-start;
    gap: 32px;
  }

  .footer-column {
    min-width: 120px;
  }
}
</style>
