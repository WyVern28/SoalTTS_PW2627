KANTINBIRU — PUJASERA MAHASISWA FTI
PROJECT UTS PEMROGRAMAN WEB (SOAL GANJIL)

Struktur Berkas Project:
- index.html                   Struktur halaman website semantik beridentitas KantinBiru
- style.css                    Desain visual Powder Blue (#E1EFFB) + Cream (#FFF9EF) + Deep Blue (#1D4ED8)
- script.js                    Logika kalkulasi subtotal, aturan diskon 5%, kontrol stepper, dan simulasi pembayaran
- assets/                      Aset foto menu terbaru: download (20).png, mie ayam.png, yaw.png, bruh.png
- test_app.js                  Suite pengujian unit otomatis kalkulasi & aturan diskon (Node.js)
- test_dom_integrity.js        Suite pengujian integritas struktur HTML, ID elemen, responsivitas & palet tema
- test_workflow_simulation.js  Suite pengujian simulasi alur pengguna end-to-end KantinBiru

Cara Menjalankan Website:
1. Buka file `index.html` langsung di browser modern (Chrome, Edge, Firefox, Safari) atau gunakan server lokal seperti Live Server / Python HTTP Server (`python -m http.server 8089`).
2. Tentukan porsi menu menggunakan tombol stepper (+ / -) atau ketik langsung angka porsi (0 - 99).
3. Pantau rincian pesanan dan total pembayaran yang terbarui secara langsung (real-time).
4. Diskon 5% otomatis aktif ketika subtotal pesanan mencapai minimal Rp 100.000.
5. Tombol "Bayar Sekarang" akan menolak proses jika keranjang masih kosong (0 item).
6. Saat ada pesanan, modal konfirmasi pembayaran akan tampil:
   - Tombol "Batal (Pertahankan Pesanan)" menutup modal tanpa menghilangkan pesanan.
   - Tombol "Konfirmasi & Bayar Sekarang" memproses simulasi, menampilkan nomor struk (#KB-XXXXX), dan mengosongkan keranjang.

Cara Menjalankan Pengujian Otomatis (Node.js):
1. Buka terminal di folder project ini.
2. Jalankan perintah:
   - `node test_app.js`                (20 pengujian unit logika & diskon)
   - `node test_dom_integrity.js`       (26 pengujian integritas elemen DOM, branding & tema)
   - `node test_workflow_simulation.js` (Simulasi alur transaksi lengkap)

Identitas Visual & Desain:
- Merek: KantinBiru (Subtitle: Pujasera Mahasiswa FTI)
- Tema: Powder Blue (#E1EFFB) + Cream (#FFF9EF) + Deep Blue (#1D4ED8)
- Background: Pola dot matrix halus dan grid tipis Soft Blue (#BFDBFE) via CSS murni
- Komponen: Kartu menu putih (#FFFFFF), teks Dark Navy (#243247), sekunder Muted Blue Gray (#64748B)
- HTML5 Semantik (Dialog Modal, Form Fieldset, ARIA labels & live regions)
- CSS3 Murni (Custom Properties, Flexbox, Grid, Media Queries, Prefers-Reduced-Motion)
- Vanilla JavaScript ES6+ (Intl Currency Formatter, Event Delegation, Pure Reducers)
