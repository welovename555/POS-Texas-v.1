import { supabase } from '../lib/supabaseClient.js';

export async function createSaleTransaction(saleData) {
  console.log('Sending sale data to RPC:', saleData);

  // ส่ง Payload ด้วย Key แบบ camelCase
  const payload = {
    p_shift_id: saleData.shiftId,
    p_employee_id: saleData.employeeId,
    p_payment_type: saleData.paymentType,
    p_cart_items: saleData.cartItems,
  };

  // เรียกใช้ rpc ด้วยชื่อตัวพิมพ์เล็กทั้งหมด
  const { data, error } = await supabase.rpc('handle_new_sale', payload);

  if (error) {
    console.error('Error calling handle_new_sale RPC:', error);
    return { success: false, transactionId: null, error: error };
  }

  console.log('RPC handle_new_sale successful, transaction ID:', data);
  return { success: true, transactionId: data, error: null };
}
