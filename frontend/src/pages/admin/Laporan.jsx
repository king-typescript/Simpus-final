import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Download,
  FileText,
  Printer,
  Users,
  Wallet,
} from "lucide-react";

const laporanPeminjamanDefault = [
  {
    id: 1,
    member: "Siti Rahma",
    nis: "20260002",
    book: "Bahasa Indonesia",
    borrowDate: "2026-09-15",
    dueDate: "2026-09-22",
    returnDate: "-",
    status: "Dipinjam",
  },
  {
    id: 2,
    member: "Ahmad Fauzan",
    nis: "20260001",
    book: "Algoritma dan Pemrograman",
    borrowDate: "2026-09-01",
    dueDate: "2026-09-08",
    returnDate: "2026-09-12",
    status: "Dikembalikan",
  },
  {
    id: 3,
    member: "Budi Santoso",
    nis: "20260003",
    book: "Matematika Dasar",
    borrowDate: "2026-08-20",
    dueDate: "2026-08-27",
    returnDate: "2026-09-01",
    status: "Dikembalikan",
  },
  {
    id: 4,
    member: "Nur Aisyah",
    nis: "20260004",
    book: "Dasar-Dasar Fisika",
    borrowDate: "2026-08-10",
    dueDate: "2026-08-17",
    returnDate: "2026-08-20",
    status: "Dikembalikan",
  },
  {
    id: 5,
    member: "Rizky Maulana",
    nis: "20260005",
    book: "Pemrograman Web",
    borrowDate: "2026-09-10",
    dueDate: "2026-09-17",
    returnDate: "-",
    status: "Dipinjam",
  },
];

const bukuDefault = [
  {
    id: 1,
    title: "Algoritma dan Pemrograman",
    category: "Informatika",
    total: 24,
  },
  {
    id: 2,
    title: "Pemrograman Web",
    category: "Informatika",
    total: 19,
  },
  {
    id: 3,
    title: "Matematika Dasar",
    category: "Matematika",
    total: 16,
  },
  {
    id: 4,
    title: "Bahasa Indonesia",
    category: "Bahasa",
    total: 14,
  },
  {
    id: 5,
    title: "Dasar-Dasar Fisika",
    category: "Sains",
    total: 11,
  },
];

const anggotaDefault = [
  {
    id: 1,
    name: "Ahmad Fauzan",
    nis: "20260001",
    className: "XII IPA 1",
    status: "Aktif",
  },
  {
    id: 2,
    name: "Siti Rahma",
    nis: "20260002",
    className: "XI IPS 1",
    status: "Aktif",
  },
  {
    id: 3,
    name: "Budi Santoso",
    nis: "20260003",
    className: "XII IPA 2",
    status: "Aktif",
  },
  {
    id: 4,
    name: "Nur Aisyah",
    nis: "20260004",
    className: "XI IPA 1",
    status: "Aktif",
  },
];

const laporanDendaDefault = [
  {
    id: 1,
    member: "Siti Rahma",
    nis: "20260002",
    fine: 4000,
    status: "Belum Dibayar",
  },
  {
    id: 2,
    member: "Ahmad Fauzan",
    nis: "20260001",
    fine: 4000,
    status: "Sudah Dibayar",
  },
  {
    id: 3,
    member: "Budi Santoso",
    nis: "20260003",
    fine: 5000,
    status: "Belum Dibayar",
  },
  {
    id: 4,
    member: "Nur Aisyah",
    nis: "20260004",
    fine: 3000,
    status: "Sudah Dibayar",
  },
];

function formatRupiah(value) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

