<template>
  <section class="hero section">
    <div class="container hero-grid">
      <div class="hero-copy">
        <p class="eyebrow">{{ content.eyebrow }}</p>
        <h1>
          {{ content.headingLine1 }}
          <span>{{ content.headingLine2 }}</span>
        </h1>
        <p class="hero-desc">{{ content.description }}</p>
        <div class="hero-buttons">
          <button type="button" class="btn btn-primary">{{ content.primaryCta }}</button>
          <button type="button" class="btn btn-secondary">{{ content.secondaryCta }}</button>
        </div>
      </div>

      <div class="hero-media">
        <img :src="content.image" alt="Featured collection" />
        <div class="designer-card">
          <p>{{ content.designerLabel }}</p>
          <h4>{{ content.designerName }}</h4>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { HeroContent } from '@/types/home'

defineProps<{
  content: HeroContent
}>()
</script>

<style scoped>
.section {
  padding: 96px 0;
}
.container {
  width: min(1440px, 100%);
  margin: 0 auto;
  padding: 0 32px;
}
.hero {
  padding-top: 64px;
  padding-bottom: 128px;
}
.hero-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
  align-items: center;
}
.eyebrow {
  margin: 0 0 10px;
  font-size: 11px;
  line-height: 16.5px;
  letter-spacing: 0.2em;
  color: #004ac6;
}
.hero-copy h1 {
  margin: 0 0 12px;
  font-size: 56px;
  line-height: 1.1;
  letter-spacing: -0.025em;
  font-weight: 400;
}
.hero-copy h1 span {
  display: block;
  color: #004ac6;
  font-style: italic;
}
.hero-desc {
  margin: 0;
  max-width: 448px;
  color: #434655;
  font-size: 16px;
  line-height: 26px;
}
.hero-buttons {
  margin-top: 24px;
  display: flex;
  gap: 16px;
}
.btn {
  border: 0;
  border-radius: 16px;
  padding: 16px 32px;
  font-size: 16px;
  line-height: 24px;
  cursor: pointer;
  font-family: inherit;
}
.btn-primary {
  background: linear-gradient(90deg, #004ac6, #2563eb);
  color: #fff;
}
.btn-secondary {
  background: #d5e0f8;
  color: #586377;
}
.hero-media {
  position: relative;
}
.hero-media img {
  width: 100%;
  height: 700px;
  object-fit: cover;
  border-radius: 24px;
  display: block;
}
.designer-card {
  position: absolute;
  left: -24px;
  bottom: -24px;
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 40px 60px -15px rgba(25, 28, 30, 0.04);
}
.designer-card p {
  margin: 0 0 4px;
  font-size: 11px;
  line-height: 16.5px;
  letter-spacing: 0.1em;
  color: #004ac6;
}
.designer-card h4 {
  margin: 0;
  font-size: 16px;
  line-height: 24px;
  font-weight: 400;
}
@media (max-width: 1100px) {
  .hero-grid {
    grid-template-columns: 1fr;
  }
  .hero-media img {
    height: 520px;
  }
}
@media (max-width: 760px) {
  .container {
    padding: 0 16px;
  }
  .hero-copy h1 {
    font-size: 42px;
  }
}
</style>
