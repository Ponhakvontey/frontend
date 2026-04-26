<template>
  <section class="stats-grid">
    <RevenueCard />
    <MetricCard label="NEW CUSTOMERS" value="1,240" subtitle="↗ 8% increase this month" />
    <MetricCard label="ACTIVE ORDERS" value="42" subtitle="2 Pending Shipments" highlight />
    <MetricCard label="STORE HEALTH" value="94%" subtitle="Optimal range" />
  </section>
</template>

<script setup lang="ts">
import RevenueCard from '@/components/admin/dashboard/RevenueCard.vue'
import MetricCard from '@/components/admin/dashboard/MetricCard.vue'
</script>

<style scoped>
.stats-grid {
  display: grid;
  grid-template-columns: 2fr 1.2fr 1fr 1fr;
  gap: 18px;
  margin-bottom: 30px;
}
</style>
