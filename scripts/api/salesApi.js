import { supabase } from '../lib/supabaseClient.js';

export async function createSaleTransaction(saleData) {
  console.log('Sending sale data to RPC:', saleData);

  // เพิ่ม p_shop_id เข้าไปใน payload ที่จะส่ง
  const payload = {
    p_shift_id: saleData.shiftId,
    p_employee_id: saleData.employeeId,
    p_payment_type: saleData.paymentType,
    p_cart_items: saleData.cartItems,
    p_shop_id: saleData.shopId // <--- เพิ่มบรรทัดนี้
  };

  const { data, error } = await supabase.rpc('handle_new_sale', payload);

  if (error) {
    console.error('Error calling handle_new_sale RPC:', error);
    return { success: false, transactionId: null, error: error };
  }

  console.log('RPC handle_new_sale successful, transaction ID:', data);
  return { success: true, transactionId: data, error: null };
}
