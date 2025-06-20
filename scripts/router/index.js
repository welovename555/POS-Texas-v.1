import { userStore } from '../state/userStore.js';
import { PosPage } from '../pages/PosPage.js';
import { AdminPage } from '../pages/AdminPage.js';
import { HistoryPage } from '../pages/HistoryPage.js';

const contentContainer = document.getElementById('main-content');

const routes = {
  '/pos': PosPage,
  '/admin': AdminPage,
  '/history': HistoryPage,
  // สำหรับเมนูที่ยังไม่มีหน้าจริง จะให้ render หน้า فاضي หรือหน้า POS ก็ได้
  '/add-stock': () => ({ view: '<h1>Add Stock Page (Coming Soon)</h1>' }),
  '/close-shift': () => ({ view: '<h1>Close Shift Page (Coming Soon)</h1>' }),
};

const adminOnlyRoutes = ['/admin'];

function renderPage(path) {
  if (!contentContainer) {
    // ถ้ากำลังแสดงหน้า Login จะไม่มี #main-content ซึ่งเป็นเรื่องปกติ
    return;
  }
  
  // ตรวจสอบสิทธิ์ Admin
  const isAdminRoute = adminOnlyRoutes.includes(path);
  if (isAdminRoute && userStore.getCurrentUser().role !== 'admin') {
    navigate('/pos'); // ถ้าไม่ใช่ admin ให้เด้งกลับ
    return;
  }

  // อัปเดตสถานะ active ของเมนูใน Sidebar
  document.querySelectorAll('.sidebar__link').forEach(link => {
    link.classList.toggle('active', link.dataset.path === path);
  });
  
  const pageComponent = routes[path] || routes['/pos']; // ถ้าหา path ไม่เจอ ให้ไปหน้า POS
  const { view, postRender } = pageComponent();
  contentContainer.innerHTML = view;
  if (typeof postRender === 'function') {
    postRender();
  }
}

export function navigate(path) {
  const newPath = path.startsWith('/') ? path : '/' + path;
  // เปลี่ยน hash โดยตรง ซึ่งจะไปกระตุ้น 'hashchange' listener
  window.location.hash = newPath;
}

export const router = {
  init() {
    // listener นี้จะทำงานทุกครั้งที่ hash เปลี่ยน (เช่นการกดเมนู)
    window.addEventListener('hashchange', () => {
      const path = window.location.hash.slice(1) || '/pos';
      renderPage(path);
    });
    
    // Render หน้าเริ่มต้นเมื่อโหลดครั้งแรก
    const initialPath = window.location.hash.slice(1) || '/pos';
    renderPage(initialPath);
  },
};
