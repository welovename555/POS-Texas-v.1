import { supabase } from '../lib/supabaseClient.js';

/**
 * ดึงข้อมูลสินค้าทั้งหมดพร้อมกับจำนวนสต็อกสำหรับสาขาที่ระบุ
 * @param {number} shopId - ไอดีของสาขาที่ต้องการดึงข้อมูลสต็อก
 * @returns {Promise<Array>} อาร์เรย์ของอ็อบเจกต์สินค้าพร้อมข้อมูลสต็อก
 */
export async function getProductsWithStock(shopId) {
  if (!shopId) {
    console.error('getProductsWithStock requires a shopId.');
    return []; // คืนค่าอาร์เรย์ว่างถ้าไม่มี shopId
  }

  console.log(`Fetching products and stock for shop_id: ${shopId}`);

  try {
    // นี่คือการ Join ข้อมูลด้วย Supabase JS Client
    // - select `*` จาก products
    // - select `stock` จากตาราง `product_stocks` ที่มีความสัมพันธ์กัน
    // - filter `product_stocks` ให้เอาเฉพาะแถวที่ `shop_id` ตรงกับที่ระบุ
    const { data: products, error } = await supabase
      .from('products')
      .select(`
        *,
        product_stocks (
          stock
        )
      `)
      .eq('product_stocks.shop_id', shopId);

    if (error) {
      console.error('Error fetching products with stock:', error.message);
      return [];
    }

    // Supabase จะคืนค่า stock มาในรูปแบบอาร์เรย์ เช่น product_stocks: [{ stock: 10 }]
    // เราจะทำการแปลงข้อมูล (transform) ให้อยู่ในรูปแบบที่ใช้งานง่ายขึ้น
    const formattedProducts = products.map(p => {
      return {
        ...p,
        // ถ้ามีข้อมูลสต็อก ให้ดึงค่า stock ออกมา, ถ้าไม่เจอ (เป็นอาร์เรย์ว่าง) ให้สต็อกเป็น 0
        stock: p.product_stocks.length > 0 ? p.product_stocks[0].stock : 0,
      };
    });
    
    // ลบ property `product_stocks` ที่ไม่จำเป็นทิ้งไป
    formattedProducts.forEach(p => delete p.product_stocks);

    console.log('Formatted products with stock:', formattedProducts);
    return formattedProducts;

  } catch (err) {
    console.error('An unexpected error occurred in getProductsWithStock:', err);
    return [];
  }
}
