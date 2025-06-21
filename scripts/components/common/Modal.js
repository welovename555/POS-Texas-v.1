// scripts/components/common/Modal.js

const MODAL_ID = 'app-modal';
const OVERLAY_ID = 'modal-overlay';

function createModalStructure(contentHtml) {
  const modalHtml = `
    <div class="modal-overlay" id="${OVERLAY_ID}"></div>
    <div class="modal" id="${MODAL_ID}">
      <button class="modal__close-btn" id="modal-close-btn">&times;</button>
      <div class="modal__content">
        ${contentHtml}
      </div>
    </div>
  `;
  return modalHtml;
}

function closeModal() {
  const modal = document.getElementById(MODAL_ID);
  const overlay = document.getElementById(OVERLAY_ID);
  if (modal && overlay) {
    modal.remove();
    overlay.remove();
    document.body.classList.remove('modal-open');
  }
}

export const Modal = {
  /**
   * เปิด Modal พร้อมกับใส่เนื้อหา HTML ที่ต้องการ
   * @param {string} contentHtml - เนื้อหา HTML ที่จะแสดงใน Modal
   * @param {function} afterOpenCallback - ฟังก์ชันที่จะรันหลังจาก Modal เปิดแล้ว (สำหรับ add event listener)
   */
  open(contentHtml, afterOpenCallback) {
    if (document.getElementById(MODAL_ID)) {
      return;
    }

    const modalStructure = createModalStructure(contentHtml);
    document.body.insertAdjacentHTML('beforeend', modalStructure);
    document.body.classList.add('modal-open');

    const closeBtn = document.getElementById('modal-close-btn');
    const overlay = document.getElementById(OVERLAY_ID);

    closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', closeModal);

    if (typeof afterOpenCallback === 'function') {
      afterOpenCallback();
    }
  },

  /**
   * ปิด Modal ที่เปิดอยู่
   */
  close: closeModal
};
