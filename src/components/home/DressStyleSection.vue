<template>
  <section class="dress-style">
    <div class="container">
      <h2 class="section-title">BROWSE BY DRESS STYLE</h2>

      <div class="style-outer">
        <div class="style-grid">
          <div v-for="style in styles" :key="style.id" class="style-card" :class="style.span">
            <div class="img-skeleton"></div>
            <span class="style-label">{{ style.label }}</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const styles = [
  { id: 1, label: 'Casual', span: 'span-small' },
  { id: 2, label: 'Formal', span: 'span-large' },
  { id: 3, label: 'Party',  span: 'span-large' },
  { id: 4, label: 'Gym',    span: 'span-small' },
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

.style-card:hover .img-skeleton {
  filter: brightness(0.92);
}

/* ── Skeleton ── */
@keyframes shimmer {
  0%   { background-position: -600px 0; }
  100% { background-position:  600px 0; }
}

.img-skeleton {
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, #e8e8e8 25%, #dadada 50%, #e8e8e8 75%);
  background-size: 1200px 100%;
  animation: shimmer 1.6s infinite linear;
  transition: filter 0.2s;
}

/* ── Label ── */
.style-label {
  position: absolute;
  top: 18px;
  left: 20px;
  font-size: 18px;
  font-weight: 700;
  color: #111;
  letter-spacing: -0.01em;
  pointer-events: none;
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
