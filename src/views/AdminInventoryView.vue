<template>
  <div class="admin-page">
    <AdminSidebar />

    <div class="main-shell">
      <AdminTopbar />

      <main class="inventory-main">
        <section class="inventory-header">
          <div>
            <h1>Product Inventory</h1>
            <p>Manage and curate your editorial collection.</p>
          </div>

          <RouterLink to="/admin/inventory/new" class="primary-btn">Add New Product</RouterLink>
        </section>

        <section class="inventory-toolbar" aria-label="Inventory tools">
          <label class="search-box">
            <span class="search-icon">Q</span>
            <input v-model="search" type="search" placeholder="Search by name, SKU, or category..." />
          </label>

          <div class="tool-group">
            <button type="button" class="tool-btn" :class="{ active: showFilters }" @click="showFilters = !showFilters">
              Filter
            </button>
            <button type="button" class="tool-btn" @click="cycleSort">Sort</button>
            <button type="button" class="tool-btn" @click="exportCsv">Export</button>
          </div>
        </section>

        <section v-if="showFilters" class="filter-panel">
          <button
            v-for="option in filterOptions"
            :key="option.value"
            type="button"
            class="filter-chip"
            :class="{ active: filter === option.value }"
            @click="filter = option.value"
          >
            {{ option.label }}
          </button>
        </section>

        <section class="inventory-card">
          <div v-if="error" class="state-message">{{ error }}</div>
          <div v-else-if="loading" class="state-message">Loading inventory...</div>

          <div v-else class="table-scroll">
            <table>
              <thead>
                <tr>
                  <th><button type="button" @click="setSort('name')">Product</button></th>
                  <th><button type="button" @click="setSort('sku')">SKU</button></th>
                  <th><button type="button" @click="setSort('category')">Category</button></th>
                  <th><button type="button" @click="setSort('price')">Price</button></th>
                  <th><button type="button" @click="setSort('stock')">Stock</button></th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                <tr v-for="product in visibleProducts" :key="product.id">
                  <td>
                    <RouterLink :to="`/admin/inventory/${product.id}/edit`" class="product-cell">
                      <img :src="product.image" :alt="product.name" />
                      <span>
                        <strong>{{ product.name }}</strong>
                        <small>{{ product.maker }}</small>
                      </span>
                    </RouterLink>
                  </td>

                  <td>{{ product.sku }}</td>
                  <td><span class="category-pill">{{ product.category }}</span></td>
                  <td class="price">{{ formatPrice(product.price) }}</td>
                  <td>
                    <span class="stock-dot" :class="getStockClass(product.stock)"></span>
                    {{ product.stock }} {{ getStockLabel(product.stock) }}
                  </td>
                  <td>
                    <div class="actions">
                      <RouterLink :to="`/admin/inventory/${product.id}/edit`" class="action-btn">Edit</RouterLink>
                      <button type="button" class="action-btn danger" @click="confirmDelete(product.id)">Delete</button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>

            <div v-if="!visibleProducts.length" class="state-message">No products match your filters.</div>
          </div>

          <div class="table-footer">
            <span>Showing {{ visibleProducts.length ? 1 : 0 }} to {{ visibleProducts.length }} of {{ products.length }} results</span>
            <span>{{ sortKey }} {{ sortDirection }}</span>
          </div>
        </section>
      </main>

      <AdminFooter />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import AdminSidebar from '@/components/admin/layout/AdminSidebar.vue'
import AdminTopbar from '@/components/admin/layout/AdminTopbar.vue'
import AdminFooter from '@/components/admin/layout/AdminFooter.vue'
import { useAdminInventory } from '@/composables/useAdminInventory'
import type { InventoryFilterKey, InventorySortKey } from '@/types/inventory'

const {
  loading,
  error,
  products,
  search,
  filter,
  visibleProducts,
  sortKey,
  sortDirection,
  fetchProducts,
  removeProduct,
  setSort,
} = useAdminInventory()

const showFilters = ref(false)
const sortCycle: InventorySortKey[] = ['name', 'sku', 'category', 'price', 'stock']

const filterOptions: Array<{ label: string; value: InventoryFilterKey }> = [
  { label: 'All Products', value: 'all' },
  { label: 'In Stock', value: 'in-stock' },
  { label: 'Low Stock', value: 'low-stock' },
  { label: 'Out of Stock', value: 'out-of-stock' },
]

onMounted(fetchProducts)

function cycleSort() {
  const currentIndex = sortCycle.indexOf(sortKey.value)
  const nextKey = sortCycle[(currentIndex + 1) % sortCycle.length] || 'name'
  setSort(nextKey)
}

