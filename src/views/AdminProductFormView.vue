<template>
  <div class="admin-page">
    <AdminSidebar />

    <div class="main-shell">
      <AdminTopbar />

      <main class="page-body">

        <!-- Header -->
        <div class="page-header">
          <div>
            <RouterLink to="/admin/inventory" class="back-link">
              <i class="fa-solid fa-arrow-left"></i> Back to Inventory
            </RouterLink>
            <h1>{{ isEditing ? 'Edit Product' : 'Add Product' }}</h1>
          </div>
          <div class="header-actions">
            <RouterLink to="/admin/inventory" class="cancel-btn">Cancel</RouterLink>
            <button type="submit" form="product-form" class="save-btn" :disabled="saving">
              <i class="fa-solid fa-floppy-disk"></i>
              {{ saving ? 'Saving…' : (isEditing ? 'Save Changes' : 'Create Product') }}
            </button>
          </div>
        </div>

        <!-- Error -->
        <div v-if="error" class="error-banner">
          <i class="fa-solid fa-triangle-exclamation"></i> {{ error }}
        </div>

        <form id="product-form" class="form-layout" @submit.prevent="saveProduct">

          <!-- Left: main fields -->
          <div class="panel">
            <h2><i class="fa-solid fa-pen-to-square panel-icon"></i> Product Details</h2>

            <label class="field">
              <span>Product Name <em class="req">*</em></span>
              <input v-model.trim="form.name" type="text" maxlength="100" placeholder="e.g. Wireless Keyboard" required />
            </label>

            <label class="field">
              <span>Description</span>
              <textarea v-model.trim="form.description" rows="4" placeholder="Short product description…"></textarea>
            </label>

            <div class="two-col">
              <label class="field">
                <span>Price (USD) <em class="req">*</em></span>
                <input v-model.number="form.price" type="number" min="0.01" step="0.01" required />
              </label>

              <label class="field">
                <span>Stock Quantity <em class="req">*</em></span>
                <input v-model.number="form.stock" type="number" min="0" step="1" required />
              </label>
            </div>

            <label class="field">
              <span>Category</span>
              <select v-model="form.categoryId">
                <option :value="null">— No category —</option>
                <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
              </select>
            </label>

            <!-- Sizes -->
            <div class="field">
              <span>Available Sizes</span>
              <div class="size-toggle-row">
                <button
                  v-for="s in PRESET_SIZES"
                  :key="s"
                  type="button"
                  class="size-toggle"
                  :class="{ active: form.sizes.includes(s) }"
                  @click="toggleSize(s)"
                >{{ s }}</button>
              </div>
            </div>
          </div>

          <!-- Right: images + meta -->
          <div class="side-panel">
            <h2><i class="fa-solid fa-images panel-icon"></i> Images</h2>

            <!-- Image entries -->
            <div
              v-for="(url, idx) in form.imageUrls"
              :key="idx"
              class="img-entry"
            >
              <div class="img-entry-header">
                <span class="img-entry-label">
                  {{ idx === 0 ? 'Primary image' : `Image ${idx + 1}` }}
                </span>
                <button
                  v-if="form.imageUrls.length > 1"
                  type="button"
                  class="remove-img-btn"
                  @click="removeImage(idx)"
                  title="Remove image"
                >
                  <i class="fa-solid fa-xmark"></i>
                </button>
              </div>

              <input
                :value="url"
                @input="updateImage(idx, ($event.target as HTMLInputElement).value)"
                type="url"
                placeholder="https://…"
                class="img-url-input"
              />

              <div class="preview-box">
                <img v-if="url" :src="url" :alt="`Product image ${idx + 1}`" />
                <div v-else class="preview-placeholder">
                  <i class="fa-solid fa-image"></i>
                  <span>No image</span>
                </div>
              </div>
            </div>

            <!-- Add image button -->
            <button type="button" class="add-img-btn" @click="addImage">
              <i class="fa-solid fa-plus"></i> Add Image
            </button>

            <!-- Read-only seller info when editing -->
            <div v-if="isEditing && sellerName" class="info-row">
              <i class="fa-solid fa-store"></i>
              <span>Sold by <strong>{{ sellerName }}</strong></span>
            </div>
          </div>

        </form>
      </main>
      <AdminFooter />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import AdminSidebar from '@/components/admin/layout/AdminSidebar.vue'
