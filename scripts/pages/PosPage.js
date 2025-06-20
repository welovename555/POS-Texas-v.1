import { userStore } from '../state/userStore.js';
import { productStore } from '../state/productStore.js';
import { cartStore } from '../state/cartStore.js';
import { getProductsWithStock } from '../api/productApi.js';
import { Modal } from '../components/common/Modal.js';
import { findOrCreateActiveShift } from '../api/shiftApi.js';
import { createSaleTransaction } from '../api/salesApi.js';
import { navigate } from '../router/index.js';

let activeCategory = null;
let cleanupFunc = null; // ตัวแปรสำหรับเก็บ cleanup function โดยเฉพาะ

// --- Helper: Render Functions ---

function renderProductCard(product) {
    const isOutOfStock = product.stock <= 0;
    const imageUrl = product.imageUrl || 'https://placehold.co/300x300/e2e8f0/64748b?text=No+Image';
    const disabledAttribute = isOutOfStock ? 'disabled' : '';
    const priceDisplay = product.price ? `${product.price} บาท` : (product.prices || []).join('/') + ' บาท';
    const lowStockIndicator = (product.stock > 0 && product.stock < 5) ? `<div class="product-card__low-stock">สต็อกใกล้หมด</div>` : '';

    return `
        <button class="pos-product-card" data-product-id="${product.id}" ${disabledAttribute}>
            <div class="pos-product-card__image-wrapper">
                <img src="${imageUrl}" alt="${product.name}" class="pos-product-card__image">
            </div>
            <div class="pos-product-card__info">
                <h3 class="pos-product-card__name">${product.name}</h3>
                <p class="pos-product-card__price">${priceDisplay}</p>
                <p class="pos-product-card__stock">เหลือ ${product.stock}</p>
            </div>
            ${lowStockIndicator}
        </button>
    `;
}

function renderFilteredProducts() {
    const productsByCategory = productStore.getProductsByCategory();
    const productContainer = document.getElementById('product-list-area');
    if (!productContainer) return;

    if (!activeCategory || !productsByCategory[activeCategory]) {
        activeCategory = Object.keys(productsByCategory)[0] || null;
    }

    document.querySelectorAll('.category-pill').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.category === activeCategory);
    });

    const productsToShow = productsByCategory[activeCategory] || [];
    productContainer.innerHTML = productsToShow.map(renderProductCard).join('');
}

function renderSummaryBar() {
    const summaryBar = document.getElementById('summary-bar');
    if (!summaryBar) return;

    const total = cartStore.getCartTotal();
    const itemCount = cartStore.getCartItemCount();

    if (itemCount === 0) {
        summaryBar.classList.remove('visible');
        return;
    }
    summaryBar.classList.add('visible');
    summaryBar.innerHTML = `
        <div class="summary-text" id="summary-bar-text">
            <span>${itemCount} รายการ</span>
            <strong>รวม ${total.toFixed(2)} บาท</strong>
        </div>
        <button class="checkout-button-main" id="checkout-btn">ชำระเงิน</button>
    `;
}

// --- Helper: Event Handlers & Checkout Flow ---

