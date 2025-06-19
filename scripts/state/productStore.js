// state ภายในของ store นี้
let products = [];
let subscribers = new Set();

function notify() {
  subscribers.forEach(callback => callback(products));
}

export const productStore = {
  /**
   * ให้ component อื่นๆ "ติดตาม" การเปลี่ยนแปลงของรายการสินค้า
   * @param {function} callback - ฟังก์ชันที่จะถูกเรียกเมื่อข้อมูลเปลี่ยน
   * @returns {function} ฟังก์ชันสำหรับ "ยกเลิกการติดตาม"
   */
  subscribe(callback) {
    subscribers.add(callback);
    callback(products); // เรียก callback ทันทีด้วยค่าปัจจุบัน
    return () => subscribers.delete(callback);
  },

  /**
   * อัปเดตรายการสินค้าทั้งหมด (จะถูกเรียกใช้หลังดึงข้อมูลจาก API สำเร็จ)
   * @param {Array} newProducts - รายการสินค้าชุดใหม่จาก productApi.js
   */
  setProducts(newProducts) {
    products = newProducts;
    console.log('Product store has been updated with', products.length, 'products.');
    notify();
  },

  /**
   * ดึงรายการสินค้าทั้งหมดที่อยู่ใน store
   * @returns {Array}
   */
  getProducts() {
    return products;
  },

  /**
   * ดึงสินค้าแค่ชิ้นเดียวด้วย ID
   * @param {string} id - ไอดีของสินค้า
   * @returns {object|undefined}
   */
  getProductById(id) {
    return products.find(p => p.id === id);
  },

  /**
   * ดึงสินค้าทั้งหมดโดยจัดกลุ่มตามหมวดหมู่
   * @returns {object} อ็อบเจกต์ที่ key คือชื่อหมวดหมู่ และ value คืออาร์เรย์ของสินค้า
   */
  getProductsByCategory() {
    return products.reduce((acc, product) => {
      const category = product.category || 'อื่นๆ'; // ถ้าสินค้าไม่มีหมวดหมู่ ให้จัดอยู่ใน 'อื่นๆ'
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(product);
      return acc;
    }, {});
  }
};
