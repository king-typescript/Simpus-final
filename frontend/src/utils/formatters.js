/**
 * ==============================================================================
 * Utility: Formatters Helper
 * Deskripsi: Fungsi bantuan untuk kalkulasi denda, format mata uang Rupiah (IDR),
 *            serta format tanggal standar Indonesia.
 * ==============================================================================
 */

/**
 * Memformat angka nominal menjadi string Rupiah (contoh: Rp 5.000)
 */
export function formatRupiah(number) {
  if (isNaN(number)) return "Rp 0";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(number);
}

/**
 * Memformat tanggal string/date menjadi format tanggal Indonesia (contoh: 25 Sep 2026)
 */
export function formatDate(dateString) {
  if (!dateString) return "-";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

/**
 * Menghitung selisih keterlambatan hari dari tanggal jatuh tempo
 */
export function calculateLateDays(dueDateString) {
  if (!dueDateString) return 0;
  const dueDate = new Date(dueDateString);
  const today = new Date();
  
  // Mengabaikan komponen jam
  dueDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const diffTime = today - dueDate;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays > 0 ? diffDays : 0;
}

/**
 * Menghitung estimasi total denda berdasarkan keterlambatan hari dan tarif per hari
 */
export function calculateFine(dueDateString, finePerDay = 1000) {
  const lateDays = calculateLateDays(dueDateString);
  return lateDays * finePerDay;
}
