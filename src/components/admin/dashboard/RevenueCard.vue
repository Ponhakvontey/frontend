<template>
  <article class="card revenue-card">
    <div class="card-top">
      <span class="mini-icon">💳</span>
      <span class="growth-badge">+12.5% vs LW</span>
    </div>

    <p class="card-label">TOTAL SALES REVENUE</p>
    <h2>$128,430.00</h2>

    <div class="progress-row">
      <div class="progress-bar">
        <div class="progress-fill"></div>
      </div>
      <span>75% of Monthly Goal</span>
    </div>

    <div class="revenue-footer">
      <div class="avatars">
        <span class="avatar-dot">A</span>
        <span class="avatar-dot">E</span>
        <span class="avatar-dot">J</span>
        <span class="avatar-plus">+12</span>
      </div>
      <button class="text-link" type="button">View recent transactions</button>
    </div>
  </article>
</template>

<style scoped>
.card {
  background: #fff;
  border-radius: 18px;
  padding: 22px;
  border: 1px solid #edf1f6;
}

.revenue-card h2 {
  margin: 10px 0 18px;
  font-size: 56px;
  line-height: 1;
  color: #000000;
  font-weight: 500;
}

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.mini-icon {
  width: 28px;
  height: 28px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  background: #f0eaeb;
}

.growth-badge {
  font-size: 11px;
  color: #22c55e;
  font-weight: 700;
}

.card-label {
  margin: 18px 0 0;
  font-size: 11px;
  letter-spacing: 0.14em;
  color: #98a2b3;
}

.progress-row {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 11px;
  color: #667085;
}

.progress-bar {
  flex: 1;
  height: 3px;
  background: #e7ecf5;
  border-radius: 999px;
  overflow: hidden;
}

.progress-fill {
  width: 75%;
  height: 100%;
  background: #000000;
}

.revenue-footer {
  margin-top: 18px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.avatars {
  display: flex;
  align-items: center;
}

.avatar-dot,
.avatar-plus {
  width: 28px;
  height: 28px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  font-size: 10px;
  border: 2px solid #fff;
  margin-left: -6px;
}

.avatar-dot {
  background: #d6defb;
}

.avatar-plus {
  background: #f1f5f9;
  color: #667085;
}

.text-link {
  border: 0;
  background: transparent;
  color: #000000;
  cursor: pointer;
  font-size: 12px;
}
</style>
