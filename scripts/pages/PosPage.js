import { userStore } from '../state/userStore.js';
import { router } from '../router/index.js';

// --- Helper Functions for this page ---

function handleLogout() {
  console.log('User logging out...');
  userStore.signOut(); // ล้างข้อมูลผู้ใช้ออกจาก state และ localStorage
  router('/login'); // กลับไปที่หน้า login
}


// --- Main Page Component ---

export function PosPage() {
  const currentUser = userStore.getCurrentUser();

  // ป้องกันกรณีที่อาจจะเข้ามาหน้านี้ได้โดยไม่ได้ล็อกอิน
  if (!currentUser) {
    const view = `<div class="pos-page">
                    <p>เกิดข้อผิดพลาด: ไม่พบข้อมูลผู้ใช้</p>
                    <button id="back-to-login-btn">กลับไปหน้าล็อกอิน</button>
                  </div>`;

    const postRender = () => {
      document.getElementById('back-to-login-btn').addEventListener('click', () => router('/login'));
    };

    return { view, postRender };
  }

  // View หลักเมื่อมีผู้ใช้ล็อกอินอยู่
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

  const postRender = () => {
    const logoutButton = document.getElementById('logout-button');
    logoutButton.addEventListener('click', handleLogout);
  };

  return { view, postRender };
}
