import { router } from './router/index.js';
// ไม่ต้อง import supabase ที่นี่แล้ว เพราะแต่ละส่วนจะไปเรียกใช้ใน api ของตัวเอง

// ฟังก์ชันหลักของแอป จะเหลือหน้าที่แค่เริ่มการทำงานของ Router
function initializeApp() {
  console.log('Router Initializing...');
  // เริ่มต้นโดยการบอกให้ router ไปที่หน้า '/login'
  router('/login');
}

initializeApp();
