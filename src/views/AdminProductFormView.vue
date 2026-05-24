<template>
  <div class="admin-page">
    <AdminSidebar />

    <div class="main-shell">
      <AdminTopbar />

      <main class="product-main">
        <section class="form-header">
          <div>
            <RouterLink to="/admin/inventory" class="back-link">Back to Inventory</RouterLink>
            <h1>{{ isEditing ? 'Edit Product' : 'Add New Product' }}</h1>
            <p>{{ isEditing ? 'Update inventory details and stock rules.' : 'Create a product record ready for your future API.' }}</p>
          </div>

          <div class="header-actions">
            <RouterLink to="/admin/inventory" class="secondary-btn">Cancel</RouterLink>
            <button type="submit" form="product-form" class="primary-btn">{{ isEditing ? 'Save Changes' : 'Create Product' }}</button>
          </div>
        </section>

        <form id="product-form" class="product-form" @submit.prevent="saveProduct">
          <section class="form-panel main-panel">
            <h2>Product Details</h2>

            <div class="form-grid two-columns">
              <label>
                <span>Product Name</span>
                <input v-model.trim="form.name" type="text" required placeholder="Arches Ceramic Vase" />
              </label>

              <label>
                <span>Maker</span>
                <input v-model.trim="form.maker" type="text" required placeholder="Curator House" />
              </label>

              <label>
                <span>SKU</span>
                <input v-model.trim="form.sku" type="text" required placeholder="HOME-AV-WH" />
              </label>

              <label>
                <span>Category</span>
                <select v-model="form.category" required>
                  <option value="Exclusive Design">Exclusive Design</option>
                  <option value="Signature Lighting">Signature Lighting</option>
                  <option value="Handcrafted Woodwork">Handcrafted Woodwork</option>
                  <option value="Atmospheric Object">Atmospheric Object</option>
                  <option value="Home Decor">Home Decor</option>
                </select>
              </label>

              <label>
                <span>Price</span>
                <input v-model.number="form.price" type="number" min="0" step="0.01" required />
              </label>

              <label>
                <span>Stock</span>
                <input v-model.number="form.stock" type="number" min="0" step="1" required />
              </label>
            </div>

            <label class="full-field">
              <span>Description</span>
              <textarea v-model.trim="form.description" rows="5" placeholder="Short admin-facing product note"></textarea>
            </label>
          </section>

          <aside class="form-panel side-panel">
            <h2>Publishing</h2>

            <label>
              <span>Status</span>
              <select v-model="form.status">
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            </label>

            <label>
              <span>Image URL</span>
              <input v-model.trim="form.image" type="text" placeholder="https://..." />
            </label>

            <div class="preview-box">
              <img :src="previewImage" alt="Product preview" />
              <p>{{ form.name || 'Product preview' }}</p>
            </div>

            <p v-if="error" class="error-text">{{ error }}</p>
          </aside>
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
import { createInventoryProduct, getInventoryProduct, updateInventoryProduct } from '@/services/adminInventoryService'
import type { InventoryProductInput, InventoryStatus } from '@/types/inventory'
import bed1Img from '@/assets/home/bed1.png'

const route = useRoute()
const router = useRouter()
const productId = computed(() => String(route.params.id || ''))
const isEditing = computed(() => Boolean(productId.value))
const error = ref('')

const form = reactive<InventoryProductInput>({
  name: '',
  maker: '',
  sku: '',
  category: 'Home Decor',
  price: 0,
  stock: 0,
  status: 'active' as InventoryStatus,
  image: '',
  description: '',
})

const previewImage = computed(() => form.image || bed1Img)

onMounted(async () => {
  if (!isEditing.value) return

  const product = await getInventoryProduct(productId.value)
  if (!product) {
    error.value = 'Product not found.'
    return
  }

  Object.assign(form, {
    name: product.name,
    maker: product.maker,
    sku: product.sku,
    category: product.category,
    price: product.price,
    stock: product.stock,
    status: product.status,
    image: product.image,
    description: product.description,
  })
})

async function saveProduct() {
  error.value = ''

  if (!form.name || !form.maker || !form.sku) {
    error.value = 'Name, maker, and SKU are required.'
    return
  }

  if (isEditing.value) {
    await updateInventoryProduct(productId.value, form)
  } else {
    await createInventoryProduct(form)
  }

  router.push('/admin/inventory')
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

.product-main {
  padding: 28px;
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
  margin-bottom: 24px;
}

.back-link {
  display: inline-flex;
  margin-bottom: 14px;
  color: #513B3C;
  font-size: 13px;
  font-weight: 700;
  text-decoration: none;
}

.form-header h1 {
  margin: 0 0 8px;
  font-size: 44px;
  line-height: 1;
  color: #101828;
}

.form-header p {
  margin: 0;
  color: #667085;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.primary-btn,
.secondary-btn {
  display: inline-flex;
  align-items: center;
  height: 44px;
  border: 0;
  border-radius: 12px;
  padding: 0 18px;
  font-weight: 800;
  text-decoration: none;
  cursor: pointer;
}

.primary-btn {
  background: #4361ee;
  color: #fff;
}

.secondary-btn {
  background: #fff;
  color: #344054;
}

.product-form {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 340px;
  gap: 18px;
}

.form-panel {
  background: #fff;
  border: 1px solid #e7ecf5;
  border-radius: 20px;
  padding: 24px;
}

.form-panel h2 {
  margin: 0 0 20px;
  font-size: 20px;
  color: #101828;
}

.form-grid {
  display: grid;
  gap: 16px;
}

.two-columns {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

label {
  display: flex;
  flex-direction: column;
  gap: 8px;
  color: #344054;
  font-size: 13px;
  font-weight: 700;
}

input,
select,
textarea {
  width: 100%;
  border: 1px solid #e4e9f2;
  border-radius: 12px;
  padding: 0 14px;
  background: #f9fafc;
  color: #101828;
  font: inherit;
  outline: 0;
}

input,
select {
  height: 44px;
}

textarea {
  resize: vertical;
  padding-top: 12px;
}

.full-field {
  margin-top: 16px;
}

.side-panel {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.preview-box {
  border: 1px dashed #cfd8ea;
  border-radius: 16px;
  padding: 14px;
  background: #f8fafc;
}

.preview-box img {
  width: 100%;
  aspect-ratio: 4 / 3;
  border-radius: 12px;
  object-fit: cover;
  background: #eef2f6;
}

.preview-box p {
  margin: 12px 0 0;
  color: #344054;
  font-weight: 800;
}

.error-text {
  margin: 0;
  color: #dc2626;
  font-size: 13px;
  font-weight: 700;
}
</style>
