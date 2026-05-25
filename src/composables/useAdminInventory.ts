import { computed, ref } from 'vue'
import {
  deleteInventoryProduct,
  getInventoryProducts,
} from '@/services/adminInventoryService'
import type { InventoryFilterKey, InventoryProduct, InventorySortKey } from '@/types/inventory'

export function useAdminInventory() {
  const loading = ref(false)
  const error = ref<string | null>(null)
  const products = ref<InventoryProduct[]>([])
  const search = ref('')
  const filter = ref<InventoryFilterKey>('all')
  const sortKey = ref<InventorySortKey>('name')
  const sortDirection = ref<'asc' | 'desc'>('asc')

  const visibleProducts = computed(() => {
    const term = search.value.trim().toLowerCase()

    const filtered = products.value.filter((p) => {
      const matchesTerm = !term || [p.name, p.category, p.sellerName].some((v) =>
        v.toLowerCase().includes(term),
      )
      const matchesFilter =
        filter.value === 'all' ||
        (filter.value === 'in-stock' && p.stock > 10) ||
        (filter.value === 'low-stock' && p.stock > 0 && p.stock <= 10) ||
        (filter.value === 'out-of-stock' && p.stock === 0)

      return matchesTerm && matchesFilter
    })

    return [...filtered].sort((a, b) => {
      const av = a[sortKey.value]
      const bv = b[sortKey.value]
      const result = typeof av === 'number' ? av - Number(bv) : String(av).localeCompare(String(bv))
      return sortDirection.value === 'asc' ? result : -result
    })
  })

  async function fetchProducts() {
    loading.value = true
    error.value = null
    try {
      products.value = await getInventoryProducts()
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Failed to load products'
    } finally {
      loading.value = false
    }
  }

  async function removeProduct(id: string) {
    await deleteInventoryProduct(id)
    products.value = products.value.filter((p) => p.id !== id)
  }

  function setSort(key: InventorySortKey) {
    if (sortKey.value === key) {
      sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
      return
    }
    sortKey.value = key
    sortDirection.value = 'asc'
  }

  return {
    loading, error, products, search, filter,
    sortKey, sortDirection, visibleProducts,
    fetchProducts, removeProduct, setSort,
  }
}
