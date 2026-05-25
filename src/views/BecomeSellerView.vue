<template>
  <div class="page">
    <AppHeader :nav-links="navLinks" :cart-count="0" />

    <main class="main">
      <div class="container">

        <div class="page-head">
          <h1>Become a Seller</h1>
          <p class="subtitle">Fill in your business details and an admin will review your application.</p>
        </div>

        <!-- Loading -->
        <div v-if="phase === 'loading'" class="card center">
          <i class="fa-solid fa-spinner fa-spin spin-icon"></i>
          <p>Checking your application status…</p>
        </div>

        <!-- Already a seller -->
        <div v-else-if="phase === 'approved'" class="card center">
          <div class="status-circle approved-circle">
            <i class="fa-solid fa-store"></i>
          </div>
          <h2>You're a verified seller!</h2>
          <p class="status-desc">Your seller account is active. List products from the admin panel or your seller dashboard.</p>
          <RouterLink to="/sell" class="primary-btn">Browse Marketplace</RouterLink>
        </div>

        <!-- Pending review -->
        <div v-else-if="phase === 'pending'" class="card center">
          <div class="status-circle pending-circle">
            <i class="fa-regular fa-clock"></i>
          </div>
          <h2>Application Under Review</h2>
          <p class="status-desc">
            Your application for <strong>{{ existingApp?.shopName }}</strong> was submitted on
            {{ formatDate(existingApp?.appliedAt) }}. An admin will review it shortly.
          </p>
        </div>

        <!-- Rejected — allow reapply -->
        <div v-else-if="phase === 'rejected'" class="card center">
          <div class="status-circle rejected-circle">
            <i class="fa-solid fa-xmark"></i>
          </div>
          <h2>Application Not Approved</h2>
          <p v-if="existingApp?.reviewNote" class="status-desc">
            Reason: <em>{{ existingApp.reviewNote }}</em>
          </p>
          <p class="status-desc">You may submit a new application with updated information.</p>
          <button class="primary-btn" @click="phase = 'form'">Apply Again</button>
        </div>

        <!-- Application form -->
        <div v-else-if="phase === 'form'" class="card form-card">
          <h2 class="form-title">Seller Application</h2>

          <form @submit.prevent="submit" novalidate>
            <div class="field">
              <label for="shopName">Shop Name <span class="req">*</span></label>
              <input
                id="shopName"
                v-model.trim="form.shopName"
                type="text"
                placeholder="e.g. My Awesome Store"
                maxlength="100"
                :class="{ invalid: errors.shopName }"
              />
              <span v-if="errors.shopName" class="err-msg">{{ errors.shopName }}</span>
            </div>

            <div class="field">
              <label for="businessAddress">Business Address <span class="req">*</span></label>
              <textarea
                id="businessAddress"
                v-model.trim="form.businessAddress"
                placeholder="Street, City, Province, Country"
                rows="3"
                maxlength="255"
                :class="{ invalid: errors.businessAddress }"
              ></textarea>
              <span v-if="errors.businessAddress" class="err-msg">{{ errors.businessAddress }}</span>
            </div>

            <div class="field-row">
              <div class="field">
                <label for="nationalId">National ID <span class="req">*</span></label>
                <input
                  id="nationalId"
                  v-model.trim="form.nationalId"
                  type="text"
                  placeholder="ID number"
                  maxlength="50"
                  :class="{ invalid: errors.nationalId }"
                />
                <span v-if="errors.nationalId" class="err-msg">{{ errors.nationalId }}</span>
              </div>

              <div class="field">
                <label for="businessPhone">Business Phone <span class="req">*</span></label>
                <input
                  id="businessPhone"
                  v-model.trim="form.businessPhone"
                  type="tel"
                  placeholder="+855 12 345 678"
                  maxlength="20"
                  :class="{ invalid: errors.businessPhone }"
                />
                <span v-if="errors.businessPhone" class="err-msg">{{ errors.businessPhone }}</span>
              </div>
            </div>

            <p v-if="submitError" class="global-error">{{ submitError }}</p>

            <button type="submit" class="submit-btn" :disabled="submitting">
              <i v-if="submitting" class="fa-solid fa-spinner fa-spin"></i>
              <i v-else class="fa-solid fa-paper-plane"></i>
              {{ submitting ? 'Submitting…' : 'Submit Application' }}
            </button>
          </form>
        </div>

        <!-- Success splash (after submit) -->
        <div v-else-if="phase === 'success'" class="card center">
          <div class="status-circle approved-circle">
            <i class="fa-solid fa-check"></i>
          </div>
          <h2>Application Submitted!</h2>
          <p class="status-desc">An admin will review your application and notify you. Check back here for updates.</p>
          <RouterLink to="/" class="primary-btn">Back to Home</RouterLink>
        </div>

      </div>
    </main>

    <AppFooter :footer-columns="footerColumns" :social-links="socialLinks" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import { getFooterColumns, getNavLinks, getSocialLinks } from '@/services/homeService'
