import { signInWithPin } from '../api/authApi.js';
import { userStore } from '../state/userStore.js';
import { navigate } from '../router/index.js';

// --- Helper Functions for this page ---

function getDOMElements() {
  return {
    pinInput: document.getElementById('pin-input'),
    numpad: document.getElementById('numpad'),
    loginForm: document.querySelector('.login-page__form'),
    errorMessage: document.getElementById('error-message'),
  };
}

async function handleLogin(pin) {
  const { loginForm, errorMessage } = getDOMElements();

  // ทำให้ปุ่มกดไม่ได้ชั่วคราวขณะตรวจสอบ
  loginForm.style.pointerEvents = 'none';
  errorMessage.textContent = 'กำลังตรวจสอบ...';

  try {
    const userData = await signInWithPin(pin);

    if (userData) {
      userStore.signIn(userData);
      navigate('/pos');
    } else {
      errorMessage.textContent = 'รหัส PIN ไม่ถูกต้อง';
      loginForm.classList.add('shake');
      
      // เคลียร์ค่าหลังจากสั่นเสร็จ
      setTimeout(() => {
        const { pinInput } = getDOMElements();
        if(pinInput) pinInput.value = '';
        loginForm.classList.remove('shake');
        loginForm.style.pointerEvents = 'auto';
      }, 500);
    }
  } catch (error) {
    errorMessage.textContent = 'เกิดข้อผิดพลาดในการเชื่อมต่อ';
    loginForm.style.pointerEvents = 'auto';
  }
}

// ▼▼▼▼▼ ปรับปรุง Logic ในฟังก์ชันนี้ใหม่ทั้งหมด ▼▼▼▼▼
function handleNumpad(event) {
  const { pinInput, errorMessage } = getDOMElements();
  const key = event.target.dataset.key;

  if (!key) return;

  // เคลียร์ข้อความ error เก่าทิ้งเมื่อผู้ใช้เริ่มพิมพ์
  if (errorMessage.textContent) {
    errorMessage.textContent = '';
  }

  // จัดการปุ่ม Clear และ Backspace ก่อน
  if (key === 'clear') {
    pinInput.value = '';
    return;
  }
  if (key === 'backspace') {
    pinInput.value = pinInput.value.slice(0, -1);
    return;
  }

  // จัดการปุ่มตัวเลข (จะเพิ่มได้ก็ต่อเมื่อยังไม่ครบ 4 ตัว)
  if (pinInput.value.length < 4) {
    pinInput.value += key;
  }

  // ตรวจสอบเพื่อล็อกอินอัตโนมัติ *หลังจาก* เพิ่มตัวเลขแล้ว
  if (pinInput.value.length === 4) {
    handleLogin(pinInput.value);
  }
}
// ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲

// --- Main Page Component ---

export function LoginPage() {
  const view = `
    <div class="login-page">
      <div class="login-page__form">
        <h1 class="login-page__title">Texas POS</h1>
        <p class="login-page__subtitle">กรุณาใส่รหัส PIN</p>
        
        <div class="login-page__pin-display">
          <input type="password" id="pin-input" class="pin-display__input" maxlength="4" readonly inputmode="numeric" pattern="[0-9]*">
        </div>

        <p id="error-message" class="login-page__error"></p>

        <div class="login-page__numpad" id="numpad">
          <button class="numpad__button" data-key="1">1</button>
          <button class="numpad__button" data-key="2">2</button>
          <button class="numpad__button" data-key="3">3</button>
          <button class="numpad__button" data-key="4">4</button>
          <button class="numpad__button" data-key="5">5</button>
          <button class="numpad__button" data-key="6">6</button>
          <button class="numpad__button" data-key="7">7</button>
          <button class="numpad__button" data-key="8">8</button>
          <button class="numpad__button" data-key="9">9</button>
          <button class="numpad__button numpad__button--clear" data-key="clear">C</button>
          <button class="numpad__button" data-key="0">0</button>
          <button class="numpad__button numpad__button--backspace" data-key="backspace">⌫</button>
        </div>
      </div>
    </div>
  `;

  const postRender = () => {
    const { numpad } = getDOMElements();
    numpad.addEventListener('click', handleNumpad);
  };

  return { view, postRender };
}
