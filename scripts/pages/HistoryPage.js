import { getSalesHistoryByDate } from '../api/historyApi.js';
import { navigate } from '../router/index.js';

// --- State ภายในของหน้านี้ ---
let selectedDate = new Date();
let isLoading = false;

// --- Helper Functions ---

function renderHistoryTable(historyData) {
  const tableBody = document.getElementById('history-table-body');
  if (!tableBody) return;

  if (historyData.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="5" class="text-center">ไม่พบข้อมูลการขายในวันที่เลือก</td></tr>';
    return;
  }

  // จัดกลุ่มข้อมูลตาม transactionId
  const groupedByTransaction = historyData.reduce((acc, sale) => {
    if (!acc[sale.transactionId]) {
      acc[sale.transactionId] = [];
    }
    acc[sale.transactionId].push(sale);
    return acc;
  }, {});

  let html = '';
  for (const transactionId in groupedByTransaction) {
    const salesInTransaction = groupedByTransaction[transactionId];
    salesInTransaction.forEach((sale, index) => {
      // แสดงเส้นขอบเฉพาะแถวแรกของแต่ละ transaction
      const transactionClass = index === 0 ? 'transaction-start' : '';
      html += `
        <tr class="${transactionClass}">
          <td>${sale.time}</td>
          <td>${sale.productName}</td>
          <td>${sale.quantity}</td>
          <td>${sale.paymentType}</td>
          <td>${sale.employeeName}</td>
        </tr>
      `;
    });
  }
  tableBody.innerHTML = html;
}

async function fetchAndRenderHistory() {
  if (isLoading) return;

  const dateInput = document.getElementById('history-date-picker');
  const tableBody = document.getElementById('history-table-body');
  selectedDate = new Date(dateInput.value);
  isLoading = true;
  tableBody.innerHTML = '<tr><td colspan="5" class="text-center">กำลังโหลด...</td></tr>';
  
  const historyData = await getSalesHistoryByDate(selectedDate);
  renderHistoryTable(historyData);
  isLoading = false;
}

// --- Main Page Component ---
export function HistoryPage() {
  // ตั้งค่า default ของ date picker ให้เป็นวันที่ปัจจุบัน
  const today = new Date().toISOString().split('T')[0];

  const view = `
    <div class="page-container">
      <header class="main-header">
        <h1>ประวัติการขาย</h1>
        </header>
      <main class="main-content">
        <div class="history-controls">
          <label for="history-date-picker">เลือกวันที่:</label>
          <input type="date" id="history-date-picker" value="${today}">
          <button id="fetch-history-btn" class="btn-primary">ค้นหา</button>
        </div>
        <div class="history-table-container">
          <table class="history-table">
            <thead>
              <tr>
                <th>เวลา</th>
                <th>สินค้า</th>
                <th>จำนวน</th>
                <th>การชำระเงิน</th>
                <th>พนักงานขาย</th>
              </tr>
            </thead>
            <tbody id="history-table-body">
              </tbody>
          </table>
        </div>
      </main>
    </div>
  `;

  const postRender = () => {
    // เพิ่ม Event Listener ให้ปุ่มค้นหา
    const fetchBtn = document.getElementById('fetch-history-btn');
    fetchBtn.addEventListener('click', fetchAndRenderHistory);

    // โหลดข้อมูลของวันปัจจุบันขึ้นมาแสดงทันทีที่เปิดหน้า
    fetchAndRenderHistory();
  };

  return { view, postRender };
}
