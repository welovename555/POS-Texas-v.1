import { userStore } from '../state/userStore.js';
import { PosPage } from '../pages/PosPage.js';
import { AdminPage } from '../pages/AdminPage.js';
import { HistoryPage } from '../pages/HistoryPage.js';

const routes = {
  '/pos': PosPage,
  '/admin': AdminPage,
  '/history': HistoryPage,
  '/add-stock': () => ({ view: '<h1>Add Stock Page (Coming Soon)</h1>' }),
  '/close-shift': () => ({ view: '<h1>Close Shift Page (Coming Soon)</h1>' }),
};

const adminOnlyRoutes = ['/admin'];

function renderPage(path) {
  const contentContainer = document.getElementById('main-content');
  if (!contentContainer) return;

  const user = userStore.getCurrentUser();
  const isAdminRoute = adminOnlyRoutes.includes(path);

  // --- Route Protection ---
  if (isAdminRoute && user.role !== 'admin') {
    return navigate('/pos'); // ถ้าไม่ใช่ admin ให้เด้งกลับ
  }

  // --- Update Active Menu ---
  document.querySelectorAll('.sidebar__link').forEach(link => {
    link.classList.toggle('active', link.dataset.path === path);
  });
  
  // --- Render Page ---
  const pageComponent = routes[path] || routes['/pos'];
  const { view, postRender } = pageComponent();
  contentContainer.innerHTML = view;
  if (typeof postRender === 'function') {
    postRender();
  }
}

export function navigate(path) {
  const newPath = path.startsWith('/') ? path : '/' + path;
  window.location.hash = newPath;
}

export const router = {
  init() {
    const handleRouteChange = () => renderPage(window.location.hash.slice(1) || '/pos');
    window.addEventListener('hashchange', handleRouteChange);
    handleRouteChange(); // Render หน้าเริ่มต้น
  },
};
