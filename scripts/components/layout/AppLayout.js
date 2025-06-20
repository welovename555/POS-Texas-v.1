import { userStore } from '../../state/userStore.js';
import { router, navigate } from '../../router/index.js';

export function AppLayout() {
  const currentUser = userStore.getCurrentUser();
  if (!currentUser) {
    navigate('/login');
    return { view: '', postRender: () => {} };
  }

  let adminMenuHtml = '';
  if (currentUser.role === 'admin') {
    // เพิ่ม title="จัดการร้าน"
    adminMenuHtml = `
      <a href="/#/admin" class="sidebar__link" data-path="/admin" title="จัดการร้าน">
        <span>🔧</span>
      </a>
    `;
  }
  
  const view = `
    <div class="app-layout">
      <nav class="sidebar" id="main-sidebar">
        <div class="sidebar__profile">
          <div class="profile-avatar">${currentUser.name.charAt(0)}</div>
        </div>
        <div class="sidebar__menu">
          <a href="/#/pos" class="sidebar__link active" data-path="/pos" title="ขายของ">
            <span>🛒</span>
          </a>
          <a href="/#/history" class="sidebar__link" data-path="/history" title="ประวัติการขาย">
            <span>🧾</span>
          </a>
          <a href="#" class="sidebar__link" data-path="/add-stock" title="เพิ่มสต็อก">
            <span>📦</span>
          </a>
          <a href="#" class="sidebar__link" data-path="/close-shift" title="สรุปยอดขาย">
            <span>📋</span>
          </a>
          ${adminMenuHtml}
        </div>
        <div class="sidebar__footer">
          <button id="logout-button" class="sidebar__link sidebar__link--logout" title="ออกจากระบบ">
            <span>🔌</span>
          </button>
        </div>
      </nav>
      <main class="main-content" id="main-content">
        </main>
    </div>
  `;

  const postRender = () => {
    const sidebar = document.getElementById('main-sidebar');
    
    sidebar.addEventListener('click', (e) => {
      e.preventDefault();
      const link = e.target.closest('.sidebar__link');
      if (!link) return;

      if (link.id === 'logout-button') {
        userStore.signOut();
        navigate('/login');
        return;
      }

      const path = link.dataset.path;
      if (path) {
        navigate(path);
      }
    });
  };

  return { view, postRender };
}
