// scripts/state/shiftStore.js

let currentShiftId = null;

export function restoreShiftIdFromLocalStorage() {
  const saved = localStorage.getItem('activeShiftId');
  if (saved) {
    currentShiftId = parseInt(saved);
    console.log('[shiftStore.js] Restored active shift ID from localStorage:', currentShiftId);
  } else {
    console.warn('[shiftStore.js] No shift ID found in localStorage');
  }
}

export function saveShiftIdToLocalStorage(shiftId) {
  currentShiftId = shiftId;
  localStorage.setItem('activeShiftId', shiftId);
  console.log('[shiftStore.js] Saved shift ID to localStorage:', shiftId);
}

export function getActiveShiftId() {
  return currentShiftId;
}

export function clearShiftId() {
  currentShiftId = null;
  localStorage.removeItem('activeShiftId');
  console.log('[shiftStore.js] Cleared shift ID from localStorage');
}
