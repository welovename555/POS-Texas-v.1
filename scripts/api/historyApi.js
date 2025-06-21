// scripts/api/historyApi.js
import { supabase } from '../lib/supabaseClient.js';
import { user } from '../stores/userStore.js';

export async function fetchSalesHistory(startDate, endDate) {
  const currentUser = user;

  if (!currentUser || !currentUser.shopId) {
    console.warn('[fetchSalesHistory] user.shopId is missing. Abort fetching history.');
    return [];
  }

  const shopId = currentUser.shopId;

  let query = supabase
    .from('sales_with_localtime')
    .select('*')
    .eq('shopId', shopId)
    .order('createdatlocal', { ascending: true });

  if (startDate) {
    query = query.gte('createdatlocal', `${startDate}T00:00:00`);
  }

  if (endDate) {
    query = query.lte('createdatlocal', `${endDate}T23:59:59`);
  }

  const { data, error } = await query;

  if (error) {
    console.error('[fetchSalesHistory] Error:', error);
    return [];
  }

  return data;
}
