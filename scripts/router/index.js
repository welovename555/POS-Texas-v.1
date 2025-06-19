import { userStore } from '../state/userStore.js';
import { LoginPage } from '../pages/LoginPage.js';
import { PosPage } from '../pages/PosPage.js';

const appContainer = document.getElementById('app');

const routes = {
  '/login': LoginPage,
  '/pos': PosPage,
};

// รายชื่อหน้าที่ต้องล็อกอินก่อนถึงจะเข้าได้
const protectedRoutes = ['/pos'];

function render(path) {
  // --- Route Protection ---
  const isProtected = protectedRoutes.includes(path);
  const isLoggedIn = userStore.isLoggedIn();

  if (isProtected && !isLoggedIn) {
    console.log(`Route ${path} is protected. Redirecting to /login.`);
    navigate('/login'); // ถ้ายังไม่ล็อกอินและพยายามเข้าหน้าป้องกัน ให้เด้งไปหน้า login
    return;
  }

  if (path === '/login' && isLoggedIn) {
    navigate('/pos'); // ถ้าล็อกอินแล้วและพยายามเข้าหน้า login ให้เด้งไปหน้า pos
    return;
  }

  const pageComponent = routes[path] || routes['/login'];

  if (pageComponent && appContainer) {
    const { view, postRender } = pageComponent();
    appContainer.innerHTML = view;
    if (typeof postRender === 'function') {
      postRender();
    }
  }
}

// ฟังก์ชันสำหรับให้ไฟล์อื่นเรียกใช้เพื่อเปลี่ยนหน้า
export function navigate(path) {
  // อัปเดต URL ใน address bar โดยไม่โหลดหน้าใหม่
  window.history.pushState({}, path, window.location.origin + path);
  render(path);
}

// จัดการเมื่อผู้ใช้กดปุ่ม back/forward ของเบราว์เซอร์
window.onpopstate = () => {
  render(window.location.pathname);
};

// ส่งออก router ตัวหลัก ที่จะถูกเรียกใช้แค่ใน main.js
export const router = {
  init() {
    render(window.location.pathname);
  },
};
