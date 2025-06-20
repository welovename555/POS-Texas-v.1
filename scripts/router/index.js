import { userStore } from '../state/userStore.js';
import { productStore } from '../state/productStore.js';
import { getProductsWithStock } from '../api/productApi.js';
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
  // เมื่อเราสร้างหน้าใหม่ๆ ก็จะมาเพิ่มที่นี่
  '/add-stock': PosPage, // Default to PosPage for now
  '/close-shift': PosPage, // Default to PosPage for now
};

// ฟังก์ชันสำหรับจัดการการโหลดข้อมูลของแต่ละหน้า
async function routeLoader(path) {
  const currentUser = userStore.getCurrentUser();
  if (!currentUser) return; // ไม่ต้องทำอะไรถ้าไม่ล็อกอิน

  // กฎ: ถ้าจะไปหน้า POS และยังไม่มีข้อมูลสินค้า ให้ไปโหลดมาก่อน
  if (path === '/pos' && productStore.getProducts().length === 0) {
    console.log('Router is loading products...');
    const products = await getProductsWithStock(currentUser.shopId);
    productStore.setProducts(products);
  }
  // ในอนาคต เราสามารถเพิ่มกฎสำหรับหน้า history ที่นี่ได้
}

async function render(path) {
  const isLoggedIn = userStore.isLoggedIn();
  const validPath = routes[path] ? path : '/pos'; // ถ้า path ไม่มีอยู่จริง ให้ไปที่ /pos

  if (!isLoggedIn && validPath !== '/login') { navigate('/login'); return; }
  if (isLoggedIn && validPath === '/login') { navigate('/pos'); return; }

  if (isLoggedIn) {
    appContainer.innerHTML = AppLayout().view;
    AppLayout().postRender();
    
    // ▼▼▼▼▼ การเปลี่ยนแปลงสำคัญ ▼▼▼▼▼
    // เรียกใช้ Loader เพื่อโหลดข้อมูลก่อน แล้วค่อย render page
    await routeLoader(validPath);

    const contentContainer = document.getElementById('main-content');
    const pageComponent = routes[validPath];
    if (contentContainer && pageComponent) {
      const { view, postRender } = pageComponent();
      contentContainer.innerHTML = view;
      if (postRender) postRender();
    }
    // ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲

  } else {
    const { view, postRender } = LoginPage();
    appContainer.innerHTML = view;
    if (postRender) postRender();
  }
}

export function navigate(path) {
  const newPath = path.startsWith('/') ? path : '/' + path;
  window.location.hash = newPath;
}

export const router = {
  init() {
    window.addEventListener('hashchange', () => render(window.location.hash.slice(1) || '/'));
    const initialPath = window.location.hash.slice(1) || (userStore.isLoggedIn() ? '/pos' : '/login');
    render(initialPath);
  },
};
