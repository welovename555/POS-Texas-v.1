import { supabase } from '../lib/supabaseClient.js';
import { userStore } from '../state/userStore.js';

/**
 * ดึงข้อมูลประวัติการขายตามวันที่ระบุ (โดยใช้ Date String)
 * @param {string} dateString - วันที่ในรูปแบบ "YYYY-MM-DD"
 * @returns {Promise<Array>} อาร์เรย์ของรายการขายที่ผ่านการจัดรูปแบบแล้ว
 */
export async function getSalesHistoryByDate(dateString) {
  const currentUser = userStore.getCurrentUser();
  if (!currentUser || !currentUser.shopId) {
    console.error('Cannot get history: No user or shopId found.');
    return [];
  }

  // --- คำนวณช่วงเวลาใหม่ที่แม่นยำกว่าเดิม ---
  const selectedDate = new Date(dateString);
  const startDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 6, 0, 0);

  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 1);
  endDate.setHours(2, 0, 0, 0);

  console.log(`Fetching sales history from ${startDate.toISOString()} to ${endDate.toISOString()}`);

  try {
    const { data: sales, error } = await supabase
      .from('sales')
      .select(`
        createdAt,
        qty,
        price,
        paymentType,
        transactionId,
        products ( name ),
        employees ( name )
      `)
      .eq('employees.shopId', currentUser.shopId)
      .gte('createdAt', startDate.toISOString())
      .lt('createdAt', endDate.toISOString())
      .order('createdAt', { ascending: false });

    if (error) {
      console.error('Error fetching sales history:', error.message);
      return [];
    }

    // จัดรูปแบบข้อมูล (เหมือนเดิม)
    const formattedHistory = sales.map(sale => ({
      time: new Date(sale.createdAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
      productName: sale.products ? sale.products.name : 'N/A',
      quantity: sale.qty,
      price: sale.price,
      paymentType: sale.paymentType,
      employeeName: sale.employees ? sale.employees.name : 'N/A',
      transactionId: sale.transactionId,
    }));

    console.log('Formatted sales history:', formattedHistory);
    return formattedHistory;

  } catch (err) {
    console.error('An unexpected error occurred in getSalesHistoryByDate:', err);
    return [];
  }
}
