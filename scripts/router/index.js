import { userStore } from '../state/userStore.js';
import { PosPage } from '../pages/PosPage.js';
import { AdminPage } from '../pages/AdminPage.js';
import { HistoryPage } from '../pages/HistoryPage.js';
import { getProductsWithStock } from '../api/productApi.js';
import { productStore } from '../state/productStore.js';

const contentContainer = document.getElementById('main-content');

const routes = {
  '/pos': PosPage,
  '/admin': AdminPage,
  '/history': HistoryPage,
  // สำหรับเมนูที่ยังไม่มีหน้า เราจะแสดงข้อความบอกผู้ใช้
  '/add-stock': () => ({ view: '<h1>Coming Soon: Add Stock</h1>' }),
  '/close-shift': () => ({ view: '<h1>Coming Soon: Close Shift</h1>' }),
};

async function routeLoader(path) {
  const currentUser = userStore.getCurrentUser();
  if (!currentUser) return;
  if (path === '/pos' && productStore.getProducts().length === 0) {
    const products = await getProductsWithStock(currentUser.shopId);
    productStore.setProducts(products);
  }
}

function renderPage(path) {
  const contentContainer = document.getElementById('main-content');
  if (!contentContainer) { return; }

  document.querySelectorAll('.sidebar__link').forEach(link => {
    link.classList.toggle('active', link.dataset.path === path);
  });
  
  const pageComponent = routes[path] || routes['/pos'];
  const { view, postRender } = pageComponent();
  contentContainer.innerHTML = view;
  if (typeof postRender === 'function') {
    postRender();
  }
}

async function handleRouteChange() {
  const isLoggedIn = userStore.isLoggedIn();
  const path = window.location.hash.slice(1) || (isLoggedIn ? '/pos' : '/login');

  if (!isLoggedIn && path !== '/login') {
    navigate('/login');
    window.location.reload(); // บังคับให้ไปหน้า login จริงๆ
    return;
  }
  
  const isAdminRoute = ['/admin'].includes(path);
  if (isLoggedIn && isAdminRoute && userStore.getCurrentUser().role !== 'admin') {
    navigate('/pos');
    return;
  }

  // โหลดข้อมูลที่จำเป็นสำหรับหน้านั้นๆ ก่อน
  await routeLoader(path);
  // จากนั้นค่อย render
  renderPage(path);
}

export function navigate(path) {
  const newPath = path.startsWith('/') ? path : '/' + path;
  window.location.hash = newPath;
}

export const router = {
  init() {
    // ใช้ setTimeout เพื่อให้แน่ใจว่า DOM ของ AppLayout พร้อมแล้ว
    setTimeout(() => {
      window.addEventListener('hashchange', handleRouteChange);
      handleRouteChange(); // Render หน้าเริ่มต้น
    }, 0);
  },
};
