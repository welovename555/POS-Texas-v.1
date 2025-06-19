// ตัวแปรสำหรับเก็บข้อมูลผู้ใช้ปัจจุบัน (state)
let currentUser = null;

// รายชื่อของฟังก์ชันที่จะถูกเรียกใช้เมื่อ state เปลี่ยนแปลง
const subscribers = new Set();

// ฟังก์ชันสำหรับแจ้งเตือน subscribers ทั้งหมด
function notify() {
  subscribers.forEach(callback => callback(currentUser));
}

// พยายามดึงข้อมูล session จาก localStorage เมื่อแอปเริ่มทำงาน
function initialize() {
  const userSession = localStorage.getItem('userSession');
  if (userSession) {
    currentUser = JSON.parse(userSession);
    console.log('Restored user session from localStorage:', currentUser);
  }
}

export const userStore = {
  /**
   * อนุญาตให้ส่วนอื่นของแอป "ติดตาม" การเปลี่ยนแปลงของ user state
   * @param {function} callback - ฟังก์ชันที่จะถูกเรียกใช้เมื่อ state เปลี่ยน
   * @returns {function} ฟังก์ชันสำหรับ "ยกเลิกการติดตาม"
   */
  subscribe(callback) {
    subscribers.add(callback);
    callback(currentUser); // เรียก callback ทันทีด้วยค่าปัจจุบัน
    return () => subscribers.delete(callback); // คืนค่าฟังก์ชันสำหรับ unsubscribe
  },

  /**
   * อัปเดต state เมื่อผู้ใช้ล็อกอินสำเร็จ
   * @param {object} userData - ข้อมูลพนักงานที่ได้มาจาก authApi
   */
  signIn(userData) {
    currentUser = userData;
    // เก็บข้อมูลลง localStorage เพื่อการจดจำ
    localStorage.setItem('userSession', JSON.stringify(userData));
    notify();
  },

  /**
   * ล้าง state เมื่อผู้ใช้ล็อกเอาต์
   */
  signOut() {
    currentUser = null;
    // ลบข้อมูลออกจาก localStorage
    localStorage.removeItem('userSession');
    notify();
  },

  /**
   * ดึงข้อมูลผู้ใช้ปัจจุบัน
   * @returns {object|null} ข้อมูลผู้ใช้ปัจจุบัน
   */
  getCurrentUser() {
    return currentUser;
  },

  /**
   * ตรวจสอบว่ามีผู้ใช้ล็อกอินอยู่หรือไม่
   * @returns {boolean}
   */
  isLoggedIn() {
    return !!currentUser;
  }
};

// เริ่มต้นการทำงานของ store ทันทีที่ไฟล์นี้ถูก import
initialize();
