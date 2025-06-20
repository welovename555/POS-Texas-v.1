import { getSalesHistoryByDate } from '../api/historyApi.js';
// navigate ไม่ได้ถูกใช้ในไฟล์นี้ ผมลบออกเพื่อความสะอาด
// import { navigate } from '../router/index.js';

let isLoading = false;

// --- Helper Functions ---

function renderHistoryTable(historyData) {
  const tableBody = document.getElementById('history-table-body');
  if (!tableBody) return;

  if (historyData.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="5" class="text-center">ไม่พบข้อมูลการขายในวันที่เลือก</td></tr>';
    return;
  }

  const groupedByTransaction = historyData.reduce((acc, sale) => {
    if (!acc[sale.transactionId]) { acc[sale.transactionId] = []; }
    acc[sale.transactionId].push(sale);
    return acc;
  }, {});

  let html = '';
  for (const transactionId in groupedByTransaction) {
    const salesInTransaction = groupedByTransaction[transactionId];
    salesInTransaction.forEach((sale, index) => {
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
  if (!dateInput || !tableBody) return;

  isLoading = true;
  tableBody.innerHTML = '<tr><td colspan="5" class="text-center">กำลังโหลด...</td></tr>';
  
  // ▼▼▼▼▼ จุดที่แก้ไข ▼▼▼▼▼
  // ส่ง dateInput.value ซึ่งเป็น string "YYYY-MM-DD" ไปโดยตรง
  const historyData = await getSalesHistoryByDate(dateInput.value);
  // ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲

  renderHistoryTable(historyData);
  isLoading = false;
}

// --- Main Page Component ---
export function HistoryPage() {
  const today = new Date().toLocaleDateString('en-CA'); // ใช้ 'en-CA' เพื่อให้ได้ format "YYYY-MM-DD"

  const view = `
    <div class="page-container">
      <header class="page-header">
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
            <tbody id="history-table-body"></tbody>
          </table>
        </div>
      </main>
    </div>
  `;

  const postRender = () => {
    const fetchBtn = document.getElementById('fetch-history-btn');
    fetchBtn?.addEventListener('click', fetchAndRenderHistory);
    fetchAndRenderHistory();
  };

  return { view, postRender };
}