import AdminTopbar from '@/components/admin/layout/AdminTopbar.vue'
import AdminFooter from '@/components/admin/layout/AdminFooter.vue'
import { api } from '@/services/apiClient'
import { createInventoryProduct, getInventoryProduct, updateInventoryProduct } from '@/services/adminInventoryService'
import type { InventoryProductInput } from '@/types/inventory'

interface Category { id: number; name: string }
interface PagedResponse<T> { content: T[] }

const route    = useRoute()
const router   = useRouter()
const productId = computed(() => String(route.params.id || ''))
const isEditing = computed(() => Boolean(productId.value))

const error   = ref('')
const saving  = ref(false)
const sellerName = ref('')
const categories = ref<Category[]>([])

const form = reactive<InventoryProductInput>({
  name: '',
  description: '',
  price: 0,
  stock: 0,
  imageUrl: '',
  imageUrls: [''],
  sizes: [],
  categoryId: null,
})

function addImage() { form.imageUrls.push('') }

function removeImage(idx: number) {
  form.imageUrls.splice(idx, 1)
  if (!form.imageUrls.length) form.imageUrls.push('')
}

function updateImage(idx: number, val: string) {
  form.imageUrls[idx] = val
}

const PRESET_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL']

function toggleSize(size: string) {
  const idx = form.sizes.indexOf(size)
  if (idx >= 0) form.sizes.splice(idx, 1)
  else form.sizes.push(size)
}

onMounted(async () => {
  // Load categories
  try {
    const res = await api.get<PagedResponse<Category>>('/api/categories?page=0&size=100')
    categories.value = res.content ?? []
  } catch {
    // categories are optional — carry on
  }

  if (!isEditing.value) return

  // Load product for editing
  const product = await getInventoryProduct(productId.value)
  if (!product) { error.value = 'Product not found.'; return }

  form.name        = product.name
  form.description = product.description
  form.price       = product.price
  form.stock       = product.stock
  form.imageUrl    = product.imageUrl
  form.imageUrls   = product.imageUrls?.length ? [...product.imageUrls] : [product.imageUrl ?? '']
  form.sizes       = product.sizes ? [...product.sizes] : []
  form.categoryId  = product.categoryId
  sellerName.value = product.sellerName
})

