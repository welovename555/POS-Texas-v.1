import { userStore } from '../state/userStore.js';
import { productStore } from '../state/productStore.js';
import { cartStore } from '../state/cartStore.js';
import { getProductsWithStock } from '../api/productApi.js';
import { router, navigate } from '../router/index.js'; // import navigate เพิ่ม

// --- Helper Functions for Rendering ---

function renderProductCard(product) { /* ... โค้ดส่วนนี้เหมือนเดิมจากแชทที่ 67 ไม่ต้องแก้ไข ... */ }

function renderProductGrid() { /* ... โค้ดส่วนนี้เหมือนเดิมจากแชทที่ 67 ไม่ต้องแก้ไข ... */ }

// --- ฟังก์ชันใหม่สำหรับ Render ตะกร้าสินค้า ---
function renderCart() {
  const cartItemsElement = document.getElementById('cart-items');
  const cartSummaryElement = document.getElementById('cart-summary');
  if (!cartItemsElement || !cartSummaryElement) return;

  const cart = cartStore.getCart();
  const total = cartStore.getCartTotal();
  const itemCount = cartStore.getCartItemCount();

  if (itemCount === 0) {
    cartItemsElement.innerHTML = '<p class="cart-empty-message">ตะกร้าสินค้าว่าง</p>';
    cartSummaryElement.innerHTML = '';
    return;
  }

  cartItemsElement.innerHTML = cart.map(item => `
    <div class="cart-item" data-cart-item-id="${item.id}">
      <div class="cart-item__info">
        <span class="cart-item__name">${item.name}</span>
        <span class="cart-item__price">${item.price} บาท</span>
      </div>
      <div class="cart-item__controls">
        <button class="quantity-btn" data-action="decrease">-</button>
        <span class="cart-item__quantity">${item.quantity}</span>
        <button class="quantity-btn" data-action="increase">+</button>
        <button class="remove-btn" data-action="remove">🗑️</button>
      </div>
    </div>
  `).join('');

  cartSummaryElement.innerHTML = `
    <div class="cart-summary">
      <div class="summary-line">
        <span>จำนวนทั้งหมด:</span>
        <span>${itemCount} ชิ้น</span>
      </div>
      <div class="summary-line summary-line--total">
        <span>ยอดรวม:</span>
        <span>${total.toFixed(2)} บาท</span>
      </div>
      <button class="checkout-button" id="checkout-btn">ชำระเงิน</button>
    </div>
  `;
}

// --- ฟังก์ชันใหม่สำหรับจัดการการคลิกต่างๆ ---
function handleProductClick(event) {
  const productCard = event.target.closest('.product-card');
  if (!productCard || productCard.disabled) return;

  const productId = productCard.dataset.productId;
  const product = productStore.getProductById(productId);

  if (product) {
    // สำหรับตอนนี้ เราจะจัดการเฉพาะสินค้าที่มีราคาเดียว
    if (product.price) {
      cartStore.addItem(product, product.price);
    } else {
      // ในอนาคต เราจะเปิด Modal ที่นี่สำหรับสินค้าหลายราคา
      console.log('Multi-price product clicked. Modal needed.');
    }
  }
}

function handleCartClick(event) {
  const actionButton = event.target.closest('[data-action]');
  if (!actionButton) return;

  const cartItemElement = event.target.closest('.cart-item');
  const cartItemId = cartItemElement.dataset.cartItemId;
  const action = actionButton.dataset.action;

  const item = cartStore.getCart().find(i => i.id === cartItemId);
  if (!item) return;

  if (action === 'increase') {
    cartStore.updateItemQuantity(cartItemId, item.quantity + 1);
  } else if (action === 'decrease') {
    cartStore.updateItemQuantity(cartItemId, item.quantity - 1);
  } else if (action === 'remove') {
    cartStore.removeItem(cartItemId);
  }
}


// --- Main Page Component (ฉบับอัปเดต) ---
export function PosPage() {
  const currentUser = userStore.getCurrentUser();
  if (!currentUser) { /* ... โค้ดป้องกันเหมือนเดิม ... */ }

  const view = `...`; // <-- view HTML หลักเหมือนเดิมทุกประการจากแชทที่ 59 ไม่ต้องแก้ไข
  
  const postRender = async () => {
    // --- ส่วนนี้คือหัวใจของการทำงานทั้งหมด ---

    // 1. ดึงข้อมูลสินค้า (เหมือนเดิม)
    const shopId = currentUser.shop_id;
    const products = await getProductsWithStock(shopId);
    productStore.setProducts(products);

    // 2. Render ส่วนต่างๆ ของหน้าจอ
    renderProductGrid();
    renderCart(); // Render ตะกร้าครั้งแรก
    
    // 3. "ติดตาม" การเปลี่ยนแปลงของ State
    const unsubscribeCart = cartStore.subscribe(renderCart); // ทุกครั้งที่ cartStore เปลี่ยน ให้ renderCart ใหม่
    // const unsubscribeProducts = productStore.subscribe(renderProductGrid); // ถ้าต้องการให้ real-time

    // 4. "ดักฟัง" การกระทำของผู้ใช้
    document.getElementById('product-grid')?.addEventListener('click', handleProductClick);
    document.getElementById('cart-items')?.addEventListener('click', handleCartClick);
    document.getElementById('logout-button')?.addEventListener('click', () => {
      userStore.signOut();
      router.init();
      // ยกเลิกการติดตามเพื่อป้องกัน memory leak เมื่อออกจากหน้านี้
      unsubscribeCart();
      // unsubscribeProducts();
    });
  };

  return { view, postRender };
}
