import { supabase } from '../lib/supabaseClient.js';

export async function createSaleTransaction(saleData) {
  console.log('Sending sale data to RPC:', saleData);

  const payload = {
    p_shift_id: saleData.shift_id,
    p_employee_id: saleData.employee_id,
    p_payment_type: saleData.payment_type,
    // ▼▼▼▼▼ จุดที่แก้ไข ▼▼▼▼▼
    p_cart_items: JSON.stringify(saleData.cart_items),
    // ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲
  };

  const { data, error } = await supabase.rpc('handle_new_sale', payload);

  if (error) {
    console.error('Error calling handle_new_sale RPC:', error);
    return { success: false, transactionId: null, error: error };
  }

  console.log('RPC handle_new_sale successful, transaction ID:', data);
  return { success: true, transactionId: data, error: null };
}

