import { LoginPage } from '../pages/LoginPage.js';

const appContainer = document.getElementById('app');

const routes = {
  '/login': LoginPage,
};

// Router ที่ฉลาดขึ้น
export function router(path) {
  const pageComponent = routes[path] || routes['/login'];

  if (pageComponent && appContainer) {
    // เรียกใช้ Component เพื่อเอา object { view, postRender }
    const { view, postRender } = pageComponent();
    
    // 1. Render HTML ก่อน
    appContainer.innerHTML = view;
    
    // 2. เช็คว่ามีฟังก์ชัน postRender หรือไม่ ถ้ามีให้เรียกใช้
    if (typeof postRender === 'function') {
      postRender();
    }
  }
}
