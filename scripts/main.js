import { router } from './router/index.js';

function initializeApp() {
  console.log('App Initializing with Router...');
  // เริ่มต้นการทำงานของ Router
  router.init();
}

initializeApp();
