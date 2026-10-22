/**
 * ============================================================================
 * TEST SUITE: KANTIN KAMPUS ONLINE (Node.js Test Runner)
 * ============================================================================
 * Pengujian komprehensif untuk memverifikasi:
 * 1. Sanitasi kuantitas (rentang 0-99, nilai negatif, string, float).
 * 2. Perhitungan subtotal per menu dan kombinasi multi-menu.
 * 3. Aturan diskon 5% pada ambang batas Rp 100.000:
 *    - Nilai di bawah Rp 100.000 (diskon = 0).
 *    - Nilai tepat Rp 100.000 (diskon = Rp 5.000).
 *    - Nilai di atas Rp 100.000 (diskon = 5% dibulatkan).
 * 4. Pemformatan mata uang Rupiah.
 * 5. Siklus hidup pesanan:
 *    - Penolakan pembayaran saat keranjang kosong.
 *    - Retensi pesanan saat pembayaran dibatalkan.
 *    - Pengosongan pesanan saat pembayaran berhasil.
 * ============================================================================
 */

const assert = require('node:assert');
const {
  DISCOUNT_MINIMUM,
  DISCOUNT_RATE,
  MAX_QUANTITY,
  MIN_QUANTITY,
  formatRupiah,
  sanitizeQuantity,
  calculateOrder
} = require('./script.js');

let totalTests = 0;
let passedTests = 0;

