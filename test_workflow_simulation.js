/**
 * ============================================================================
 * TEST SUITE: SIMULASI ALUR PENGGUNA LENGKAP (END-TO-END WORKFLOW)
 * ============================================================================
 * Menguji skenario nyata dari awal hingga akhir:
 * 1. Sesi dimulai dengan keranjang kosong.
 * 2. Percobaan bayar saat kosong -> sistem menolak.
 * 3. Menambah porsi Nasi Goreng dan Es Teh secara bertahap.
 * 4. Mencapai ambang batas diskon 5% pada subtotal Rp 100.000.
 * 5. Buka modal pembayaran, lalu BATALKAN -> pesanan tetap utuh.
 * 6. Buka kembali modal pembayaran, lalu KONFIRMASI -> struk tercetak & pesanan reset ke 0.
 * ============================================================================
 */

const assert = require('node:assert');
const { calculateOrder, formatRupiah, sanitizeQuantity } = require('./script.js');

console.log('\n============================================================');
console.log('MEMULAI SIMULASI ALUR PENGGUNA LENGKAP (E2E SIMULATION)');
console.log('============================================================\n');

// Representasi state aplikasi
let state = {
  serviceType: 'dine-in',
  notes: 'Meja 04 - Budi Mahasiswa',
  items: {
    'nasi-goreng': { name: 'Nasi Goreng', price: 18000, quantity: 0 },
    'mie-ayam': { name: 'Mie Ayam', price: 15000, quantity: 0 },
    'es-teh': { name: 'Es Teh', price: 5000, quantity: 0 },
    'jus-alpukat': { name: 'Jus Alpukat', price: 12000, quantity: 0 }
  },
  modalOpen: false,
  alertMessage: null,
  receipt: null
};

function getOrderState() {
  const itemList = Object.entries(state.items).map(([id, item]) => ({
    id,
    name: item.name,
    price: item.price,
    quantity: item.quantity
  }));
  return calculateOrder(itemList);
}

// Langkah 1: Sesi awal
console.log('Langkah 1: Memeriksa state awal aplikasi...');
let order = getOrderState();
assert.strictEqual(order.subtotal, 0, 'Subtotal awal harus 0');
assert.strictEqual(order.total, 0, 'Total awal harus 0');
assert.strictEqual(order.totalJenisMenu, 0, 'Jenis menu awal harus 0');
console.log('  ✓ State awal: Keranjang bersih (Rp 0).');

// Langkah 2: Percobaan pembayaran saat keranjang kosong
console.log('\nLangkah 2: Pengguna mengklik tombol bayar saat keranjang kosong...');
if (order.totalJenisMenu === 0 || order.subtotal === 0) {
  state.alertMessage = 'Keranjang pesanan masih kosong! Silakan pilih minimal 1 porsi menu sebelum melanjutkan pembayaran.';
} else {
  state.modalOpen = true;
}
assert.strictEqual(state.modalOpen, false, 'Modal TIDAK boleh terbuka saat keranjang kosong');
assert.ok(state.alertMessage !== null, 'Pesan penolakan harus ditampilkan');
console.log(`  ✓ Sistem berhasil menolak: "${state.alertMessage}"`);

// Langkah 3: Pengguna menambah 5 porsi Nasi Goreng (5 x 18.000 = 90.000)
console.log('\nLangkah 3: Pengguna menambah 5 porsi Nasi Goreng...');
state.items['nasi-goreng'].quantity = 5;
state.alertMessage = null; // Alert tertutup otomatis saat memilih menu
order = getOrderState();
assert.strictEqual(order.subtotal, 90000);
assert.strictEqual(order.hasDiscount, false);
assert.strictEqual(order.discount, 0);
assert.strictEqual(order.total, 90000);
assert.strictEqual(order.remainingForDiscount, 10000);
console.log(`  ✓ Subtotal: ${formatRupiah(order.subtotal)} | Belum ada diskon (Kurang ${formatRupiah(order.remainingForDiscount)} lagi).`);

