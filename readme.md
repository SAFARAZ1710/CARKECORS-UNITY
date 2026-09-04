# CARKECORS UNITY | Memory Box

Website kenangan dan galeri untuk komunitas CARKECORS UNITY yang terhubung langsung dengan Google Sheets sebagai basis data.

## Fitur
- **Galeri Foto & Video** (kategori jalan-jalan, makan-makan, dan momen acak).
- **Profil Anggota**: Julukan, tanggal lahir, kutipan, tautan Instagram dan TikTok.
- **Mode Gelap / Terang**: Tersedia toggle tema.
- **Database Google Sheets**: Menggunakan Google Apps Script Web App sebagai REST API backend.

## Cara Konfigurasi Database
1. Buat salinan atau gunakan spreadsheet database Anda.
2. Buka menu **Ekstensi > Apps Script**, masukkan kode dari `Code.gs`.
3. Klik **Deploy > New deployment**, pilih jenis **Web app**.
4. Setel **Who has access** ke **Anyone** (Siapa saja).
5. Salin URL Web App yang diperoleh, lalu masukkan ke variabel `SCRIPT_URL` di dalam `index.html`.