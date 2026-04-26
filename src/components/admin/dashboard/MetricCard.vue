<template>
  <article class="card" :class="{ highlight }">
    <p class="card-label">{{ label }}</p>
    <h3>{{ value }}</h3>
    <p class="subtitle">{{ subtitle }}</p>
  </article>
</template>

<script setup lang="ts">
defineProps<{
  label: string
  value: string
  subtitle: string
  highlight?: boolean
}>()
</script>

<style scoped>
.card {
  background: #fff;
  border-radius: 18px;
  padding: 22px;
  border: 1px solid #edf1f6;
}

.card.highlight {
  border-bottom: 3px solid #c56a2f;
}

.card-label {
  margin: 0;
  font-size: 11px;
  letter-spacing: 0.14em;
  color: #98a2b3;
}

h3 {
  margin: 12px 0 8px;
  font-size: 42px;
  line-height: 1;
}

.subtitle {
  margin: 0;
  color: #667085;
  font-size: 12px;
}
</style>
