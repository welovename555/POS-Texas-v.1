import { userStore } from './state/userStore.js';
import { AppLayout } from './components/layout/AppLayout.js';
import { LoginPage } from './pages/LoginPage.js';
import { router } from './router/index.js';

function main() {
  const appContainer = document.getElementById('app');
  const isLoggedIn = userStore.isLoggedIn();

  // ล้างเนื้อหาและ class เก่าทิ้งก่อน
  appContainer.innerHTML = '';
  appContainer.className = '';

  if (isLoggedIn) {
    // ถ้าล็อกอินอยู่: ใช้ Layout หลักของแอป
    appContainer.classList.add('layout--app');
    const { view, postRender } = AppLayout();
    appContainer.innerHTML = view;
    if (postRender) postRender();
    
    router.init(); // สั่งให้ router จัดการเนื้อหาข้างใน
  } else {
    // ถ้ายังไม่ล็อกอิน: ใช้ Layout แบบจัดกลางสำหรับหน้า Login
    appContainer.classList.add('layout--center');
    const { view, postRender } = LoginPage();
    appContainer.innerHTML = view;
    if (postRender) postRender();
  }
}

// รอให้ DOM พร้อมเต็มที่ก่อน แล้วค่อยเริ่มการทำงาน
document.addEventListener('DOMContentLoaded', main);
