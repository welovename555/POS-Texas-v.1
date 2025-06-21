// scripts/pages/HistoryPage.js
import { fetchSalesHistory } from '../api/historyApi.js'

export async function HistoryPage() {
  const appContent = document.getElementById('app')
  appContent.innerHTML = `
    <div class="history-page">
      <h2>ประวัติการขาย</h2>

      <div class="filters">
        <label>จากวันที่: <input type="date" id="start-date"></label>
        <label>ถึงวันที่: <input type="date" id="end-date"></label>
        <button id="filter-btn">ค้นหา</button>
      </div>

      <div class="summary-box" id="summary-box"></div>

      <div class="table-wrapper">
        <table class="history-table">
          <thead>
            <tr>
              <th>วันที่</th>
              <th>เวลา</th>
              <th>สินค้า</th>
              <th>จำนวน</th>
              <th>ชำระ</th>
              <th>ราคา</th>
              <th>พนักงาน</th>
            </tr>
          </thead>
          <tbody id="history-body"></tbody>
        </table>
      </div>
    </div>
  `

  document.getElementById('filter-btn').addEventListener('click', loadHistoryData)
  loadHistoryData()
}

async function loadHistoryData() {
  const tbody = document.getElementById('history-body')
  const summaryBox = document.getElementById('summary-box')
  tbody.innerHTML = ''
  summaryBox.innerHTML = ''

  const startDate = document.getElementById('start-date').value || null
  const endDate = document.getElementById('end-date').value || null
  const data = await fetchSalesHistory(startDate, endDate)

  let totalCash = 0
  let totalTransfer = 0

  data.forEach((sale) => {
    const dateObj = new Date(sale.createdatlocal)
    const date = window.dateFns.format(dateObj, 'dd/MM/yyyy')
    const time = window.dateFns.format(dateObj, 'HH:mm:ss')

    if (sale.paymentType === 'cash') totalCash += parseFloat(sale.price) * sale.qty
    else if (sale.paymentType === 'transfer') totalTransfer += parseFloat(sale.price) * sale.qty

    const row = `
      <tr>
        <td>${date}</td>
        <td>${time}</td>
        <td>${sale.productname}</td>
        <td>${sale.qty}</td>
        <td>${sale.paymentType === 'cash' ? 'เงินสด' : 'โอน'}</td>
        <td>${parseFloat(sale.price).toFixed(2)}</td>
        <td>${sale.employeename}</td>
      </tr>
    `
    tbody.insertAdjacentHTML('beforeend', row)
  })

  summaryBox.innerHTML = `
    <p><strong>รวมเงินสด:</strong> ${totalCash.toFixed(2)} บาท</p>
    <p><strong>รวมโอน:</strong> ${totalTransfer.toFixed(2)} บาท</p>
  `
}
