<template>
  <div class="home-page">
    <AppHeader
      :nav-links="navLinks"
      :cart-count="cartCount"
    />
    <main>
      <HeroSection v-if="hero" :content="hero" />
      <NewArrivalsSection />
      <CategorySection :categories="categories" />
      <TrendingSection :products="products" />
      <JournalSection v-if="journal" :content="journal" :social-links="socialLinks" />
    </main>

    <AppFooter :footer-columns="footerColumns" :social-links="socialLinks" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import HeroSection from '@/components/home/HeroSection.vue'
import NewArrivalsSection from '@/components/home/NewArrivalsSection.vue'
import CategorySection from '@/components/home/CategorySection.vue'
import TrendingSection from '@/components/home/TrendingSection.vue'
import JournalSection from '@/components/home/JournalSection.vue'

import {
  getNavLinks,
  getCategories,
  getTrendingProducts,
  getFooterColumns,
  getHeroContent,
  getJournalContent,
  getSocialLinks,
} from '@/services/homeService'

import type {
  NavLink,
  Category,
  Product,
  FooterColumn,
  HeroContent,
  JournalContent,
  SocialLink,
} from '@/types/home'
import { readStorage } from '@/utils/storage'

interface CartItem {
  id: number
  quantity: number
}

const navLinks = ref<NavLink[]>([])
const categories = ref<Category[]>([])
const products = ref<Product[]>([])
const footerColumns = ref<FooterColumn[]>([])
const hero = ref<HeroContent | null>(null)
const journal = ref<JournalContent | null>(null)
const socialLinks = ref<SocialLink[]>([])

const cartItems = ref<CartItem[]>([])

const cartCount = computed(() => {
  return cartItems.value.reduce((sum, item) => sum + item.quantity, 0)
})

function loadCart() {
  cartItems.value = readStorage<CartItem[]>('cartItems', [])
}


onMounted(async () => {
  loadCart()

  const [nav, cat, prod, footer, heroData, journalData, social] = await Promise.all([
    getNavLinks(),
    getCategories(),
    getTrendingProducts(),
    getFooterColumns(),
    getHeroContent(),
    getJournalContent(),
    getSocialLinks(),
  ])

  navLinks.value = nav
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
