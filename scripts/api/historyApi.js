// scripts/api/historyApi.js
import { supabase } from '../lib/supabaseClient.js';

export async function fetchSalesHistory(startDate, endDate) {
  let userData = null;

  try {
    userData = JSON.parse(localStorage.getItem('user'));
  } catch (err) {
    console.error('[fetchSalesHistory] Failed to parse user:', err);
  }

  const shopId = userData?.shopId;

  if (!shopId) {
    console.warn('[fetchSalesHistory] shopId is undefined. Abort fetching history.');
    return [];
  }

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
