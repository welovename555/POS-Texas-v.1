function handleNumpad(event) {
  const pinInput = document.getElementById('pin-input');
  const key = event.target.dataset.key;

  if (!key) return; // ถ้าคลิกนอกปุ่ม ให้ไม่ต้องทำอะไร

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

// Component ที่คืนค่าเป็น Object ที่มี view และ postRender
export function LoginPage() {
  const view = `
    <div class="login-page">
      <div class="login-page__form">
        <h1 class="login-page__title">Texas POS</h1>
        <p class="login-page__subtitle">กรุณาใส่รหัส PIN</p>
        
        <div class="login-page__pin-display">
          <input type="password" id="pin-input" class="pin-display__input" maxlength="4" readonly inputmode="numeric" pattern="[0-9]*">
        </div>

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

  // ฟังก์ชันที่จะถูกเรียกใช้หลังจาก HTML ถูก render ลงบนหน้าจอแล้ว
  const postRender = () => {
    const numpad = document.getElementById('numpad');
    // ใช้ Event Delegation เพื่อจัดการการคลิกทั้งหมดใน numpad
    numpad.addEventListener('click', handleNumpad);
  };

  return { view, postRender };
}
