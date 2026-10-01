/**
 * ==============================================================================
 * Utility: Status Styles Mapping
 * Deskripsi: Mapping fungsi untuk mengembalikan kelas Tailwind CSS (warna) 
 *            berdasarkan berbagai state teks (status transaksi, keanggotaan, dsb).
 * ==============================================================================
 */

export function getStatusStyle(status, type = "general") {
  // --- Modul Denda ---
  if (type === "fine") {
    switch (status) {
      case "Sudah Dibayar":
        return "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20";
      case "Belum Dibayar":
        return "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/20";
      default:
        return "bg-slate-50 text-slate-700 ring-1 ring-inset ring-slate-500/20";
    }
  }

  // --- Modul Umum (Keanggotaan, Sirkulasi, Ketersediaan) ---
  switch (status) {
    // Status Positif (Hijau)
    case "Aktif":
    case "Tersedia":
    case "Dikembalikan":
    case "Selesai":
      return "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20";
    
    // Status Peringatan/Tindakan (Kuning/Biru Muda)
    case "Dipinjam":
      return "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20";
    
    // Status Negatif (Merah)
    case "Tidak Aktif":
    case "Terlambat":
      return "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/20";
    
    // Status Default/Abu-abu
    case "Hilang":
    case "Rusak":
    default:
      return "bg-slate-50 text-slate-700 ring-1 ring-inset ring-slate-500/20";
  }
}
