// scripts/pages/PosPage.js

import { getUser, setUser, clearUser } from '../state/userStore.js';
import { getProducts } from '../api/productApi.js';
import { getActiveShiftId } from '../state/shiftStore.js';
import { handleSale } from '../api/salesApi.js';

export async function PosPage() {
  const wrapper = document.createElement('div');
  wrapper.className = 'page-content-wrapper';
  wrapper.id = 'pos-page-wrapper';
  wrapper.innerHTML = `
    <h2>ระบบขาย</h2>
    <div id="product-list" class="product-list"></div>
    <div class="checkout-area">
      <div class="total-price" id="total-price">รวม: 0 บาท</div>
      <button class="checkout-button-main" id="checkout-btn">ชำระเงิน</button>
    </div>
  `;

  document.title = 'POS - ระบบขาย';
  document.getElementById('app').innerHTML = '';
  document.getElementById('app').appendChild(wrapper);

  const productListEl = document.getElementById('product-list');
  const totalPriceEl = document.getElementById('total-price');
  const checkoutBtn = document.getElementById('checkout-btn');

  const user = getUser();
  if (!user || !user.shopId) {
    console.error('[POS] ไม่พบข้อมูลผู้ใช้งานหรือ shopId');
    return;
  }

  const products = await getProducts(user.shopId);
  let cart = [];

  products.forEach((product) => {
    const card = document.createElement('div');
    card.className = 'product-item';
    card.innerHTML = `
      <img src="${product.imageUrl || 'https://placehold.co/300x300/e2e8f0/64748b?text=No+Image'}" alt="${product.name}" class="product-item__image" />
      <div class="product-item__name">${product.name}</div>
      <div class="product-item__price">${product.price ? product.price + ' บาท' : ''}</div>
    `;

    card.addEventListener('click', () => {
      console.log('[DEBUG] Clicked product:', product.name, product);

      if (Array.isArray(product.prices) && product.prices.length > 0) {
        const readablePrices = product.prices.join(', ');
        const selected = confirm(`คุณต้องการเพิ่ม "${product.name}"?\nราคาที่มี: ${readablePrices}`);
        if (selected) {
          const chosen = prompt(`ใส่ราคาที่เลือก (${readablePrices})`);
          const price = Number(chosen);

          const validPrices = product.prices.map(Number);
          if (!isNaN(price) && validPrices.includes(price)) {
            addToCart(product, price);
          } else {
            alert('กรุณาใส่ราคาที่ถูกต้อง');
          }
        }
      } else {
        addToCart(product, product.price);
      }
    });

    productListEl.appendChild(card);
  });

  function addToCart(product, price) {
    const index = cart.findIndex((item) => item.productId === product.id && item.price === price);
    if (index > -1) {
      cart[index].qty += 1;
    } else {
      cart.push({
        productId: product.id,
        price,
        qty: 1,
        name: product.name,
      });
    }
    updateTotal();
  }

  function updateTotal() {
    const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    totalPriceEl.textContent = `รวม: ${total.toLocaleString()} บาท`;
  }

  checkoutBtn.addEventListener('click', async () => {
    if (cart.length === 0) {
      alert('ยังไม่มีสินค้าในตะกร้า');
      return;
    }

    const paymentType = prompt('พิมพ์ "cash" หรือ "transfer" เพื่อเลือกวิธีชำระเงิน');
    if (paymentType !== 'cash' && paymentType !== 'transfer') {
      alert('ต้องระบุว่า cash หรือ transfer เท่านั้น');
      return;
    }

    const shiftId = getActiveShiftId();
    if (!shiftId) {
      alert('ไม่พบกะการทำงาน กรุณาเริ่มกะก่อน');
      return;
    }

    const result = await handleSale({
      shiftId,
      employeeId: user.id,
      shopId: user.shopId,
      paymentType,
      cartItems: cart,
    });

    if (result.success) {
      alert('บันทึกการขายเรียบร้อยแล้ว');
      cart = [];
      updateTotal();
    } else {
      alert('เกิดข้อผิดพลาดในการขาย');
    }
  });
}
