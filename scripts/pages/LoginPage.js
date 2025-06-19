import { signInWithPin } from '../api/authApi.js';
import { userStore } from '../state/userStore.js';
import { navigate } from '../router/index.js';

// --- Helper Functions for this page ---

function getDOMElements() {
  return {
    pinInput: document.getElementById('pin-input'),
    numpad: document.getElementById('numpad'),
    loginButton: document.getElementById('login-button'),
    errorMessage: document.getElementById('error-message'),
  };
}

function handleNumpad(event) {
  const { pinInput, errorMessage } = getDOMElements();
  const key = event.target.dataset.key;

  if (!key) return;

  if (errorMessage.textContent) {
    errorMessage.textContent = '';
  }

  if (key >= '0' && key <= '9') {
    if (pinInput.value.length < 4) {
      pinInput.value += key;
    }
  } else if (key === 'clear') {
    pinInput.value = '';
  } else if (key === 'backspace') {
    pinInput.value = pinInput.value.slice(0, -1);
  }
}

async function handleLogin() {
  const { pinInput, loginButton, errorMessage } = getDOMElements();
  const pin = pinInput.value;

  if (pin.length < 4) return;

  const originalButtonText = loginButton.textContent;
  loginButton.textContent = 'กำลังตรวจสอบ...';
  loginButton.disabled = true;

  try {
    const userData = await signInWithPin(pin);

    if (userData) {
      userStore.signIn(userData);
      navigate('/pos');
    } else {
      errorMessage.textContent = 'รหัส PIN ไม่ถูกต้อง';
      pinInput.value = '';
      loginButton.textContent = originalButtonText;
      loginButton.disabled = false;
    }
  } catch (error) {
    errorMessage.textContent = 'เกิดข้อผิดพลาดในการเชื่อมต่อ';
    loginButton.textContent = originalButtonText;
    loginButton.disabled = false;
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

        <button class="login-page__button" id="login-button">เข้าสู่ระบบ</button>
      </div>
    </div>
  `;

  const postRender = () => {
    const { numpad, loginButton } = getDOMElements();
    numpad.addEventListener('click', handleNumpad);
    loginButton.addEventListener('click', handleLogin);
  };

  return { view, postRender };
}
