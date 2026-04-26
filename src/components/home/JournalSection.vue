<template>
  <section class="section journal">
    <div class="container journal-grid">
      <div class="journal-image">
        <img :src="content.image" alt="Curator journal" />
      </div>
      <div class="journal-content">
        <h3>{{ content.title }}</h3>
        <p>{{ content.description }}</p>
        <div class="newsletter">
          <input type="email" :placeholder="content.newsletterPlaceholder" />
          <button type="button">{{ content.newsletterCta }}</button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { JournalContent } from '@/types/home'

defineProps<{
  content: JournalContent
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
.journal-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 64px;
  align-items: center;
}
.journal-image img {
  width: 100%;
  height: 324px;
  border-radius: 24px;
  display: block;
  object-fit: cover;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}
.journal-content h3 {
  margin: 0 0 24px;
  font-size: 30px;
  line-height: 36px;
  letter-spacing: -0.025em;
  font-weight: 400;
}
.journal-content p {
  margin: 0;
  color: #434655;
  font-size: 16px;
  line-height: 26px;
}
.newsletter {
  margin-top: 24px;
  display: flex;
  gap: 16px;
}
.newsletter input {
  flex: 1;
  border: 0;
  border-radius: 16px;
  background: #e6e8ea;
  padding: 18px 24px;
  font-size: 16px;
  color: #6b7280;
  outline: none;
  font-family: inherit;
}
.newsletter button {
  border: 0;
  border-radius: 16px;
  background: #004ac6;
  color: #fff;
  padding: 16px 32px;
  font-size: 16px;
  cursor: pointer;
  font-family: inherit;
}
@media (max-width: 1100px) {
  .journal-grid {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 760px) {
  .container {
    padding: 0 16px;
  }
}
</style>
