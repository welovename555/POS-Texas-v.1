import { userStore } from '../state/userStore.js';
import { router } from '../router/index.js';
import { navigate } from '../router/index.js'; // เพิ่ม import navigate

function handleLogout() {
  console.log('User logging out...');
  userStore.signOut();
  router.init(); 
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
  // เปลี่ยนจาก .ชื่อ เป็น .name
  // เปลี่ยนจาก .ตำแหน่ง เป็น .role
  const view = `
    <div class="pos-page">
      <header class="pos-page__header">
        <h1>POS System</h1>
        <div class="user-info">
          <span>พนักงาน: <strong>${currentUser.name}</strong> (${currentUser.role})</span>
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
