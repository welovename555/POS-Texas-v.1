import { supabase } from '../lib/supabaseClient.js';

/**
 * ตรวจสอบ PIN ของพนักงานกับฐานข้อมูล
 * @param {string} pin - รหัส PIN 4 หลักที่ผู้ใช้กรอก
 * @returns {Promise<object|null>} ข้อมูลพนักงานถ้าเจอ หรือ null ถ้าไม่เจอหรือเกิดข้อผิดพลาด
 */
export async function signInWithPin(pin) {
  console.log(`Attempting to sign in with PIN: ${pin}`);

  try {
    // ▼▼▼▼▼ จุดที่แก้ไข ▼▼▼▼▼
    // เปลี่ยนจาก 'รหัส' เป็น 'id' ซึ่งเป็นชื่อคอลัมน์ที่แท้จริงสำหรับเก็บ PIN
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('id', pin) // <--- แก้ไขที่บรรทัดนี้
      .single();
    // ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲

    if (error) {
      console.error('Supabase error:', error.message);
      return null;
    }

    if (!data) {
      console.log('PIN not found in "id" column.');
      return null;
    }

    console.log('Sign-in successful for:', data.name);
    return data;

  } catch (err) {
    console.error('An unexpected error occurred:', err);
    return null;
  }
}
