// ในไฟล์ LoginPage.js
// แก้ไขเฉพาะฟังก์ชัน handleLogin
async function handleLogin(pin) {
  const { loginForm, errorMessage } = getDOMElements();
  loginForm.style.pointerEvents = 'none';
  errorMessage.textContent = 'กำลังตรวจสอบ...';
  try {
    const userData = await signInWithPin(pin);
    if (userData) {
      userStore.signIn(userData);
      // ▼▼▼▼▼ จุดที่แก้ไขสำคัญที่สุด ▼▼▼▼▼
      window.location.reload(); // สั่งให้โหลดแอปใหม่ทั้งหมด
      // ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲
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
  } catch (error) { /* ... โค้ดเดิม ... */ }
}
