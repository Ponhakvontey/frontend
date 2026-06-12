<template>
  <section class="dress-style">
    <div class="container">
      <h2 class="section-title">BROWSE BY DRESS STYLE</h2>

      <div class="style-outer">
        <div class="style-grid">
          <div v-for="style in styles" :key="style.id" class="style-card" :class="style.span">
            <img :src="style.img" :alt="style.label" class="style-img" />
            <span class="style-label">{{ style.label }}</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const BASE = 'https://images.pexels.com/photos'
const Q    = 'auto=compress&cs=tinysrgb&w=800&h=500&fit=crop'

const styles = [
  { id: 1, label: 'Casual', span: 'span-small', img: `${BASE}/5314599/pexels-photo-5314599.jpeg?${Q}` },
  { id: 2, label: 'Formal', span: 'span-large', img: `${BASE}/8244875/pexels-photo-8244875.jpeg?${Q}` },
  { id: 3, label: 'Party',  span: 'span-large', img: `${BASE}/16894090/pexels-photo-16894090.jpeg?${Q}` },
  { id: 4, label: 'Gym',    span: 'span-small', img: `${BASE}/1717098/pexels-photo-1717098.jpeg?${Q}` },
]
</script>

<style scoped>
.dress-style {
  background: #fff;
  padding: 72px 0 80px;
}

.container {
  width: min(1280px, 100%);
  margin: 0 auto;
  padding: 0 32px;
}

/* ── Title ── */
.section-title {
  text-align: center;
  font-size: 36px;
  font-weight: 800;
  letter-spacing: -0.01em;
  color: #111;
  margin: 0 0 36px;
}

/* ── Outer rounded wrapper ── */
.style-outer {
  background: #f2f2f2;
  border-radius: 24px;
  padding: 20px;
}

/* ── Asymmetric grid ─────────────────────────────
   10 equal columns:
   Row 1 → Casual (4) | Formal (6)
   Row 2 → Party  (6) | Gym    (4)
──────────────────────────────────────────────── */
.style-grid {
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  gap: 16px;
}

.span-small { grid-column: span 4; }
.span-large { grid-column: span 6; }

/* ── Card ── */
.style-card {
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  height: 230px;
  cursor: pointer;
}

.style-card:hover .style-img {
  transform: scale(1.04);
}

.style-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center top;
  display: block;
  transition: transform 0.35s ease;
}

/* ── Label ── */
.style-label {
  position: absolute;
  top: 18px;
  left: 20px;
  font-size: 18px;
  font-weight: 700;
  color: #fff;
  letter-spacing: -0.01em;
  pointer-events: none;
  text-shadow: 0 1px 6px rgba(0,0,0,0.55);
}

/* ── Responsive ── */
@media (max-width: 768px) {
  .style-grid {
    grid-template-columns: 1fr 1fr;
  }

  .span-small,
  .span-large {
    grid-column: span 1;
  }

  .style-card {
    height: 180px;
  }

  .section-title {
    font-size: 26px;
  }
}

@media (max-width: 480px) {
  .style-grid {
    grid-template-columns: 1fr;
  }

  .span-small,
  .span-large {
    grid-column: span 1;
  }
}
</style>
