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

  const categories = computed(() => [...new Set(products.value.map((product) => product.category))])

  const visibleProducts = computed(() => {
    const term = search.value.trim().toLowerCase()
    const filtered = products.value.filter((product) => {
      const matchesTerm = !term || [product.name, product.maker, product.sku, product.category].some((value) =>
        value.toLowerCase().includes(term),
      )

      const matchesFilter =
        filter.value === 'all' ||
        (filter.value === 'in-stock' && product.stock > 10) ||
        (filter.value === 'low-stock' && product.stock > 0 && product.stock <= 10) ||
        (filter.value === 'out-of-stock' && product.stock === 0)

      return matchesTerm && matchesFilter
    })

    return [...filtered].sort((first, second) => {
      const firstValue = first[sortKey.value]
      const secondValue = second[sortKey.value]
      const result = typeof firstValue === 'number'
        ? firstValue - Number(secondValue)
        : String(firstValue).localeCompare(String(secondValue))

      return sortDirection.value === 'asc' ? result : -result
    })
  })

  async function fetchProducts() {
    loading.value = true
    error.value = null

    try {
      products.value = await getInventoryProducts()
    } catch (err: any) {
      error.value = err?.message || 'Failed to load inventory products'
    } finally {
      loading.value = false
    }
  }

  async function removeProduct(id: string) {
    await deleteInventoryProduct(id)
    products.value = products.value.filter((product) => product.id !== id)
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
    loading,
    error,
    products,
    search,
    filter,
    sortKey,
    sortDirection,
    categories,
    visibleProducts,
    fetchProducts,
    removeProduct,
    setSort,
  }
}
