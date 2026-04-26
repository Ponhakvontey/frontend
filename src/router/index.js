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

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/login', name: 'login', component: LoginView },
    { path: '/register', name: 'register', component: RegisterView },
    { path: '/card', name: 'card', component: CardView },
    { path: '/product/:id', name: 'product-detail', component: ProductDetailView },
    { path: '/checkout', name: 'checkout', component: CheckoutView },
    { path: '/payment', name: 'payment', component: PaymentView },
    { path: '/review', name: 'review', component: ReviewView },
    { path: '/order-confirm', name: 'order-confirm', component: OrderConfirmView },
    { path: '/sell', name: 'sell', component: SellView },
    { path: '/order-history', name: 'order-history', component: OrderHistoryView },
    { path: '/admin', name: 'admin', component: AdminDashboardView },
    { path: '/forgot-password', name: 'forgot-password', component: ForgotPasswordView },
    { path: '/verify-identity', name: 'verify-identity', component: VerifyIdentityView },
  ],
})

export default router
