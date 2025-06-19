import { productStore } from './productStore.js';

let cart = []; // State ของตะกร้าสินค้า
let subscribers = new Set();

function notify() {
  subscribers.forEach(callback => callback(cart));
}

export const cartStore = {
  subscribe(callback) {
    subscribers.add(callback);
    callback(cart);
    return () => subscribers.delete(callback);
  },

  /**
   * เพิ่มสินค้าลงในตะกร้า
   * @param {object} product - อ็อบเจกต์สินค้าจาก productStore
   * @param {number} price - ราคาที่เลือก (สำหรับสินค้าหลายราคา)
   * @param {number} quantity - จำนวนที่ต้องการเพิ่ม (ปกติคือ 1)
   */
  addItem(product, price, quantity = 1) {
    if (!product) return;

    const productInStock = productStore.getProductById(product.id);
    if (!productInStock || productInStock.stock < 1) {
      console.warn('Attempted to add an out-of-stock item.');
      // ในอนาคตอาจจะแสดง alert ให้ผู้ใช้ทราบ
      return;
    }

    // สร้าง ID ที่ไม่ซ้ำกันสำหรับรายการในตะกร้า (เผื่อสินค้าเดียวกันแต่คนละราคา)
    const cartItemId = `${product.id}-${price}`;
    const existingItem = cart.find(item => item.id === cartItemId);

    if (existingItem) {
      // ถ้ามีสินค้านี้ในตะกร้าแล้ว ให้อัปเดตจำนวน
      const newQuantity = existingItem.quantity + quantity;
      // เช็คสต็อกอีกครั้ง
      if (productInStock.stock >= newQuantity) {
        existingItem.quantity = newQuantity;
      } else {
        console.warn('Cannot add more. Not enough stock.');
        // แสดง alert
      }
    } else {
      // ถ้ายังไม่มี ให้เพิ่มเป็นรายการใหม่
      cart.push({
        id: cartItemId,
        productId: product.id,
        name: product.name,
        quantity: quantity,
        price: price,
        image_url: product.image_url,
      });
    }
    notify();
  },

  /**
   * อัปเดตจำนวนสินค้าในตะกร้า
   * @param {string} cartItemId - ไอดีของรายการในตะกร้า
   * @param {number} newQuantity - จำนวนใหม่
   */
  updateItemQuantity(cartItemId, newQuantity) {
    const itemIndex = cart.findIndex(item => item.id === cartItemId);
    if (itemIndex === -1) return;

    if (newQuantity <= 0) {
      // ถ้าจำนวนใหม่เป็น 0 หรือน้อยกว่า ให้ลบสินค้านั้นทิ้ง
      cart.splice(itemIndex, 1);
    } else {
      const productInStock = productStore.getProductById(cart[itemIndex].productId);
      if (productInStock && productInStock.stock >= newQuantity) {
        cart[itemIndex].quantity = newQuantity;
      } else {
        console.warn('Cannot update quantity. Not enough stock.');
        // แสดง alert
      }
    }
    notify();
  },

  /**
   * ลบสินค้าออกจากตะกร้า
   * @param {string} cartItemId - ไอดีของรายการในตะกร้า
   */
  removeItem(cartItemId) {
    cart = cart.filter(item => item.id !== cartItemId);
    notify();
  },

  /**
   * ล้างตะกร้าทั้งหมด (ใช้หลังจากชำระเงินสำเร็จ)
   */
  clearCart() {
    cart = [];
    notify();
  },

  /**
   * ดึงข้อมูลตะกร้าทั้งหมด
   * @returns {Array}
   */
  getCart() {
    return cart;
  },

  /**
   * คำนวณราคารวมของสินค้าทั้งหมดในตะกร้า
   * @returns {number}
   */
  getCartTotal() {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  },

  /**
   * นับจำนวนชิ้นของสินค้าทั้งหมดในตะกร้า
   * @returns {number}
   */
  getCartItemCount() {
    return cart.reduce((total, item) => total + item.quantity, 0);
  }
};