async function confirmDelete(id: string) {
  const product = products.value.find((item) => item.id === id)
  if (!product) return

  if (window.confirm(`Delete ${product.name} from inventory?`)) {
    await removeProduct(id)
  }
}

function exportCsv() {
  const rows = visibleProducts.value.map((product) => [
    product.name,
    product.sku,
    product.category,
    product.price,
    product.stock,
    product.status,
  ])
  const csv = [['Name', 'SKU', 'Category', 'Price', 'Stock', 'Status'], ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'inventory-products.csv'
  link.click()
  URL.revokeObjectURL(url)
}

function getStockClass(stock: number) {
  if (stock === 0) return 'danger'
  if (stock <= 10) return 'warning'
  return 'success'
}

function getStockLabel(stock: number) {
  if (stock === 0) return 'Out of Stock'
  if (stock <= 10) return 'Low Stock'
  return 'In Stock'
}

function formatPrice(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value)
}
</script>

<style scoped>
.admin-page {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 250px minmax(0, 1fr);
  min-width: 1180px;
  background: #f6f8fb;
}

.main-shell {
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 100vh;
}

.inventory-main {
  padding: 28px;
}

.inventory-header,
.inventory-toolbar,
.table-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
}

.inventory-header {
  margin-bottom: 28px;
}

.inventory-header h1 {
  margin: 0 0 6px;
  font-size: 44px;
  line-height: 1;
  color: #101828;
}

.inventory-header p {
  margin: 0;
  color: #667085;
}

.primary-btn,
.tool-btn,
.filter-chip,
.action-btn {
  border: 0;
  text-decoration: none;
  cursor: pointer;
  font-weight: 700;
}

.primary-btn {
  display: inline-flex;
  align-items: center;
  height: 54px;
  border-radius: 14px;
  padding: 0 22px;
  background: #4361ee;
  color: #fff;
}

.inventory-toolbar {
  margin-bottom: 14px;
}

.search-box {
  flex: 1;
  height: 58px;
  background: #fff;
  border-radius: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 20px;
  color: #98a2b3;
}

.search-icon {
  font-size: 12px;
  font-weight: 800;
}

.search-box input {
  width: 100%;
  border: 0;
  outline: 0;
  font-size: 16px;
  background: transparent;
}

.tool-group {
  display: flex;
  gap: 12px;
}

.tool-btn {
  height: 54px;
  border-radius: 14px;
  padding: 0 22px;
  background: #fff;
  color: #344054;
}

.tool-btn.active,
.filter-chip.active {
  background: #e8efff;
  color: #3563e9;
}

.filter-panel {
  display: flex;
  gap: 10px;
  margin-bottom: 18px;
}

.filter-chip {
  height: 34px;
  border-radius: 999px;
  padding: 0 14px;
  background: #fff;
  color: #667085;
}

.inventory-card {
  background: #fff;
  border-radius: 20px;
  overflow: hidden;
  border: 1px solid #e7ecf5;
}

.table-scroll {
  overflow-x: auto;
}

table {
  width: 100%;
  min-width: 920px;
  border-collapse: collapse;
}

th,
td {
  padding: 22px 26px;
  border-bottom: 1px solid #eef2f6;
  text-align: left;
  color: #101828;
}

th,
th button {
  font-size: 12px;
  letter-spacing: 0.18em;
  color: #475467;
  text-transform: uppercase;
}

th button {
  border: 0;
  background: transparent;
  cursor: pointer;
  font-weight: 800;
  padding: 0;
}

.product-cell {
  display: flex;
  align-items: center;
  gap: 14px;
  color: inherit;
  text-decoration: none;
}

.product-cell img {
  width: 58px;
  height: 58px;
  border-radius: 10px;
  object-fit: cover;
  background: #eef2f6;
}

.product-cell strong,
.product-cell small {
  display: block;
}

.product-cell strong {
  margin-bottom: 5px;
  font-size: 15px;
}

.product-cell small {
  color: #667085;
}

.category-pill {
  display: inline-flex;
  padding: 5px 12px;
  border-radius: 999px;
  background: #e8efff;
  color: #2454e8;
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
}

.price {
  font-weight: 800;
}

.stock-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  margin-right: 10px;
  border-radius: 999px;
}

.stock-dot.success {
  background: #22c55e;
}

.stock-dot.warning {
  background: #f59e0b;
}

.stock-dot.danger {
  background: #dc2626;
}

.actions {
  display: flex;
  gap: 10px;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  height: 30px;
  border-radius: 999px;
  padding: 0 12px;
  background: #f4f6fa;
  color: #344054;
  font-size: 11px;
}

.action-btn.danger {
  color: #dc2626;
}

.table-footer,
.state-message {
  padding: 18px 26px;
  color: #667085;
  font-size: 13px;
}
</style>

