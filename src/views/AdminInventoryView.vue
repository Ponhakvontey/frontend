<template>
  <div class="admin-page">
    <AdminSidebar />

    <div class="main-shell">
      <AdminTopbar />

      <main class="page-body">

        <!-- Header -->
        <div class="page-header">
          <div>
            <h1><i class="fa-solid fa-box-archive title-icon"></i> Inventory</h1>
            <p class="sub">Manage products, stock levels and categories.</p>
          </div>
          <RouterLink to="/admin/inventory/new" class="add-btn">
            <i class="fa-solid fa-plus"></i> Add Product
          </RouterLink>
        </div>

        <!-- Stats -->
        <div class="stats-row">
          <div class="stat-chip">
            <i class="fa-solid fa-box-archive"></i>
            <span><strong>{{ products.length }}</strong> total</span>
          </div>
          <div class="stat-chip green">
            <i class="fa-solid fa-circle-check"></i>
            <span><strong>{{ inStock }}</strong> in stock</span>
          </div>
          <div class="stat-chip amber">
            <i class="fa-solid fa-triangle-exclamation"></i>
            <span><strong>{{ lowStock }}</strong> low stock</span>
          </div>
          <div class="stat-chip red">
            <i class="fa-solid fa-circle-xmark"></i>
            <span><strong>{{ outOfStock }}</strong> out of stock</span>
          </div>
        </div>

        <!-- Toolbar -->
        <div class="toolbar">
          <div class="tab-row">
            <button
              v-for="opt in FILTER_OPTIONS" :key="opt.value"
              type="button" class="tab-btn"
              :class="{ active: filter === opt.value }"
              @click="filter = opt.value; "
            >
              {{ opt.label }}
            </button>
          </div>

          <div class="right-tools">
            <div class="search-wrap">
              <i class="fa-solid fa-magnifying-glass search-icon"></i>
              <input v-model="search" type="text" class="search-input" placeholder="Search name or category…" />
            </div>
            <button type="button" class="tool-btn" @click="exportCsv">
              <i class="fa-solid fa-arrow-down-to-line"></i> Export
            </button>
          </div>
        </div>

        <!-- Table -->
        <div class="card">
          <div v-if="loading" class="empty"><i class="fa-solid fa-spinner fa-spin"></i> Loading…</div>
          <div v-else-if="error" class="empty err"><i class="fa-solid fa-triangle-exclamation"></i> {{ error }}</div>

          <template v-else>
            <div class="table-wrap">
              <div v-if="!visibleProducts.length" class="empty">
                <i class="fa-regular fa-folder-open"></i> No products match your filters.
              </div>
              <table v-else>
                <thead>
                  <tr>
                    <th>
                      <button type="button" class="sort-btn" @click="setSort('name')">
                        <i class="fa-solid fa-box ti"></i> Product
                        <i :class="sortIcon('name')"></i>
                      </button>
                    </th>
                    <th>
                      <button type="button" class="sort-btn" @click="setSort('category')">
                        <i class="fa-solid fa-tag ti"></i> Category
                        <i :class="sortIcon('category')"></i>
                      </button>
                    </th>
                    <th>
                      <button type="button" class="sort-btn" @click="setSort('price')">
                        <i class="fa-solid fa-dollar-sign ti"></i> Price
                        <i :class="sortIcon('price')"></i>
                      </button>
                    </th>
                    <th>
                      <button type="button" class="sort-btn" @click="setSort('stock')">
                        <i class="fa-solid fa-cubes ti"></i> Stock
                        <i :class="sortIcon('stock')"></i>
                      </button>
                    </th>
                    <th><i class="fa-solid fa-ellipsis ti"></i> Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="p in visibleProducts" :key="p.id">
                    <td>
                      <div class="product-cell">
                        <img v-if="p.imageUrl" :src="p.imageUrl" :alt="p.name" class="product-img" />
                        <div v-else class="product-img-placeholder"><i class="fa-solid fa-image"></i></div>
                        <div class="product-meta">
                          <span class="product-name">{{ p.name }}</span>
                          <span v-if="p.sellerName" class="product-seller">by {{ p.sellerName }}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span class="category-pill">{{ p.category }}</span>
                    </td>
                    <td class="bold">${{ Number(p.price).toFixed(2) }}</td>
                    <td>
                      <span class="stock-badge" :class="stockClass(p.stock)">
                        <i :class="stockIcon(p.stock)"></i>
                        {{ p.stock }}
                        <em>{{ stockLabel(p.stock) }}</em>
                      </span>
                    </td>
                    <td>
                      <div class="actions">
                        <RouterLink :to="`/admin/inventory/${p.id}/edit`" class="action-btn">
                          <i class="fa-solid fa-pen"></i> Edit
                        </RouterLink>
                        <button type="button" class="action-btn danger" @click="confirmDelete(p.id)">
                          <i class="fa-solid fa-trash"></i> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="table-footer">
              <span class="muted">{{ visibleProducts.length }} of {{ products.length }} products</span>
            </div>
          </template>
        </div>

      </main>
      <AdminFooter />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import AdminSidebar from '@/components/admin/layout/AdminSidebar.vue'
