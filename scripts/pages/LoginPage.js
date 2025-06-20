import { signInWithPin } from '../api/authApi.js';
import { userStore } from '../state/userStore.js';

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
  if (!loginForm || !errorMessage) return;
  loginForm.style.pointerEvents = 'none';
  errorMessage.textContent = 'กำลังตรวจสอบ...';
  try {
    const userData = await signInWithPin(pin);
    if (userData) {
      userStore.signIn(userData);
      window.location.hash = '#/pos';
      window.location.reload();
    } else {
      errorMessage.textContent = 'รหัส PIN ไม่ถูกต้อง';
      loginForm.classList.add('shake');
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

function handleNumpad(event) {
  const { pinInput, errorMessage } = getDOMElements();
  if(!pinInput || !errorMessage) return;
  const key = event.target.dataset.key;
  if (!key) return;
  if (errorMessage.textContent) { errorMessage.textContent = ''; }
  if (key === 'clear') { pinInput.value = ''; return; }
  if (key === 'backspace') { pinInput.value = pinInput.value.slice(0, -1); return; }
  if (pinInput.value.length < 4) { pinInput.value += key; }
  if (pinInput.value.length === 4) { handleLogin(pinInput.value); }
}

export function LoginPage() {
  const view = `
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
        <button class="numpad__button" data-key="clear">C</button>
        <button class="numpad__button" data-key="0">0</button>
        <button class="numpad__button" data-key="backspace">⌫</button>
      </div>
    </div>
  `;
  const postRender = () => {
    setTimeout(() => {
      const { numpad } = getDOMElements();
      if (numpad) {
        numpad.addEventListener('click', handleNumpad);
      } else {
        console.error('Login page: Numpad element not found!');
      }
    }, 0);
  };
  return { view, postRender };
}
