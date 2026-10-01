# SIMPUS SATAK — Frontend (React + Vite + Tailwind)

Landing page Sistem Informasi & Manajemen Perpustakaan Sekolah, dibangun
mereplikasi desain yang diberikan.

## Struktur

```
src/
├── components/       Header, Hero, Features, BookCard, PopularBooks, Footer
├── pages/Landing.jsx Menyusun seluruh section jadi satu halaman
├── data/books.js      Data contoh buku (ganti dengan API saat backend siap)
├── services/api.js    Axios client ke Laravel backend
└── index.css          Tailwind + gaya global
```

## Menjalankan

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # build production ke folder dist/
```

## Interaktivitas yang sudah tersedia

- Navigasi header dengan indikator halaman aktif + menu mobile (hamburger).
- Pencarian judul buku dan filter kategori pada bagian "Buku Populer",
  langsung memfilter data secara real-time di client.
- Tombol "Cari Buku" / "Lihat Katalog" mengarah ke bagian katalog.
- Seluruh layout responsif dari mobile hingga desktop (breakpoint Tailwind).

## Menghubungkan ke data asli

Ganti isi `src/data/books.js` dengan pemanggilan `BookService.getPopular()`
dari `src/services/api.js` begitu backend Laravel berjalan.