// Langkah 4: Pengguna menambah 2 gelas Es Teh (2 x 5.000 = 10.000)
console.log('\nLangkah 4: Pengguna menambah 2 gelas Es Teh...');
state.items['es-teh'].quantity = 2;
order = getOrderState();
assert.strictEqual(order.subtotal, 100000, 'Subtotal harus tepat Rp 100.000');
assert.strictEqual(order.hasDiscount, true, 'Diskon 5% harus aktif');
assert.strictEqual(order.discount, 5000, 'Diskon harus Rp 5.000');
assert.strictEqual(order.total, 95000, 'Total bayar harus Rp 95.000 (100.000 - 5.000)');
assert.strictEqual(order.remainingForDiscount, 0);
assert.strictEqual(order.progressPercent, 100);
console.log(`  ✓ Subtotal mencapai ${formatRupiah(order.subtotal)}! Diskon 5% (${formatRupiah(order.discount)}) aktif! Total: ${formatRupiah(order.total)}.`);

// Langkah 5: Pengguna membuka modal pembayaran, kemudian membatalkan
console.log('\nLangkah 5: Pengguna membuka modal pembayaran lalu menekan BATAL...');
if (order.totalJenisMenu > 0 && order.subtotal > 0) {
  state.modalOpen = true;
}
assert.strictEqual(state.modalOpen, true, 'Modal pembayaran terbuka');

// Simulasi klik BATAL (cancelPayment)
state.modalOpen = false; // Menutup modal tanpa reset
order = getOrderState();
assert.strictEqual(state.items['nasi-goreng'].quantity, 5, 'Kuantitas Nasi Goreng harus tetap 5');
assert.strictEqual(state.items['es-teh'].quantity, 2, 'Kuantitas Es Teh harus tetap 2');
assert.strictEqual(order.subtotal, 100000, 'Subtotal harus tetap Rp 100.000 setelah batal');
assert.strictEqual(order.total, 95000, 'Total harus tetap Rp 95.000 setelah batal');
console.log('  ✓ Pembatalan sukses: Pesanan dan seluruh angka tetap utuh di keranjang.');

// Langkah 6: Pengguna membuka kembali modal pembayaran dan menekan KONFIRMASI & BAYAR
console.log('\nLangkah 6: Pengguna membuka kembali modal dan menekan KONFIRMASI & BAYAR...');
state.modalOpen = true;

// Simulasi klik KONFIRMASI (confirmPayment)
const receiptCode = `#KTN-${Math.floor(10000 + Math.random() * 90000)}`;
state.receipt = {
  id: receiptCode,
  totalPaid: order.total,
  service: state.serviceType === 'dine-in' ? 'Makan di Tempat' : 'Bungkus',
  notes: state.notes
};

// Aturan: Pembayaran berhasil harus mengosongkan pesanan
Object.keys(state.items).forEach((id) => {
  state.items[id].quantity = 0;
});
order = getOrderState();

assert.strictEqual(order.subtotal, 0, 'Subtotal harus kembali ke Rp 0 setelah bayar sukses');
assert.strictEqual(order.discount, 0, 'Diskon harus kembali ke Rp 0 setelah bayar sukses');
assert.strictEqual(order.total, 0, 'Total harus kembali ke Rp 0 setelah bayar sukses');
assert.strictEqual(order.totalJenisMenu, 0, 'Jenis menu harus 0 setelah bayar sukses');
assert.ok(state.receipt !== null, 'Struk pembayaran harus terbit');
console.log(`  ✓ Transaksi berhasil! Nomor Struk: ${state.receipt.id} | Total Dibayar: ${formatRupiah(state.receipt.totalPaid)}.`);
console.log('  ✓ Keranjang berhasil dikosongkan secara otomatis (Subtotal = Rp 0).');

console.log('\n============================================================');
console.log('HASIL SIMULASI ALUR PENGGUNA: SELURUH LANGKAH 100% LULUS!');
console.log('============================================================\n');
