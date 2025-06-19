import { supabase } from '../lib/supabaseClient.js';
import { shiftStore } from '../state/shiftStore.js';

/**
 * ค้นหากะที่ยังทำงานอยู่ (end_time is null) ของพนักงานคนนั้น
 * ถ้าไม่เจอ จะทำการสร้างกะใหม่ให้โดยอัตโนมัติ
 * @param {{employeeId: string, shopId: number}} params - ไอดีพนักงานและสาขา
 * @returns {Promise<object|null>} อ็อบเจกต์ของกะที่กำลังทำงานอยู่
 */
export async function findOrCreateActiveShift({ employeeId, shopId }) {
  if (!employeeId || !shopId) {
    console.error('findOrCreateActiveShift requires employeeId and shopId');
    return null;
  }

  // 1. ลองค้นหาจากใน store ก่อน (เร็วที่สุด)
  const activeShiftId = shiftStore.getActiveShiftId();
  if (activeShiftId) {
    // ถ้าเจอใน store ให้ดึงข้อมูลกะนั้นมาเลย
    const { data: shift, error } = await supabase
      .from('shifts')
      .select('*')
      .eq('id', activeShiftId)
      .single();
    
    if (shift && !shift.end_time) {
      console.log('Found active shift from store:', shift);
      return shift;
    } else {
      // ถ้าข้อมูลใน store ไม่ถูกต้อง (เช่น กะถูกปิดไปแล้ว) ให้ล้างค่าทิ้ง
      shiftStore.clearActiveShift();
    }
  }

  // 2. ถ้าไม่เจอใน store ให้ลองค้นหาในฐานข้อมูล
  const { data: existingShift, error: findError } = await supabase
    .from('shifts')
    .select('*')
    .eq('employee_id', employeeId)
    .is('end_time', null) // ค้นหาแถวที่ end_time เป็นค่าว่าง (NULL)
    .single();

  if (findError && findError.code !== 'PGRST116') { // PGRST116 คือ error "ไม่เจอแถว" ซึ่งไม่ใช่ error จริงๆ
    console.error('Error finding active shift:', findError);
    return null;
  }

  if (existingShift) {
    console.log('Found existing active shift in DB:', existingShift);
    shiftStore.setActiveShift(existingShift.id); // บันทึก ID ลง store
    return existingShift;
  }

  // 3. ถ้าไม่เจอเลย ให้สร้างกะใหม่
  console.log('No active shift found. Creating a new one...');
  const { data: newShift, error: createError } = await supabase
    .from('shifts')
    .insert({ 
      employee_id: employeeId,
      shop_id: shopId, // สมมติว่าตาราง shifts มีคอลัมน์ shop_id
      start_time: new Date().toISOString(),
    })
    .select()
    .single();

  if (createError) {
    console.error('Error creating new shift:', createError);
    return null;
  }

  if (newShift) {
    console.log('Successfully created a new shift:', newShift);
    shiftStore.setActiveShift(newShift.id); // บันทึก ID ลง store
    return newShift;
  }
  
  return null;
}
