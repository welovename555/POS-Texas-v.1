import { supabase } from '../lib/supabaseClient.js';

/**
 * เรียกใช้ RPC function บน Supabase เพื่อบันทึกการขายและตัดสต็อก
 * @param {object} saleData - ข้อมูลการขายทั้งหมด
 * @param {number} saleData.shift_id - ไอดีของกะ
 * @param {string} saleData.employee_id - ไอดีของพนักงาน
 * @param {string} saleData.payment_type - ประเภทการชำระเงิน ('cash' หรือ 'transfer')
 * @param {Array} saleData.cart_items - รายการสินค้าในตะกร้า
 * @returns {Promise<{success: boolean, transactionId: string|null, error: object|null}>}
 */
export async function createSaleTransaction(saleData) {
  console.log('Sending sale data to RPC:', saleData);

  const { data, error } = await supabase.rpc('handle_new_sale', {
    p_shift_id: saleData.shift_id,
    p_employee_id: saleData.employee_id,
    p_payment_type: saleData.payment_type,
    p_cart_items: saleData.cart_items,
  });

  if (error) {
    console.error('Error calling handle_new_sale RPC:', error);
    return { success: false, transactionId: null, error: error };
  }

  console.log('RPC handle_new_sale successful, transaction ID:', data);
  return { success: true, transactionId: data, error: null };
}
