// ในไฟล์ LoginPage.js ให้มองหาฟังก์ชัน handleLogin แล้วแก้ไขเฉพาะส่วนที่สำเร็จ
// ... (โค้ดส่วนอื่นเหมือนเดิม) ...

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
      // --- Login Success (ส่วนที่แก้ไข) ---
      userStore.signIn(userData);
      // เรียกใช้ navigate จาก router เพื่อเปลี่ยนหน้าไปยัง '/pos'
      navigate('/pos'); 

    } else {
      // --- Login Failed (เหมือนเดิม) ---
      errorMessage.textContent = 'รหัส PIN ไม่ถูกต้อง';
      pinInput.value = '';
      loginButton.textContent = originalButtonText;
      loginButton.disabled = false;
    }
  } catch (error) {
    // ... (เหมือนเดิม) ...
  }
}

// ฟังก์ชัน navigate จะถูก import เข้ามา
import { navigate } from '../router/index.js'; 
// ... (ส่วน import อื่นๆ และโค้ดที่เหลือของ LoginPage.js ก็เพิ่ม/แก้ไขตามนี้) ...
