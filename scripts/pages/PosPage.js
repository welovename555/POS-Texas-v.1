import { userStore } from '../state/userStore.js';
import { router } from '../router/index.js';

function handleLogout() {
  console.log('User logging out...');
  userStore.signOut();
  router.init(); // เรียก init() เพื่อให้ router ตัดสินใจไปหน้า login เอง
}

export function PosPage() {
  const currentUser = userStore.getCurrentUser();

  if (!currentUser) {
    const view = `<div class="pos-page">
                    <p>เกิดข้อผิดพลาด: ไม่พบข้อมูลผู้ใช้</p>
                    <button id="back-to-login-btn">กลับไปหน้าล็อกอิน</button>
                  </div>`;
    const postRender = () => {
      document.getElementById('back-to-login-btn').addEventListener('click', () => navigate('/login'));
    };
    return { view, postRender };
  }

  // ▼▼▼▼▼ จุดที่แก้ไข ▼▼▼▼▼
  // เปลี่ยนจาก .name เป็น .ชื่อ
  // เปลี่ยนจาก .role เป็น .ตำแหน่ง
  const view = `
    <div class="pos-page">
      <header class="pos-page__header">
        <h1>POS System</h1>
        <div class="user-info">
          <span>พนักงาน: <strong>${currentUser.ชื่อ}</strong> (${currentUser.ตำแหน่ง})</span>
          <button id="logout-button" class="logout-button">ออกจากระบบ</button>
        </div>
      </header>
      <main class="pos-page__main">
        <p>หน้าขายของกำลังอยู่ในระหว่างการพัฒนา...</p>
      </main>
    </div>
  `;
  // ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲

  const postRender = () => {
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
      logoutButton.addEventListener('click', handleLogout);
    }
  };

  return { view, postRender };
}
