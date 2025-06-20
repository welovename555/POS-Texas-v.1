import { supabase } from '../lib/supabaseClient.js';
import { userStore } from '../state/userStore.js';

/**
 * ดึงข้อมูลประวัติการขายตามวันที่ระบุ (ช่วงเวลา 06:00 ถึง 02:00 ของวันถัดไป)
 * @param {Date} date - อ็อบเจกต์ Date ของวันที่ต้องการดูข้อมูล
 * @returns {Promise<Array>} อาร์เรย์ของรายการขายที่ผ่านการจัดรูปแบบแล้ว
 */
export async function getSalesHistoryByDate(date) {
  const currentUser = userStore.getCurrentUser();
  if (!currentUser || !currentUser.shopId) {
    console.error('Cannot get history: No user or shopId found.');
    return [];
  }

  // --- คำนวณช่วงเวลา ---
  const startDate = new Date(date);
  startDate.setHours(6, 0, 0, 0); // 06:00:00 ของวันที่เลือก

  const endDate = new Date(date);
  endDate.setDate(endDate.getDate() + 1); // ไปวันถัดไป
  endDate.setHours(2, 0, 0, 0); // 02:00:00 ของวันถัดไป

  console.log(`Fetching sales history from ${startDate.toISOString()} to ${endDate.toISOString()}`);

  try {
    // ดึงข้อมูลจาก sales และ join ข้อมูลจาก products และ employees ที่เกี่ยวข้อง
    // Supabase จะฉลาดพอที่จะ join ตารางที่มี foreign key ให้เราโดยอัตโนมัติ
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
      .eq('employees.shopId', currentUser.shopId) // Filter เฉพาะสาขาของพนักงานที่ล็อกอิน
      .gte('createdAt', startDate.toISOString()) // >= เวลาเริ่มต้น
      .lt('createdAt', endDate.toISOString())    // < เวลาสิ้นสุด
      .order('createdAt', { ascending: false }); // เรียงจากล่าสุดไปเก่าสุด

    if (error) {
      console.error('Error fetching sales history:', error.message);
      return [];
    }

    // จัดรูปแบบข้อมูลเพื่อให้ UI นำไปใช้ได้ง่าย
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
