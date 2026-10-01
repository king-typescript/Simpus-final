/**
 * ==============================================================================
 * Komponen Bersama: Avatar Inisial
 * Deskripsi: Menampilkan lingkaran profil berbasis huruf inisial dari nama pengguna.
 * ==============================================================================
 */

export function Avatar({ name = "U", size = "md", className = "" }) {
  // Pilihan ukuran dimensi dan tipografi avatar
  const sizeMap = {
    sm: "h-8 w-8 text-xs",
    md: "h-9 w-9 text-xs sm:text-sm",
    lg: "h-11 w-11 text-sm sm:text-base",
    xl: "h-16 w-16 text-2xl font-black",
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700 ${currentSize} ${className}`}
    >
      {/* Mengambil huruf pertama nama pengguna sebagai inisial */}
      {name.charAt(0).toUpperCase()}
    </div>
  );
}
