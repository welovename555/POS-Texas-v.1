// scripts/api/historyApi.js
import { supabase } from '../lib/supabaseClient.js';

export async function fetchSalesHistory(startDate, endDate) {
  let shopId;

  try {
    const rawUser = localStorage.getItem('user');

    if (!rawUser) {
      console.warn('[fetchSalesHistory] No user in localStorage');
      return [];
    }

    const user = typeof rawUser === 'string' ? JSON.parse(rawUser) : rawUser;

    if (!user || typeof user !== 'object' || !user.shopId) {
      console.warn('[fetchSalesHistory] Invalid user format or missing shopId:', user);
      return [];
    }

    shopId = user.shopId;
  } catch (error) {
    console.error('[fetchSalesHistory] Failed to parse user from localStorage:', error);
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
