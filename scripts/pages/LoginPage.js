import { signInWithPin } from '../api/authApi.js';
import { userStore } from '../state/userStore.js';
import { navigate } from '../router/index.js';

// --- Helper Functions for this page ---

function getDOMElements() {
  return {
    pinInput: document.getElementById('pin-input'),
    numpad: document.getElementById('numpad'),
    loginForm: document.querySelector('.login-page__form'), // เพิ่มการเข้าถึงฟอร์มหลัก
    errorMessage: document.getElementById('error-message'),
  };
}

// ฟังก์ชัน handleLogin ถูกปรับปรุงให้รับค่า pin โดยตรง
async function handleLogin(pin) {
  const { pinInput, loginForm, errorMessage } = getDOMElements();

  // แสดงสถานะว่ากำลังโหลด (เช่น ทำให้แป้นพิมพ์กดไม่ได้ชั่วคราว)
  loginForm.style.pointerEvents = 'none';
  errorMessage.textContent = 'กำลังตรวจสอบ...';

  try {
    const userData = await signInWithPin(pin);

    if (userData) {
      // --- Login Success ---
      userStore.signIn(userData);
      navigate('/pos');
    } else {
      // --- Login Failed (เพิ่ม Animation) ---
      errorMessage.textContent = 'รหัส PIN ไม่ถูกต้อง';
      loginForm.classList.add('shake'); // เพิ่ม class เพื่อให้สั่น
      pinInput.value = '';

      // หลังจาก Animation จบ (0.5 วินาที) ให้เอา class ออกเพื่อให้สั่นใหม่ได้
      setTimeout(() => {
        loginForm.classList.remove('shake');
        loginForm.style.pointerEvents = 'auto'; // คืนให้กดได้เหมือนเดิม
      }, 500);
    }
  } catch (error) {
    errorMessage.textContent = 'เกิดข้อผิดพลาดในการเชื่อมต่อ';
    loginForm.style.pointerEvents = 'auto';
  }
}

function handleNumpad(event) {
  const { pinInput } = getDOMElements();
  const key = event.target.dataset.key;

  if (!key || pinInput.value.length >= 4) {
    // ถ้ากดนอกปุ่ม หรือ PIN เต็มแล้ว ไม่ต้องทำอะไร
    if (key !== 'clear' && key !== 'backspace') return;
  }
  
  handleNumpad.errorMessageElement.textContent = ''; // เคลียร์ error message เมื่อเริ่มพิมพ์

  if (key >= '0' && key <= '9') {
    pinInput.value += key;
  } else if (key === 'clear') {
    pinInput.value = '';
  } else if (key === 'backspace') {
    pinInput.value = pinInput.value.slice(0, -1);
  }

  // --- Logic ใหม่: ล็อกอินอัตโนมัติ ---
  if (pinInput.value.length === 4) {
    handleLogin(pinInput.value);
  }
}

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
    const { numpad, errorMessage } = getDOMElements();
    handleNumpad.errorMessageElement = errorMessage; // ส่ง error message element ไปให้ฟังก์ชัน
    numpad.addEventListener('click', handleNumpad);
  };

  return { view, postRender };
}
