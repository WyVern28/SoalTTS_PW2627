'use strict';

/**
 * ============================================================================
 * KANTINBIRU - PUJASERA MAHASISWA FTI (LOGIKA BISNIS & KONTROL APLIKASI)
 * ============================================================================
 * Fitur:
 * 1. Kalkulasi subtotal dari menu yang dipilih (kuantitas × harga satuan).
 * 2. Aturan diskon: Diskon 5% berlaku otomatis jika subtotal mencapai minimal Rp 100.000.
 * 3. Pembaruan rincian pesanan secara langsung (real-time).
 * 4. Kontrol kuantitas dengan tombol stepper (+ / -) dan input langsung (batas 0 - 99).
 * 5. Sinkronisasi dua arah antara kartu menu dan ringkasan pesanan.
 * 6. Validasi penolakan pembayaran saat keranjang kosong.
 * 7. Simulasi pembayaran via modal interaktif:
 *    - Pembayaran dibatalkan -> pesanan dipertahankan utuh.
 *    - Pembayaran berhasil -> struk simulasi ditampilkan & pesanan dikosongkan.
 * ============================================================================
 */

// Konstanta Aturan Bisnis
const DISCOUNT_MINIMUM = 100000; // Ambang batas minimal subtotal untuk diskon
const DISCOUNT_RATE = 0.05;      // Besaran diskon 5%
const MAX_QUANTITY = 99;         // Batas maksimum porsi per item
const MIN_QUANTITY = 0;          // Batas minimum porsi per item

// Formatter Rupiah Indonesia
const rupiahFormatter = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0
});

/**
 * Memformat angka nominal menjadi representasi string Rupiah standar.
 * @param {number} amount - Angka yang akan diformat.
 * @returns {string} String format Rupiah (contoh: "Rp 18.000").
 */
function formatRupiah(amount) {
  const safeAmount = Number.isFinite(amount) ? amount : 0;
  return rupiahFormatter.format(safeAmount).replace(/\u00a0/g, ' ');
}

/**
 * Memvalidasi dan membersihkan nilai kuantitas agar selalu berada pada rentang 0 - 99.
 * @param {any} value - Nilai masukan.
 * @returns {number} Bilangan bulat antara 0 dan 99.
 */
function sanitizeQuantity(value) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < MIN_QUANTITY) {
    return MIN_QUANTITY;
  }
  return Math.min(parsed, MAX_QUANTITY);
}

/**
 * Fungsi murni untuk menghitung subtotal, diskon, dan total pesanan.
 * @param {Array<{id: string, name: string, price: number, quantity: number}>} items - Daftar item menu.
 * @returns {Object} Hasil perhitungan pesanan.
 */
function calculateOrder(items) {
  let subtotal = 0;
  let totalJenisMenu = 0;
  let totalPorsi = 0;
  const activeItems = [];

  if (Array.isArray(items)) {
    items.forEach((item) => {
      const quantity = sanitizeQuantity(item.quantity);
      const price = Math.max(0, Number(item.price) || 0);

      if (quantity > 0) {
        const itemSubtotal = quantity * price;
        subtotal += itemSubtotal;
        totalJenisMenu += 1;
        totalPorsi += quantity;

        activeItems.push({
          id: item.id || '',
          name: item.name || 'Menu Kantin',
          price: price,
          quantity: quantity,
          subtotal: itemSubtotal
        });
      }
    });
  }

  // Aturan diskon 5% jika subtotal >= Rp 100.000
  const hasDiscount = subtotal >= DISCOUNT_MINIMUM;
  const discount = hasDiscount ? Math.round(subtotal * DISCOUNT_RATE) : 0;
  const total = Math.max(0, subtotal - discount);

  // Perhitungan persentase menuju diskon Rp 100.000
  const progressPercent = Math.min(100, Math.round((subtotal / DISCOUNT_MINIMUM) * 100));
  const remainingForDiscount = Math.max(0, DISCOUNT_MINIMUM - subtotal);

  return {
    subtotal,
    discount,
    total,
    totalJenisMenu,
    totalPorsi,
    activeItems,
    hasDiscount,
    progressPercent,
    remainingForDiscount
  };
}

