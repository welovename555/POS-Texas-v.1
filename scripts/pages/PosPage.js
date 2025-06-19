import { userStore } from '../state/userStore.js';
import { productStore } from '../state/productStore.js';
import { cartStore } from '../state/cartStore.js';
import { getProductsWithStock } from '../api/productApi.js';
import { router, navigate } from '../router/index.js';
import { Modal } from '../components/common/Modal.js';

// --- Helper: Render Functions ---

function renderProductCard(product) {
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock < 5;
  const imageUrl = product.image_url || 'https://placehold.co/600x400/e2e8f0/64748b?text=No+Image';
  const disabledClass = isOutOfStock ? 'product-card--out-of-stock' : '';
  const disabledAttribute = isOutOfStock ? 'disabled' : '';
  const lowStockIndicator = isLowStock ? `<div class="product-card__low-stock">สต็อกใกล้หมด</div>` : '';
  const priceDisplay = product.price ? `${product.price} บาท` : product.prices.join('/') + ' บาท';

  return `
    <button class="product-card ${disabledClass}" data-product-id="${product.id}" ${disabledAttribute}>
      <img src="${imageUrl}" alt="${product.name}" class="product-card__image">
      <div class="product-card__info">
        <h3 class="product-card__name">${product.name}</h3>
        <p class="product-card__price">${priceDisplay}</p>
      </div>
      <div class="product-card__stock">คงเหลือ: ${product.stock}</div>
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
    html += `<div class="product-list">${productsByCategory[category].map(renderProductCard).join('')}</div>`;
  }
  productGridElement.innerHTML = html;
}

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

// --- Helper: Event Handlers ---

function openPriceSelectionModal(product) {
  const contentHtml = `
    <div class="price-modal">
      <h3 class="price-modal__title">เลือกราคาสำหรับ "${product.name}"</h3>
      <div class="price-modal__buttons" id="price-options">
        ${product.prices.map(price => 
          `<button class="price-btn" data-price="${price}">${price} บาท</button>`
        ).join('')}
      </div>
    </div>
  `;

  const afterOpen = () => {
    const priceOptions = document.getElementById('price-options');
    priceOptions?.addEventListener('click', (event) => {
      const priceButton = event.target.closest('.price-btn');
      if (priceButton) {
        const selectedPrice = parseFloat(priceButton.dataset.price);
        cartStore.addItem(product, selectedPrice);
        Modal.close();
      }
    });
  };

  Modal.open(contentHtml, afterOpen);
}

function handleProductClick(event) {
  const productCard = event.target.closest('.product-card');
  if (!productCard || productCard.disabled) return;
  const productId = productCard.dataset.productId;
  const product = productStore.getProductById(productId);

  if (product) {
    const hasMultiplePrices = product.prices && product.prices.length > 0;
    if (hasMultiplePrices) {
      openPriceSelectionModal(product);
    } else if (product.price) {
      cartStore.addItem(product, product.price);
    } else {
      console.warn(`Product ${product.id} has no price defined.`);
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

  if (action === 'increase') cartStore.updateItemQuantity(cartItemId, item.quantity + 1);
  if (action === 'decrease') cartStore.updateItemQuantity(cartItemId, item.quantity - 1);
  if (action === 'remove') cartStore.removeItem(cartItemId);
}


// --- Main Page Component ---
export function PosPage() {
  const currentUser = userStore.getCurrentUser();
  if (!currentUser) {
    const view = `<div class="pos-page-container"><p>เกิดข้อผิดพลาด: ไม่พบข้อมูลผู้ใช้ <button id="back-to-login-btn">กลับไปหน้าล็อกอิน</button></p></div>`;
    const postRender = () => {
      document.getElementById('back-to-login-btn')?.addEventListener('click', () => navigate('/login'));
    };
    return { view, postRender };
  }

  const view = `
    <div class="pos-page-container">
      <aside class="sidebar">
        <h2 class="sidebar-title">ตะกร้าสินค้า</h2>
        <div id="cart-items" class="cart-items-container"></div>
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
    if (productStore.getProducts().length === 0) {
      const products = await getProductsWithStock(shopId);
      productStore.setProducts(products);
    }
    
    renderProductGrid();
    renderCart();
    
    const unsubscribeCart = cartStore.subscribe(renderCart);
    
    const productGrid = document.getElementById('product-grid');
    const cartItems = document.getElementById('cart-items');
    const logoutButton = document.getElementById('logout-button');
    
    productGrid?.addEventListener('click', handleProductClick);
    cartItems?.addEventListener('click', handleCartClick);
    logoutButton?.addEventListener('click', () => {
      userStore.signOut();
      router.init();
      unsubscribeCart();
    });
  };

  return { view, postRender };
}
