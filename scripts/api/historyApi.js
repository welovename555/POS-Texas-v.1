// scripts/api/historyApi.js
import { supabase } from '../lib/supabaseClient.js'
import { getUser } from '../state/userStore.js'

export async function fetchSalesHistory() {
  const user = getUser()
  if (!user || !user.shopId) {
    console.warn('[fetchSalesHistory] No user or shopId. Abort fetching history.')
    return []
  }

  const { data, error } = await supabase
    .from('sales_with_localtime')
    .select('*')
    .eq('shopId', user.shopId)
    .order('createdatlocal', { ascending: true })

  if (error) {
    console.error('[fetchSalesHistory] Error:', error)
    return []
  }

  return data
}
