// Function-based Component ที่ทำหน้าที่สร้างและคืนค่าเป็น HTML string
export function LoginPage() {
  // เราจะใช้ String Literal ในการสร้างโครงสร้าง HTML ทั้งหมด
  // การตั้งชื่อ class แบบ BEM (Block__Element--Modifier) จะช่วยให้ CSS จัดการง่าย
  const view = `
    <div class="login-page">
      <div class="login-page__form">
        <h1 class="login-page__title">Texas POS</h1>
        <p class="login-page__subtitle">กรุณาใส่รหัส PIN</p>
        
        <div class="login-page__pin-display">
          <input type="password" id="pin-input" class="pin-display__input" maxlength="4" readonly>
        </div>

        <div class="login-page__numpad">
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

  return view;
}
