import { userStore } from '../state/userStore.js';
import { productStore } from '../state/productStore.js';
import { cartStore } from '../state/cartStore.js';
import { getProductsWithStock } from '../api/productApi.js';
import { Modal } from '../components/common/Modal.js';
import { findOrCreateActiveShift } from '../api/shiftApi.js';
import { createSaleTransaction } from '../api/salesApi.js';

let activeCategory = null;

function renderProductCard(product){const isOutOfStock=product.stock<=0;const imageUrl=product.imageUrl||'https://placehold.co/300x300/e2e8f0/64748b?text=No+Image';const disabledAttribute=isOutOfStock?'disabled':'';const priceDisplay=product.price?`${product.price} บาท`:(product.prices||[]).join('/')+' บาท';return`<button class="pos-product-card" data-product-id="${product.id}" ${disabledAttribute}><div class="pos-product-card__image-wrapper"><img src="${imageUrl}" alt="${product.name}" class="pos-product-card__image"></div><div class="pos-product-card__info"><h3 class="pos-product-card__name">${product.name}</h3><p class="pos-product-card__price">${priceDisplay}</p><p class="pos-product-card__stock">เหลือ ${product.stock}</p></div></button>`}
function renderProductContainer(){const productsByCategory=productStore.getProductsByCategory();const productContainer=document.getElementById('product-container');if(!productContainer)return;const categories=Object.keys(productsByCategory);if(!activeCategory&&categories.length>0){activeCategory=categories[0]}const productsToShow=productsByCategory[activeCategory]||[];productContainer.innerHTML=productsToShow.map(renderProductCard).join('');document.querySelectorAll('.category-pill').forEach(btn=>{btn.dataset.category===activeCategory?btn.classList.add('active'):btn.classList.remove('active')})}
function renderSummaryBar(){const summaryBar=document.getElementById('summary-bar');if(!summaryBar)return;const total=cartStore.getCartTotal();const itemCount=cartStore.getCartItemCount();if(itemCount===0){summaryBar.style.display='none';return}summaryBar.style.display='flex';summaryBar.innerHTML=`<div class="summary-text" id="summary-bar-text"><span>${itemCount} รายการ</span><strong>รวม ${total.toFixed(2)} บาท</strong></div><button class="checkout-button-main" id="checkout-btn">ชำระเงิน</button>`}
async function handleCheckout(){const total=cartStore.getCartTotal();const contentHtml=`...`;Modal.open(contentHtml,()=>{})}
function openPaymentModal(){const total=cartStore.getCartTotal();const cart=cartStore.getCart();const contentHtml=`<div class="payment-modal-final"><div class="payment-modal-header">สรุปรายการ</div><div class="payment-modal-items">${cart.map(item=>`<div class="payment-modal-item"><span>${item.name} (x${item.quantity})</span><span>${(item.price*item.quantity).toFixed(2)}</span></div>`).join('')}</div><div class="payment-modal-total"><span>ยอดรวม</span><strong>${total.toFixed(2)} บาท</strong></div><div class="payment-modal-controls">${/* ... */''}</div></div>`;Modal.open(contentHtml,()=>{})}
function openPriceSelectionModal(product){const prices=product.prices||[];const contentHtml=`<div class="price-modal"><h3 class="price-modal__title">เลือกราคาสำหรับ "${product.name}"</h3><div class="price-modal__buttons" id="price-options">${prices.map(price=>`<button class="price-btn" data-price="${price}">${price} บาท</button>`).join('')}</div></div>`;const afterOpen=()=>{document.getElementById('price-options')?.addEventListener('click',e=>{const priceButton=e.target.closest('.price-btn');if(priceButton){const selectedPrice=parseFloat(priceButton.dataset.price);cartStore.addItem(product,selectedPrice);Modal.close()}})};Modal.open(contentHtml,afterOpen)}

export function PosPage() {
    const productsByCategory = productStore.getProductsByCategory();
    const categories = Object.keys(productsByCategory);
    const categoryPillsHtml = categories.map(cat => `<button class="category-pill" data-category="${cat}">${cat}</button>`).join('');

    const view = `
        <div class="pos-page-header">
            <h1 class="pos-logo">TEXAS</h1>
            <button id="search-btn" class="header-icon-btn" title="ค้นหา"><i class="bi bi-search"></i></button>
        </div>
        <div class="category-selector" id="category-selector">${categoryPillsHtml}</div>
        <div class="product-container" id="product-container"></div>
        <div class="summary-bar" id="summary-bar"></div>
    `;

    const postRender = async () => {
        const currentUser = userStore.getCurrentUser();
        const pageContainer = document.getElementById('main-content');

        const handlePageClick = (e) => {
            const productCard = e.target.closest('.pos-product-card');
            if (productCard) {
                const productId = productCard.dataset.productId;
                const product = productStore.getProductById(productId);
                if (product) {
                    const hasMultiplePrices = product.prices && product.prices.length > 0;
                    if (hasMultiplePrices) openPriceSelectionModal(product);
                    else if (product.price) cartStore.addItem(product, product.price);
                }
                return;
            }
            const categoryPill = e.target.closest('.category-pill');
            if(categoryPill) {
                activeCategory = categoryPill.dataset.category;
                renderProductContainer();
                return;
            }
            const summaryBar = e.target.closest('#summary-bar-text');
            if (summaryBar) {
                // TODO: Open full cart details modal
                console.log('Summary bar clicked');
            }
            if (e.target.id === 'checkout-btn') {
                openPaymentModal();
            }
        };

        const loadProducts = async () => {
            if (productStore.getProducts().length === 0) {
                const products = await getProductsWithStock(currentUser.shopId);
                productStore.setProducts(products);
                // ต้อง re-render ทั้งหน้าเพื่อสร้าง category pills
                navigate('/pos'); 
            }
        };

        await loadProducts();

        renderProductContainer();
        renderSummaryBar();

        const unsubscribeCart = cartStore.subscribe(renderSummaryBar);
        const unsubscribeProducts = productStore.subscribe(renderProductContainer);
        
        pageContainer.addEventListener('click', handlePageClick);

        return () => {
            pageContainer.removeEventListener('click', handlePageClick);
            unsubscribeCart();
            unsubscribeProducts();
        };
    };

    return { view, postRender };
}
