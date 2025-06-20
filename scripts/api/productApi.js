import { supabase } from '../lib/supabaseClient.js';
export async function getProductsWithStock(shopId) {
  if (!shopId) { console.error('getProductsWithStock requires a shopId.'); return []; }
  console.log(`Fetching products and stock for shopId: ${shopId}`);
  try {
    const { data: products, error } = await supabase
      .from('products')
      .select(`*, product_stocks(stock)`)
      .eq('product_stocks.shopId', shopId); // ใช้ shopId
    if (error) { console.error('Error fetching products with stock:', error.message); return []; }
    const formattedProducts = products.map(p => {
      const hasStockInfo = p.product_stocks && Array.isArray(p.product_stocks) && p.product_stocks.length > 0;
      const stock = hasStockInfo ? p.product_stocks[0].stock : 0;
      return { ...p, stock: stock };
    });
    formattedProducts.forEach(p => delete p.product_stocks);
    console.log('Formatted products with stock:', formattedProducts);
    return formattedProducts;
  } catch (err) { console.error('An unexpected error occurred in getProductsWithStock:', err); return []; }
}