function openPriceSelectionModal(product) {
    const prices = product.prices || [];
    const contentHtml = `
        <div class="price-modal">
            <h3 class="price-modal__title">เลือกราคาสำหรับ "${product.name}"</h3>
            <div class="price-modal__buttons" id="price-options">
                ${prices.map(price => `<button class="price-btn" data-price="${price}">${price} บาท</button>`).join('')}
            </div>
        </div>`;
    
    const afterOpen = () => {
        document.getElementById('price-options')?.addEventListener('click', e => {
            const priceButton = e.target.closest('.price-btn');
            if (priceButton) {
                const selectedPrice = parseFloat(priceButton.dataset.price);
                cartStore.addItem(product, selectedPrice);
                Modal.close();
            }
        });
    };
    Modal.open(contentHtml, afterOpen);
}

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

    if (paymentType === 'cash' && cashReceived < total) {
        alert('จำนวนเงินที่รับมาไม่เพียงพอ');
        return;
    }

    const shift = await findOrCreateActiveShift({ employeeId: currentUser.id });
    if (!shift) {
        alert('ไม่สามารถหากะการทำงานได้');
        return;
    }

    const saleData = {
        shiftId: shift.id,
        employeeId: currentUser.id,
        paymentType: paymentType,
        shopId: currentUser.shopId,
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
    const cart = cartStore.getCart();
    const contentHtml = `
        <div class="payment-modal-final">
            <div class="payment-modal-header">สรุปรายการ</div>
            <div class="payment-modal-items">
                ${cart.map(item => `<div class="payment-modal-item"><span>${item.name} (x${item.quantity})</span><span>${(item.price * item.quantity).toFixed(2)}</span></div>`).join('')}
            </div>
            <div class="payment-modal-total">
                <span>ยอดรวม</span><strong>${total.toFixed(2)} บาท</strong>
            </div>
            <div class="payment-method" id="payment-method-selector">
                <button class="payment-btn" data-method="transfer">โอนชำระ</button>
                <button class="payment-btn active" data-method="cash">เงินสด</button>
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
        let selectedPayment = 'cash';
        const cashSection = document.getElementById('cash-section');
        const cashInput = document.getElementById('cash-received');
        const changeAmount = document.getElementById('change-amount');
        
        document.getElementById('payment-method-selector')?.addEventListener('click', e => {
            const btn = e.target.closest('.payment-btn');
            if (!btn) return;
            document.querySelectorAll('.payment-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedPayment = btn.dataset.method;
            cashSection.style.display = selectedPayment === 'cash' ? 'block' : 'none';
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
    const productCard = event.target.closest('.pos-product-card');
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

// --- Main Page Component ---

export function PosPage() {
    // โหลดข้อมูลครั้งแรก ถ้ายังไม่มี
    if (productStore.getProducts().length === 0) {
        setTimeout(async () => {
            const currentUser = userStore.getCurrentUser();
            if (currentUser) {
                const products = await getProductsWithStock(currentUser.shopId);
                productStore.setProducts(products);
                navigate('/pos'); // สั่งให้ re-render หน้านี้ใหม่เมื่อข้อมูลพร้อม
            }
        }, 0);
        return { view: `<div class="loading-spinner"></div>` };
    }

    const productsByCategory = productStore.getProductsByCategory();
    const categories = Object.keys(productsByCategory);
    if (!activeCategory || !productsByCategory[activeCategory]) {
        activeCategory = categories[0] || null;
    }
    const categoryPillsHtml = categories.map(cat => `
        <button class="category-pill ${cat === activeCategory ? 'active' : ''}" data-category="${cat}">${cat}</button>
    `).join('');

    const view = `
        <div class="page-content-wrapper">
            <header class="pos-page-header">
                <h1 class="pos-logo">TEXAS</h1>
                <button id="search-btn" class="header-icon-btn" title="ค้นหา"><i class="bi bi-search"></i></button>
            </header>
            <nav class="category-selector" id="category-selector">${categoryPillsHtml}</nav>
            <main class="product-container-wrapper" id="product-list-area">
                </main>
            <footer class="summary-bar" id="summary-bar"></footer>
        </div>
    `;

    const postRender = () => {
        if (cleanupFunc) {
            cleanupFunc(); // เรียก cleanup ของ listener เก่าก่อน
        }
        
        const pageContainer = document.getElementById('main-content');

        const handlePageClick = (event) => {
            handleProductClick(event);
            // ... (จะเพิ่ม handleCartClick ที่นี่ในอนาคต) ...
            const categoryPill = event.target.closest('.category-pill');
            if (categoryPill) {
                activeCategory = categoryPill.dataset.category;
                renderFilteredProducts();
                return;
            }
            if (event.target.closest('#checkout-btn')) {
                openPaymentModal();
            }
        };
        pageContainer.addEventListener('click', handlePageClick);

        const unsubscribeCart = cartStore.subscribe(renderSummaryBar);
        
        renderFilteredProducts();
        renderSummaryBar();
        
        cleanupFunc = () => {
            pageContainer.removeEventListener('click', handlePageClick);
            unsubscribeCart();
        };
    };

    return { view, postRender };
}
