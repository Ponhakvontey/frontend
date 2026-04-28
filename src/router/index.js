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
import ForgotPasswordView from '../views/ForgotPasswordView.vue'
import VerifyIdentityView from '../views/VerifyIdentityView.vue'
import { isAdmin, isLoggedIn } from '@/utils/auth'
import { readStorage } from '@/utils/storage'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/login', name: 'login', component: LoginView },
    { path: '/register', name: 'register', component: RegisterView },
    { path: '/card', name: 'card', component: CardView },
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
    { path: '/order-confirm', name: 'order-confirm', component: OrderConfirmView },
    { path: '/sell', name: 'sell', component: SellView },
    { path: '/order-history', name: 'order-history', component: OrderHistoryView },
    { path: '/admin', name: 'admin', component: AdminDashboardView, meta: { requiresAdmin: true } },
    { path: '/forgot-password', name: 'forgot-password', component: ForgotPasswordView },
    { path: '/verify-identity', name: 'verify-identity', component: VerifyIdentityView },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

router.beforeEach((to) => {
  if (to.meta.requiresAdmin && !isAdmin()) {
    return '/login?redirect=/admin'
  }

  if (to.meta.requiresAuth && !isLoggedIn()) {
    return `/login?redirect=${encodeURIComponent(to.fullPath)}`
  }

  if (to.meta.requiresShipping) {
    const shipping = readStorage('shippingInfo', {})
    if (!shipping?.firstName || !shipping?.address || !shipping?.phone) {
      return '/checkout'
    }
  }

  if (to.meta.requiresPayment) {
    const payment = readStorage('paymentInfo', {})
    if (!payment?.method) {
      return '/payment'
    }
  }

  return true
})

export default router
