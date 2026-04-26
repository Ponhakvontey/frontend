<template>
  <section class="hero-row">
    <div>
      <h1>Morning, Alex.</h1>
      <p>Here is what is happening with Curator Luxe today.</p>
    </div>

    <div class="hero-actions">
      <button class="secondary-btn" type="button">Download Report</button>
      <button class="primary-btn" type="button">Add New Product</button>
    </div>
  </section>
</template>

<style scoped>
.hero-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  margin-bottom: 22px;
}

.hero-row h1 {
  margin: 0 0 8px;
  font-size: 54px;
  line-height: 1;
  font-weight: 800;
  letter-spacing: -0.04em;
}

.hero-row p {
  margin: 0;
  color: #667085;
}

.hero-actions {
  display: flex;
  gap: 12px;
}

.primary-btn,
.secondary-btn {
  height: 42px;
  border: 0;
  border-radius: 12px;
  padding: 0 18px;
  font-weight: 600;
  cursor: pointer;
}

.primary-btn {
  background: #3563e9;
  color: #fff;
}

.secondary-btn {
  background: #e9efff;
  color: #5b6b94;
}
</style>
