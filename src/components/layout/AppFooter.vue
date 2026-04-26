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
  if (slug === 'home') return '/'
  return `/${slug}`
}
</script>

<style scoped>
.site-footer {
  background: #10161d;
  color: #d7e1f2;
  padding: 70px 70px 50px;
}

.footer-inner {
  display: flex;
  justify-content: space-between;
  gap: 60px;
}

.footer-brand {
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
}

.footer-columns {
  display: flex;
  gap: 80px;
}

.footer-column {
  display: flex;
  flex-direction: column;
  gap: 18px;
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
</style>
