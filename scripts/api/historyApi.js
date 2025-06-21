// scripts/api/historyApi.js
import { supabase } from '../lib/supabaseClient.js'
import { getUser } from '../state/userStore.js'

export async function fetchSalesHistory(startDate, endDate) {
  const user = getUser()
  if (!user || !user.shopId) {
    console.warn('[fetchSalesHistory] No user or shopId. Abort fetching history.')
    return []
  }

  let query = supabase
    .from('sales_with_localtime')
    .select('*')
    .eq('shopId', user.shopId)
    .order('createdatlocal', { ascending: true })

  if (startDate) {
    query = query.gte('createdatlocal', `${startDate}T00:00:00`)
  }

  if (endDate) {
    query = query.lte('createdatlocal', `${endDate}T23:59:59`)
  }

  const { data, error } = await query

  if (error) {
    console.error('[fetchSalesHistory] Error:', error)
    return []
  }

  return data
}
