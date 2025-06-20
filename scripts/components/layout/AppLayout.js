import { userStore } from '../../state/userStore.js';
import { navigate } from '../../router/index.js';

export function AppLayout() {
  const currentUser = userStore.getCurrentUser();
  if (!currentUser) {
    navigate('/login');
    return { view: '', postRender: () => {} };
  }

  // สร้างปุ่ม Admin เฉพาะเมื่อเป็น admin
  let adminMenuHtml = '';
  if (currentUser.role === 'admin') {
    adminMenuHtml = `
      <a href="/#/admin" class="sidebar__link" data-path="/admin">
        <span>🔧</span><span>จัดการร้าน</span>
      </a>
    `;
  }
  
  const view = `
    <div class="app-layout">
      <nav class="sidebar" id="main-sidebar">
        <div class="sidebar__profile">
          <div class="profile-avatar">${currentUser.name.charAt(0)}</div>
          <div class="profile-info">
            <div class="profile-name">${currentUser.name}</div>
            <div class="profile-role">${currentUser.role}</div>
          </div>
        </div>
        <div class="sidebar__menu">
          <a href="/#/pos" class="sidebar__link active" data-path="/pos">
            <span>🛒</span><span>ขายของ</span>
          </a>
          <a href="/#/history" class="sidebar__link" data-path="/history">
            <span>🧾</span><span>ประวัติการขาย</span>
          </a>
          <a href="#" class="sidebar__link" data-path="/add-stock">
            <span>📦</span><span>เพิ่มสต็อก</span>
          </a>
          <a href="#" class="sidebar__link" data-path="/close-shift">
            <span>📋</span><span>สรุปยอดขาย</span>
          </a>
          ${adminMenuHtml}
        </div>
        <div class="sidebar__footer">
          <button id="logout-button" class="sidebar__link sidebar__link--logout">
            <span>🔌</span><span>ออกจากระบบ</span>
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
        router.init(); // ใช้ router.init() เพื่อให้มัน redirect ไป /login เอง
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
