import { userStore } from '../state/userStore.js';
import { LoginPage } from '../pages/LoginPage.js';
import { PosPage } from '../pages/PosPage.js';
import { AdminPage } from '../pages/AdminPage.js';

const appContainer = document.getElementById('app');

const routes = {
  '/login': LoginPage,
  '/pos': PosPage,
  '/admin': AdminPage,
};

const protectedRoutes = ['/pos', '/admin'];
// ▼▼▼▼▼ เพิ่มกฎใหม่สำหรับ Admin ▼▼▼▼▼
const adminOnlyRoutes = ['/admin'];
// ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲

function render(path) {
  const isLoggedIn = userStore.isLoggedIn();
  const currentUser = userStore.getCurrentUser();

  // --- Route Protection Logic ---
  const isProtected = protectedRoutes.includes(path);
  if (isProtected && !isLoggedIn) {
    navigate('/login');
    return;
  }

  // ▼▼▼▼▼ เพิ่ม Logic ตรวจสอบสิทธิ์ Admin ▼▼▼▼▼
  const isAdminRoute = adminOnlyRoutes.includes(path);
  if (isAdminRoute && currentUser?.role !== 'admin') {
    console.warn(`Access denied: User with role '${currentUser?.role}' tried to access admin route '${path}'. Redirecting.`);
    navigate('/pos'); // ถ้าไม่ใช่ admin แล้วพยายามเข้าหน้า admin ให้เด้งกลับไปหน้า POS
    return;
  }
  // ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲

  if (path === '/login' && isLoggedIn) {
    navigate('/pos');
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

export function navigate(path) {
  // ทำให้ URL เป็น #/path เสมอถ้ามันยังไม่มี #
  const newPath = path.startsWith('/') ? path : '/' + path;
  if (window.location.hash !== `#${newPath}`) {
    window.location.hash = newPath;
  } else {
    // ถ้า hash เหมือนเดิม ให้ render ใหม่เฉยๆ (สำหรับกรณีที่ต้องการ refresh หน้าเดิม)
    render(newPath);
  }
}

export const router = {
  init() {
    window.addEventListener('hashchange', () => {
      const path = window.location.hash.slice(1) || '/login';
      render(path);
    });
    // Trigger initial render
    const initialPath = window.location.hash.slice(1) || '/login';
    navigate(initialPath);
  },
};
