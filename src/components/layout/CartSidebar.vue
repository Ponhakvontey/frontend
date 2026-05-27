<template>
  <Teleport to="body">

    <!-- Backdrop -->
    <Transition name="sb-fade">
      <div v-if="state.open" class="sb-overlay" @click="closeSidebar" />
    </Transition>

    <!-- Panel -->
    <Transition name="sb-slide">
      <div v-if="state.open" class="sb-panel" role="dialog" aria-modal="true" aria-label="Shopping cart">

        <!-- Header -->
        <div class="sb-header">
          <h2 class="sb-title">
            My Bag
            <span v-if="state.items.length" class="sb-count">({{ state.items.length }})</span>
          </h2>
          <button class="sb-close" type="button" @click="closeSidebar" aria-label="Close">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <!-- Body -->
        <div class="sb-body">

          <!-- Loading -->
          <div v-if="state.loading" class="sb-state">
            <i class="fa-solid fa-spinner fa-spin"></i>
          </div>

          <!-- Error -->
          <div v-else-if="state.error" class="sb-state sb-error">
            <i class="fa-solid fa-triangle-exclamation"></i>
            {{ state.error }}
          </div>

          <!-- Empty -->
          <div v-else-if="state.items.length === 0" class="sb-state sb-empty">
            <i class="fa-solid fa-bag-shopping"></i>
            <p>Your bag is empty</p>
          </div>

          <!-- Item list -->
          <div v-else class="sb-items">
            <div
              v-for="item in state.items"
              :key="`${item.productId}-${item.size ?? 'none'}`"
              class="sb-item"
            >
              <!-- Image -->
              <div class="si-img">
                <img v-if="item.productImageUrl" :src="item.productImageUrl" :alt="item.productName" />
                <div v-else class="si-img-placeholder"><i class="fa-solid fa-image"></i></div>
              </div>

              <!-- Details -->
              <div class="si-info">
                <p class="si-name">{{ item.productName }}</p>
                <p v-if="item.size" class="si-size">Size: <strong>{{ item.size }}</strong></p>
                <p class="si-price">${{ item.totalPrice.toFixed(2) }}</p>

                <div class="si-row">
                  <!-- Quantity -->
                  <div class="si-qty">
                    <button
                      type="button"
                      class="si-qty-btn"
                      :disabled="item.quantity <= 1"
                      @click="changeQty(item, -1)"
                    ><i class="fa-solid fa-minus"></i></button>
                    <span class="si-qty-val">{{ item.quantity }}</span>
                    <button
                      type="button"
                      class="si-qty-btn"
                      :disabled="item.quantity >= item.availableStock"
                      @click="changeQty(item, +1)"
                    ><i class="fa-solid fa-plus"></i></button>
                  </div>

                  <!-- Remove -->
                  <button
                    type="button"
                    class="si-remove"
                    @click="removeItem(item.productId, item.size)"
                    aria-label="Remove item"
                  >
                    <i class="fa-regular fa-trash-can"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div v-if="!state.loading && state.items.length > 0" class="sb-footer">
          <div class="sb-total-row">
            <span class="sb-total-label">Subtotal</span>
            <span class="sb-total-val">${{ state.totalAmount.toFixed(2) }}</span>
          </div>
          <RouterLink to="/checkout" class="sb-checkout-btn" @click="closeSidebar">
            Proceed to Checkout
          </RouterLink>
        </div>

      </div>
    </Transition>

  </Teleport>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useCartSidebar } from '@/composables/useCartSidebar'
import type { SidebarCartItem } from '@/composables/useCartSidebar'

const { state, closeSidebar, updateQuantity, removeItem } = useCartSidebar()

function changeQty(item: SidebarCartItem, delta: number) {
  const next = item.quantity + delta
  if (next < 1 || next > item.availableStock) return
  updateQuantity(item.productId, item.size, next)
}
</script>

<style scoped>
/* ── Transitions ── */
.sb-fade-enter-active,
.sb-fade-leave-active { transition: opacity 0.25s ease; }
.sb-fade-enter-from,
.sb-fade-leave-to    { opacity: 0; }

.sb-slide-enter-active,
.sb-slide-leave-active { transition: transform 0.3s ease; }
.sb-slide-enter-from,
.sb-slide-leave-to    { transform: translateX(100%); }

/* ── Overlay ── */
.sb-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 1000;
}

