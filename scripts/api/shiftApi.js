import { supabase } from '../lib/supabaseClient.js';
import { shiftStore } from '../state/shiftStore.js';

/**
 * ค้นหากะที่ยังทำงานอยู่ (end_time is null) ของพนักงานคนนั้น
 * ถ้าไม่เจอ จะทำการสร้างกะใหม่ให้โดยอัตโนมัติ
 * @param {{employeeId: string}} params - ไอดีพนักงาน
 * @returns {Promise<object|null>} อ็อบเจกต์ของกะที่กำลังทำงานอยู่
 */
export async function findOrCreateActiveShift({ employeeId }) {
  if (!employeeId) {
    console.error('findOrCreateActiveShift requires an employeeId');
    return null;
  }

  const activeShiftId = shiftStore.getActiveShiftId();
  if (activeShiftId) {
    const { data: shift, error } = await supabase
      .from('shifts')
      .select('*')
      .eq('id', activeShiftId)
      .single();
    
    if (shift && !shift.end_time) {
      console.log('Found active shift from store:', shift);
      return shift;
    } else {
      shiftStore.clearActiveShift();
    }
  }

  const { data: existingShift, error: findError } = await supabase
    .from('shifts')
    .select('*')
    .eq('employee_id', employeeId)
    .is('end_time', null)
    .single();

  if (findError && findError.code !== 'PGRST116') {
    console.error('Error finding active shift:', findError);
    return null;
  }

  if (existingShift) {
    console.log('Found existing active shift in DB:', existingShift);
    shiftStore.setActiveShift(existingShift.id);
    return existingShift;
  }

  console.log('No active shift found. Creating a new one...');
  // ▼▼▼▼▼ จุดที่แก้ไข: นำ shop_id ออกจาก object ที่จะ insert ▼▼▼▼▼
  const { data: newShift, error: createError } = await supabase
    .from('shifts')
    .insert({ 
      employee_id: employeeId,
      start_time: new Date().toISOString(),
    })
    .select()
    .single();
  // ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲

  if (createError) {
    console.error('Error creating new shift:', createError);
    return null;
  }

  if (newShift) {
    console.log('Successfully created a new shift:', newShift);
    shiftStore.setActiveShift(newShift.id);
    return newShift;
  }
  
  return null;
}
