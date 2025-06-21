import { getSalesHistoryByDate } from '../api/historyApi.js';

let isLoading = false;

// === Helper: แปลงเวลาให้อ่านง่าย (23:34 → 23:34 น.) ===
function formatThaiTime(isoString) {
  const date = new Date(isoString);
  return date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', hour12: false }) + ' น.';
}

// === Helper: Render ตารางประวัติการขาย ===
function renderHistoryTable(historyData) {
  const tableBody = document.getElementById('history-table-body');
  if (!tableBody) return;

  if (!historyData || historyData.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="5" class="text-center">ไม่พบข้อมูลการขายในวันที่เลือก</td></tr>';
    return;
  }

  // เรียงจากล่าสุด -> เก่าสุด
  historyData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const grouped = historyData.reduce((acc, sale) => {
    if (!acc[sale.transactionId]) acc[sale.transactionId] = [];
    acc[sale.transactionId].push(sale);
    return acc;
  }, {});

  let html = '';
  for (const transactionId in grouped) {
    const sales = grouped[transactionId];
    sales.forEach((sale, idx) => {
      const timeDisplay = formatThaiTime(sale.createdAt);
      const rowClass = idx === 0 ? 'transaction-start-row' : '';
      html += `
        <tr class="${rowClass}">
          <td>${timeDisplay}</td>
          <td>${sale.productName}</td>
          <td>${sale.quantity}</td>
          <td class="payment-type">${sale.paymentType === 'cash' ? 'เงินสด' : 'โอนชำระ'}</td>
          <td>${sale.employeeName}</td>
        </tr>
      `;
    });
  }

  tableBody.innerHTML = html;
}

// === Main: โหลดข้อมูลเมื่อกดค้นหา ===
async function fetchAndRenderHistory() {
  if (isLoading) return;

  const dateInput = document.getElementById('history-date-picker');
  const tableBody = document.getElementById('history-table-body');
  if (!dateInput || !tableBody) return;

  isLoading = true;
  tableBody.innerHTML = '<tr><td colspan="5" class="text-center">กำลังโหลด...</td></tr>';

  try {
    const historyData = await getSalesHistoryByDate(dateInput.value);
    renderHistoryTable(historyData);
  } catch (err) {
    console.error('[ERROR] Fetching history failed:', err);
    tableBody.innerHTML = '<tr><td colspan="5" class="text-center error">เกิดข้อผิดพลาดในการโหลดข้อมูล</td></tr>';
  }

  isLoading = false;
}

// === Event Listener ===
document.getElementById('history-search-btn')?.addEventListener('click', fetchAndRenderHistory);
