export function AdminPage() {
  const view = `
    <div class="admin-page">
      <h1>Admin Dashboard</h1>
      <p>ส่วนจัดการสำหรับแอดมินกำลังอยู่ในระหว่างการพัฒนา...</p>
      <a href="/#/pos" class="nav-link">กลับไปหน้าขายของ</a>
    </div>
  `;

  const postRender = () => {
    // Add event listener for the link to use our router
    document.querySelector('.nav-link').addEventListener('click', (e) => {
      e.preventDefault();
      navigate('/pos');
    });
  };

  return { view, postRender };
}
