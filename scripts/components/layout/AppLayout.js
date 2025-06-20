import { userStore } from '../../state/userStore.js';
import { navigate } from '../../router/index.js';

export function AppLayout() {
  const currentUser = userStore.getCurrentUser();
  if (!currentUser) { navigate('/login'); return { view: '' }; }

  let adminMenuHtml = '';
  if (currentUser.role === 'admin') {
    adminMenuHtml = `<a href="/#/admin" class="sidebar__link" data-path="/admin" title="จัดการร้าน"><i class="bi bi-gear-fill"></i></a>`;
  }
  
  const view = `
    <div class="app-layout">
      <nav class="sidebar" id="main-sidebar">
        <div class="sidebar__profile">
          <div class="profile-avatar">${currentUser.name.charAt(0)}</div>
        </div>
        <div class="sidebar__menu">
          <a href="/#/pos" class="sidebar__link" data-path="/pos" title="ขายของ"><i class="bi bi-cart4"></i></a>
          <a href="/#/history" class="sidebar__link" data-path="/history" title="ประวัติการขาย"><i class="bi bi-receipt"></i></a>
          <a href="/#/add-stock" class="sidebar__link" data-path="/add-stock" title="เพิ่มสต็อก"><i class="bi bi-box-seam"></i></a>
          <a href="/#/close-shift" class="sidebar__link" data-path="/close-shift" title="สรุปยอดขาย"><i class="bi bi-clipboard-data"></i></a>
          ${adminMenuHtml}
        </div>
        <div class="sidebar__footer">
          <button id="logout-button" class="sidebar__link sidebar__link--logout" title="ออกจากระบบ"><i class="bi bi-power"></i></button>
        </div>
      </nav>
      <main class="main-content" id="main-content"></main>
    </div>
  `;

  const postRender = () => {
    const sidebar = document.getElementById('main-sidebar');
    
    sidebar.addEventListener('click', (e) => {
      const link = e.target.closest('.sidebar__link');
      if (!link) return;
      e.preventDefault();

      if (link.id === 'logout-button') {
        userStore.signOut();
        window.location.reload(); // สั่งให้โหลดแอปใหม่ทั้งหมด
        return;
      }
      
      const path = link.dataset.path;
      if (path) { navigate(path); }
    });
  };

  return { view, postRender };
}