import AdminTopbar from '@/components/admin/layout/AdminTopbar.vue'
import AdminFooter from '@/components/admin/layout/AdminFooter.vue'
import { useAdminInventory } from '@/composables/useAdminInventory'
import type { InventoryFilterKey, InventorySortKey } from '@/types/inventory'

const {
  loading, error, products, search, filter,
  sortKey, sortDirection, visibleProducts,
  fetchProducts, removeProduct, setSort,
} = useAdminInventory()

const FILTER_OPTIONS: Array<{ label: string; value: InventoryFilterKey }> = [
  { label: 'All',          value: 'all' },
  { label: 'In Stock',     value: 'in-stock' },
  { label: 'Low Stock',    value: 'low-stock' },
  { label: 'Out of Stock', value: 'out-of-stock' },
]

const inStock    = computed(() => products.value.filter(p => p.stock > 10).length)
const lowStock   = computed(() => products.value.filter(p => p.stock > 0 && p.stock <= 10).length)
const outOfStock = computed(() => products.value.filter(p => p.stock === 0).length)

onMounted(fetchProducts)

function sortIcon(key: InventorySortKey) {
  if (sortKey.value !== key) return 'fa-solid fa-sort sort-neutral'
  return sortDirection.value === 'asc' ? 'fa-solid fa-sort-up sort-active' : 'fa-solid fa-sort-down sort-active'
}

function stockClass(stock: number) {
  if (stock === 0)   return 'out'
  if (stock <= 10)   return 'low'
  return 'ok'
}

function stockIcon(stock: number) {
  if (stock === 0)  return 'fa-solid fa-circle-xmark'
  if (stock <= 10)  return 'fa-solid fa-triangle-exclamation'
  return 'fa-solid fa-circle-check'
}

function stockLabel(stock: number) {
  if (stock === 0)  return 'Out of Stock'
  if (stock <= 10)  return 'Low'
  return 'In Stock'
}

async function confirmDelete(id: string) {
  const product = products.value.find(p => p.id === id)
  if (!product) return
  if (window.confirm(`Delete "${product.name}"?`)) {
    await removeProduct(id)
  }
}

function exportCsv() {
  const rows = visibleProducts.value.map(p => [p.name, p.category, p.price, p.stock])
  const csv = [['Name', 'Category', 'Price', 'Stock'], ...rows]
    .map(row => row.map(c => `"${String(c).replace(/"/g, '""')}"`).join(','))
    .join('\n')
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }))
  const a = document.createElement('a')
  a.href = url; a.download = 'inventory.csv'; a.click()
  URL.revokeObjectURL(url)
}
</script>

