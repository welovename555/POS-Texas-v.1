import { userStore } from '../state/userStore.js';
import { LoginPage } from '../pages/LoginPage.js';
import { PosPage } from '../pages/PosPage.js';
import { AdminPage } from '../pages/AdminPage.js'; // Import หน้าใหม่

const appContainer = document.getElementById('app');

const routes = {
  '/login': LoginPage,
  '/pos': PosPage,
  '/admin': AdminPage, // เพิ่มเส้นทางใหม่
};

const protectedRoutes = ['/pos', '/admin'];

function render(path) {
  const isProtected = protectedRoutes.includes(path);
  const isLoggedIn = userStore.isLoggedIn();

  if (isProtected && !isLoggedIn) {
    navigate('/login');
    return;
  }
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

// เปลี่ยน `Maps` ให้ทำงานกับ hash
export function navigate(path) {
  window.location.hash = path;
}

// เปลี่ยน `init` ให้ทำงานกับ hash
export const router = {
  init() {
    // Render หน้าแรกตาม hash ที่มีอยู่ หรือไปที่ /login ถ้าไม่มี
    window.addEventListener('hashchange', () => {
      const path = window.location.hash.slice(1) || '/login';
      render(path);
    });

    // Render หน้าเริ่มต้นเมื่อโหลดแอปครั้งแรก
    const initialPath = window.location.hash.slice(1) || '/login';
    render(initialPath);
  },
};
