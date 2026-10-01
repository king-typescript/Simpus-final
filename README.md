# SIMPUS SATAK — Sistem Informasi & Manajemen Perpustakaan Sekolah

Proyek ini dibangun berdasarkan PRD "Sistem Informasi & Manajemen
Perpustakaan Sekolah (SIMPUS)" dengan dua bagian terpisah:

```
simpus-satak/
├── frontend/   → React 18 + Vite + Tailwind CSS (landing page & UI)
└── backend/    → Laravel 11 (REST API, database, RBAC, sirkulasi)
```

## Ringkasan sesuai PRD

| Kebutuhan PRD | Implementasi |
|---|---|
| FR-01 Manajemen Anggota (import Excel, kartu digital) | `backend`: model `User` (kolom `nis`, `kelas`, `library_card_number`), paket `maatwebsite/excel` sudah disiapkan di `composer.json` untuk import massal |
| FR-02 Katalogisasi & Stok | `Book` + `BookCopy` model, status eksemplar real-time (tersedia/dipinjam/rusak/hilang) |
| FR-03 Modul Sirkulasi | `LoanController` — maks 3 buku, durasi 7 hari, denda Rp1.000/hari, 1x perpanjangan mandiri (dikonfigurasi lewat `.env`) |
| FR-04 Katalog Publik (OPAC) | `GET /api/books` dengan filter pencarian & kategori — dikonsumsi komponen `PopularBooks.jsx` di frontend |
| FR-05 Laporan & Rekap | Paket `barryvdh/laravel-dompdf` (PDF) & `maatwebsite/excel` (XLSX) sudah disiapkan untuk endpoint laporan |
| NFR-01 Kinerja pencarian < 1.5 detik | Index database pada kolom `title`, `category` |
| NFR-02 Responsive | Seluruh UI frontend responsif (mobile–desktop) dengan Tailwind |
| NFR-03 Keamanan (Bcrypt/Argon2, RBAC) | Password di-hash via cast `hashed`, middleware `role:pustakawan` |
| NFR-04 Backup harian 00:00 | Jadwalkan `php artisan backup:run` di scheduler (lihat catatan di bawah) |

## Menjalankan Frontend (React)

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Landing page akan tersedia di `http://localhost:5173`, mereplikasi desain
yang diberikan: header dengan navigasi & tombol Login, hero "Selamat
Datang di SIMPUS SATAK" dengan CTA "Cari Buku" / "Lihat Katalog", 4
kartu keunggulan, serta bagian "Buku Populer" lengkap dengan pencarian
dan filter kategori yang interaktif.

## Menjalankan Backend (Laravel)

Folder `backend/` berisi kode aplikasi (Models, Controllers, Migrations,
Routes, konfigurasi) sesuai kebutuhan PRD. Karena instalasi paket Laravel
memerlukan akses ke Packagist saat proses pembuatan proyek ini, jalankan
langkah berikut di komputer Anda untuk melengkapi kerangka framework:

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve
```

API akan tersedia di `http://localhost:8000/api`. Dua akun contoh dibuat
oleh seeder:

- Pustakawan: `pustakawan@simpus-satak.sch.id` / `password`
- Siswa: `siswa@simpus-satak.sch.id` / `password`

> Catatan: jika `backend/` belum berisi file inti Laravel (folder
> `vendor`, `bootstrap/cache`, dll.), jalankan
> `composer create-project laravel/laravel tmp && cp -r tmp/. .` lebih
> dahulu di folder `backend/` sebelum `composer install`, lalu biarkan
> file yang sudah disediakan di sini (app/Models, app/Http, routes,
> database/migrations, bootstrap/app.php, config/cors.php) menimpa
> berkas bawaan.

## Menghubungkan Frontend ↔ Backend

`frontend/src/services/api.js` menggunakan Axios dan membaca
`VITE_API_URL` dari `.env` (default `/api`, diproksi oleh Vite ke
`http://localhost:8000` — lihat `frontend/vite.config.js`). Untuk
production, set `VITE_API_URL` ke domain API dan `FRONTEND_URL` di
backend ke domain frontend agar CORS (`config/cors.php`) mengizinkannya.

## Backup harian (NFR-04)

Tambahkan pada `routes/console.php` backend:

```php
Schedule::command('backup:run')->dailyAt(env('BACKUP_DAILY_TIME', '00:00'));
```

(memerlukan paket `spatie/laravel-backup`, tambahkan ke `composer.json`
bila ingin fitur ini aktif).