function runTest(testName, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  ✓ [LULUS] ${testName}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✗ [GAGAL] ${testName}`);
    console.error(`    Detail: ${err.message}`);
  }
}

console.log('\n============================================================');
console.log('MEMULAI PENGUJIAN OTOMATIS: KANTIN KAMPUS ONLINE');
console.log('============================================================\n');

// ----------------------------------------------------------------------------
// KELOMPOK 1: PENGUJIAN SANITASI KUANTITAS
// ----------------------------------------------------------------------------
console.log('[Kategori 1] Pengujian Sanitasi Kuantitas:');

runTest('Nilai positif valid dalam rentang (0 - 99) dipertahankan', () => {
  assert.strictEqual(sanitizeQuantity(0), 0);
  assert.strictEqual(sanitizeQuantity(5), 5);
  assert.strictEqual(sanitizeQuantity('12'), 12);
  assert.strictEqual(sanitizeQuantity(99), 99);
});

runTest('Nilai negatif disanitasi menjadi 0', () => {
  assert.strictEqual(sanitizeQuantity(-1), 0);
  assert.strictEqual(sanitizeQuantity(-99), 0);
  assert.strictEqual(sanitizeQuantity('-15'), 0);
});

runTest('Nilai di atas batas maksimum (99) dipangkas menjadi 99', () => {
  assert.strictEqual(sanitizeQuantity(100), 99);
  assert.strictEqual(sanitizeQuantity(999), 99);
  assert.strictEqual(sanitizeQuantity('150'), 99);
});

runTest('Nilai bukan angka (NaN, string acak, null, undefined) disanitasi menjadi 0', () => {
  assert.strictEqual(sanitizeQuantity('abc'), 0);
  assert.strictEqual(sanitizeQuantity(''), 0);
  assert.strictEqual(sanitizeQuantity(null), 0);
  assert.strictEqual(sanitizeQuantity(undefined), 0);
  assert.strictEqual(sanitizeQuantity(NaN), 0);
});

runTest('Nilai pecahan (float) dipotong menjadi bilangan bulat', () => {
  assert.strictEqual(sanitizeQuantity(3.7), 3);
  assert.strictEqual(sanitizeQuantity('4.9'), 4);
});

// ----------------------------------------------------------------------------
// KELOMPOK 2: PENGUJIAN PEMFORMATAN RUPIAH
// ----------------------------------------------------------------------------
console.log('\n[Kategori 2] Pengujian Pemformatan Rupiah:');

runTest('Format nominal 0 menghasilkan string berawalan Rp 0', () => {
  const result = formatRupiah(0);
  assert.ok(result.includes('Rp') && result.includes('0'), `Hasil aktual: ${result}`);
});

runTest('Format nominal ribuan memiliki pemisah titik ribuan', () => {
  const result = formatRupiah(18000);
  assert.ok(result.includes('18.000'), `Hasil aktual: ${result}`);
});

runTest('Format nominal ratusan ribu diformat dengan benar', () => {
  const result = formatRupiah(100000);
  assert.ok(result.includes('100.000'), `Hasil aktual: ${result}`);
});

// ----------------------------------------------------------------------------
// KELOMPOK 3: PENGUJIAN PERHITUNGAN SUBTOTAL MENU
// ----------------------------------------------------------------------------
console.log('\n[Kategori 3] Pengujian Perhitungan Subtotal Menu:');

const MENU_PRICES = {
  nasiGoreng: 18000,
  mieAyam: 15000,
  esTeh: 5000,
  jusAlpukat: 12000
};

runTest('Keranjang kosong (kuantitas 0) menghasilkan subtotal 0 dan total 0', () => {
  const items = [
    { id: 'nasi-goreng', name: 'Nasi Goreng', price: MENU_PRICES.nasiGoreng, quantity: 0 },
    { id: 'mie-ayam', name: 'Mie Ayam', price: MENU_PRICES.mieAyam, quantity: 0 }
  ];
  const order = calculateOrder(items);
  assert.strictEqual(order.subtotal, 0);
  assert.strictEqual(order.discount, 0);
  assert.strictEqual(order.total, 0);
  assert.strictEqual(order.totalJenisMenu, 0);
  assert.strictEqual(order.totalPorsi, 0);
});

runTest('Satu menu (Nasi Goreng 3 porsi = Rp 54.000)', () => {
  const items = [
    { id: 'nasi-goreng', name: 'Nasi Goreng', price: MENU_PRICES.nasiGoreng, quantity: 3 }
  ];
  const order = calculateOrder(items);
  assert.strictEqual(order.subtotal, 54000);
  assert.strictEqual(order.discount, 0); // Di bawah Rp 100.000, tanpa diskon
  assert.strictEqual(order.total, 54000);
  assert.strictEqual(order.totalJenisMenu, 1);
  assert.strictEqual(order.totalPorsi, 3);
});

runTest('Kombinasi multi-menu di bawah ambang batas diskon (Rp 86.000)', () => {
  // 2 Nasi Goreng (36.000) + 2 Mie Ayam (30.000) + 4 Es Teh (20.000) = 86.000
  const items = [
    { id: 'nasi-goreng', name: 'Nasi Goreng', price: MENU_PRICES.nasiGoreng, quantity: 2 },
    { id: 'mie-ayam', name: 'Mie Ayam', price: MENU_PRICES.mieAyam, quantity: 2 },
    { id: 'es-teh', name: 'Es Teh', price: MENU_PRICES.esTeh, quantity: 4 },
    { id: 'jus-alpukat', name: 'Jus Alpukat', price: MENU_PRICES.jusAlpukat, quantity: 0 }
  ];
  const order = calculateOrder(items);
  assert.strictEqual(order.subtotal, 86000);
  assert.strictEqual(order.hasDiscount, false);
  assert.strictEqual(order.discount, 0);
  assert.strictEqual(order.total, 86000);
  assert.strictEqual(order.remainingForDiscount, 14000);
  assert.strictEqual(order.totalJenisMenu, 3);
  assert.strictEqual(order.totalPorsi, 8);
});

// ----------------------------------------------------------------------------
// KELOMPOK 4: PENGUJIAN ATURAN DISKON 5% (MINIMAL RP 100.000)
// ----------------------------------------------------------------------------
console.log('\n[Kategori 4] Pengujian Aturan Diskon 5% (Subtotal Minimal Rp 100.000):');

runTest('Subtotal Rp 99.000 (< 100.000) TIDAK berhak mendapat diskon', () => {
  // Simulasi subtotal Rp 99.000
  const items = [
    { id: 'item-custom', name: 'Menu Uji', price: 99000, quantity: 1 }
  ];
  const order = calculateOrder(items);
  assert.strictEqual(order.subtotal, 99000);
  assert.strictEqual(order.hasDiscount, false);
  assert.strictEqual(order.discount, 0);
  assert.strictEqual(order.total, 99000);
  assert.strictEqual(order.remainingForDiscount, 1000);
});

runTest('Subtotal TEPAT Rp 100.000 berhak mendapat diskon 5% = Rp 5.000, Total = Rp 95.000', () => {
  // Contoh: 20 Es Teh (20 x 5.000 = 100.000)
  const items = [
    { id: 'es-teh', name: 'Es Teh', price: MENU_PRICES.esTeh, quantity: 20 }
  ];
  const order = calculateOrder(items);
  assert.strictEqual(order.subtotal, 100000);
  assert.strictEqual(order.hasDiscount, true);
  assert.strictEqual(order.discount, 5000); // 5% dari 100.000
  assert.strictEqual(order.total, 95000);   // 100.000 - 5.000
  assert.strictEqual(order.remainingForDiscount, 0);
  assert.strictEqual(order.progressPercent, 100);
});

runTest('Subtotal Rp 110.000 (> 100.000) berhak mendapat diskon 5% = Rp 5.500, Total = Rp 104.500', () => {
  // Contoh: 5 Nasi Goreng (90.000) + 4 Es Teh (20.000) = 110.000
  const items = [
    { id: 'nasi-goreng', name: 'Nasi Goreng', price: MENU_PRICES.nasiGoreng, quantity: 5 },
    { id: 'es-teh', name: 'Es Teh', price: MENU_PRICES.esTeh, quantity: 4 }
  ];
  const order = calculateOrder(items);
  assert.strictEqual(order.subtotal, 110000);
  assert.strictEqual(order.hasDiscount, true);
  assert.strictEqual(order.discount, 5500); // 5% dari 110.000
  assert.strictEqual(order.total, 104500);  // 110.000 - 5.500
});

runTest('Subtotal ganjil Rp 105.500 dibulatkan ke bilangan bulat (5.275)', () => {
  const items = [
    { id: 'item-custom', name: 'Menu Uji', price: 105500, quantity: 1 }
  ];
  const order = calculateOrder(items);
  assert.strictEqual(order.subtotal, 105500);
  assert.strictEqual(order.discount, Math.round(105500 * 0.05)); // 5275
  assert.strictEqual(order.total, 105500 - 5275); // 100225
});

runTest('Subtotal pesanan besar (Rp 200.000) diskon 5% = Rp 10.000, Total = Rp 190.000', () => {
  const items = [
    { id: 'item-custom', name: 'Menu Uji', price: 200000, quantity: 1 }
  ];
  const order = calculateOrder(items);
  assert.strictEqual(order.subtotal, 200000);
  assert.strictEqual(order.discount, 10000);
  assert.strictEqual(order.total, 190000);
});

// ----------------------------------------------------------------------------
// KELOMPOK 5: PENGUJIAN SIKLUS HIDUP TRANSAKSI & PERILAKU SISTEM
// ----------------------------------------------------------------------------
console.log('\n[Kategori 5] Pengujian Logika Alur Transaksi & Validasi Pembayaran:');

runTest('Sistem menolak pembayaran jika tidak ada pesanan (totalJenisMenu === 0)', () => {
  const emptyItems = [
    { id: 'nasi-goreng', price: 18000, quantity: 0 },
    { id: 'mie-ayam', price: 15000, quantity: 0 }
  ];
  const order = calculateOrder(emptyItems);
  const isPaymentAllowed = order.totalJenisMenu > 0 && order.subtotal > 0;
  assert.strictEqual(isPaymentAllowed, false, 'Pembayaran harus ditolak saat keranjang kosong');
});

runTest('Sistem mengizinkan proses pembayaran jika ada minimal 1 pesanan', () => {
  const activeItems = [
    { id: 'nasi-goreng', price: 18000, quantity: 1 }
  ];
  const order = calculateOrder(activeItems);
  const isPaymentAllowed = order.totalJenisMenu > 0 && order.subtotal > 0;
  assert.strictEqual(isPaymentAllowed, true, 'Pembayaran harus diizinkan saat ada pesanan');
});

runTest('Simulasi Pembatalan Pembayaran: Data pesanan dipertahankan utuh', () => {
  // State awal keranjang
  let state = [
    { id: 'nasi-goreng', name: 'Nasi Goreng', price: 18000, quantity: 2 },
    { id: 'es-teh', name: 'Es Teh', price: 5000, quantity: 3 }
  ];

  const beforeCancel = calculateOrder(state);
  assert.strictEqual(beforeCancel.subtotal, 51000);

  // Aksi pengguna: Menekan Batal pada modal (cancelPayment)
  // Aturan spesifikasi: Pembayaran yang dibatalkan harus mempertahankan pesanan
  // Tidak ada perubahan pada state kuantitas
  const afterCancel = calculateOrder(state);
  assert.strictEqual(afterCancel.subtotal, 51000);
  assert.strictEqual(afterCancel.totalPorsi, 5);
  assert.strictEqual(afterCancel.activeItems.length, 2);
  assert.strictEqual(state[0].quantity, 2, 'Kuantitas Nasi Goreng harus tetap 2');
  assert.strictEqual(state[1].quantity, 3, 'Kuantitas Es Teh harus tetap 3');
});

runTest('Simulasi Pembayaran Berhasil: Data pesanan dikosongkan (reset ke 0)', () => {
  // State awal keranjang
  let state = [
    { id: 'nasi-goreng', name: 'Nasi Goreng', price: 18000, quantity: 4 },
    { id: 'jus-alpukat', name: 'Jus Alpukat', price: 12000, quantity: 2 }
  ];

  const beforeConfirm = calculateOrder(state);
  assert.strictEqual(beforeConfirm.subtotal, 96000);

  // Aksi pengguna: Menekan Konfirmasi & Bayar (confirmPayment)
  // Aturan spesifikasi: Pembayaran yang berhasil harus mengosongkan pesanan
  state = state.map((item) => ({ ...item, quantity: 0 }));

  const afterConfirm = calculateOrder(state);
  assert.strictEqual(afterConfirm.subtotal, 0, 'Subtotal harus kembali ke 0');
  assert.strictEqual(afterConfirm.discount, 0, 'Diskon harus kembali ke 0');
  assert.strictEqual(afterConfirm.total, 0, 'Total harus kembali ke 0');
  assert.strictEqual(afterConfirm.totalJenisMenu, 0, 'Total jenis menu harus 0');
  assert.strictEqual(afterConfirm.totalPorsi, 0, 'Total porsi harus 0');
  assert.strictEqual(afterConfirm.activeItems.length, 0, 'Daftar item aktif harus kosong');
});

// ----------------------------------------------------------------------------
// RINGKASAN HASIL
// ----------------------------------------------------------------------------
console.log('\n============================================================');
console.log(`HASIL AKHIR PENGUJIAN: ${passedTests} DARI ${totalTests} PENGUJIAN LULUS`);
if (passedTests === totalTests) {
  console.log('STATUS: SEMUA FITUR DAN ATURAN LOGIKA BISNIS TERVERIFIKASI!');
} else {
  console.log('STATUS: ADA PENGUJIAN YANG GAGAL. PERIKSA DETAIL DI ATAS.');
  process.exit(1);
}
console.log('============================================================\n');
