<template>
  <div class="home-page">
    <AppHeader :nav-links="navLinks" />

    <main>
      <HeroSection v-if="hero" :content="hero" />
      <BenefitsSection :benefits="benefits" />
      <CategorySection :categories="categories" />
      <TrendingSection :products="products" />
      <JournalSection v-if="journal" :content="journal" :social-links="socialLinks" />
    </main>

    <AppFooter :footer-columns="footerColumns" :social-links="socialLinks" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import HeroSection from '@/components/home/HeroSection.vue'
import BenefitsSection from '@/components/home/BenefitsSection.vue'
import CategorySection from '@/components/home/CategorySection.vue'
import TrendingSection from '@/components/home/TrendingSection.vue'
import JournalSection from '@/components/home/JournalSection.vue'

import {
  getNavLinks,
  getBenefits,
  getCategories,
  getTrendingProducts,
  getFooterColumns,
  getHeroContent,
  getJournalContent,
  getSocialLinks,
} from '@/services/homeService'

import type {
  NavLink,
  Benefit,
  Category,
  Product,
  FooterColumn,
  HeroContent,
  JournalContent,
  SocialLink,
} from '@/types/home'

const navLinks = ref<NavLink[]>([])
const benefits = ref<Benefit[]>([])
const categories = ref<Category[]>([])
const products = ref<Product[]>([])
const footerColumns = ref<FooterColumn[]>([])
const hero = ref<HeroContent | null>(null)
const journal = ref<JournalContent | null>(null)
const socialLinks = ref<SocialLink[]>([])

onMounted(async () => {
  const [nav, ben, cat, prod, footer, heroData, journalData, social] = await Promise.all([
    getNavLinks(),
    getBenefits(),
    getCategories(),
    getTrendingProducts(),
    getFooterColumns(),
    getHeroContent(),
    getJournalContent(),
    getSocialLinks(),
  ])

  navLinks.value = nav
  benefits.value = ben
  categories.value = cat
  products.value = prod
  footerColumns.value = footer
  hero.value = heroData
  journal.value = journalData
  socialLinks.value = social
})
</script>

<style>
* {
  box-sizing: border-box;
}

.home-page {
  background: #f7f9fb;
  color: #191c1e;
  font-family: Inter, Arial, sans-serif;
}
</style>
