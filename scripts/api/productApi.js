import { supabase } from '../lib/supabaseClient.js';

/**
 * ดึงข้อมูลสินค้าทั้งหมดพร้อมกับจำนวนสต็อกสำหรับสาขาที่ระบุ
 * @param {number} shopId - ไอดีของสาขาที่ต้องการดึงข้อมูลสต็อก
 * @returns {Promise<Array>} อาร์เรย์ของอ็อบเจกต์สินค้าพร้อมข้อมูลสต็อก
 */
export async function getProductsWithStock(shopId) {
  if (!shopId) {
    console.error('getProductsWithStock requires a shopId.');
    return [];
  }

  console.log(`Fetching products and stock for shop_id: ${shopId}`);

  try {
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

    // ▼▼▼▼▼ จุดที่แก้ไข ▼▼▼▼▼
    // ปรับปรุง Logic การแปลงข้อมูลให้มีความปลอดภัยและรอบคอบมากขึ้น
    const formattedProducts = products.map(p => {
      // ตรวจสอบให้แน่ใจว่า p.product_stocks เป็นอาร์เรย์และมีข้อมูลจริงๆ ก่อนที่จะเข้าถึง
      const hasStockInfo = p.product_stocks && Array.isArray(p.product_stocks) && p.product_stocks.length > 0;
      const stock = hasStockInfo ? p.product_stocks[0].stock : 0;

      return {
        ...p,
        stock: stock,
      };
    });
    // ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲
    
    formattedProducts.forEach(p => delete p.product_stocks);

    console.log('Formatted products with stock:', formattedProducts);
    return formattedProducts;

  } catch (err) {
    console.error('An unexpected error occurred in getProductsWithStock:', err);
    return [];
  }
}
