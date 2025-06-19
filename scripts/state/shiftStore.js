// state ภายในของ store นี้
let activeShiftId = null;

// ฟังก์ชันสำหรับอ่านข้อมูลจาก localStorage ตอนเริ่มต้น
function initialize() {
  const savedShiftId = localStorage.getItem('activeShiftId');
  if (savedShiftId) {
    activeShiftId = JSON.parse(savedShiftId);
    console.log(`Restored active shift ID from localStorage: ${activeShiftId}`);
  }
}

export const shiftStore = {
  /**
   * ตั้งค่า ID ของกะที่กำลังทำงานอยู่
   * @param {number} shiftId - ID ของกะ
   */
  setActiveShift(shiftId) {
    if (shiftId) {
      activeShiftId = shiftId;
      localStorage.setItem('activeShiftId', JSON.stringify(shiftId));
      console.log(`Active shift ID set to: ${shiftId}`);
    }
  },

  /**
   * ล้างค่า ID ของกะที่ทำงานอยู่ (ใช้ตอนปิดกะ หรือออกจากระบบ)
   */
  clearActiveShift() {
    activeShiftId = null;
    localStorage.removeItem('activeShiftId');
    console.log('Active shift ID cleared.');
  },

  /**
   * ดึง ID ของกะที่กำลังทำงานอยู่
   * @returns {number|null}
   */
  getActiveShiftId() {
    return activeShiftId;
  }
};

// เริ่มต้นทำงานทันทีที่ไฟล์ถูก import
initialize();

