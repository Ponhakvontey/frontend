import type { Directive } from 'vue'

// Usage: v-scroll-reveal            → fade up (default)
//        v-scroll-reveal="'left'"   → fade from left
//        v-scroll-reveal="'right'"  → fade from right
//        v-scroll-reveal="'fade'"   → plain fade
//        v-scroll-reveal="'zoom'"   → scale up

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('sr-visible')
        observer.unobserve(entry.target)
      }
    })
  },
  { threshold: 0.12 }
)

export const scrollReveal: Directive = {
  mounted(el: HTMLElement, binding) {
    const type = binding.value ?? 'up'
    el.classList.add('sr-base', `sr-${type}`)
    observer.observe(el)
  },
  unmounted(el: HTMLElement) {
    observer.unobserve(el)
  },
}