import type { FooterColumn, NavLink, SocialLink } from '@/types/home'
import { api, isLoggedIn } from '@/services/apiClient'

const router = useRouter()

const navLinks     = ref<NavLink[]>([])
const footerColumns = ref<FooterColumn[]>([])
const socialLinks  = ref<SocialLink[]>([])

type Phase = 'loading' | 'form' | 'pending' | 'approved' | 'rejected' | 'success'
const phase = ref<Phase>('loading')

interface ApplicationStatus {
  id: number
  shopName: string
  businessAddress: string
  nationalId: string
  businessPhone: string
  appliedAt: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  reviewedAt: string | null
  reviewNote: string | null
}

const existingApp = ref<ApplicationStatus | null>(null)

const form = reactive({
  shopName: '',
  businessAddress: '',
  nationalId: '',
  businessPhone: '',
})

const errors = reactive({
  shopName: '',
  businessAddress: '',
  nationalId: '',
  businessPhone: '',
})

const submitting  = ref(false)
const submitError = ref('')

function formatDate(iso: string | null | undefined) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

function validate(): boolean {
  errors.shopName        = ''
  errors.businessAddress = ''
  errors.nationalId      = ''
  errors.businessPhone   = ''

  let ok = true

  if (!form.shopName || form.shopName.length < 2) {
    errors.shopName = 'Shop name must be at least 2 characters.'
    ok = false
  }
  if (!form.businessAddress || form.businessAddress.length < 10) {
    errors.businessAddress = 'Business address must be at least 10 characters.'
    ok = false
  }
  if (!form.nationalId || form.nationalId.length < 6) {
    errors.nationalId = 'National ID must be at least 6 characters.'
    ok = false
  }
  if (!form.businessPhone || !/^[+]?[0-9\s\-() ]{7,20}$/.test(form.businessPhone)) {
    errors.businessPhone = 'Enter a valid phone number (7–20 digits).'
    ok = false
  }

  return ok
}

async function submit() {
  if (!validate()) return
  submitting.value  = true
  submitError.value = ''
  try {
    await api.post('/api/seller/apply', {
      shopName:        form.shopName,
      businessAddress: form.businessAddress,
      nationalId:      form.nationalId,
      businessPhone:   form.businessPhone,
    })
    phase.value = 'success'
  } catch (e: unknown) {
    submitError.value = e instanceof Error ? e.message : 'Failed to submit. Please try again.'
  } finally {
    submitting.value = false
  }
}

async function loadStatus() {
  if (!isLoggedIn()) {
    router.push('/login?redirect=/become-seller')
    return
  }
  try {
    const app = await api.get<ApplicationStatus>('/api/seller/application/status')
    existingApp.value = app
    if (app.status === 'APPROVED')  phase.value = 'approved'
    else if (app.status === 'PENDING')  phase.value = 'pending'
    else if (app.status === 'REJECTED') phase.value = 'rejected'
    else phase.value = 'form'
  } catch {
    // 404 = no application yet — show the form
    phase.value = 'form'
  }
}

