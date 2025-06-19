import { userStore } from '../state/userStore.js';
import { productStore } from '../state/productStore.js';
import { getProductsWithStock } from '../api/productApi.js';
import { router } from '../router/index.js';
import { navigate } from '../router/index.js';

// --- Helper Functions for Rendering ---

function renderProductCard(product) {
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock < 5;

  // เพิ่ม class modifier ตามสถานะของสต็อก
  const stockStatusClass = isOutOfStock ? 'product-card--out-of-stock' : '';
  const lowStockIndicator = isLowStock ? `<div class="product-card__low-stock">สต็อกใกล้หมด</div>` : '';

  return `
    <div class="product-card ${stockStatusClass}" data-product-id="${product.id}">
      <img src="${product.image_url}" alt="${product.name}" class="product-card__image">
      <div class="product-card__info">
        <h3 class="product-card__name">${product.name}</h3>
        <p class="product-card__price">${product.price} บาท</p>
      </div>
      <div class="product-card__stock">
        คงเหลือ: ${product.stock}
      </div>
      ${lowStockIndicator}
    </div>
  `;
}

function renderProductGrid() {
  const productsByCategory = productStore.getProductsByCategory();
  const categories = Object.keys(productsByCategory);
  
  const productGridElement = document.getElementById('product-grid');
  if (!productGridElement) return;

  let html = '';
  for (const category of categories) {
    html += `<h2 class="category-title">${category}</h2>`;
    html += `<div class="product-list">`;
    html += productsByCategory[category].map(renderProductCard).join('');
    html += `</div>`;
  }
  productGridElement.innerHTML = html;
}

// --- Main Page Component ---

export function PosPage() {
  const currentUser = userStore.getCurrentUser();

  if (!currentUser) {
    // โค้ดป้องกันยังคงเหมือนเดิม
    // ...
  }

  const view = `
    <div class="pos-page-container">
      <aside class="sidebar">
        <h2>ตะกร้าสินค้า</h2>
        <div id="cart-items"></div>
        <div id="cart-summary"></div>
      </aside>
      <main class="main-content">
        <header class="main-header">
          <h1>สินค้า</h1>
          <div class="user-info">
            <span>พนักงาน: <strong>${currentUser.name}</strong> (${currentUser.role})</span>
            <button id="logout-button" class="logout-button">ออกจากระบบ</button>
          </div>
        </header>
        <section id="product-grid" class="product-grid-container"></section>
      </main>
    </div>
  `;

  const postRender = async () => {
    // ดึงข้อมูลสินค้าแค่ครั้งเดียวเมื่อเปิดหน้านี้
    const shopId = currentUser.shop_id;
    const products = await getProductsWithStock(shopId);
    productStore.setProducts(products); // นำสินค้าไปเก็บใน store

    // เริ่ม render สินค้าลงบนหน้าจอ
    renderProductGrid();
    
    // --- Setup Event Listeners ---
    document.getElementById('logout-button')?.addEventListener('click', () => {
      userStore.signOut();
      router.init();
    });

    // เราจะเพิ่ม event listener สำหรับการคลิกสินค้าในขั้นตอนต่อไป
  };

  return { view, postRender };
}
