/**
 * ============================================================================
 * TEST SUITE: INTEGRITAS DOM, FILE, & ASET (HTML & CSS)
 * ============================================================================
 * Memverifikasi:
 * 1. Keberadaan seluruh file dan aset SVG menu.
 * 2. Konsistensi ID elemen antara index.html dan script.js.
 * 3. Keberadaan atribut data pada setiap kartu menu (data-id, data-name, data-price).
 * 4. Konsistensi kelas CSS dan responsivitas.
 * ============================================================================
 */

const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert');

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
console.log('MEMULAI PENGUJIAN INTEGRITAS DOM & ASET: KANTINBIRU (FTI)');
console.log('============================================================\n');

const workspaceDir = __dirname;
const htmlPath = path.join(workspaceDir, 'index.html');
const cssPath = path.join(workspaceDir, 'style.css');
const jsPath = path.join(workspaceDir, 'script.js');
const assetsDir = path.join(workspaceDir, 'assets');

const htmlContent = fs.readFileSync(htmlPath, 'utf8');
const cssContent = fs.readFileSync(cssPath, 'utf8');
const jsContent = fs.readFileSync(jsPath, 'utf8');

// 1. Keberadaan file inti
console.log('[Kategori 1] Keberadaan File dan Aset Inti:');

runTest('File index.html, style.css, dan script.js tersedia', () => {
  assert.ok(fs.existsSync(htmlPath), 'index.html harus ada');
  assert.ok(fs.existsSync(cssPath), 'style.css harus ada');
  assert.ok(fs.existsSync(jsPath), 'script.js harus ada');
});

runTest('Seluruh aset gambar menu terbaru tersedia di folder assets/', () => {
  const images = ['download (20).png', 'mie ayam.png', 'yaw.png', 'bruh.png'];
  images.forEach((img) => {
    const fullPath = path.join(assetsDir, img);
    assert.ok(fs.existsSync(fullPath), `Aset ${img} harus tersedia di assets/`);
  });
});

runTest('Gambar menu terbaru direferensikan pada index.html', () => {
  assert.ok(htmlContent.includes('download (20).png'), 'Nasi goreng harus menggunakan download (20).png');
  assert.ok(htmlContent.includes('mie ayam.png'), 'Mie ayam harus menggunakan mie ayam.png');
  assert.ok(htmlContent.includes('yaw.png'), 'Es teh harus menggunakan yaw.png');
  assert.ok(htmlContent.includes('bruh.png'), 'Jus alpukat harus menggunakan bruh.png');
});

// 2. Integritas Data Menu di index.html
console.log('\n[Kategori 2] Integritas Data Menu di index.html:');

runTest('4 Menu terdaftar dengan data-id, data-name, dan data-price yang benar', () => {
  assert.ok(htmlContent.includes('data-id="nasi-goreng"'));
  assert.ok(htmlContent.includes('data-name="Nasi Goreng"'));
  assert.ok(htmlContent.includes('data-price="18000"'));

  assert.ok(htmlContent.includes('data-id="mie-ayam"'));
  assert.ok(htmlContent.includes('data-name="Mie Ayam"'));
  assert.ok(htmlContent.includes('data-price="15000"'));

  assert.ok(htmlContent.includes('data-id="es-teh"'));
  assert.ok(htmlContent.includes('data-name="Es Teh"'));
  assert.ok(htmlContent.includes('data-price="5000"'));

  assert.ok(htmlContent.includes('data-id="jus-alpukat"'));
  assert.ok(htmlContent.includes('data-name="Jus Alpukat"'));
  assert.ok(htmlContent.includes('data-price="12000"'));
});

// 3. Integritas ID Elemen DOM yang Digunakan script.js
console.log('\n[Kategori 3] Integritas ID Elemen DOM:');

const REQUIRED_IDS = [
  'pesanan-list',
  'empty-state',
  'subtotal',
  'diskon',
  'total-harga',
  'discount-hint',
  'pay-button',
  'order-alert',
  'btn-clear-order',
  'payment-modal',
  'btn-cancel-payment',
  'btn-confirm-payment',
  'btn-success-finish',
  'receipt-id',
  'receipt-time',
  'receipt-method',
  'receipt-total'
];

