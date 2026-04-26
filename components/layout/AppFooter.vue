<template>
  <footer class="footer">
    <div class="container footer-main">
      <div class="footer-brand">
        <img :src="uiAssets.logo" alt="Ubuyee" />
        <p>
          EDITORIAL RETAIL FOR THE DISCERNING MODERN HOME. WE CURATE OBJECTS THAT COMMAND TRUST
          THROUGH PRECISION.
        </p>
      </div>
      <div class="footer-columns">
        <div v-for="column in footerColumns" :key="column.id">
          <h5>{{ column.title }}</h5>
          <template v-for="link in column.links" :key="link.slug">
            <a :href="link.href ?? '#'">{{ link.label }}</a>
          </template>
        </div>
      </div>
    </div>

    <div class="container footer-bottom">
      <div class="socials">
        <template v-for="social in socialLinks" :key="social.id">
          <a :href="social.href">
            <img :src="social.icon" :alt="social.platform" />
          </a>
        </template>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { uiAssets } from '@/data/home'
import type { FooterColumn, SocialLink } from '@/types/home'

defineProps<{
  footerColumns: FooterColumn[]
  socialLinks: SocialLink[]
}>()
</script>

<style scoped>
.footer {
  background: #191c1e;
  color: #94a3b8;
  padding-top: 64px;
}
.container {
  width: min(1440px, 100%);
  margin: 0 auto;
}
.footer-main {
  display: flex;
  justify-content: space-between;
  gap: 64px;
  padding: 0 48px;
}
.footer-brand {
  max-width: 320px;
}
.footer-brand img {
  width: 120px;
  height: 42px;
  object-fit: contain;
  margin-bottom: 24px;
}
.footer-brand p {
  margin: 0;
  font-size: 12px;
  line-height: 24px;
  letter-spacing: 0.1em;
}
.footer-columns {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 64px;
}
.footer-columns h5 {
  margin: 0 0 24px;
  color: #fff;
  font-size: 12px;
  line-height: 16px;
  letter-spacing: 0.2em;
  font-weight: 400;
}
.footer-columns a {
  display: block;
  color: #94a3b8;
  text-decoration: none;
  margin-bottom: 16px;
  font-size: 12px;
  line-height: 16px;
  letter-spacing: 0.1em;
}
.footer-bottom {
  margin-top: 64px;
  border-top: 1px solid #1e293b;
  padding: 32px 48px 40px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 24px;
}
.socials {
  display: flex;
  gap: 24px;
}
.socials img {
  width: 12px;
  height: 12px;
}
@media (max-width: 1100px) {
  .footer-main {
    flex-direction: column;
  }
}
@media (max-width: 760px) {
  .footer-main,
  .footer-bottom {
    padding-left: 16px;
    padding-right: 16px;
  }
  .footer-bottom {
    flex-direction: column;
    align-items: flex-start;
  }
  .footer-columns {
    grid-template-columns: 1fr;
  }
}
</style>
