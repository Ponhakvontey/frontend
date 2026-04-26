<template>
  <section class="table-section">
    <div class="table-head">
      <div>
        <h2>Recent Transactions</h2>
        <p>Monitoring the last 48 hours of sales activity.</p>
      </div>

      <select class="range-select">
        <option>Last 7 Days</option>
        <option>Last 30 Days</option>
      </select>
    </div>

    <div class="table-card">
      <table>
        <thead>
          <tr>
            <th>ORDER ID</th>
            <th>CUSTOMER</th>
            <th>PRODUCT</th>
            <th>DATE</th>
            <th>AMOUNT</th>
            <th>STATUS</th>
            <th>ACTIONS</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in transactions" :key="row.id">
            <td>{{ row.id }}</td>
            <td>
              <div class="customer-cell">
                <span class="customer-avatar">{{ row.initials }}</span>
                <span>{{ row.customer }}</span>
              </div>
            </td>
            <td>{{ row.product }}</td>
            <td>{{ row.date }}</td>
            <td>{{ row.amount }}</td>
            <td>
              <span class="status-pill" :class="row.statusClass">{{ row.status }}</span>
            </td>
            <td>⋯</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup lang="ts">
const transactions = [
  {
    id: '#CL-8902',
    initials: 'EM',
    customer: 'Elena Moretti',
    product: 'Luxe Velvet Ottoman',
    date: 'Oct 12, 2023',
    amount: '$1,240.00',
    status: 'SHIPPED',
    statusClass: 'green',
  },
  {
    id: '#CL-8903',
    initials: 'JD',
    customer: 'Julien De Silva',
    product: 'Marble Base Desk Lamp',
    date: 'Oct 12, 2023',
    amount: '$450.00',
    status: 'PROCESSING',
    statusClass: 'blue',
  },
]
</script>

<style scoped>
.table-section h2 {
  margin: 0 0 6px;
  font-size: 34px;
  font-weight: 700;
  letter-spacing: -0.03em;
}

.table-section p {
  margin: 0;
  color: #667085;
}

.table-head {
  display: flex;
  justify-content: space-between;
  align-items: end;
  margin-bottom: 16px;
}

.range-select {
  height: 38px;
  border: 0;
  border-radius: 10px;
  background: #ffffff;
  padding: 0 12px;
}

.table-card {
  background: #fff;
  border-radius: 20px;
  border: 1px solid #edf1f6;
  overflow: hidden;
}

table {
  width: 100%;
  border-collapse: collapse;
}

thead th {
  text-align: left;
  font-size: 11px;
  letter-spacing: 0.12em;
  color: #98a2b3;
  padding: 22px 20px 14px;
}

tbody td {
  padding: 16px 20px;
  border-top: 1px solid #f2f4f8;
  font-size: 14px;
  color: #344054;
  vertical-align: middle;
}

.customer-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.customer-avatar {
  width: 26px;
  height: 26px;
  border-radius: 999px;
  background: #e7ecfb;
  color: #667085;
  display: grid;
  place-items: center;
  font-size: 10px;
  font-weight: 700;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  height: 22px;
  padding: 0 10px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.status-pill.green {
  background: #eaf8ef;
  color: #16a34a;
}

.status-pill.blue {
  background: #e8efff;
  color: #3563e9;
}
</style>
