<template>
  <div class="home-page">
    <AppHeader
      :nav-links="navLinks"
      :cart-count="cartCount"
    />
    <main>
      <HeroSection v-if="hero" :content="hero" />
      <NewArrivalsSection />
      <TopSellingSection />
      <DressStyleSection />
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
import TopSellingSection from '@/components/home/TopSellingSection.vue'
import DressStyleSection from '@/components/home/DressStyleSection.vue'

import {
  getNavLinks,
  getFooterColumns,
  getHeroContent,
  getSocialLinks,
} from '@/services/homeService'

import type {
  NavLink,
  FooterColumn,
  HeroContent,
  SocialLink,
} from '@/types/home'
import { readStorage } from '@/utils/storage'

interface CartItem {
  id: number
  quantity: number
}

const navLinks = ref<NavLink[]>([])
const footerColumns = ref<FooterColumn[]>([])
const hero = ref<HeroContent | null>(null)
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

  const [nav, footer, heroData, social] = await Promise.all([
    getNavLinks(),
    getFooterColumns(),
    getHeroContent(),
    getSocialLinks(),
  ])

  navLinks.value = nav
  footerColumns.value = footer
  hero.value = heroData
  socialLinks.value = social
})
</script>

<style>
* { box-sizing: border-box; }

.home-page {
  background: #fff;
  color: #000;
  font-family: Helvetica, Arial, sans-serif;
}
</style>
