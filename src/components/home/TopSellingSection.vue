<template>
  <section class="top-selling">
    <div class="container">
      <h2 class="section-title">TOP SELLING</h2>

      <div class="product-grid">
        <article v-for="product in products" :key="product.id" class="product-card">
          <div class="card-image">
            <div class="img-skeleton"></div>
          </div>

          <div class="card-body">
            <h3 class="product-name">{{ product.name }}</h3>

            <div class="rating-row">
              <div class="stars">
                <i v-for="n in 5" :key="n" :class="getStarClass(product.rating, n)"></i>
              </div>
              <span class="rating-text">{{ product.rating }}/5</span>
            </div>

            <div class="price-row">
              <span class="price">${{ product.price }}</span>
              <template v-if="product.originalPrice">
                <span class="original-price">${{ product.originalPrice }}</span>
                <span class="discount-badge">-{{ product.discount }}%</span>
              </template>
            </div>
          </div>
        </article>
      </div>

      <div class="view-all-wrap">
        <button type="button" class="view-all-btn">View All</button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
interface Product {
  id: number
  name: string
  rating: number
  price: number
  originalPrice?: number
  discount?: number
}

const products: Product[] = [
  { id: 1, name: 'Vertical Striped Shirt', rating: 5.0, price: 212, originalPrice: 232, discount: 20 },
  { id: 2, name: 'Courage Graphic T-shirt', rating: 4.0, price: 145 },
  { id: 3, name: 'Loose Fit Bermuda Shorts', rating: 3.0, price: 80 },
  { id: 4, name: 'Faded Skinny Jeans', rating: 4.5, price: 210 },
]

function getStarClass(rating: number, position: number): string {
  if (rating >= position) return 'fa-solid fa-star'
  if (rating >= position - 0.5) return 'fa-solid fa-star-half-stroke'
  return 'fa-regular fa-star'
}
</script>

<style scoped>
.top-selling {
  background: #f5f5f5;
  padding: 72px 0 80px;
}

.container {
  width: min(1280px, 100%);
  margin: 0 auto;
  padding: 0 32px;
}

.section-title {
  text-align: center;
  font-size: 36px;
  font-weight: 800;
  letter-spacing: -0.01em;
  color: #111;
  margin: 0 0 48px;
}

/* ── Grid ── */
.product-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

/* ── Card ── */
.product-card {
  background: #fff;
  border-radius: 14px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.09);
}

.card-image {
  background: #f3f3f3;
  border-radius: 12px;
  overflow: hidden;
  aspect-ratio: 3 / 4;
  margin: 12px 12px 0;
}

@keyframes shimmer {
  0%   { background-position: -600px 0; }
  100% { background-position:  600px 0; }
}

.img-skeleton {
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, #ececec 25%, #e0e0e0 50%, #ececec 75%);
  background-size: 1200px 100%;
  animation: shimmer 1.6s infinite linear;
}

.card-body {
  padding: 14px 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.product-name {
  margin: 0;
  font-size: 15px;
  font-weight: 500;
  color: #111;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.rating-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.stars {
  display: flex;
  gap: 2px;
}

.stars i {
  font-size: 13px;
  color: #f5a623;
}

.rating-text {
  font-size: 12px;
  color: #888;
}

.price-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.price {
  font-size: 20px;
  font-weight: 700;
  color: #111;
}

.original-price {
  font-size: 15px;
  color: #aaa;
  text-decoration: line-through;
}

.discount-badge {
  font-size: 11px;
  font-weight: 600;
  color: #e85c6e;
  background: rgba(232, 92, 110, 0.1);
  border-radius: 4px;
  padding: 2px 7px;
}

.view-all-wrap {
  display: flex;
  justify-content: center;
  margin-top: 48px;
}

.view-all-btn {
  padding: 13px 40px;
  font-size: 14px;
  font-weight: 500;
  color: #111;
  background: transparent;
  border: 1px solid #c8c8c8;
  border-radius: 8px;
  cursor: pointer;
  font-family: inherit;
  transition: border-color 0.18s, color 0.18s;
}

.view-all-btn:hover {
  border-color: var(--clr-plum);
  color: var(--clr-plum);
}

@media (max-width: 1024px) {
  .product-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 560px) {
  .product-grid {
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }

  .section-title {
    font-size: 26px;
  }
}
</style>
