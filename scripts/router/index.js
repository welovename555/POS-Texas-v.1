import { userStore } from '../state/userStore.js';
import { AppLayout } from '../components/layout/AppLayout.js';
import { LoginPage } from '../pages/LoginPage.js';
import { PosPage } from '../pages/PosPage.js';
import { AdminPage } from '../pages/AdminPage.js';
import { HistoryPage } from '../pages/HistoryPage.js';

const appContainer = document.getElementById('app');

const routes = {
  '/login': LoginPage,
  '/pos': PosPage,
  '/admin': AdminPage,
  '/history': HistoryPage,
};

const protectedRoutes = ['/pos', '/admin', 'history'];
const adminOnlyRoutes = ['/admin'];

// ฟังก์ชัน render ใหม่ จะ render ทั้ง Layout และ Page
function render(path) {
  const isLoggedIn = userStore.isLoggedIn();

  // --- Route Protection ---
  if (!isLoggedIn && path !== '/login') {
    navigate('/login');
    return;
  }
  if (isLoggedIn && path === '/login') {
    navigate('/pos');
    return;
  }
  
  const isAdminRoute = adminOnlyRoutes.includes(path);
  if (isLoggedIn && isAdminRoute && userStore.getCurrentUser().role !== 'admin') {
    navigate('/pos');
    return;
  }

  // --- Rendering ---
  if (isLoggedIn) {
    // ถ้าล็อกอินอยู่ ให้ render Layout หลักก่อน
    const { view, postRender: layoutPostRender } = AppLayout();
    appContainer.innerHTML = view;
    if (layoutPostRender) layoutPostRender();

    // จากนั้น render page ลงใน content area
    const contentContainer = document.getElementById('main-content');
    const pageComponent = routes[path] || PosPage;
    if (contentContainer && pageComponent) {
      const { view: pageView, postRender: pagePostRender } = pageComponent();
      contentContainer.innerHTML = pageView;
      if (pagePostRender) pagePostRender();
    }
  } else {
    // ถ้ายังไม่ล็อกอิน ให้ render หน้า Login
    const { view, postRender } = LoginPage();
    appContainer.innerHTML = view;
    if (postRender) postRender();
  }
}

// ฟังก์ชัน navigate จะมีหน้าที่แค่เปลี่ยน hash
export function navigate(path) {
  const newPath = path.startsWith('/') ? path : '/' + path;
  window.location.hash = newPath;
}

// init จะมีหน้าที่แค่ติดตั้ง listener
export const router = {
  init() {
    window.addEventListener('hashchange', () => render(window.location.hash.slice(1)));
    
    // Initial load
    const initialPath = window.location.hash.slice(1) || '/login';
    render(initialPath);
  },
};