<style scoped>
.admin-page { min-height: 100vh; display: grid; grid-template-columns: 230px minmax(0,1fr); background: #f8fafc; }
.main-shell { display: flex; flex-direction: column; min-height: 100vh; }
.page-body  { flex: 1; padding: 28px 32px; font-family: Helvetica, Arial, sans-serif; }

/* Header */
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; gap: 16px; }
h1 { margin: 0 0 4px; font-size: 22px; font-weight: 700; color: #0f172a; letter-spacing: -0.02em; display: flex; align-items: center; gap: 10px; }
.title-icon { color: #94a3b8; font-size: 18px; }
.sub { margin: 0; font-size: 13px; color: #94a3b8; }

.add-btn {
  display: inline-flex; align-items: center; gap: 7px;
  height: 36px; padding: 0 16px; border-radius: 8px;
  background: #000000; color: #fff; font-size: 13px; font-weight: 600;
  text-decoration: none; flex-shrink: 0; font-family: Helvetica, Arial, sans-serif;
}
.add-btn:hover { background: #3f2d2e; }

/* Stats */
.stats-row { display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap; }
.stat-chip {
  display: inline-flex; align-items: center; gap: 7px;
  height: 34px; padding: 0 14px; border-radius: 8px;
  background: #fff; border: 1px solid #e2e8f0;
  font-size: 13px; color: #334155;
  font-family: Helvetica, Arial, sans-serif;
}
.stat-chip i { font-size: 12px; color: #94a3b8; }
.stat-chip.green { background: #f0fdf4; border-color: #bbf7d0; }
.stat-chip.green i { color: #16a34a; }
.stat-chip.amber { background: #fffbeb; border-color: #fde68a; }
.stat-chip.amber i { color: #d97706; }
.stat-chip.red   { background: #fff1f2; border-color: #fecaca; }
.stat-chip.red i { color: #be123c; }

/* Toolbar */
.toolbar { display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 14px; flex-wrap: wrap; }
.tab-row { display: flex; gap: 5px; flex-wrap: wrap; }
.tab-btn {
  height: 30px; border: 0; border-radius: 999px; padding: 0 12px;
  background: transparent; color: #64748b; font-size: 12px; font-weight: 600;
  cursor: pointer; font-family: Helvetica, Arial, sans-serif;
}
.tab-btn.active { background: #000000; color: #fff; }

.right-tools { display: flex; gap: 8px; align-items: center; }
.search-wrap { position: relative; }
.search-icon { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: #94a3b8; font-size: 12px; pointer-events: none; }
.search-input {
  height: 32px; width: 220px; border: 1px solid #e2e8f0; border-radius: 8px;
  padding: 0 12px 0 30px; font-size: 13px; color: #334155; outline: none;
  font-family: Helvetica, Arial, sans-serif; background: #fff;
}
.search-input:focus { border-color: #000000; }

.tool-btn {
  height: 32px; border: 1px solid #e2e8f0; border-radius: 8px; padding: 0 12px;
  background: #fff; color: #334155; font-size: 12px; font-weight: 600;
  cursor: pointer; display: inline-flex; align-items: center; gap: 6px;
  font-family: Helvetica, Arial, sans-serif;
}
.tool-btn:hover { background: #f8fafc; }

/* Card */
.card { background: #fff; border-radius: 16px; border: 1px solid #e9eef5; overflow: hidden; }
.table-wrap { overflow-x: auto; }
.empty { padding: 52px; text-align: center; color: #94a3b8; font-size: 14px; display: flex; align-items: center; justify-content: center; gap: 8px; }
.empty.err { color: #be123c; }

table { width: 100%; border-collapse: collapse; min-width: 700px; }
thead th { text-align: left; padding: 13px 16px 10px; }
.sort-btn {
  border: 0; background: transparent; cursor: pointer; padding: 0;
  font-size: 11px; letter-spacing: .08em; color: #94a3b8; font-weight: 600;
  text-transform: uppercase; display: inline-flex; align-items: center; gap: 5px;
  font-family: Helvetica, Arial, sans-serif;
}
.ti { font-size: 10px; }
.sort-neutral { color: #cbd5e1; font-size: 9px; }
.sort-active  { color: #000000; font-size: 9px; }

tbody tr { border-top: 1px solid #f1f5f9; }
tbody tr:hover { background: #fafbfc; }
tbody td { padding: 12px 16px; font-size: 13px; color: #334155; vertical-align: middle; }

/* Product cell */
.product-cell { display: flex; align-items: center; gap: 10px; }
.product-img { width: 40px; height: 40px; border-radius: 8px; object-fit: cover; flex-shrink: 0; background: #f1f5f9; }
.product-img-placeholder {
  width: 40px; height: 40px; border-radius: 8px; background: #f1f5f9;
  display: grid; place-items: center; color: #cbd5e1; flex-shrink: 0; font-size: 14px;
}
.product-meta { display: flex; flex-direction: column; gap: 2px; }
.product-name { font-weight: 600; color: #0f172a; font-size: 13px; }
.product-seller { font-size: 11px; color: #94a3b8; }

/* Category */
.category-pill {
  display: inline-flex; padding: 3px 10px; border-radius: 999px;
  background: #eff6ff; color: #2563eb; font-size: 10px; font-weight: 700;
  text-transform: uppercase; letter-spacing: .04em;
}

.bold { font-weight: 700; color: #0f172a; }

/* Stock badge */
.stock-badge {
  display: inline-flex; align-items: center; gap: 5px;
  font-size: 12px; font-weight: 600;
}
.stock-badge em { font-style: normal; font-size: 10px; font-weight: 600; }
.stock-badge.ok  { color: #16a34a; }
.stock-badge.low { color: #d97706; }
.stock-badge.out { color: #be123c; }

/* Actions */
.actions { display: flex; gap: 6px; }
.action-btn {
  display: inline-flex; align-items: center; gap: 5px;
  height: 28px; padding: 0 10px; border: 0; border-radius: 6px;
  background: #f1f5f9; color: #334155; font-size: 11px; font-weight: 600;
  cursor: pointer; text-decoration: none; font-family: Helvetica, Arial, sans-serif;
}
.action-btn:hover { background: #e2e8f0; }
.action-btn.danger { background: #fff1f2; color: #be123c; }
.action-btn.danger:hover { background: #ffe4e6; }

/* Footer */
.table-footer { padding: 13px 16px; border-top: 1px solid #f1f5f9; }
.muted { font-size: 12px; color: #94a3b8; }

@media (max-width: 768px) {
  .admin-page { grid-template-columns: 1fr !important; }
  .page-body  { padding: 16px !important; }
}
</style>