import { userStore } from '../../state/userStore.js';
import { router, navigate } from '../../router/index.js';

export function AppLayout() {
  const currentUser = userStore.getCurrentUser();
  if (!currentUser) { /*...*/ }

  let adminMenuHtml = '';
  if (currentUser.role === 'admin') {
    adminMenuHtml = `
      <a href="/#/admin" class="sidebar__link" data-path="/admin" title="จัดการร้าน">
        <i class="bi bi-gear-fill"></i>
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
            <i class="bi bi-cart4"></i>
          </a>
          <a href="/#/history" class="sidebar__link" data-path="/history" title="ประวัติการขาย">
            <i class="bi bi-receipt"></i>
          </a>
          <a href="#" class="sidebar__link" data-path="/add-stock" title="เพิ่มสต็อก">
            <i class="bi bi-box-seam"></i>
          </a>
          <a href="#" class="sidebar__link" data-path="/close-shift" title="สรุปยอดขาย">
            <i class="bi bi-clipboard-data"></i>
          </a>
          ${adminMenuHtml}
        </div>
        <div class="sidebar__footer">
          <button id="logout-button" class="sidebar__link sidebar__link--logout" title="ออกจากระบบ">
            <i class="bi bi-power"></i>
          </button>
        </div>
      </nav>
      <main class="main-content" id="main-content"></main>
    </div>
  `;

  const postRender = () => { /* ... โค้ดส่วนนี้เหมือนเดิม ... */ };

  return { view, postRender };
}
