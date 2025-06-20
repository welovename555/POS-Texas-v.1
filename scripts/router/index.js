import { PosPage } from '../pages/PosPage.js';
import { AdminPage } from '../pages/AdminPage.js';
import { HistoryPage } from '../pages/HistoryPage.js';

const contentContainer = document.getElementById('main-content');

const routes = {
  '/pos': PosPage,
  '/admin': AdminPage,
  '/history': HistoryPage,
  '/add-stock': () => ({ view: '<h1>Add Stock Page</h1>' }),
  '/close-shift': () => ({ view: '<h1>Close Shift Page</h1>' }),
};

function render(path) {
  if (!contentContainer) return;

  // อัปเดตสถานะ active ของเมนูใน Sidebar
  document.querySelectorAll('.sidebar__link').forEach(link => {
    link.classList.toggle('active', link.dataset.path === path);
  });
  
  const pageComponent = routes[path] || routes['/pos']; // ถ้าหาไม่เจอ ให้ไปหน้า POS
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
    window.addEventListener('hashchange', () => render(window.location.hash.slice(1)));
    const initialPath = window.location.hash.slice(1) || '/pos';
    render(initialPath);
  },
};
