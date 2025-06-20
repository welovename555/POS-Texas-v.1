import { supabase } from '../lib/supabaseClient.js';
import { shiftStore } from '../state/shiftStore.js';

export async function findOrCreateActiveShift({ employeeId }) {
  if (!employeeId) {
    console.error('findOrCreateActiveShift requires an employeeId');
    return null;
  }
  const activeShiftId = shiftStore.getActiveShiftId();
  if (activeShiftId) {
    const { data: shift } = await supabase.from('shifts').select('*').eq('id', activeShiftId).single();
    if (shift && !shift.endTime) {
      console.log('Found active shift from store:', shift);
      return shift;
    } else {
      shiftStore.clearActiveShift();
    }
  }
  const { data: existingShift, error: findError } = await supabase
    .from('shifts').select('*').eq('employeeId', employeeId).is('endTime', null).single();
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
  const { data: newShift, error: createError } = await supabase
    .from('shifts').insert({ employeeId: employeeId, startTime: new Date().toISOString() }).select().single();
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
