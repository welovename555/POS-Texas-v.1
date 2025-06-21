// scripts/pages/HistoryPage.js

import { userStore } from '../state/userStore.js';
import { fetchSalesHistory } from '../api/historyApi.js';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';

export function HistoryPage() {
  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');

  const view = `
    <div class="page-content-wrapper history-page">
      <h1 class="page-title">ประวัติการขาย</h1>
      <div class="history-date-selector">
        <label for="history-date">เลือกวันที่:</label>
        <input type="date" id="history-date" value="${todayStr}" />
        <button id="fetch-history-btn">ค้นหา</button>
      </div>
      <div class="history-table-container" id="history-table-container">
        <p>กรุณาเลือกวันที่เพื่อดูรายการขาย</p>
      </div>
    </div>
  `;

  const postRender = () => {
    document.getElementById('fetch-history-btn')?.addEventListener('click', async () => {
      const date = document.getElementById('history-date').value;
      const currentUser = userStore.getCurrentUser();
      if (!currentUser || !date) return;

      const { data: sales } = await fetchSalesHistory(date, currentUser.shopId);

      const tableContainer = document.getElementById('history-table-container');

      if (!sales || sales.length === 0) {
        tableContainer.innerHTML = `<p>ไม่พบรายการขายในวันที่เลือก</p>`;
        return;
      }

      // Group by transactionId
      const grouped = {};
      sales.forEach((sale) => {
        if (!grouped[sale.transactionId]) {
          grouped[sale.transactionId] = {
            time: format(new Date(sale.createdAt), 'HH:mm'),
            employee: sale.employeeId,
            paymentType: sale.paymentType,
            items: [],
          };
        }
        grouped[sale.transactionId].items.push({
          name: sale.product.name,
          qty: sale.qty,
        });
      });

      // Convert and sort
      const sortedSales = Object.entries(grouped)
        .sort((a, b) => new Date(b[1].time) - new Date(a[1].time));

      const html = `
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
          <tbody>
            ${sortedSales
              .map(
                ([_, tx]) =>
                  tx.items
                    .map(
                      (item, index) => `
                  <tr>
                    ${index === 0 ? `<td rowspan="${tx.items.length}">${tx.time}</td>` : ''}
                    <td>${item.name}</td>
                    <td>${item.qty}</td>
                    ${index === 0 ? `<td rowspan="${tx.items.length}">${tx.paymentType}</td>` : ''}
                    ${index === 0 ? `<td rowspan="${tx.items.length}">${tx.employee}</td>` : ''}
                  </tr>`
                    )
                    .join('')
              )
              .join('')}
          </tbody>
        </table>
      `;

      tableContainer.innerHTML = html;
    });
  };

  return { view, postRender };
}