REQUIRED_IDS.forEach((id) => {
  runTest(`ID #${id} wajib ada pada index.html`, () => {
    assert.ok(htmlContent.includes(`id="${id}"`), `Elemen id="${id}" tidak ditemukan di index.html`);
  });
});

// 4. Standar Aksesibilitas dan Responsivitas
console.log('\n[Kategori 4] Aksesibilitas dan Responsivitas:');

runTest('Elemen dialog modal menggunakan tag <dialog> dengan aria-labelledby', () => {
  assert.ok(htmlContent.includes('<dialog id="payment-modal"'), 'Modal harus menggunakan <dialog>');
  assert.ok(htmlContent.includes('aria-labelledby="modal-title"'), 'Modal harus memiliki atribut aksesibilitas');
});

runTest('Input kuantitas memiliki atribut min="0" max="99" dan inputmode="numeric"', () => {
  assert.ok(htmlContent.includes('min="0"'));
  assert.ok(htmlContent.includes('max="99"'));
  assert.ok(htmlContent.includes('inputmode="numeric"'));
});

runTest('style.css memiliki breakpoint media query untuk mobile dan reduced-motion', () => {
  assert.ok(cssContent.includes('@media (max-width: 1024px)'));
  assert.ok(cssContent.includes('@media (max-width: 768px)'));
  assert.ok(cssContent.includes('@media (max-width: 480px)'));
  assert.ok(cssContent.includes('@media (prefers-reduced-motion: reduce)'));
});

// 5. Verifikasi Palet Powder Blue + Cream + Deep Blue & Pola Background
console.log('\n[Kategori 5] Verifikasi Palet Powder Blue + Cream + Deep Blue:');

runTest('Palet warna acuan Powder Blue + Cream + Deep Blue diterapkan pada style.css', () => {
  assert.ok(cssContent.includes('#E1EFFB'), 'Powder Blue #E1EFFB harus didefinisikan');
  assert.ok(cssContent.includes('#FFF9EF'), 'Cream #FFF9EF harus didefinisikan');
  assert.ok(cssContent.includes('#FFFFFF'), 'White #FFFFFF harus didefinisikan');
  assert.ok(cssContent.includes('#1D4ED8'), 'Deep Blue #1D4ED8 harus didefinisikan');
  assert.ok(cssContent.includes('#243247'), 'Dark Navy #243247 harus didefinisikan');
  assert.ok(cssContent.includes('#64748B'), 'Muted Blue Gray #64748B harus didefinisikan');
  assert.ok(cssContent.includes('#BFDBFE'), 'Soft Blue #BFDBFE harus didefinisikan');
});

runTest('Pola background dekoratif halus diterapkan pada body di style.css', () => {
  assert.ok(cssContent.includes('background-image:'), 'Pola background-image harus ada');
  assert.ok(cssContent.includes('radial-gradient('), 'Pola dot matrix radial-gradient harus ada');
  assert.ok(cssContent.includes('linear-gradient('), 'Garis grid halus linear-gradient harus ada');
});

// 6. Verifikasi Identitas & Branding KantinBiru
console.log('\n[Kategori 6] Verifikasi Identitas & Branding KantinBiru:');

runTest('Nama KantinBiru dan subtitle Pujasera Mahasiswa FTI tampil di index.html', () => {
  assert.ok(htmlContent.includes('KantinBiru'), 'Nama aplikasi KantinBiru harus ada');
  assert.ok(htmlContent.includes('Pujasera Mahasiswa FTI'), 'Subtitle Pujasera Mahasiswa FTI harus ada');
  assert.ok(!htmlContent.includes('Kantin Kampus Online'), 'Nama lama Kantin Kampus Online tidak boleh ada di antarmuka');
});

console.log('\n============================================================');
console.log(`HASIL AKHIR INTEGRITAS DOM: ${passedTests} DARI ${totalTests} PENGUJIAN LULUS`);
if (passedTests === totalTests) {
  console.log('STATUS: SELURUH ELEMEN DOM, FILE, & ASET LENGKAP & VALID!');
} else {
  console.log('STATUS: ADA MASALAH INTEGRITAS DOM.');
  process.exit(1);
}
console.log('============================================================\n');
