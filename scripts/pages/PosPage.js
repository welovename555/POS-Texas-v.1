import { userStore } from '../state/userStore.js';
import { productStore } from '../state/productStore.js';
import { getProductsWithStock } from '../api/productApi.js';
import { router } from '../router/index.js';
import { navigate } from '../router/index.js';

// --- Helper Functions for Rendering ---

function renderProductCard(product) {
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock < 5;

  // 1. ตรวจสอบ image_url ถ้าไม่มี ให้ใช้รูปภาพสำรอง
  const imageUrl = product.image_url || 'https://placehold.co/600x400/e2e8f0/64748b?text=No+Image';

  // 2. เพิ่มเงื่อนไขปิดการใช้งานปุ่มถ้าสต็อกหมด
  const disabledClass = isOutOfStock ? 'product-card--out-of-stock' : ''; // ใช้สำหรับ CSS styling เท่านั้น
  const disabledAttribute = isOutOfStock ? 'disabled' : '';

  const lowStockIndicator = isLowStock ? `<div class="product-card__low-stock">สต็อกใกล้หมด</div>` : '';

  return `
    <button 
      class="product-card ${disabledClass}" 
      data-product-id="${product.id}"
      ${disabledAttribute}
    >
      <img src="${imageUrl}" alt="${product.name}" class="product-card__image">
      <div class="product-card__info">
        <h3 class="product-card__name">${product.name}</h3>
        <p class="product-card__price">${product.price} บาท</p>
      </div>
      <div class="product-card__stock">
        คงเหลือ: ${product.stock}
      </div>
      ${lowStockIndicator}
    </button>
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
    const view = `<div class="pos-page-container">
                    <p>เกิดข้อผิดพลาด: ไม่พบข้อมูลผู้ใช้</p>
                    <button id="back-to-login-btn">กลับไปหน้าล็อกอิน</button>
                  </div>`;
    const postRender = () => {
      document.getElementById('back-to-login-btn')?.addEventListener('click', () => navigate('/login'));
    };
    return { view, postRender };
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
    const shopId = currentUser.shop_id;
    const products = await getProductsWithStock(shopId);
    productStore.setProducts(products);

    renderProductGrid();
    
    document.getElementById('logout-button')?.addEventListener('click', () => {
      userStore.signOut();
      router.init();
    });
  };

  return { view, postRender };
}