// Inisialisasi DOM ketika berjalan di peramban web
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    // Referensi Elemen DOM Menu & Keranjang
    const menuCards = Array.from(document.querySelectorAll('.menu-card'));
    const orderListElement = document.getElementById('pesanan-list');
    const emptyStateElement = document.getElementById('empty-state');
    const orderActionsBar = document.getElementById('order-actions-bar');
    const subtotalElement = document.getElementById('subtotal');
    const discountElement = document.getElementById('diskon');
    const totalElement = document.getElementById('total-harga');
    const discountHint = document.getElementById('discount-hint');
    const discountProgressFill = document.getElementById('discount-progress-fill');
    const discountPill = document.getElementById('discount-pill');
    const payButton = document.getElementById('pay-button');
    const orderAlert = document.getElementById('order-alert');
    const alertText = document.getElementById('alert-text');
    const alertCloseBtn = document.getElementById('alert-close-btn');
    const btnClearOrder = document.getElementById('btn-clear-order');
    const orderItemCount = document.getElementById('order-item-count');
    const orderItemsTotalLabel = document.getElementById('order-items-total-label');
    const navCartCount = document.getElementById('nav-cart-count');
    const orderNoteInput = document.getElementById('order-note');

    // Referensi Elemen Modal Pembayaran
    const paymentModal = document.getElementById('payment-modal');
    const modalReviewView = document.getElementById('modal-review-view');
    const modalSuccessView = document.getElementById('modal-success-view');
    const modalItemsList = document.getElementById('modal-items-list');
    const modalSubtotal = document.getElementById('modal-subtotal');
    const modalDiscount = document.getElementById('modal-discount');
    const modalDiscountRow = document.getElementById('modal-discount-row');
    const modalTotal = document.getElementById('modal-total');
    const modalServiceDisplay = document.getElementById('modal-service-display');
    const modalNotesDisplay = document.getElementById('modal-notes-display');
    const btnCancelPayment = document.getElementById('btn-cancel-payment');
    const btnConfirmPayment = document.getElementById('btn-confirm-payment');
    const modalCloseX = document.getElementById('modal-close-x');
    const btnSuccessFinish = document.getElementById('btn-success-finish');

    // Struk Sukses Elemen
    const receiptId = document.getElementById('receipt-id');
    const receiptTime = document.getElementById('receipt-time');
    const receiptMethod = document.getElementById('receipt-method');
    const receiptService = document.getElementById('receipt-service');
    const receiptTotal = document.getElementById('receipt-total');

    /**
     * Mengambil seluruh data menu beserta kuantitas saat ini dari DOM.
     * @returns {Array<Object>}
     */
    function getCurrentMenuItems() {
      return menuCards.map((card) => {
        const input = card.querySelector('.qty');
        return {
          id: card.dataset.id,
          name: card.dataset.name,
          price: Number.parseInt(card.dataset.price, 10) || 0,
          quantity: input ? sanitizeQuantity(input.value) : 0
        };
      });
    }

    /**
     * Memperbarui kuantitas untuk item tertentu dan mensinkronisasikan ke input kartu menu.
     * @param {string} id - ID menu.
     * @param {number} newQuantity - Kuantitas baru.
     */
    function setItemQuantity(id, newQuantity) {
      const safeQty = sanitizeQuantity(newQuantity);
      const card = menuCards.find((c) => c.dataset.id === id);
      if (card) {
        const input = card.querySelector('.qty');
        if (input) {
          input.value = String(safeQty);
        }
      }
      hideAlert();
      updateApp();
    }

    /**
     * Menampilkan pesan peringatan / validasi inline.
     * @param {string} message - Pesan kesalahan.
     */
    function showAlert(message) {
      if (orderAlert && alertText) {
        alertText.textContent = message;
        orderAlert.hidden = false;
        orderAlert.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }

    /**
     * Menyembunyikan pesan peringatan / validasi inline.
     */
    function hideAlert() {
      if (orderAlert) {
        orderAlert.hidden = true;
      }
    }

    /**
     * Merender satu baris pesanan dalam daftar ringkasan pesanan.
     * Termasuk tombol stepper (+ / -) dan hapus langsung di ringkasan pesanan.
     */
    function createOrderItemElement(item) {
      const row = document.createElement('div');
      row.className = 'order-item-row';
      row.dataset.id = item.id;

      // Detail nama dan harga satuan
      const details = document.createElement('div');
      details.className = 'order-item-details';

      const nameEl = document.createElement('div');
      nameEl.className = 'order-item-name';
      nameEl.textContent = item.name;

      const metaEl = document.createElement('div');
      metaEl.className = 'order-item-meta';
      metaEl.textContent = `${formatRupiah(item.price)} / porsi`;

      details.append(nameEl, metaEl);

      // Stepper di dalam ringkasan pesanan
      const stepper = document.createElement('div');
      stepper.className = 'order-item-stepper';

      const btnMinus = document.createElement('button');
      btnMinus.type = 'button';
      btnMinus.className = 'btn-item-step';
      btnMinus.textContent = '−';
      btnMinus.setAttribute('aria-label', `Kurangi 1 porsi ${item.name}`);
      btnMinus.addEventListener('click', () => {
        setItemQuantity(item.id, item.quantity - 1);
      });

      const qtySpan = document.createElement('span');
      qtySpan.className = 'order-item-qty';
      qtySpan.textContent = String(item.quantity);

      const btnPlus = document.createElement('button');
      btnPlus.type = 'button';
      btnPlus.className = 'btn-item-step';
      btnPlus.textContent = '+';
      btnPlus.setAttribute('aria-label', `Tambah 1 porsi ${item.name}`);
      btnPlus.disabled = item.quantity >= MAX_QUANTITY;
      btnPlus.addEventListener('click', () => {
        setItemQuantity(item.id, item.quantity + 1);
      });

      stepper.append(btnMinus, qtySpan, btnPlus);

      // Subtotal per item
      const subtotalEl = document.createElement('div');
      subtotalEl.className = 'order-item-subtotal';
      subtotalEl.textContent = formatRupiah(item.subtotal);

      // Tombol hapus item
      const btnRemove = document.createElement('button');
      btnRemove.type = 'button';
      btnRemove.className = 'btn-remove-item';
      btnRemove.innerHTML = '&times;';
      btnRemove.setAttribute('aria-label', `Hapus ${item.name} dari keranjang`);
      btnRemove.addEventListener('click', () => {
        setItemQuantity(item.id, 0);
      });

      row.append(details, stepper, subtotalEl, btnRemove);
      return row;
    }

    /**
     * Memperbarui seluruh tampilan aplikasi, menghitung kalkulasi, dan memperbarui state.
     */
    function updateApp() {
      const items = getCurrentMenuItems();
      const order = calculateOrder(items);

      // 1. Perbarui state visual kartu menu & tombol stepper kartu
      menuCards.forEach((card) => {
        const id = card.dataset.id;
        const input = card.querySelector('.qty');
        const qty = input ? sanitizeQuantity(input.value) : 0;
        const btnMinus = card.querySelector('.btn-minus');
        const btnPlus = card.querySelector('.btn-plus');

        // Pastikan isi input valid di layar
        if (input && input.value !== String(qty)) {
          input.value = String(qty);
        }

        // Disable tombol minus jika 0, disable plus jika >= 99
        if (btnMinus) btnMinus.disabled = qty <= MIN_QUANTITY;
        if (btnPlus) btnPlus.disabled = qty >= MAX_QUANTITY;

        // Beri kelas is-selected jika porsi > 0
        if (qty > 0) {
          card.classList.add('is-selected');
        } else {
          card.classList.remove('is-selected');
        }
      });

      // 2. Perbarui daftar item pesanan
      const fragment = document.createDocumentFragment();
      order.activeItems.forEach((item) => {
        fragment.appendChild(createOrderItemElement(item));
      });
      orderListElement.replaceChildren(fragment);

      // 3. Perbarui state kosong vs terisi
      const hasItems = order.totalJenisMenu > 0;
      if (emptyStateElement) emptyStateElement.hidden = hasItems;
      if (orderActionsBar) orderActionsBar.hidden = !hasItems;

      // 4. Perbarui indikator jumlah pesanan
      const countLabel = `${order.totalJenisMenu} Menu Terpilih`;
      if (orderItemCount) orderItemCount.textContent = countLabel;
      if (navCartCount) navCartCount.textContent = `${order.totalPorsi} Porsi`;
      if (orderItemsTotalLabel) {
        orderItemsTotalLabel.textContent = `Total: ${order.totalPorsi} porsi (${order.totalJenisMenu} menu)`;
      }

      // 5. Perbarui angka subtotal, diskon, dan total tagihan
      if (subtotalElement) subtotalElement.textContent = formatRupiah(order.subtotal);
      if (discountElement) discountElement.textContent = `− ${formatRupiah(order.discount)}`;
      if (totalElement) totalElement.textContent = formatRupiah(order.total);

      // 6. Perbarui widget progress diskon 5%
      if (discountProgressFill) {
        discountProgressFill.style.width = `${order.progressPercent}%`;
        if (order.hasDiscount) {
          discountProgressFill.classList.add('is-qualified');
        } else {
          discountProgressFill.classList.remove('is-qualified');
        }
      }

      if (discountPill) {
        if (order.hasDiscount) {
          discountPill.classList.add('is-qualified');
        } else {
          discountPill.classList.remove('is-qualified');
        }
      }

      if (discountHint) {
        if (order.subtotal === 0) {
          discountHint.textContent = 'Belanja minimal Rp 100.000 untuk mendapatkan diskon 5%.';
          discountHint.classList.remove('is-active');
        } else if (order.hasDiscount) {
          discountHint.textContent = `Mantap! Diskon 5% sebesar ${formatRupiah(order.discount)} sudah aktif pada pesananmu.`;
          discountHint.classList.add('is-active');
        } else {
          discountHint.textContent = `Tambah pesanan ${formatRupiah(order.remainingForDiscount)} lagi untuk mendapatkan diskon 5%.`;
          discountHint.classList.remove('is-active');
        }
      }

      return order;
    }

    /**
     * Mengosongkan seluruh pesanan (reset kuantitas ke 0).
     */
    function resetOrder() {
      menuCards.forEach((card) => {
        const input = card.querySelector('.qty');
        if (input) input.value = '0';
      });
      hideAlert();
      updateApp();
    }

    /**
     * Membuka modal konfirmasi pembayaran jika pesanan valid.
     * Jika tidak ada pesanan, pembayaran ditolak.
     */
    function initiatePayment() {
      const order = updateApp();

      // Aturan: Jika tidak ada pesanan, sistem harus menolak pembayaran!
      if (order.totalJenisMenu === 0 || order.subtotal === 0) {
        showAlert('Keranjang pesanan masih kosong! Silakan pilih minimal 1 porsi menu sebelum melanjutkan pembayaran.');
        return;
      }

      hideAlert();

      // Ambil opsi layanan terpilih (Makan di Tempat / Bungkus)
      const serviceTypeInput = document.querySelector('input[name="service-type"]:checked');
      const serviceName = serviceTypeInput && serviceTypeInput.value === 'takeaway'
        ? 'Bungkus (Takeaway)'
        : 'Makan di Tempat (Dine-in)';

      const notes = (orderNoteInput && orderNoteInput.value.trim()) || 'Mahasiswa FTI';

      // Tampilkan rincian pesanan di modal review
      if (modalServiceDisplay) modalServiceDisplay.textContent = serviceName;
      if (modalNotesDisplay) modalNotesDisplay.textContent = notes;

      if (modalItemsList) {
        modalItemsList.innerHTML = '';
        order.activeItems.forEach((item) => {
          const line = document.createElement('div');
          line.className = 'modal-item-line';
          line.innerHTML = `
            <span>${item.name} <small class="text-muted">(${item.quantity} × ${formatRupiah(item.price)})</small></span>
            <strong>${formatRupiah(item.subtotal)}</strong>
          `;
          modalItemsList.appendChild(line);
        });
      }

      if (modalSubtotal) modalSubtotal.textContent = formatRupiah(order.subtotal);
      if (modalDiscount) modalDiscount.textContent = `− ${formatRupiah(order.discount)}`;
      if (modalTotal) modalTotal.textContent = formatRupiah(order.total);

      if (modalDiscountRow) {
        modalDiscountRow.hidden = !order.hasDiscount;
      }

      // Tampilkan tampilan review, sembunyikan tampilan sukses
      if (modalReviewView) modalReviewView.hidden = false;
      if (modalSuccessView) modalSuccessView.hidden = true;

      // Buka modal dialog secara aksesibel
      if (paymentModal) {
        if (typeof paymentModal.showModal === 'function') {
          paymentModal.showModal();
        } else {
          paymentModal.setAttribute('open', '');
        }
      }
    }

    /**
     * Menutup modal pembayaran tanpa mengubah pesanan.
     * Pesanan dipertahankan utuh!
     */
    function cancelPayment() {
      if (paymentModal) {
        if (typeof paymentModal.close === 'function') {
          paymentModal.close();
        } else {
          paymentModal.removeAttribute('open');
        }
      }
      // Catatan: Pesanan tidak di-reset, tetap utuh sesuai preferensi pengguna.
    }

    /**
     * Memproses konfirmasi simulasi pembayaran.
     * Menampilkan struk sukses dan mengosongkan pesanan.
     */
    function confirmPayment() {
      const order = calculateOrder(getCurrentMenuItems());

      if (order.totalJenisMenu === 0 || order.subtotal === 0) {
        cancelPayment();
        showAlert('Gagal memproses: Keranjang pesanan kosong.');
        return;
      }

      // Ambil metode bayar terpilih
      const selectedMethodInput = document.querySelector('input[name="pay-method"]:checked');
      const methodName = selectedMethodInput ? selectedMethodInput.value : 'QRIS';
      const serviceTypeInput = document.querySelector('input[name="service-type"]:checked');
      const serviceName = serviceTypeInput && serviceTypeInput.value === 'takeaway'
        ? 'Bungkus (Takeaway)'
        : 'Makan di Tempat (Dine-in)';

      // Buat nomor transaksi simulasi unik KantinBiru (#KB-XXXXX)
      const randomSuffix = Math.floor(10000 + Math.random() * 90000);
      const transactionCode = `#KB-${randomSuffix}`;
      const now = new Date();
      const timeStr = now.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      }) + ', ' + now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';

      // Isi struk sukses
      if (receiptId) receiptId.textContent = transactionCode;
      if (receiptTime) receiptTime.textContent = timeStr;
      if (receiptMethod) receiptMethod.textContent = methodName;
      if (receiptService) receiptService.textContent = serviceName;
      if (receiptTotal) receiptTotal.textContent = formatRupiah(order.total);

      // Tampilkan tampilan sukses di modal
      if (modalReviewView) modalReviewView.hidden = true;
      if (modalSuccessView) modalSuccessView.hidden = false;

      // ATURAN: Pembayaran yang berhasil harus mengosongkan pesanan!
      resetOrder();
    }

    // ========================================================================
    // Event Listeners & Binding
    // ========================================================================

    // 1. Stepper tombol (+ dan -) pada kartu menu
    menuCards.forEach((card) => {
      const id = card.dataset.id;
      const input = card.querySelector('.qty');
      const btnMinus = card.querySelector('.btn-minus');
      const btnPlus = card.querySelector('.btn-plus');

      if (btnMinus) {
        btnMinus.addEventListener('click', () => {
          const current = sanitizeQuantity(input.value);
          setItemQuantity(id, current - 1);
        });
      }

      if (btnPlus) {
        btnPlus.addEventListener('click', () => {
          const current = sanitizeQuantity(input.value);
          setItemQuantity(id, current + 1);
        });
      }

      if (input) {
        input.addEventListener('input', () => {
          hideAlert();
          updateApp();
        });

        input.addEventListener('change', () => {
          const clean = sanitizeQuantity(input.value);
          input.value = String(clean);
          hideAlert();
          updateApp();
        });

        // Cegah pengetikan karakter negatif / eksponensial di input number
        input.addEventListener('keydown', (e) => {
          if (e.key === '-' || e.key === 'e' || e.key === '+' || e.key === '.') {
            e.preventDefault();
          }
        });
      }
    });

    // 2. Tombol Bayar Sekarang
    if (payButton) {
      payButton.addEventListener('click', initiatePayment);
    }

    // 3. Tombol Batal pada Modal (mempertahankan pesanan)
    if (btnCancelPayment) {
      btnCancelPayment.addEventListener('click', cancelPayment);
    }

    if (modalCloseX) {
      modalCloseX.addEventListener('click', cancelPayment);
    }

    // 4. Tombol Konfirmasi & Bayar pada Modal
    if (btnConfirmPayment) {
      btnConfirmPayment.addEventListener('click', confirmPayment);
    }

    // 5. Tombol Selesai pada Struk Sukses Modal
    if (btnSuccessFinish) {
      btnSuccessFinish.addEventListener('click', cancelPayment);
    }

    // 6. Tombol Kosongkan Keranjang
    if (btnClearOrder) {
      btnClearOrder.addEventListener('click', () => {
        if (window.confirm('Kosongkan semua pesanan yang telah dipilih?')) {
          resetOrder();
        }
      });
    }

    // 7. Tombol tutup pesan alert
    if (alertCloseBtn) {
      alertCloseBtn.addEventListener('click', hideAlert);
    }

    // 8. Menutup modal dengan tombol ESC atau klik backdrop
    if (paymentModal) {
      paymentModal.addEventListener('cancel', (e) => {
        // Event cancel native dialog (misal tombol ESC)
        // Pesanan tetap dipertahankan
      });

      paymentModal.addEventListener('click', (e) => {
        // Jika klik tepat pada backdrop dialog
        const rect = paymentModal.getBoundingClientRect();
        const isInDialog = (
          rect.top <= e.clientY &&
          e.clientY <= rect.top + rect.height &&
          rect.left <= e.clientX &&
          e.clientX <= rect.left + rect.width
        );
        if (!isInDialog) {
          cancelPayment();
        }
      });
    }

    // Jalankan kalkulasi awal saat halaman dimuat
    updateApp();
  });
}

// Ekspor untuk pengujian otomatis (Node.js test suite)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    DISCOUNT_MINIMUM,
    DISCOUNT_RATE,
    MAX_QUANTITY,
    MIN_QUANTITY,
    formatRupiah,
    sanitizeQuantity,
    calculateOrder
  };
}
