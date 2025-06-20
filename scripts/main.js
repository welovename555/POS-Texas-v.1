import { userStore } from './state/userStore.js';
import { AppLayout } from './components/layout/AppLayout.js';
import { LoginPage } from './pages/LoginPage.js';
import { router } from './router/index.js';

function main() {
  const appContainer = document.getElementById('app');
  const isLoggedIn = userStore.isLoggedIn();

  if (isLoggedIn) {
    // ถ้าล็อกอินอยู่แล้ว: ให้สร้าง Layout หลักทั้งหมด
    const { view, postRender } = AppLayout();
    appContainer.innerHTML = view;
    if (postRender) postRender();

    // แล้วค่อยให้ router จัดการเนื้อหาข้างใน
    router.init();
  } else {
    // ถ้ายังไม่ล็อกอิน: ให้แสดงแค่หน้า Login
    const { view, postRender } = LoginPage();
    appContainer.innerHTML = view;
    if (postRender) postRender();
  }
}

main();
