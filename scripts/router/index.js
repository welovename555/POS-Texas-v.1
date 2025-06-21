import { userStore } from '../state/userStore.js';
import { productStore } from '../state/productStore.js';
import { getProductsWithStock } from '../api/productApi.js';
import { PosPage } from '../pages/PosPage.js';
import { AdminPage } from '../pages/AdminPage.js';
import { HistoryPage } from '../pages/HistoryPage.js';

const contentContainer = document.getElementById('main-content');

const routes = {
  '/pos': PosPage,
  '/admin': AdminPage,
  '/history': HistoryPage,
  '/add-stock': () => ({ view: '<h1>Add Stock Page (Coming Soon)</h1>' }),
  '/close-shift': () => ({ view: '<h1>Close Shift Page (Coming Soon)</h1>' }),
};

const adminOnlyRoutes = ['/admin'];

async function routeLoader(path) {
  const currentUser = userStore.getCurrentUser();
  if (!currentUser) return;

  if (path === '/pos' && productStore.getProducts().length === 0) {
    const products = await getProductsWithStock(currentUser.shopId);
    productStore.setProducts(products);
  }
}

async function renderPage(path) {
  if (!contentContainer) return;

  const user = userStore.getCurrentUser();
  const isAdminRoute = adminOnlyRoutes.includes(path);

  if (isAdminRoute && user.role !== 'admin') {
    return navigate('/pos');
  }

  document.querySelectorAll('.sidebar__link').forEach(link => {
    link.classList.toggle('active', link.dataset.path === path);
  });
  
  await routeLoader(path);

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
    handleRouteChange();
  },
};
