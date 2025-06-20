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
      return shift;
    } else {
      shiftStore.clearActiveShift();
    }
  }
  const { data: existingShift } = await supabase
    .from('shifts').select('*').eq('employeeId', employeeId).is('endTime', null).single();
  
  if (existingShift) {
    shiftStore.setActiveShift(existingShift.id);
    return existingShift;
  }

  const { data: newShift, error: createError } = await supabase
    .from('shifts').insert({ employeeId: employeeId, startTime: new Date().toISOString() }).select().single();
    
  if (createError) {
    console.error('Error creating new shift:', createError);
    return null;
  }
  if (newShift) {
    shiftStore.setActiveShift(newShift.id);
    return newShift;
  }
  return null;
}
