<template>
  <section class="hero">
    <!-- Slides -->
    <div class="slide-track">
      <div
        v-for="(slide, i) in slides"
        :key="i"
        class="slide"
        :class="{ active: i === activeIndex }"
      >
        <img :src="slide.image" :alt="slide.alt" />
      </div>
    </div>

    <!-- Gradient overlay for text legibility -->
    <div class="overlay"></div>

    <!-- Text content -->
    <div class="hero-body">
      <div class="hero-content">
        <span class="eyebrow">{{ content.eyebrow }}</span>
        <h1>
          {{ content.headingLine1 }}
          <span>{{ content.headingLine2 }}</span>
        </h1>
        <p class="hero-desc">{{ content.description }}</p>
        <div class="hero-actions">
          <button type="button" class="btn-primary">{{ content.primaryCta }}</button>
          <button type="button" class="btn-secondary">{{ content.secondaryCta }}</button>
        </div>
      </div>
    </div>

    <!-- Slide indicators -->
    <div class="carousel-dots">
      <button
        v-for="(_, i) in slides"
        :key="i"
        type="button"
        class="dot"
        :class="{ active: i === activeIndex }"
        :aria-label="`Go to slide ${i + 1}`"
        @click="goTo(i)"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import type { HeroContent } from '@/types/home'
import shirt1 from '@/assets/home/shirt_carousel1.jpg'
import shirt2 from '@/assets/home/shirt_carousel2.jpg'

defineProps<{
  content: HeroContent
}>()

const slides = [
  { image: shirt1, alt: 'New collection — shirts' },
  { image: shirt2, alt: 'Featured styles' },
]

const activeIndex = ref(0)
let timer: ReturnType<typeof setInterval>

function goTo(index: number) {
  activeIndex.value = index
  restart()
}

function next() {
  activeIndex.value = (activeIndex.value + 1) % slides.length
}

function restart() {
  clearInterval(timer)
  timer = setInterval(next, 5000)
}

onMounted(() => {
  timer = setInterval(next, 5000)
})

onBeforeUnmount(() => {
  clearInterval(timer)
})
</script>

<style scoped>
/* ── Shell ── */
.hero {
  position: relative;
  width: 100%;
  height: 100vh;
  min-height: 600px;
  overflow: hidden;
}

/* ── Slides ── */
.slide-track {
  position: absolute;
  inset: 0;
}

.slide {
  position: absolute;
  inset: 0;
  opacity: 0;
  transition: opacity 0.9s ease;
}

.slide.active {
  opacity: 1;
}

.slide img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* ── Dark gradient ── */
.overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    105deg,
    rgba(7, 7, 7, 0.78) 0%,
    rgba(7, 7, 7, 0.42) 55%,
    rgba(7, 7, 7, 0.12) 100%
  );
  z-index: 1;
}

/* ── Content ── */
.hero-body {
  position: absolute;
  inset: 0;
  z-index: 2;
  display: flex;
  align-items: center;
}

.hero-content {
  padding: 0 80px;
  padding-top: 70px; /* clear fixed header */
  max-width: 620px;
}

.eyebrow {
  display: block;
  margin-bottom: 22px;
  font-size: 11px;
  letter-spacing: 0.34em;
  color: var(--clr-sky);
  text-transform: uppercase;
}

.hero-content h1 {
  margin: 0 0 18px;
  font-size: 66px;
  line-height: 1.03;
  letter-spacing: -0.025em;
  font-weight: 300;
  color: #fff;
}

.hero-content h1 span {
  display: block;
  color: rgba(255, 255, 255, 0.58);
  font-weight: 400;
}

.hero-desc {
  margin: 0 0 40px;
  max-width: 400px;
  color: rgba(255, 255, 255, 0.55);
  font-size: 15px;
  line-height: 1.8;
}

/* ── Buttons ── */
.hero-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.btn-primary,
.btn-secondary {
  padding: 15px 38px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  cursor: pointer;
  font-family: inherit;
  border: none;
  transition: background 0.2s, border-color 0.2s, color 0.2s;
}

.btn-primary {
  background: var(--clr-plum);
  color: #fff;
}

.btn-primary:hover {
  background: var(--clr-taupe);
}

.btn-secondary {
  background: transparent;
  color: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.28);
}

.btn-secondary:hover {
  border-color: rgba(255, 255, 255, 0.6);
  color: #fff;
}

/* ── Carousel dots ── */
.carousel-dots {
  position: absolute;
  bottom: 36px;
  left: 80px;
  z-index: 3;
  display: flex;
  gap: 8px;
  align-items: center;
}

.dot {
  width: 28px;
  height: 3px;
  border: none;
  border-radius: 2px;
  padding: 0;
  background: rgba(255, 255, 255, 0.3);
  cursor: pointer;
  transition: background 0.25s, width 0.3s;
}

.dot.active {
  background: #fff;
  width: 50px;
}

/* ── Responsive ── */
@media (max-width: 768px) {
  .hero-content {
    padding: 0 24px;
    padding-top: 80px;
  }

  .hero-content h1 {
    font-size: 42px;
  }

  .carousel-dots {
    left: 24px;
    bottom: 24px;
  }
}
</style>
