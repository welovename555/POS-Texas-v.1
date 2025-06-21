import { userStore } from './state/userStore.js';
import { AppLayout } from './components/layout/AppLayout.js';
import { LoginPage } from './pages/LoginPage.js';
import { router } from './router/index.js';

function main() {
  const appContainer = document.getElementById('app');
  const isLoggedIn = userStore.isLoggedIn();

  appContainer.innerHTML = '';
  appContainer.className = '';

  if (isLoggedIn) {
    appContainer.classList.add('layout--app');
    const { view, postRender } = AppLayout();
    appContainer.innerHTML = view;
    if (postRender) postRender();
    
    router.init();
  } else {
    appContainer.classList.add('layout--center');
    const { view, postRender } = LoginPage();
    appContainer.innerHTML = view;
    if (postRender) postRender();
  }
}

document.addEventListener('DOMContentLoaded', main);
