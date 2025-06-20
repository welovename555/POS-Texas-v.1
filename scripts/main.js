import { userStore } from './state/userStore.js';
import { AppLayout } from './components/layout/AppLayout.js';
import { LoginPage } from './pages/LoginPage.js';
import { router } from './router/index.js';

function main() {
  const appContainer = document.getElementById('app');
  const isLoggedIn = userStore.isLoggedIn();

  if (isLoggedIn) {
    const { view, postRender } = AppLayout();
    appContainer.innerHTML = view;
    if (postRender) postRender();
    
    // เรียกใช้ init ของ router
    router.init();
  } else {
    const { view, postRender } = LoginPage();
    appContainer.innerHTML = view;
    if (postRender) postRender();
  }
}

// รอให้ DOM พร้อมเต็มที่ก่อน แล้วค่อยเริ่มการทำงาน
document.addEventListener('DOMContentLoaded', main);
