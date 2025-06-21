// scripts/pages/HistoryPage.js
import { fetchSalesHistory } from '../api/historyApi.js';
import { parseISO, format } from 'date-fns';

export default function HistoryPage() {
  const wrapper = document.getElementById('pos-page-wrapper');
  wrapper.innerHTML = `
    <section class="history-page">
      <h2>ประวัติการขาย</h2>
      
      <div class="filters">
        <label>จากวันที่: <input type="date" id="start-date"></label>
        <label>ถึงวันที่: <input type="date" id="end-date"></label>
        <button id="filter-btn">ค้นหา</button>
      </div>

      <div class="table-container">
        <table class="history-table">
          <thead>
            <tr>
              <th>วันเวลา</th>
              <th>สินค้า</th>
              <th>จำนวน</th>
              <th>ราคา</th>
              <th>ช่องทางชำระ</th>
              <th>พนักงาน</th>
            </tr>
          </thead>
          <tbody id="history-body">
            <tr><td colspan="6" style="text-align:center;">กำลังโหลด...</td></tr>
          </tbody>
        </table>
      </div>
    </section>
  `;

  document.getElementById('filter-btn').addEventListener('click', loadData);

  loadData();
}

async function loadData() {
  const tbody = document.getElementById('history-body');
  tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;">กำลังโหลดข้อมูล...</td></tr>`;

  const start = document.getElementById('start-date').value;
  const end = document.getElementById('end-date').value;

  try {
    const sales = await fetchSalesHistory(start, end);

    if (!sales || sales.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;">ไม่พบข้อมูล</td></tr>`;
      return;
    }

    const rows = sales.map(item => {
      const dateTime = format(parseISO(item.createdAtLocal), 'dd/MM/yyyy HH:mm:ss');
      const product = item.productname;
      const qty = item.qty;
      const price = parseFloat(item.price).toLocaleString('th-TH', { style: 'currency', currency: 'THB' });
      const payment = item.paymentType === 'cash' ? 'เงินสด' : 'โอน';
      const employee = item.employeename;

      return `
        <tr>
          <td>${dateTime}</td>
          <td>${product}</td>
          <td>${qty}</td>
          <td>${price}</td>
          <td>${payment}</td>
          <td>${employee}</td>
        </tr>
      `;
    });

    tbody.innerHTML = rows.join('');
  } catch (error) {
    console.error('[HistoryPage] โหลดข้อมูลล้มเหลว:', error);
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;">เกิดข้อผิดพลาด</td></tr>`;
  }
}
