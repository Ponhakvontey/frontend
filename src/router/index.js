import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import CardView from '../views/CardView.vue'
import ProductDetailView from '../views/ProductDetailView.vue'
import CheckoutView from '../views/CheckoutView.vue'
import PaymentView from '../views/PaymentView.vue'
import ReviewView from '../views/ReviewView.vue'
import OrderConfirmView from '../views/OrderConfirmView.vue'
import SellView from '../views/SellView.vue'
import OrderHistoryView from '../views/OrderHistoryView.vue'
import AdminDashboardView from '../views/AdminDashboardView.vue'
import AdminOrdersView from '../views/AdminOrdersView.vue'
import AdminUsersView from '../views/AdminUsersView.vue'
import AdminInventoryView from '../views/AdminInventoryView.vue'
import AdminProductFormView from '../views/AdminProductFormView.vue'
import ForgotPasswordView from '../views/ForgotPasswordView.vue'
import VerifyIdentityView from '../views/VerifyIdentityView.vue'
import ResetPasswordView from '../views/ResetPasswordView.vue'
import { isAdmin, isLoggedIn } from '@/utils/auth'
import { readStorage } from '@/utils/storage'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/login', name: 'login', component: LoginView },
    { path: '/register', name: 'register', component: RegisterView },
    { path: '/card', redirect: '/cart' },
    { path: '/cart', name: 'cart', component: CardView },
    { path: '/product/:id', name: 'product-detail', component: ProductDetailView },

    { path: '/checkout', name: 'checkout', component: CheckoutView, meta: { requiresAuth: true } },

    {
      path: '/payment',
      name: 'payment',
      component: PaymentView,
      meta: { requiresAuth: true, requiresShipping: true },
    },
    {
      path: '/review',
      name: 'review',
      component: ReviewView,
      meta: { requiresAuth: true, requiresShipping: true, requiresPayment: true },
    },

    { path: '/order-confirm', name: 'order-confirm', component: OrderConfirmView, meta: { requiresAuth: true } },
    { path: '/sell', name: 'sell', component: SellView },
    { path: '/order-history', name: 'order-history', component: OrderHistoryView, meta: { requiresAuth: true } },

    {
      path: '/admin',
      name: 'admin',
      component: AdminDashboardView,
      meta: { requiresAdmin: true },
    },
    {
      path: '/admin/orders',
      name: 'admin-orders',
      component: AdminOrdersView,
      meta: { requiresAdmin: true },
    },
    {
      path: '/admin/users',
      name: 'admin-users',
      component: AdminUsersView,
      meta: { requiresAdmin: true },
    },
    {
      path: '/admin/inventory',
      name: 'admin-inventory',
      component: AdminInventoryView,
      meta: { requiresAdmin: true },
    },
    {
      path: '/admin/inventory/new',
      name: 'admin-product-new',
      component: AdminProductFormView,
      meta: { requiresAdmin: true },
    },
    {
      path: '/admin/inventory/:id/edit',
      name: 'admin-product-edit',
      component: AdminProductFormView,
      meta: { requiresAdmin: true },
    },

    { path: '/forgot-password', name: 'forgot-password', component: ForgotPasswordView },
    { path: '/verify-identity', name: 'verify-identity', component: VerifyIdentityView },
    { path: '/reset-password', name: 'reset-password', component: ResetPasswordView },

    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

router.beforeEach((to) => {
  if (to.meta.requiresAdmin && !isAdmin()) {
    return '/login?redirect=' + encodeURIComponent(to.fullPath)
  }

  if (to.meta.requiresAuth && !isLoggedIn()) {
    return `/login?redirect=${encodeURIComponent(to.fullPath)}`
  }

  if (to.meta.requiresShipping) {
    const shipping = readStorage('shippingInfo', {})
    const cartItems = readStorage('cartItems', [])
    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      return '/cart'
    }
    if (
      !shipping?.firstName ||
      !shipping?.lastName ||
      !shipping?.address ||
      !shipping?.city ||
      !shipping?.state ||
      !shipping?.zipCode ||
      !shipping?.phone
    ) {
      return '/checkout'
    }
  }

  if (to.meta.requiresPayment) {
    const payment = readStorage('paymentInfo', {})
    if (!payment?.method) {
      return '/payment'
    }
  }

  if (to.path === '/order-confirm') {
    const order = readStorage('orderConfirmation', null)
    if (!order?.orderNumber) return '/review'
  }

  return true
})

export default router