onMounted(async () => {
  const [nav, footer, social] = await Promise.all([getNavLinks(), getFooterColumns(), getSocialLinks()])
  navLinks.value      = nav
  footerColumns.value = footer
  socialLinks.value   = social
  await loadStatus()
})
</script>

<style scoped>
.page { min-height: 100vh; background: #f7f9fb; font-family: Inter, Arial, sans-serif; color: #191c1e; }
.main { padding: 64px 0 96px; }
.container { width: min(680px, 100%); margin: 0 auto; padding: 0 20px; }

.page-head { text-align: center; margin-bottom: 32px; }
.page-head h1 { margin: 0 0 10px; font-size: 42px; font-weight: 400; letter-spacing: -0.03em; }
.subtitle { margin: 0; font-size: 15px; color: #667085; }

/* Card */
.card { background: #fff; border: 1px solid #eef2f6; border-radius: 20px; padding: 36px 32px; }
.center { display: flex; flex-direction: column; align-items: center; gap: 14px; text-align: center; padding: 56px 32px; }
.center h2 { margin: 0; font-size: 24px; font-weight: 700; }
.status-desc { margin: 0; font-size: 14px; color: #667085; max-width: 420px; line-height: 1.6; }

/* Status circles */
.status-circle { width: 72px; height: 72px; border-radius: 50%; display: grid; place-items: center; font-size: 28px; margin-bottom: 4px; }
.approved-circle { background: #dcfce7; color: #16a34a; }
.pending-circle  { background: #fef9c3; color: #ca8a04; }
.rejected-circle { background: #fee2e2; color: #d92d20; }

.spin-icon { font-size: 36px; color: #003366; }

/* Form */
.form-card { }
.form-title { margin: 0 0 24px; font-size: 22px; font-weight: 700; }

.field { display: flex; flex-direction: column; gap: 6px; margin-bottom: 18px; }
.field label { font-size: 13px; font-weight: 600; color: #344054; }
.req { color: #d92d20; }

.field input, .field textarea {
  border: 1.5px solid #d0d5dd;
  border-radius: 10px;
  padding: 10px 14px;
  font-size: 14px;
  font-family: inherit;
  color: #191c1e;
  background: #fff;
  outline: none;
  transition: border-color 0.15s;
  resize: vertical;
}
.field input:focus, .field textarea:focus { border-color: #513B3C; }
.field input.invalid, .field textarea.invalid { border-color: #d92d20; }

.err-msg { font-size: 12px; color: #d92d20; }

.field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

.global-error { font-size: 13px; color: #d92d20; background: #fee2e2; border-radius: 10px; padding: 10px 14px; margin-bottom: 4px; }

.submit-btn {
  width: 100%; height: 50px; border: 0; border-radius: 14px;
  background: #003366; color: #fff; font-size: 15px; font-weight: 700;
  cursor: pointer; font-family: inherit; display: flex; align-items: center;
  justify-content: center; gap: 8px; margin-top: 8px;
  transition: background 0.15s;
}
.submit-btn:hover:not(:disabled) { background: #004488; }
.submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }

.primary-btn {
  display: inline-flex; align-items: center; justify-content: center;
  height: 46px; padding: 0 28px; border-radius: 14px;
  background: #513B3C; color: #fff; font-weight: 700; font-size: 14px;
  text-decoration: none; cursor: pointer; border: 0; font-family: inherit;
  transition: background 0.15s; margin-top: 4px;
}
.primary-btn:hover { background: #6b4f50; }

@media (max-width: 560px) {
  .field-row { grid-template-columns: 1fr; }
  .card { padding: 28px 18px; }
}
</style>
