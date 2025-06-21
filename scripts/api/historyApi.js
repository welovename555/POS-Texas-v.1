// scripts/api/historyApi.js

import { supabase } from '../lib/supabaseClient.js';

export async function fetchSalesHistory(date, shopId) {
  const start = new Date(`${date}T00:00:00+07:00`).toISOString();
  const end = new Date(`${date}T23:59:59+07:00`).toISOString();

  const { data, error } = await supabase
    .from('sales')
    .select(
      `
      id,
      transactionId,
      shiftId,
      employeeId,
      productId,
      qty,
      price,
      paymentType,
      createdAt,
      product:products (
        id,
        name
      )
    `
    )
    .gte('createdAt', start)
    .lte('createdAt', end)
    .eq('shopId', shopId) // ต้องมี column shopId ใน sales
    .order('createdAt', { ascending: false });

  if (error) {
    console.error('[fetchSalesHistory] Supabase error:', error.message);
    return { data: [], error };
  }

  return { data, error: null };
}
