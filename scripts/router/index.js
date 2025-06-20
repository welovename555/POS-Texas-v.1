import { userStore } from '../state/userStore.js';
import { AppLayout } from '../components/layout/AppLayout.js'; // Import Layout ใหม่
import { LoginPage } from '../pages/LoginPage.js';
import { PosPage } from '../pages/PosPage.js';
import { AdminPage } from '../pages/AdminPage.js';
import { HistoryPage } from '../pages/HistoryPage.js'; // Import หน้าใหม่

const appContainer = document.getElementById('app');

const routes = {
  '/login': LoginPage,
  '/pos': PosPage,
  '/admin': AdminPage,
  '/history': HistoryPage, // เพิ่มเส้นทางใหม่
  // '/add-stock': AddStockPage, // สำหรับอนาคต
  // '/close-shift': CloseShiftPage, // สำหรับอนาคต
};

const protectedRoutes = ['/pos', '/admin', '/history', '/add-stock', '/close-shift'];
const adminOnlyRoutes = ['/admin'];

// ฟังก์ชัน render ใหม่ จะ render Page ลงใน #main-content
function renderPage(path) {
  const contentContainer = document.getElementById('main-content');
  if (!contentContainer) return;
  
  // อัปเดตสถานะ active ของเมนูใน Sidebar
  document.querySelectorAll('.sidebar__link').forEach(link => {
    if (link.dataset.path === path) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  const pageComponent = routes[path] || PosPage; // ถ้าหาไม่เจอ ให้ไปหน้า POS
  const { view, postRender } = pageComponent();
  contentContainer.innerHTML = view;
  if (typeof postRender === 'function') {
    postRender();
  }
}

export function navigate(path) {
  const newPath = path.startsWith('/') ? path : '/' + path;
  if (window.location.hash !== `#${newPath}`) {
    window.location.hash = newPath;
  } else {
    renderPage(newPath);
  }
}

export const router = {
  init() {
    const isLoggedIn = userStore.isLoggedIn();
    const path = window.location.hash.slice(1) || (isLoggedIn ? '/pos' : '/login');

    if (isLoggedIn) {
      // ถ้าล็อกอินอยู่ ให้ render AppLayout ก่อน แล้วค่อย render page
      appContainer.innerHTML = AppLayout().view;
      AppLayout().postRender();
      renderPage(path);
    } else {
      // ถ้ายังไม่ล็อกอิน ให้ render LoginPage
      if (path !== '/login') {
        navigate('/login');
      } else {
        const { view, postRender } = LoginPage();
        appContainer.innerHTML = view;
        if (postRender) postRender();
      }
    }

    window.onhashchange = () => {
      const newPath = window.location.hash.slice(1) || '/login';
      const stillLoggedIn = userStore.isLoggedIn();
      if(!stillLoggedIn) {
        // ถ้า session หมดอายุ ให้ refresh ทั้งหน้า
        window.location.reload();
        return;
      }
      renderPage(newPath);
    };
  },
};