async function saveProduct() {
  error.value = ''

  if (!form.name.trim()) { error.value = 'Product name is required.'; return }
  if (form.price <= 0)   { error.value = 'Price must be greater than 0.'; return }
  if (form.stock < 0)    { error.value = 'Stock cannot be negative.'; return }

  // Sync primary imageUrl from the first non-empty entry in imageUrls
  const validUrls = form.imageUrls.filter(u => u.trim())
  form.imageUrl = validUrls[0] ?? ''

  saving.value = true
  try {
    if (isEditing.value) {
      await updateInventoryProduct(productId.value, form)
    } else {
      await createInventoryProduct(form)
    }
    router.push('/admin/inventory')
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'Failed to save product.'
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.admin-page { min-height: 100vh; display: grid; grid-template-columns: 230px minmax(0,1fr); background: #f8fafc; }
.main-shell { display: flex; flex-direction: column; min-height: 100vh; }
.page-body  { flex: 1; padding: 28px 32px; font-family: Helvetica, Arial, sans-serif; }

/* Header */
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; gap: 16px; }
.back-link {
  display: inline-flex; align-items: center; gap: 7px;
  color: #000000; font-size: 12px; font-weight: 600;
  text-decoration: none; margin-bottom: 10px;
}
.back-link:hover { text-decoration: underline; }
h1 { margin: 0; font-size: 22px; font-weight: 700; color: #0f172a; letter-spacing: -0.02em; }

.header-actions { display: flex; gap: 10px; align-items: center; flex-shrink: 0; }
.cancel-btn {
  display: inline-flex; align-items: center; height: 36px; padding: 0 16px;
  border-radius: 8px; background: #fff; border: 1px solid #e2e8f0;
  color: #334155; font-size: 13px; font-weight: 600; text-decoration: none;
  font-family: Helvetica, Arial, sans-serif;
}
.save-btn {
  display: inline-flex; align-items: center; gap: 7px; height: 36px; padding: 0 18px;
  border-radius: 8px; background: #000000; border: 0; color: #fff;
  font-size: 13px; font-weight: 600; cursor: pointer; font-family: Helvetica, Arial, sans-serif;
}
.save-btn:hover:not(:disabled) { background: #3f2d2e; }
.save-btn:disabled { opacity: .6; cursor: default; }

/* Error */
.error-banner {
  background: #fff1f2; border: 1px solid #fecaca; color: #be123c;
  border-radius: 10px; padding: 12px 16px; font-size: 13px;
  margin-bottom: 20px; display: flex; align-items: center; gap: 8px;
}

/* Layout */
.form-layout {
  display: grid;
  grid-template-columns: minmax(0,1fr) 300px;
  gap: 18px;
  align-items: start;
}

/* Panels */
.panel, .side-panel {
  background: #fff; border: 1px solid #e9eef5; border-radius: 16px; padding: 22px;
  display: flex; flex-direction: column; gap: 16px;
}
.panel h2, .side-panel h2 {
  margin: 0; font-size: 14px; font-weight: 700; color: #0f172a;
  display: flex; align-items: center; gap: 8px;
}
.panel-icon { color: #94a3b8; font-size: 13px; }

/* Fields */
.field {
  display: flex; flex-direction: column; gap: 6px;
  font-size: 13px; font-weight: 600; color: #334155;
}
.field span { display: flex; align-items: center; gap: 3px; }
.req { color: #be123c; font-style: normal; }

input, select, textarea {
  width: 100%; border: 1px solid #e2e8f0; border-radius: 8px;
  padding: 0 12px; background: #f8fafc; color: #0f172a;
  font-family: Helvetica, Arial, sans-serif; font-size: 13px; outline: none;
}
input, select { height: 38px; }
input:focus, select:focus, textarea:focus { border-color: #000000; background: #fff; }
textarea { resize: vertical; padding: 10px 12px; }

.two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }

/* Preview */
.preview-box {
  border: 1px dashed #e2e8f0; border-radius: 10px;
  overflow: hidden; background: #f8fafc; aspect-ratio: 4/3;
  display: flex; align-items: center; justify-content: center;
}
.preview-box img { width: 100%; height: 100%; object-fit: cover; }
.preview-placeholder {
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  color: #cbd5e1; font-size: 12px;
}
.preview-placeholder i { font-size: 28px; }

/* Multi-image manager */
.img-entry {
  display: flex; flex-direction: column; gap: 8px;
  padding: 12px; border: 1px solid #e2e8f0; border-radius: 10px;
  background: #f8fafc;
}

.img-entry-header {
  display: flex; align-items: center; justify-content: space-between;
  font-size: 12px; font-weight: 700; color: #64748b;
}

.img-url-input {
  height: 36px !important;
}

.remove-img-btn {
  width: 24px; height: 24px; border-radius: 6px;
  border: 1px solid #e2e8f0; background: #fff;
  color: #94a3b8; cursor: pointer; display: grid; place-items: center;
  font-size: 11px; flex-shrink: 0;
  transition: background 0.15s, color 0.15s, border-color 0.15s;
}
.remove-img-btn:hover { background: #fee2e2; color: #dc2626; border-color: #fecaca; }

.add-img-btn {
  display: inline-flex; align-items: center; gap: 6px;
  height: 34px; padding: 0 14px;
  border: 1.5px dashed #cbd5e1; border-radius: 8px;
  background: #fff; color: #475569;
  font-size: 13px; font-weight: 600;
  cursor: pointer; font-family: Helvetica, Arial, sans-serif;
  transition: border-color 0.15s, color 0.15s;
  align-self: flex-start;
}
.add-img-btn:hover { border-color: #000; color: #000; }

/* Seller info */
.info-row {
  display: flex; align-items: center; gap: 8px;
  padding: 10px 12px; border-radius: 8px; background: #f8fafc;
  border: 1px solid #e2e8f0; font-size: 12px; color: #64748b;
}
.info-row i { color: #94a3b8; }

/* Sizes */
.size-toggle-row {
  display: flex; flex-wrap: wrap; gap: 8px;
}

.size-toggle {
  min-width: 46px; height: 36px; padding: 0 14px;
  border: 1.5px solid #e2e8f0; border-radius: 8px;
  background: #f8fafc; color: #334155;
  font-family: Helvetica, Arial, sans-serif;
  font-size: 13px; font-weight: 700; cursor: pointer;
  transition: border-color 0.15s, background 0.15s, color 0.15s;
}
.size-toggle:hover { border-color: #94a3b8; }
.size-toggle.active { border-color: #000; background: #000; color: #fff; }

@media (max-width: 768px) {
  .admin-page  { grid-template-columns: 1fr !important; }
  .page-body   { padding: 16px !important; }
  .form-layout { grid-template-columns: 1fr !important; }
  .two-col     { grid-template-columns: 1fr !important; }
}
</style>