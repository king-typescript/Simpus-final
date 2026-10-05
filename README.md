# SIMPUS SATAK — Sistem Informasi & Manajemen Perpustakaan Sekolah

Proyek Sistem Informasi & Manajemen Perpustakaan Sekolah (SIMPUS) berbasis arsitektur terpisah:

```
Simpus_final/
├── frontend/   → React 18 + Vite + Tailwind CSS (SPA)
└── simpus.be/  → Next.js 16 (App Router) + TypeScript + Prisma ORM + PostgreSQL
```

## Ringkasan Fitur & Arsitektur

| Kebutuhan PRD | Implementasi |
|---|---|
| FR-01 Manajemen Anggota | Prisma model `User` & `Student` (NIS, kelas, kartu perpus), role-based auth (PUSTAKAWAN/SISWA) |
| FR-02 Katalogisasi & Stok | Model `Book`, `BookCopy`, `Category`, `Author`, `Shelf`. Status eksemplar real-time: `TERSEDIA`, `DIPINJAM`, `RUSAK`, `HILANG` |
| FR-03 Modul Sirkulasi | Endpoint `/api/sirkulasi/*` — peminjaman aktif, pengembalian, status denda |
| FR-04 Katalog Publik (OPAC) | `GET /api/buku` & `GET /api/kategori` dengan filter pencarian & kategori |
| FR-05 Pengaturan Sistem | Model `LibrarySetting` — batas pinjam hari, denda/hari, max eksemplar |
| NFR-01 Keamanan | Password di-hash via Argon2, autentikasi JWT (JOSE) via HTTP-Only cookie & Bearer token |
| NFR-02 Kinerja & Validasi | Input validation via Zod, Prisma PostgreSQL adapter, Next.js Node.js runtime |
| NFR-03 Responsive UI | Tailwind CSS responsive (mobile–desktop) |

---

## Menjalankan Backend (`simpus.be`)

Backend menggunakan **Next.js 16**, **Prisma ORM**, dan **PostgreSQL 16**.

### 1. Prasyarat
- Node.js >= 20
- PostgreSQL database aktif (lokal atau via Docker)

### 2. Instalasi & Setup
```bash
cd simpus.be
pnpm install # atau npm install
cp .env.example .env
```

Sesuaikan variabel di `.env` (terutama `DATABASE_URL` dan `AUTH_SECRET`).

### 3. Migrasi Database & Seeding
```bash
npx prisma migrate dev
npx prisma db seed
```

### 4. Jalankan Server Backend
```bash
pnpm dev # atau npm run dev
```

Backend API akan aktif di `http://localhost:3000`.

Akun bawaan seeder:
- **Pustakawan**: `admin` / `adminSimpus123`
- **Siswa**: `siswa1` / `siswaSimpus123`

---

## Menjalankan Frontend (`frontend`)

Frontend menggunakan **React 18**, **Vite**, dan **Tailwind CSS**.

### 1. Instalasi & Setup
```bash
cd frontend
npm install
cp .env.example .env
```

Pastikan `.env` memiliki:
```env
VITE_API_URL=/api
```

### 2. Jalankan Dev Server
```bash
npm run dev
```

Frontend akan aktif di `http://localhost:5173`. Request `/api/*` secara otomatis diproksikan ke backend di `http://localhost:3000` via Vite dev server proxy.

---

## Menjalankan Testing

Untuk menjalankan unit test backend:
```bash
cd simpus.be
npm run test
```