/* ── Panel ── */
.sb-panel {
  position: fixed;
  top: 0; right: 0;
  height: 100dvh;
  width: 420px;
  max-width: 100vw;
  background: #fff;
  z-index: 1001;
  display: flex;
  flex-direction: column;
  font-family: Helvetica, Arial, sans-serif;
}

/* ── Header ── */
.sb-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #e9eef5;
  flex-shrink: 0;
}
.sb-title {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
  display: flex;
  align-items: center;
  gap: 6px;
}
.sb-count { font-weight: 400; color: #64748b; font-size: 14px; }

.sb-close {
  width: 32px; height: 32px;
  border: none; background: transparent;
  cursor: pointer; border-radius: 6px;
  display: grid; place-items: center;
  color: #64748b; font-size: 16px;
  transition: background 0.15s, color 0.15s;
}
.sb-close:hover { background: #f1f5f9; color: #0f172a; }

/* ── Body ── */
.sb-body {
  flex: 1;
  overflow-y: auto;
  overscroll-behavior: contain;
}

/* ── States ── */
.sb-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  height: 100%;
  min-height: 200px;
  color: #94a3b8;
  font-size: 14px;
}
.sb-state i { font-size: 28px; }
.sb-state p { margin: 0; }
.sb-error { color: #be123c; }
.sb-empty { color: #94a3b8; }

/* ── Item list ── */
.sb-items { padding: 8px 0; }

.sb-item {
  display: flex;
  gap: 14px;
  padding: 16px 24px;
  border-bottom: 1px solid #f1f5f9;
}
.sb-item:last-child { border-bottom: none; }

/* image */
.si-img {
  flex-shrink: 0;
  width: 80px; height: 100px;
  border-radius: 8px;
  overflow: hidden;
  background: #f1f5f9;
}
.si-img img { width: 100%; height: 100%; object-fit: cover; display: block; }
.si-img-placeholder {
  width: 100%; height: 100%;
  display: grid; place-items: center;
  color: #cbd5e1; font-size: 20px;
}

/* details */
.si-info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 4px; }

.si-name {
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  color: #0f172a;
  line-height: 1.4;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
.si-size {
  margin: 0;
  font-size: 12px;
  color: #64748b;
  font-weight: 400;
}
.si-size strong { color: #334155; }
.si-price {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  color: #000;
}

.si-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 4px;
}

/* qty */
.si-qty {
  display: flex;
  align-items: center;
  gap: 0;
  border: 1.5px solid #e2e8f0;
  border-radius: 6px;
  overflow: hidden;
  height: 30px;
}
.si-qty-btn {
  width: 28px; height: 100%;
  border: none; background: transparent;
  cursor: pointer; color: #334155;
  font-size: 10px;
  display: grid; place-items: center;
  transition: background 0.12s;
}
.si-qty-btn:hover:not(:disabled) { background: #f1f5f9; }
.si-qty-btn:disabled { opacity: 0.35; cursor: default; }
.si-qty-val {
  min-width: 28px;
  text-align: center;
  font-size: 13px;
  font-weight: 600;
  color: #0f172a;
  border-left: 1px solid #e2e8f0;
  border-right: 1px solid #e2e8f0;
  line-height: 30px;
}

/* remove */
.si-remove {
  width: 28px; height: 28px;
  border: none; background: transparent;
  cursor: pointer; color: #94a3b8;
  font-size: 13px;
  display: grid; place-items: center;
  border-radius: 6px;
  transition: background 0.12s, color 0.12s;
}
.si-remove:hover { background: #fff1f2; color: #be123c; }

/* ── Footer ── */
.sb-footer {
  flex-shrink: 0;
  padding: 20px 24px;
  border-top: 1px solid #e9eef5;
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: #fff;
}

.sb-total-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}
.sb-total-label { font-size: 14px; font-weight: 600; color: #334155; }
.sb-total-val   { font-size: 18px; font-weight: 700; color: #000; }

.sb-checkout-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 48px;
  border-radius: 50px;
  background: #000;
  color: #fff;
  font-family: Helvetica, Arial, sans-serif;
  font-size: 14px;
  font-weight: 700;
  text-decoration: none;
  transition: background 0.15s;
}
.sb-checkout-btn:hover { background: #222; }

/* ── Mobile ── */
@media (max-width: 480px) {
  .sb-panel { width: 100vw; }
}
</style>
