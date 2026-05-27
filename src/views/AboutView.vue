<template>
  <div class="about-page">
    <AppHeader :nav-links="navLinks" :cart-count="cartCount" />

    <main class="about-main">
      <section class="intro-section">
        <div class="container intro-grid">
          <div class="intro-copy">
            <p class="eyebrow">ABOUT US</p>
            <h1>Developers behind the Ubuyee project.</h1>
            <p>
              This page introduces the team who built the Ubuyee e-commerce frontend. The project focuses on a clean Vue interface, organized service files, responsive pages, and flows that are ready to connect with a backend API.
            </p>
          </div>

          <div class="project-card">
            <img :src="aboutImages[0]" alt="Ubuyee" />
            <h2>Ubuyee Frontend</h2>
            <p>Home, sell, product detail, wishlist, checkout, profile, invoice, and admin screens prepared in one consistent UI style.</p>
          </div>
        </div>
      </section>

      <section class="container stats-grid">
        <article v-for="item in aboutStats" :key="item.id" class="stat-card">
          <strong>{{ item.value }}</strong>
          <p>{{ item.label }}</p>
        </article>
      </section>

      <section class="container values-section">
        <div class="section-head">
          <p class="eyebrow">PROJECT FOCUS</p>
          <h2>Clean structure, usable pages, backend-ready services.</h2>
        </div>

        <div class="values-grid">
          <article v-for="item in aboutValues" :key="item.id" class="value-card">
            <h3>{{ item.title }}</h3>
            <p>{{ item.description }}</p>
          </article>
        </div>
      </section>

      <section class="team-section">
        <div class="container">
          <div class="team-head">
            <div>
              <p class="eyebrow">THE TEAM</p>
              <h2>Meet us</h2>
            </div>
            <p>People behind this project.</p>
          </div>

          <div class="team-grid">
            <article v-for="member in teamMembers" :key="member.id" class="team-card">
              <div class="team-image">
                <img :src="member.image" :alt="member.name" />
              </div>
              <h3>{{ member.name }}</h3>
              <p>{{ member.role }}</p>
            </article>
          </div>
        </div>
      </section>
    </main>

    <AppFooter :footer-columns="footerColumns" :social-links="socialLinks" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import { aboutImages, aboutStats, aboutValues, teamMembers } from '@/data/about'
import { getFooterColumns, getNavLinks, getSocialLinks } from '@/services/homeService'
import { loadCartItems } from '@/utils/commerce'
import type { FooterColumn, NavLink, SocialLink } from '@/types/home'

const navLinks = ref<NavLink[]>([])
const footerColumns = ref<FooterColumn[]>([])
const socialLinks = ref<SocialLink[]>([])
const cartItems = ref(loadCartItems())
const cartCount = computed(() => cartItems.value.reduce((sum, item) => sum + item.quantity, 0))

onMounted(async () => {
  navLinks.value = await getNavLinks()
  footerColumns.value = await getFooterColumns()
  socialLinks.value = await getSocialLinks()
})
</script>

<style scoped>
* { box-sizing: border-box; }

.about-page {
  min-height: 100vh;
  background: #fff;
  color: #000;
  font-family: Helvetica, Arial, sans-serif;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.about-main { padding: 70px 0 0; }

.intro-section { padding: 40px 0 32px; }

.intro-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 380px;
  gap: 20px;
  align-items: stretch;
}

.eyebrow {
  margin: 0 0 8px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.12em;
  color: #808080;
  text-transform: uppercase;
}

.intro-copy,
.project-card,
.stat-card,
.value-card {
  background: #fff;
  border: 1px solid #AABBAA;
  border-radius: 4px;
  box-shadow: rgba(0,0,0,0.05) 0 2px 4px;
}

.intro-copy { padding: 28px; }

.intro-copy h1,
.section-head h2,
.team-head h2 {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  line-height: 1.3;
}

.intro-copy p:not(.eyebrow),
.project-card p,
.stat-card p,
.value-card p,
.team-head > p,
.team-card p {
  color: #808080;
  line-height: 1.6;
  font-size: 14px;
}

.intro-copy p:not(.eyebrow) { margin: 16px 0 0; }

.project-card { padding: 24px; }

.project-card img {
  width: 100px;
  height: 40px;
  object-fit: contain;
  filter: brightness(0);
  margin-bottom: 20px;
}

.project-card h2 { margin: 0 0 10px; font-size: 20px; font-weight: 700; }
.project-card p { margin: 0; }

.stats-grid,
.values-grid,
.team-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.stat-card,
.value-card { padding: 20px; }

.stat-card strong {
  display: block;
  margin-bottom: 10px;
  font-size: 32px;
  font-weight: 700;
  color: #DA292E;
}

.stat-card p, .value-card p, .team-card p { margin: 0; }

.values-section { padding-top: 40px; }

.section-head { max-width: 800px; margin-bottom: 20px; }

.value-card h3 { margin: 0 0 10px; font-size: 18px; font-weight: 700; }

.team-section {
  margin-top: 56px;
  padding: 48px 0 60px;
  background: #f5f5f5;
  border-top: 1px solid #AABBAA;
}

.team-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 20px;
  margin-bottom: 24px;
}

.team-head h2 { font-size: 28px; }
.team-head > p { max-width: 360px; margin: 0; font-weight: 700; color: #000; }

.team-card { background: transparent; }

.team-image {
  background: #fff;
  border: 1px solid #AABBAA;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 14px;
}

.team-image img {
  width: 100%;
  aspect-ratio: 0.88 / 1;
  object-fit: cover;
  display: block;
}

.team-card h3 { margin: 0 0 4px; font-size: 18px; font-weight: 700; color: #000; }

@media (max-width: 980px) {
  .intro-grid,
  .stats-grid,
  .values-grid,
  .team-grid { grid-template-columns: 1fr; }
  .team-head { flex-direction: column; align-items: flex-start; }
}
</style>
