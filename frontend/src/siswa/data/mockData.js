export const siswaData = {
  nama: "Muhammad Najmul Rijal",
  namaPanggilan: "Najmul",
  nisn: "190204001",
  kelas: "XII IPA 1",
  status: "Aktif",
  avatar: "https://ui-avatars.com/api/?name=Najmul+Rijal&background=102E68&color=fff",
  email: "najmul.rijal@email.com",
  telepon: "0812-3456-7890",
  alamat: "Jl. Mawar Merah No. 12, Kota Mataram"
};

export const pengumumanInfo = {
  judul: "Info Perpustakaan",
  pesan: "Perpustakaan tutup lebih awal Jumat ini (14:00 WITA) karena rapat evaluasi.",
  tanggal: "27 September 2026"
};

export const statistikSiswa = [
  {
    id: "dipinjam",
    label: "Sedang Dipinjam",
    nilai: "2",
    satuan: "Buku",
    tipe: "warning",
  },
  {
    id: "selesai",
    label: "Selesai Dibaca",
    nilai: "15",
    satuan: "Buku",
    tipe: "success",
  },
  {
    id: "denda",
    label: "Tunggakan Denda",
    nilai: "Rp 0",
    satuan: "",
    tipe: "danger",
  }
];

export const bukuAktifDipinjam = [
  {
    id: 101,
    judul: "Belajar Dasar Pemrograman Web",
    rak: "B-02",
    kode: "BDPW-001",
    jatuhTempo: "29 Sep",
    catatan: "Kembalikan ke petugas",
    cover: null
  }
];

export const bukuSelesaiDibaca = [
  {
    id: 102,
    judul: "Filosofi Teras",
    dikembalikan: "5 Sep 2026",
    cover: null
  }
];

export const koleksiTerbaru = [
  {
    id: 4,
    judul: "Clean Code",
    penulis: "Robert C. Martin",
    kategori: "Teknologi",
    rak: "A-02",
    cover: null
  }
];

export const daftarBukuKatalog = [
  { 
    id: 1, 
    judul: "React JS untuk Pemula", 
    penulis: "Sandhika Galih", 
    kategori: "Teknologi", 
    rak: "A-01", 
    stok: 3,
    penerbit: "Informatika Pustaka", 
    tahun: "2023", 
    isbn: "978-602-1234-56-7", 
    halaman: 250, 
    bahasa: "Indonesia",
    deskripsi: "Buku panduan lengkap belajar React JS dari nol hingga mahir. Dilengkapi dengan studi kasus nyata pembuatan aplikasi web modern menggunakan Hooks dan Tailwind CSS."
  },
  { 
    id: 2, 
    judul: "Bumi Manusia", 
    penulis: "Pramoedya A. Toer", 
    kategori: "Sastra", 
    rak: "C-12", 
    stok: 0,
    penerbit: "Lentera Dipantara", 
    tahun: "2005", 
    isbn: "978-979-97312-3-4", 
    halaman: 535, 
    bahasa: "Indonesia",
    deskripsi: "Novel sejarah epic yang mengisahkan perjuangan Minke, seorang pribumi terpelajar di era kolonial Hindia Belanda, dalam menghadapi penindasan dan mencari keadilan."
  },
  { 
    id: 3, 
    judul: "Fisika Dasar 1", 
    penulis: "Halliday Resnick", 
    kategori: "Sains", 
    rak: "B-04", 
    stok: 5,
    penerbit: "Erlangga", 
    tahun: "2018", 
    isbn: "978-602-298-123-4", 
    halaman: 480, 
    bahasa: "Indonesia (Terjemahan)",
    deskripsi: "Buku rujukan utama mahasiswa sains dan teknik. Membahas kinematika, dinamika, usaha, energi, hingga mekanika fluida dengan pendekatan matematis yang sistematis."
  },
  { 
    id: 4, 
    judul: "Clean Code", 
    penulis: "Robert C. Martin", 
    kategori: "Teknologi", 
    rak: "A-02", 
    stok: 2,
    penerbit: "Prentice Hall", 
    tahun: "2008", 
    isbn: "978-013-235088-4", 
    halaman: 464, 
    bahasa: "Inggris",
    deskripsi: "Panduan legendaris bagi programmer perangkat lunak yang ingin menulis kode yang bersih, mudah dibaca, dan mudah dikembangkan (maintainable) oleh tim."
  }
];

export const daftarRiwayat = [
  {
    id: 1,
    judul: "Filosofi Teras",
    waktuPinjam: "1 Sep 2026",
    waktuKembali: "5 Sep 2026",
    status: "Selesai",
    denda: "Tidak Ada (-)"
  }
];
