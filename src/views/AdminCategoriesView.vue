<template>
  <div class="admin-page">
    <AdminSidebar />

    <div class="main-shell">
      <AdminTopbar />

      <main class="page-body">

        <!-- Header -->
        <div class="page-header">
          <div>
            <h1><i class="fa-solid fa-tags title-icon"></i> Categories</h1>
            <p class="sub">Create and manage product categories.</p>
          </div>
          <button type="button" class="add-btn" @click="openCreate">
            <i class="fa-solid fa-plus"></i> Add Category
          </button>
        </div>

        <!-- Error -->
        <div v-if="error" class="error-banner">
          <i class="fa-solid fa-triangle-exclamation"></i> {{ error }}
        </div>

        <!-- Stats -->
        <div class="stats-row">
          <div class="stat-chip">
            <i class="fa-solid fa-tags"></i>
            <span><strong>{{ categories.length }}</strong> categories</span>
          </div>
          <div class="stat-chip blue">
            <i class="fa-solid fa-box-archive"></i>
            <span><strong>{{ totalProducts }}</strong> products assigned</span>
          </div>
        </div>

        <!-- Table card -->
        <div class="card">
          <div v-if="loading" class="empty">
            <i class="fa-solid fa-spinner fa-spin"></i> Loading…
          </div>
          <template v-else>
            <div v-if="!categories.length" class="empty">
              <i class="fa-regular fa-folder-open"></i> No categories yet. Create one!
            </div>
            <table v-else>
              <thead>
                <tr>
                  <th><i class="fa-solid fa-tag ti"></i> Name</th>
                  <th><i class="fa-solid fa-align-left ti"></i> Description</th>
                  <th><i class="fa-solid fa-box-archive ti"></i> Products</th>
                  <th><i class="fa-solid fa-ellipsis ti"></i> Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="cat in categories" :key="cat.id">
                  <td class="cat-name">{{ cat.name }}</td>
                  <td class="cat-desc">{{ cat.description || '—' }}</td>
                  <td>
                    <span class="count-badge">{{ cat.productCount ?? 0 }}</span>
                  </td>
                  <td>
                    <div class="actions">
                      <button type="button" class="action-btn" @click="openEdit(cat)">
                        <i class="fa-solid fa-pen"></i> Edit
                      </button>
                      <button type="button" class="action-btn danger" @click="confirmDelete(cat)">
                        <i class="fa-solid fa-trash"></i> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </template>
        </div>

      </main>
      <AdminFooter />
    </div>

    <!-- Modal -->
    <Teleport to="body">
      <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal">
          <div class="modal-header">
            <h3>{{ editingId ? 'Edit Category' : 'New Category' }}</h3>
            <button type="button" class="modal-close" @click="closeModal">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>

          <div v-if="modalError" class="modal-error">
            <i class="fa-solid fa-triangle-exclamation"></i> {{ modalError }}
          </div>

          <form class="modal-form" @submit.prevent="saveCategory">
            <label class="field">
              <span>Name <em class="req">*</em></span>
              <input v-model.trim="form.name" type="text" maxlength="100" placeholder="e.g. Electronics" required autofocus />
            </label>

            <label class="field">
              <span>Description</span>
              <textarea v-model.trim="form.description" rows="3" placeholder="Optional description…"></textarea>
            </label>

            <div class="modal-footer">
              <button type="button" class="cancel-btn" @click="closeModal">Cancel</button>
              <button type="submit" class="save-btn" :disabled="saving">
                <i class="fa-solid fa-floppy-disk"></i>
                {{ saving ? 'Saving…' : (editingId ? 'Save Changes' : 'Create') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import AdminSidebar from '@/components/admin/layout/AdminSidebar.vue'
import AdminTopbar from '@/components/admin/layout/AdminTopbar.vue'
import AdminFooter from '@/components/admin/layout/AdminFooter.vue'
import { api } from '@/services/apiClient'

interface Category {
  id: number
  name: string
  description: string | null
  productCount: number | null
}

interface PagedResponse<T> { content: T[] }

// ── State ────────────────────────────────────────────────────────────────────

const categories = ref<Category[]>([])
const loading    = ref(true)
const error      = ref('')

const showModal  = ref(false)
const editingId  = ref<number | null>(null)
const saving     = ref(false)
const modalError = ref('')

const form = reactive({ name: '', description: '' })

const totalProducts = computed(() =>
  categories.value.reduce((s, c) => s + (c.productCount ?? 0), 0),
)

// ── Load ─────────────────────────────────────────────────────────────────────

async function fetchCategories() {
  loading.value = true
  error.value = ''
  try {
    const res = await api.get<PagedResponse<Category>>('/api/categories?page=0&size=100')
    categories.value = res.content ?? []
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'Failed to load categories.'
  } finally {
    loading.value = false
  }
}

onMounted(fetchCategories)

// ── Modal helpers ─────────────────────────────────────────────────────────────

function openCreate() {
  editingId.value = null
  form.name = ''
  form.description = ''
  modalError.value = ''
  showModal.value = true
}

function openEdit(cat: Category) {
  editingId.value = cat.id
  form.name = cat.name
  form.description = cat.description ?? ''
  modalError.value = ''
  showModal.value = true
}

function closeModal() {
  showModal.value = false
}

// ── Save ──────────────────────────────────────────────────────────────────────

async function saveCategory() {
  if (!form.name.trim()) { modalError.value = 'Name is required.'; return }
  modalError.value = ''
  saving.value = true

  const payload = {
    name: form.name,
    description: form.description || null,
  }

  try {
    if (editingId.value) {
      const updated = await api.put<Category>(`/api/categories/${editingId.value}`, payload)
      const idx = categories.value.findIndex(c => c.id === editingId.value)
      if (idx !== -1) categories.value[idx] = updated
    } else {
      const created = await api.post<Category>('/api/categories', payload)
      categories.value.push(created)
    }
    closeModal()
  } catch (e: unknown) {
    modalError.value = e instanceof Error ? e.message : 'Failed to save category.'
  } finally {
    saving.value = false
  }
}

// ── Delete ────────────────────────────────────────────────────────────────────

async function confirmDelete(cat: Category) {
  if (!window.confirm(`Delete category "${cat.name}"? Products in this category will become uncategorized.`)) return
  error.value = ''
  try {
    await api.delete(`/api/categories/${cat.id}`)
    categories.value = categories.value.filter(c => c.id !== cat.id)
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'Failed to delete category.'
  }
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
  height: 36px; padding: 0 16px; border-radius: 8px; border: 0;
  background: #000000; color: #fff; font-size: 13px; font-weight: 600;
  cursor: pointer; font-family: Helvetica, Arial, sans-serif; flex-shrink: 0;
}
.add-btn:hover { background: #3f2d2e; }

/* Error */
.error-banner {
  background: #fff1f2; border: 1px solid #fecaca; color: #be123c;
  border-radius: 10px; padding: 12px 16px; font-size: 13px;
  margin-bottom: 20px; display: flex; align-items: center; gap: 8px;
}

/* Stats */
.stats-row { display: flex; gap: 10px; margin-bottom: 20px; }
.stat-chip {
  display: inline-flex; align-items: center; gap: 7px; height: 34px; padding: 0 14px;
  border-radius: 8px; background: #fff; border: 1px solid #e2e8f0;
  font-size: 13px; color: #334155; font-family: Helvetica, Arial, sans-serif;
}
.stat-chip i { font-size: 12px; color: #94a3b8; }
.stat-chip.blue { background: #eff6ff; border-color: #bfdbfe; }
.stat-chip.blue i { color: #2563eb; }

/* Card */
.card { background: #fff; border-radius: 16px; border: 1px solid #e9eef5; overflow: hidden; }
.empty { padding: 52px; text-align: center; color: #94a3b8; font-size: 14px; display: flex; align-items: center; justify-content: center; gap: 8px; }

table { width: 100%; border-collapse: collapse; }
thead th { text-align: left; padding: 13px 18px 10px; font-size: 11px; letter-spacing: .08em; color: #94a3b8; font-weight: 600; text-transform: uppercase; }
.ti { margin-right: 4px; font-size: 10px; }
tbody tr { border-top: 1px solid #f1f5f9; }
tbody tr:hover { background: #fafbfc; }
tbody td { padding: 13px 18px; font-size: 13px; color: #334155; vertical-align: middle; }

.cat-name { font-weight: 600; color: #0f172a; }
.cat-desc { color: #64748b; max-width: 360px; }

.count-badge {
  display: inline-flex; align-items: center; justify-content: center;
  min-width: 28px; height: 22px; padding: 0 8px; border-radius: 999px;
  background: #f1f5f9; color: #334155; font-size: 11px; font-weight: 700;
}

.actions { display: flex; gap: 6px; }
.action-btn {
  display: inline-flex; align-items: center; gap: 5px; height: 28px; padding: 0 10px;
  border: 0; border-radius: 6px; background: #f1f5f9; color: #334155;
  font-size: 11px; font-weight: 600; cursor: pointer; font-family: Helvetica, Arial, sans-serif;
}
.action-btn:hover { background: #e2e8f0; }
.action-btn.danger { background: #fff1f2; color: #be123c; }
.action-btn.danger:hover { background: #ffe4e6; }

/* Modal overlay */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(15,23,42,.45);
  display: flex; align-items: center; justify-content: center; z-index: 1000;
}
.modal {
  background: #fff; border-radius: 16px; width: 440px; max-width: calc(100vw - 32px);
  box-shadow: 0 20px 60px rgba(15,23,42,.18); overflow: hidden;
}
.modal-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 18px 22px 0; margin-bottom: 16px;
}
.modal-header h3 { margin: 0; font-size: 16px; font-weight: 700; color: #0f172a; font-family: Helvetica, Arial, sans-serif; }
.modal-close {
  border: 0; background: transparent; color: #94a3b8;
  font-size: 16px; cursor: pointer; padding: 4px; line-height: 1;
}
.modal-close:hover { color: #334155; }

.modal-error {
  margin: 0 22px 12px; background: #fff1f2; border: 1px solid #fecaca;
  color: #be123c; border-radius: 8px; padding: 10px 14px; font-size: 13px;
  display: flex; align-items: center; gap: 7px; font-family: Helvetica, Arial, sans-serif;
}

.modal-form { padding: 0 22px 22px; display: flex; flex-direction: column; gap: 14px; font-family: Helvetica, Arial, sans-serif; }
.field { display: flex; flex-direction: column; gap: 6px; font-size: 13px; font-weight: 600; color: #334155; }
.field span { display: flex; align-items: center; gap: 3px; }
.req { color: #be123c; font-style: normal; }
input, textarea {
  width: 100%; border: 1px solid #e2e8f0; border-radius: 8px; padding: 0 12px;
  background: #f8fafc; color: #0f172a; font-family: Helvetica, Arial, sans-serif; font-size: 13px; outline: none;
}
input { height: 38px; }
input:focus, textarea:focus { border-color: #000000; background: #fff; }
textarea { resize: vertical; padding: 10px 12px; }

.modal-footer { display: flex; justify-content: flex-end; gap: 8px; padding-top: 4px; }
.cancel-btn {
  height: 36px; padding: 0 16px; border-radius: 8px; border: 1px solid #e2e8f0;
  background: #fff; color: #334155; font-size: 13px; font-weight: 600;
  cursor: pointer; font-family: Helvetica, Arial, sans-serif;
}
.save-btn {
  display: inline-flex; align-items: center; gap: 7px; height: 36px; padding: 0 18px;
  border-radius: 8px; border: 0; background: #000000; color: #fff;
  font-size: 13px; font-weight: 600; cursor: pointer; font-family: Helvetica, Arial, sans-serif;
}
.save-btn:hover:not(:disabled) { background: #3f2d2e; }
.save-btn:disabled { opacity: .6; cursor: default; }
</style>
