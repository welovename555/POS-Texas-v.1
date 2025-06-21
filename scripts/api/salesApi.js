// scripts/api/saleApi.js

import { supabase } from '../lib/supabaseClient.js';

export async function handleSale({ shiftId, employeeId, shopId, paymentType, cartItems }) {
  try {
    const { data, error } = await supabase.rpc('handle_new_sale', {
      p_shift_id: shiftId,
      p_employee_id: employeeId,
      p_payment_type: paymentType,
      p_cart_items: cartItems,
      p_shop_id: shopId,
    });

    if (error) {
      console.error('[handleSale] Supabase error:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err) {
    console.error('[handleSale] Unexpected error:', err);
    return { success: false, error: err };
  }
}
