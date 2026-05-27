import { reactive } from 'vue'

const state = reactive({ open: false })

export function useAdminMenu() {
  return {
    state,
    toggle: () => { state.open = !state.open },
    close:  () => { state.open = false },
  }
}
