import { userStore } from '../state/userStore.js';
import { productStore } from '../state/productStore.js';
import { cartStore } from '../state/cartStore.js';
import { findOrCreateActiveShift } from '../api/shiftApi.js';
import { createSaleTransaction } from '../api/salesApi.js';
import { getProductsWithStock } from '../api/productApi.js';
import { router, navigate } from '../router/index.js';
import { Modal } from '../components/common/Modal.js';

// --- Helper Functions: Rendering ---

function renderProductCard(product) {
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock < 5;
  const imageUrl = product.imageUrl || 'https://placehold.co/600x400/e2e8f0/64748b?text=No+Image';
  const disabledClass = isOutOfStock ? 'product-card--out-of-stock' : '';
  const disabledAttribute = isOutOfStock ? 'disabled' : '';
  const lowStockIndicator = isLowStock ? `<div class="product-card__low-stock">สต็อกใกล้หมด</div>` : '';
  const priceDisplay = product.price ? `${product.price} บาท` : (product.prices || []).join('/') + ' บาท';

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
      <button class="checkout-button" id="checkout-btn" ${cart.length === 0 ? 'disabled' : ''}>ชำระเงิน</button>
    </div>
  `;
}

// --- Helper Functions: Checkout Flow & Event Handlers ---

function showSuccessAnimation(onComplete) {
  const animationHtml = `<div class="success-animation"><div class="progress-bar" id="success-progress-bar"></div><span id="success-progress-text">0%</span></div>`;
  Modal.open(animationHtml, () => {
    const bar = document.getElementById('success-progress-bar');
    const text = document.getElementById('success-progress-text');
    let width = 0;
    const interval = setInterval(() => {
      if (width >= 100) {
        clearInterval(interval);
        setTimeout(() => { Modal.close(); onComplete(); }, 500);
      } else {
        width++;
        bar.style.width = `${width}%`;
        text.textContent = `${width}%`;
      }
    }, 15);
  });
}

async function handleCheckout(paymentType, cashReceived = 0) {
  Modal.close();
  const currentUser = userStore.getCurrentUser();
  const cart = cartStore.getCart();
  const total = cartStore.getCartTotal();

  if (paymentType === 'เงินสด' && cashReceived < total) {
    alert('จำนวนเงินที่รับมาไม่เพียงพอ');
    return;
  }
  
  const shift = await findOrCreateActiveShift({ employeeId: currentUser.id });
  if (!shift) {
    alert('ไม่สามารถหากะการทำงานได้ โปรดลองอีกครั้ง');
    return;
  }

  const saleData = {
    shiftId: shift.id,
    employeeId: currentUser.id,
    paymentType: paymentType,
    cartItems: cart.map(item => ({
      productId: item.productId,
      quantity: item.quantity,
      price: item.price
    }))
  };

  const { success, error } = await createSaleTransaction(saleData);

  if (success) {
    showSuccessAnimation(async () => {
      cartStore.clearCart();
      // Re-fetch products to show updated stock
      const updatedProducts = await getProductsWithStock(currentUser.shopId);
      productStore.setProducts(updatedProducts);
    });
  } else {
    alert(`เกิดข้อผิดพลาดในการบันทึกการขาย: ${error.message}`);
  }
}

function openPaymentModal() {
  const total = cartStore.getCartTotal();
  const contentHtml = `
    <div class="payment-modal">
      <h3 class="payment-modal__title">ยืนยันการชำระเงิน</h3>
      <p class="payment-modal__total">ยอดรวม: <span>${total.toFixed(2)} บาท</span></p>
      <div class="payment-method" id="payment-method-selector">
        <button class="payment-btn" data-method="โอนชำระ">โอนชำระ</button>
        <button class="payment-btn active" data-method="เงินสด">เงินสด</button>
      </div>
      <div class="cash-section" id="cash-section">
        <label for="cash-received">รับเงินมา (บาท):</label>
        <input type="number" id="cash-received" class="cash-input" placeholder="0.00">
        <p class="change-display">เงินทอน: <span id="change-amount">0.00</span> บาท</p>
      </div>
      <div class="payment-modal__actions">
        <button class="confirm-btn" id="confirm-payment-btn">ยืนยันการขาย</button>
      </div>
    </div>`;

  const afterOpen = () => {
    let selectedPayment = 'เงินสด';
    const cashSection = document.getElementById('cash-section');
    const cashInput = document.getElementById('cash-received');
    const changeAmount = document.getElementById('change-amount');
    
    document.getElementById('payment-method-selector')?.addEventListener('click', e => {
      const btn = e.target.closest('.payment-btn');
      if (!btn) return;
      document.querySelectorAll('.payment-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedPayment = btn.dataset.method;
      cashSection.style.display = selectedPayment === 'เงินสด' ? 'block' : 'none';
    });

    cashInput?.addEventListener('input', () => {
      const received = parseFloat(cashInput.value) || 0;
      const change = received - total;
      changeAmount.textContent = change > 0 ? change.toFixed(2) : '0.00';
    });

    document.getElementById('confirm-payment-btn')?.addEventListener('click', () => {
      const cashReceived = parseFloat(cashInput.value) || 0;
      handleCheckout(selectedPayment, cashReceived);
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
    // ใช้ Event Delegation กับ container หลักเพื่อจัดการคลิกทั้งหมดในหน้า
    const pageContainer = document.getElementById('app');
    const handlePageClick = (event) => {
        handleProductClick(event);
        handleCartClick(event);
        if (event.target.id === 'checkout-btn') {
            openPaymentModal();
        }
    };
    pageContainer.addEventListener('click', handlePageClick);

    // ติดตาม cart store เพื่อ re-render เฉพาะส่วนที่จำเป็น
    const unsubscribeCart = cartStore.subscribe(renderCart);
    const unsubscribeProducts = productStore.subscribe(renderProductGrid);

    // โหลดข้อมูลสินค้าครั้งแรก
    if (productStore.getProducts().length === 0) {
      const shopId = currentUser.shopId;
      const products = await getProductsWithStock(shopId);
      productStore.setProducts(products);
    } else {
      renderProductGrid();
    }
    renderCart();

    // จัดการการออกจากระบบ
    document.getElementById('logout-button')?.addEventListener('click', () => {
      userStore.signOut();
      unsubscribeCart();
      unsubscribeProducts();
      pageContainer.removeEventListener('click', handlePageClick);
      router.init();
    });
  };

  return { view, postRender };
}
