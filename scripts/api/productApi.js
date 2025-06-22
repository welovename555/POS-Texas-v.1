// scripts/api/productApi.js

import { supabase } from '../lib/supabaseClient.js'

export async function getProducts(shopId) {
  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        product_stocks (
          stock
        )
      `)
      .eq('product_stocks.shopId', shopId)

    if (error) {
      console.error('[productApi] Error fetching products:', error)
      return []
    }

    const productsWithStock = data.map(p => ({
      ...p,
      stock: p.product_stocks?.[0]?.stock ?? 0
    }))

    console.log('[productApi] Fetched products:', productsWithStock)
    return productsWithStock
  } catch (err) {
    console.error('[productApi] Unexpected error:', err)
    return []
  }
}
