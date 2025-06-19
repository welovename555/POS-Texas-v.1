import { LoginPage } from '../pages/LoginPage.js';
// ในอนาคตจะ import Page อื่นๆ ที่นี่
// import { PosPage } from '../pages/PosPage.js';

const appContainer = document.getElementById('app');

// เก็บเส้นทางและ Page component ที่คู่กัน
const routes = {
  '/login': LoginPage,
  // '/pos': PosPage,
};

// ฟังก์ชันหลักของ Router
export function router(path) {
  const pageComponent = routes[path];

  if (pageComponent && appContainer) {
    // เรียกใช้ function component เพื่อเอา HTML string มา render
    appContainer.innerHTML = pageComponent();
  } else {
    // ถ้าไม่เจอ path ที่กำหนด ให้ไปที่หน้า login เสมอ
    appContainer.innerHTML = routes['/login']();
  }
}
