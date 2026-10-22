KANTIN KAMPUS ONLINE - PROJECT UTS PEMROGRAMAN WEB (SOAL GANJIL)

Struktur Berkas Project:
- index.html                   Struktur halaman website semantik (HTML5 & Aksesibilitas)
- style.css                    Desain sistem visual otentik kantin kampus & tata letak responsif
- script.js                    Logika kalkulasi subtotal, aturan diskon 5%, kontrol stepper, dan simulasi pembayaran
- assets/                      Aset ilustrasi SVG menu asli (nasi goreng, mie ayam, es teh, jus alpukat)
- test_app.js                  Suite pengujian unit otomatis kalkulasi & aturan diskon (Node.js)
- test_dom_integrity.js        Suite pengujian integritas struktur HTML, ID elemen, dan responsivitas
- test_workflow_simulation.js  Suite pengujian simulasi alur pengguna end-to-end

Cara Menjalankan Website:
1. Buka file `index.html` langsung di browser modern (Chrome, Edge, Firefox, Safari) atau gunakan server lokal seperti Live Server / Python HTTP Server (`python -m http.server 8089`).
2. Tentukan porsi menu menggunakan tombol stepper (+ / -) atau ketik langsung angka porsi (0 - 99).
3. Pantau rincian pesanan dan total pembayaran yang terbarui secara langsung (real-time).
4. Diskon 5% otomatis aktif ketika subtotal pesanan mencapai minimal Rp 100.000.
5. Tombol "Bayar Sekarang" akan menolak proses jika keranjang masih kosong (0 item).
6. Saat ada pesanan, modal konfirmasi pembayaran akan tampil:
   - Tombol "Batal (Pertahankan Pesanan)" menutup modal tanpa menghilangkan pesanan.
   - Tombol "Konfirmasi & Bayar Sekarang" memproses simulasi, menampilkan nomor struk, dan mengosongkan keranjang.

Cara Menjalankan Pengujian Otomatis (Node.js):
1. Buka terminal di folder project ini.
2. Jalankan perintah:
   - `node test_app.js`                (20 pengujian unit logika & diskon)
   - `node test_dom_integrity.js`       (23 pengujian integritas elemen DOM)
   - `node test_workflow_simulation.js` (Simulasi alur transaksi lengkap)

Teknologi:
- HTML5 Semantik (Dialog Modal, Form Fieldset, ARIA labels & live regions)
- CSS3 Murni (Custom Properties, Flexbox, Grid, Media Queries, Prefers-Reduced-Motion)
- Vanilla JavaScript ES6+ (Intl Currency Formatter, Event Delegation, Pure Reducers)