function formatDate(date) {
  if (!date || date === "-") return "-";

  return new Date(`${date}T00:00:00`).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getStoredData(key, fallback) {
  try {
    const stored = localStorage.getItem(key);

    if (!stored) {
      return fallback;
    }

    const parsed = JSON.parse(stored);

    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function getStoredObject(key, fallback) {
  try {
    const stored = localStorage.getItem(key);

    if (!stored) {
      return fallback;
    }

    const parsed = JSON.parse(stored);

    return parsed && typeof parsed === "object" ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function normalizeStatus(status) {
  const value = String(status || "").toLowerCase();

  if (
    value.includes("kembali") ||
    value.includes("dikembalikan") ||
    value.includes("returned")
  ) {
    return "Dikembalikan";
  }

  return "Dipinjam";
}

function normalizePeminjaman(item, index) {
  return {
    id: item.id ?? index + 1,
    member:
      item.member ??
      item.memberName ??
      item.namaAnggota ??
      item.nama ??
      "-",
    nis: item.nis ?? item.NIS ?? "-",
    book:
      item.book ??
      item.bookTitle ??
      item.judulBuku ??
      item.title ??
      "-",
    borrowDate:
      item.borrowDate ??
      item.borrowedAt ??
      item.tanggalPeminjaman ??
      item.tanggalPinjam ??
      "-",
    dueDate:
      item.dueDate ??
      item.tanggalJatuhTempo ??
      item.jatuhTempo ??
      "-",
    returnDate:
      item.returnDate ??
      item.returnedAt ??
      item.tanggalPengembalian ??
      "-",
    status: normalizeStatus(item.status),
  };
}

function normalizeBuku(item, index) {
  return {
    id: item.id ?? index + 1,
    title:
      item.title ??
      item.name ??
      item.judul ??
      item.judulBuku ??
      "-",
    category:
      item.category ??
      item.kategori ??
      item.categoryName ??
      "Umum",
    total: Number(
      item.total ??
      item.stock ??
      item.stok ??
      item.jumlah ??
      item.quantity ??
      0
    ),
  };
}

function normalizeAnggota(item, index) {
  return {
    id: item.id ?? index + 1,
    name:
      item.name ??
      item.nama ??
      item.member ??
      item.namaAnggota ??
      "-",
    nis: item.nis ?? item.NIS ?? "-",
    className:
      item.className ??
      item.class ??
      item.kelas ??
      "-",
    status:
      item.status ??
      item.activeStatus ??
      "Aktif",
  };
}

function normalizeDenda(item, index, finePerDay) {
  const lateDays = Number(
    item.lateDays ??
    item.daysLate ??
    item.keterlambatan ??
    item.hariTerlambat ??
    0
  );

  const fine =
    item.fine !== undefined && item.fine !== null
      ? Number(item.fine)
      : item.amount !== undefined && item.amount !== null
        ? Number(item.amount)
        : lateDays * finePerDay;

  return {
    id: item.id ?? index + 1,
    member:
      item.member ??
      item.memberName ??
      item.namaAnggota ??
      item.nama ??
      "-",
    nis: item.nis ?? item.NIS ?? "-",
    fine: Number.isFinite(fine) ? fine : 0,
    status:
      item.status === "Sudah Dibayar" ||
        item.status === "Dibayar" ||
        item.paid === true
        ? "Sudah Dibayar"
        : "Belum Dibayar",
  };
}

export default function Laporan() {
  const [period, setPeriod] = useState("Bulan Ini");

  const [laporanPeminjaman, setLaporanPeminjaman] = useState(
    laporanPeminjamanDefault
  );

  const [buku, setBuku] = useState(bukuDefault);

  const [anggota, setAnggota] = useState(anggotaDefault);

  const [laporanDenda, setLaporanDenda] = useState(
    laporanDendaDefault
  );

  const [finePerDay, setFinePerDay] = useState(1000);

  useEffect(() => {
    const loadData = () => {
      const fineSettings = getStoredObject(
        "perpustakaan_fine_settings",
        {
          finePerDay: 1000,
        }
      );

      const currentFinePerDay =
        Number(fineSettings.finePerDay) || 1000;

      setFinePerDay(currentFinePerDay);

      const storedBuku = getStoredData(
        "perpustakaan_buku",
        bukuDefault
      );

      const storedAnggota = getStoredData(
        "perpustakaan_anggota",
        anggotaDefault
      );

      const storedSirkulasi = getStoredData(
        "perpustakaan_sirkulasi",
        laporanPeminjamanDefault
      );

      const storedDenda = getStoredData(
        "perpustakaan_denda",
        laporanDendaDefault
      );

      setBuku(
        storedBuku.map((item, index) =>
          normalizeBuku(item, index)
        )
      );

      setAnggota(
        storedAnggota.map((item, index) =>
          normalizeAnggota(item, index)
        )
      );

      setLaporanPeminjaman(
        storedSirkulasi.map((item, index) =>
          normalizePeminjaman(item, index)
        )
      );

      setLaporanDenda(
        storedDenda.map((item, index) =>
          normalizeDenda(item, index, currentFinePerDay)
        )
      );
    };

    loadData();

    const handleStorage = () => {
      loadData();
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("profileUpdated", handleStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("profileUpdated", handleStorage);
    };
  }, []);

  const filteredPeminjaman = useMemo(() => {
    const now = new Date();

    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);

    const startOfWeek = new Date(startOfDay);
    const day = startOfWeek.getDay();
    const diff = day === 0 ? 6 : day - 1;
    startOfWeek.setDate(startOfWeek.getDate() - diff);

    const startOfMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    );

    const startOfYear = new Date(
      now.getFullYear(),
      0,
      1
    );

    return laporanPeminjaman.filter((item) => {
      if (!item.borrowDate || item.borrowDate === "-") {
        return true;
      }

      const date = new Date(`${item.borrowDate}T00:00:00`);

      if (Number.isNaN(date.getTime())) {
        return true;
      }

      if (period === "Hari Ini") {
        return date >= startOfDay;
      }

      if (period === "Minggu Ini") {
        return date >= startOfWeek;
      }

      if (period === "Bulan Ini") {
        return date >= startOfMonth;
      }

      if (period === "Tahun Ini") {
        return date >= startOfYear;
      }

      return true;
    });
  }, [laporanPeminjaman, period]);

  const bukuPopuler = useMemo(() => {
    const peminjamanCount = {};

    laporanPeminjaman.forEach((item) => {
      const title = String(item.book || "").trim();

      if (!title || title === "-") {
        return;
      }

      peminjamanCount[title] =
        (peminjamanCount[title] || 0) + 1;
    });

    return buku
      .map((book, index) => ({
        id: book.id ?? index + 1,
        title: book.title,
        category: book.category,
        total: peminjamanCount[book.title] || 0,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [buku, laporanPeminjaman]);

  const stats = useMemo(() => {
    const totalPeminjaman = filteredPeminjaman.length;

    const totalPengembalian = filteredPeminjaman.filter(
      (item) => item.status === "Dikembalikan"
    ).length;

    const sedangDipinjam = filteredPeminjaman.filter(
      (item) => item.status === "Dipinjam"
    ).length;

    const totalDenda = laporanDenda.reduce(
      (sum, item) => sum + (Number(item.fine) || 0),
      0
    );

    return {
      totalPeminjaman,
      totalPengembalian,
      sedangDipinjam,
      totalDenda,
    };
  }, [filteredPeminjaman, laporanDenda]);

  const statistikAnggota = useMemo(() => {
    const totalAnggota = anggota.length;

    const anggotaAktif = anggota.filter((item) => {
      const status = String(item.status || "").toLowerCase();

      return (
        status === "aktif" ||
        status === "active" ||
        status === "true"
      );
    }).length;

    const peminjamAktif = new Set(
      laporanPeminjaman
        .filter((item) => item.status === "Dipinjam")
        .map((item) => item.nis || item.member)
    ).size;

    const sekarang = new Date();

    const anggotaBaru = anggota.filter((item) => {
      const createdAt =
        item.createdAt ??
        item.created_at ??
        item.tanggalDaftar ??
        item.registrationDate;

      if (!createdAt) {
        return false;
      }

      const date = new Date(createdAt);

      if (Number.isNaN(date.getTime())) {
        return false;
      }

      if (period === "Hari Ini") {
        return (
          date.toDateString() === sekarang.toDateString()
        );
      }

      if (period === "Minggu Ini") {
        const start = new Date(sekarang);
        const day = start.getDay();
        const diff = day === 0 ? 6 : day - 1;

        start.setDate(start.getDate() - diff);
        start.setHours(0, 0, 0, 0);

        return date >= start;
      }

      if (period === "Bulan Ini") {
        return (
          date.getMonth() === sekarang.getMonth() &&
          date.getFullYear() === sekarang.getFullYear()
        );
      }

      if (period === "Tahun Ini") {
        return date.getFullYear() === sekarang.getFullYear();
      }

      return true;
    }).length;

    return {
      totalAnggota,
      anggotaAktif,
      peminjamAktif,
      anggotaBaru,
    };
  }, [anggota, laporanPeminjaman, period]);

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    const headers = [
      "Anggota",
      "NIS",
      "Buku",
      "Tanggal Peminjaman",
      "Jatuh Tempo",
      "Tanggal Pengembalian",
      "Status",
    ];

    const rows = filteredPeminjaman.map((item) => [
      item.member,
      item.nis,
      item.book,
      item.borrowDate,
      item.dueDate,
      item.returnDate,
      item.status,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row
          .map((value) =>
            `"${String(value).replace(/"/g, '""')}"`
          )
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "laporan-perpustakaan.csv";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            Laporan
          </h1>
          <p className="mt-0.5 text-xs sm:text-sm text-slate-500">
            Rekap aktivitas perpustakaan dan statistik sirkulasi buku.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm font-semibold text-slate-700 shadow-2xs transition hover:bg-slate-50 active:scale-95"
          >
            <Download size={15} />
            Export CSV
          </button>

          <button
            onClick={handlePrint}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-95"
          >
            <Printer size={15} />
            Cetak
          </button>
        </div>
      </div>

      {/* FILTER PERIODE */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5 sm:p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <CalendarDays size={18} />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-semibold text-slate-800">
                Periode
              </p>
              <p className="text-[11px] text-slate-400">
                Filter rentang data
              </p>
            </div>
          </div>

          <div className="flex overflow-x-auto custom-scrollbar pb-1 sm:pb-0 gap-1.5">
            {["Hari Ini", "Minggu Ini", "Bulan Ini", "Tahun Ini"].map((item) => (
              <button
                key={item}
                onClick={() => setPeriod(item)}
                className={`whitespace-nowrap rounded-xl px-3 py-1.5 text-xs font-semibold transition active:scale-95 ${
                  period === item
                    ? "bg-blue-600 text-white shadow-xs"
                    : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* STATISTICS */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {/* PEMINJAMAN */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-slate-500">
                Total Peminjaman
              </p>
              <h3 className="mt-1 text-xl sm:text-2xl font-bold text-slate-900">
                {stats.totalPeminjaman}
              </h3>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <BookOpen size={18} />
            </div>
          </div>
        </div>

        {/* PENGEMBALIAN */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-slate-500">
                Total Pengembalian
              </p>
              <h3 className="mt-1 text-xl sm:text-2xl font-bold text-slate-900">
                {stats.totalPengembalian}
              </h3>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-50 text-green-600">
              <CheckCircle2 size={18} />
            </div>
          </div>
        </div>

        {/* SEDANG DIPINJAM */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-slate-500">
                Sedang Dipinjam
              </p>
              <h3 className="mt-1 text-xl sm:text-2xl font-bold text-slate-900">
                {stats.sedangDipinjam}
              </h3>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
              <Clock3 size={18} />
            </div>
          </div>
        </div>

        {/* DENDA */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-slate-500">
                Total Denda
              </p>
              <h3 className="mt-1 text-xl sm:text-2xl font-bold text-slate-900">
                {formatRupiah(stats.totalDenda)}
              </h3>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
              <Wallet size={18} />
            </div>
          </div>
        </div>
      </div>

      {/* RINGKASAN */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* RINGKASAN SIRKULASI */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
            <div>
              <h2 className="font-bold text-slate-900">
                Ringkasan Sirkulasi
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                Periode: {period}
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <BarChart3 size={20} />
            </div>
          </div>

          <div className="space-y-5 p-6">
            {/* PEMINJAMAN */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm text-slate-500">
                  Peminjaman
                </span>

                <span className="text-sm font-bold text-slate-800">
                  {stats.totalPeminjaman}
                </span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-blue-600"
                  style={{
                    width: `${Math.min(
                      stats.totalPeminjaman * 12,
                      100
                    )}%`,
                  }}
                />
              </div>
            </div>

            {/* PENGEMBALIAN */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm text-slate-500">
                  Pengembalian
                </span>

                <span className="text-sm font-bold text-slate-800">
                  {stats.totalPengembalian}
                </span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-green-500"
                  style={{
                    width: `${Math.min(
                      stats.totalPengembalian * 15,
                      100
                    )}%`,
                  }}
                />
              </div>
            </div>

            {/* SEDANG DIPINJAM */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm text-slate-500">
                  Sedang Dipinjam
                </span>

                <span className="text-sm font-bold text-slate-800">
                  {stats.sedangDipinjam}
                </span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-orange-500"
                  style={{
                    width: `${Math.min(
                      stats.sedangDipinjam * 20,
                      100
                    )}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ANGGOTA */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
            <div>
              <h2 className="font-bold text-slate-900">
                Statistik Anggota
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                Aktivitas anggota perpustakaan
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
              <Users size={20} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 p-6">
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs text-slate-500">
                Anggota Aktif
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                {statistikAnggota.anggotaAktif}
              </p>

              <p className="mt-1 text-xs text-green-600">
                Aktif menggunakan perpustakaan
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs text-slate-500">
                Peminjam Aktif
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                {statistikAnggota.peminjamAktif}
              </p>

              <p className="mt-1 text-xs text-blue-600">
                Sedang memiliki pinjaman
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs text-slate-500">
                Anggota Baru
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                {statistikAnggota.anggotaBaru}
              </p>

              <p className="mt-1 text-xs text-purple-600">
                Pada periode ini
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs text-slate-500">
                Total Anggota
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                {statistikAnggota.totalAnggota}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Terdaftar di sistem
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* BUKU POPULER */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <h2 className="font-bold text-slate-900">
              Buku Paling Sering Dipinjam
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              Berdasarkan jumlah peminjaman
            </p>
          </div>

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <BookOpen size={20} />
          </div>
        </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="w-16 px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  #
                </th>

                <th className="min-w-[300px] px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Judul Buku
                </th>

                <th className="min-w-[180px] px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Kategori
                </th>

                <th className="min-w-[150px] px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Peminjaman
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {bukuPopuler.map((book, index) => (
                <tr
                  key={book.id}
                  className="transition hover:bg-slate-50"
                >
                  <td className="px-6 py-4 text-sm font-medium text-slate-400">
                    {String(index + 1).padStart(2, "0")}
                  </td>

                  <td className="px-6 py-4">
                    <p className="font-semibold text-slate-900">
                      {book.title}
                    </p>
                  </td>

                  <td className="px-6 py-4">
                    <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">
                      {book.category}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-slate-800">
                      {book.total} kali
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAIL PEMINJAMAN */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <h2 className="font-bold text-slate-900">
              Detail Peminjaman
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              Rekap transaksi peminjaman dan pengembalian buku
            </p>
          </div>

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <FileText size={20} />
          </div>
        </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[1100px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="min-w-[160px] px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Anggota
                </th>

                <th className="min-w-[220px] px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Buku
                </th>

                <th className="min-w-[140px] px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Peminjaman
                </th>

                <th className="min-w-[140px] px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Jatuh Tempo
                </th>

                <th className="min-w-[160px] px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Pengembalian
                </th>

                <th className="min-w-[140px] px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Status
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredPeminjaman.map((item) => (
                <tr
                  key={item.id}
                  className="transition hover:bg-slate-50"
                >
                  {/* ANGGOTA */}
                  <td className="px-6 py-4">
                    <p className="font-semibold text-slate-900">
                      {item.member}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      NIS {item.nis}
                    </p>
                  </td>

                  {/* BUKU */}
                  <td className="px-6 py-4">
                    <p className="max-w-[230px] whitespace-normal text-sm font-medium leading-5 text-slate-800">
                      {item.book}
                    </p>
                  </td>

                  {/* PEMINJAMAN */}
                  <td className="px-6 py-4 text-sm text-slate-700">
                    {formatDate(item.borrowDate)}
                  </td>

                  {/* JATUH TEMPO */}
                  <td className="px-6 py-4 text-sm text-slate-700">
                    {formatDate(item.dueDate)}
                  </td>

                  {/* PENGEMBALIAN */}
                  <td className="px-6 py-4 text-sm text-slate-700">
                    {formatDate(item.returnDate)}
                  </td>

                  {/* STATUS */}
                  <td className="px-6 py-4">
                    {item.status === "Dikembalikan" ? (
                      <span className="inline-flex items-center gap-2 whitespace-nowrap text-sm font-medium text-green-600">
                        <span className="h-2 w-2 rounded-full bg-green-500" />
                        Dikembalikan
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2 whitespace-nowrap text-sm font-medium text-orange-600">
                        <span className="h-2 w-2 rounded-full bg-orange-500" />
                        Dipinjam
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* REKAP DENDA */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <h2 className="font-bold text-slate-900">
              Rekap Denda
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              Ringkasan denda keterlambatan buku
            </p>
          </div>

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
            <Wallet size={20} />
          </div>
        </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="min-w-[180px] px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Anggota
                </th>

                <th className="min-w-[160px] px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  NIS
                </th>

                <th className="min-w-[160px] px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Denda
                </th>

                <th className="min-w-[170px] px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Status
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {laporanDenda.map((item) => (
                <tr
                  key={item.id}
                  className="transition hover:bg-slate-50"
                >
                  <td className="px-6 py-4">
                    <p className="font-semibold text-slate-900">
                      {item.member}
                    </p>
                  </td>

                  <td className="px-6 py-4 text-sm text-slate-600">
                    {item.nis}
                  </td>

                  <td className="px-6 py-4">
                    <span className="font-bold text-slate-900">
                      {formatRupiah(item.fine)}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    {item.status === "Sudah Dibayar" ? (
                      <span className="inline-flex items-center gap-2 whitespace-nowrap text-sm font-medium text-green-600">
                        <span className="h-2 w-2 rounded-full bg-green-500" />
                        Sudah Dibayar
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2 whitespace-nowrap text-sm font-medium text-orange-600">
                        <span className="h-2 w-2 rounded-full bg-orange-500" />
                        Belum Dibayar
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CATATAN */}
      <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
        <div className="flex gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
            <FileText size={18} />
          </div>

          <div>
            <h3 className="text-sm font-semibold text-blue-900">
              Informasi Laporan
            </h3>

            <p className="mt-1 text-sm leading-6 text-blue-700">
              Data laporan mengikuti data Koleksi Buku, Anggota,
              Sirkulasi, dan Denda yang tersimpan pada sistem.
              Tombol Export CSV dapat digunakan untuk mengunduh
              rekap peminjaman, sedangkan tombol Cetak Laporan akan
              membuka fungsi cetak browser.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
