// scripts/api/historyApi.js
import { supabase } from '../lib/supabaseClient.js';
import { userStore } from '../state/userStore.js';

export async function fetchSalesHistory(startDate, endDate) {
  const user = userStore.getCurrentUser();

  let query = supabase
    .from('sales_with_localtime')
    .select('*')
    .eq('shopId', user.shopId);

  if (startDate) query = query.gte('createdAtLocal', startDate);
  if (endDate) query = query.lte('createdAtLocal', endDate);

  const { data, error } = await query.order('createdAtLocal', { ascending: true });

  if (error) {
    console.error('[fetchSalesHistory] Error:', error);
    return [];
  }

  return data;
}
