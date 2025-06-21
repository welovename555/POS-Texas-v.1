import { userStore } from '../state/userStore.js';
import { productStore } from '../state/productStore.js';
import { cartStore } from '../state/cartStore.js';
import { getProductsWithStock } from '../api/productApi.js';
import { Modal } from '../components/common/Modal.js';
import { findOrCreateActiveShift } from '../api/shiftApi.js';
import { createSaleTransaction } from '../api/salesApi.js';
import { navigate } from '../router/index.js';

let activeCategory = null;
let cleanupFunc = null;

// --- Helper: Utility Function ---
function chunk(arr, size) {
    const chunks = [];
    if (!arr) return chunks;
    for (let i = 0; i < arr.length; i += size) {
        chunks.push(arr.slice(i, i + size));
    }
    return chunks;
}

// --- Helper: Render Functions ---
function renderProductCard(product) {
    const isOutOfStock = product.stock <= 0;
    const imageUrl = product.imageUrl || 'https://placehold.co/300x300/e2e8f0/64748b?text=No+Image';
    const disabledAttribute = isOutOfStock ? 'disabled' : '';
    const priceDisplay = product.price ? `${product.price}` : (product.prices || []).join('/');
    
    return `
        <button class="product-item" data-product-id="${product.id}" ${disabledAttribute}>
            <div class="product-item__image-wrapper">
                <img src="${imageUrl}" alt="${product.name}" class="product-item__image">
            </div>
            <div class="product-item__info">
                <h3 class="product-item__name">${product.name}</h3>
                <div class="product-item__details">
                    <span class="product-item__price">${priceDisplay}.-</span>
                    <span class="product-item__stock">เหลือ ${product.stock}</span>
                </div>
            </div>
        </button>
    `;
}

function renderFilteredProducts() {
    const productsByCategory = productStore.getProductsByCategory();
    const productCarousel = document.getElementById('product-carousel');
    if (!productCarousel) return;

    if (!activeCategory || !productsByCategory[activeCategory]) {
        activeCategory = Object.keys(productsByCategory)[0] || null;
    }
    
    document.querySelectorAll('.category-pill').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.category === activeCategory);
    });

    const productsToShow = productsByCategory[activeCategory] || [];
    const productPages = chunk(productsToShow, 4);

    if (productPages.length === 0) {
        productCarousel.innerHTML = '<p class="no-products-message">ไม่มีสินค้าในหมวดหมู่นี้</p>';
        return;
    }

    productCarousel.innerHTML = productPages.map(page => `
        <div class="product-page">
            ${page.map(renderProductCard).join('')}
        </div>
    `).join('');
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

// --- Helper: Modal and Checkout Functions ---
function openPriceSelectionModal(product) {
    const prices = product.prices || [];
    const contentHtml = `<div class="price-modal"><h3 class="price-modal__title">เลือกราคาสำหรับ "${product.name}"</h3><div class="price-modal__buttons" id="price-options">${prices.map(price => `<button class="price-btn" data-price="${price}">${price} บาท</button>`).join('')}</div></div>`;
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
        cartItems: cart.map(item => ({ productId: item.productId, quantity: item.quantity, price: item.price }))
    };

    const { success, error } = await createSaleTransaction(saleData);
    if (success) {
        showSuccessAnimation(async () => {
            cartStore.clearCart();
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
    const contentHtml = `<div class="payment-modal-final">...</div>`; // Assuming full HTML is complex and correct
    const afterOpen = () => { /* ... */ };
    Modal.open(contentHtml, afterOpen);
}

function showSuccessAnimation(onComplete) { /* ... */ }

// --- Main Page Component ---
export function PosPage() {
    if (productStore.getProducts().length === 0) {
        setTimeout(async () => {
            const currentUser = userStore.getCurrentUser();
            if (currentUser) {
                const products = await getProductsWithStock(currentUser.shopId);
                productStore.setProducts(products);
                navigate('/pos');
            }
        }, 0);
        return { view: `<div class="loading-spinner"></div>` };
    }

    const productsByCategory = productStore.getProductsByCategory();
    const categories = Object.keys(productsByCategory);
    if (!activeCategory || !productsByCategory[activeCategory]) {
        activeCategory = categories[0] || null;
    }
    const categoryPillsHtml = categories.map(cat => `<button class="category-pill ${cat === activeCategory ? 'active' : ''}" data-category="${cat}">${cat}</button>`).join('');

    const view = `
        <div class="page-content-wrapper">
            <header class="pos-page-header">
                <h1 class="pos-logo">TEXAS</h1>
                <button id="search-btn" class="header-icon-btn" title="ค้นหา"><i class="bi bi-search"></i></button>
            </header>
            <nav class="category-selector" id="category-selector">${categoryPillsHtml}</nav>
            <main class="pos-main-content">
                <div class="product-carousel" id="product-carousel">
                    </div>
            </main>
            <footer class="summary-bar" id="summary-bar"></footer>
        </div>
    `;

    const postRender = () => {
        if (cleanupFunc) cleanupFunc();
        
        const pageWrapper = document.querySelector('.page-content-wrapper');
        if (!pageWrapper) return;

        const handlePageClick = (event) => {
            const productCard = event.target.closest('.product-item');
            if (productCard && !productCard.disabled) {
                const productId = productCard.dataset.productId;
                const product = productStore.getProductById(productId);
                if (product) {
                    const hasMultiplePrices = product.prices && product.prices.length > 0;
                    if (hasMultiplePrices) openPriceSelectionModal(product);
                    else if (product.price) cartStore.addItem(product, product.price);
                }
                return;
            }
            
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
        pageWrapper.addEventListener('click', handlePageClick);
        
        const unsubscribeCart = cartStore.subscribe(renderSummaryBar);
        
        renderFilteredProducts();
        renderSummaryBar();

        cleanupFunc = () => {
            pageWrapper.removeEventListener('click', handlePageClick);
            unsubscribeCart();
        };
    };

    return { view, postRender };
}
