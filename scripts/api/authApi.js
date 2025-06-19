import { supabase } from '../lib/supabaseClient.js';

/**
 * ตรวจสอบ PIN ของพนักงานกับฐานข้อมูล
 * @param {string} pin - รหัส PIN 4 หลักที่ผู้ใช้กรอก
 * @returns {Promise<object|null>} ข้อมูลพนักงานถ้าเจอ หรือ null ถ้าไม่เจอหรือเกิดข้อผิดพลาด
 */
export async function signInWithPin(pin) {
  console.log(`Attempting to sign in with PIN: ${pin}`);

  try {
    // ใช้ .eq() เพื่อหาแถวที่คอลัมน์ 'pin' ตรงกับค่าที่ส่งมา
    // ใช้ .single() เพื่อบอกว่าเราต้องการผลลัพธ์แค่แถวเดียว (ถ้าเจอหลายแถวจะ error)
    // ซึ่งดีกับการหาข้อมูลที่ไม่ควรซ้ำกันอย่าง ID หรือ PIN
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('pin', pin)
      .single();

    // กรณีเกิด error จากการ query หรือ network
    if (error) {
      // Pin ไม่ตรงจะไม่มี error แต่จะให้ data เป็น null, ดังนั้น error นี้คือปัญหาอื่นๆ
      console.error('Supabase error:', error.message);
      return null;
    }

    // กรณีไม่เจอข้อมูล (PIN ผิด)
    if (!data) {
      console.log('PIN not found.');
      return null;
    }

    // กรณีเจอข้อมูล (PIN ถูกต้อง)
    console.log('Sign-in successful for:', data.name);
    return data;

  } catch (err) {
    console.error('An unexpected error occurred:', err);
    return null;
  }
}
