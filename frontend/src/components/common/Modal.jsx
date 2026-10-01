/**
 * ==============================================================================
 * Komponen Bersama: Modal Dialog (Pop-up)
 * Deskripsi: Komponen overlay dialog umum dengan penutup otomatis tombol ESC,
 *            animasi pop-in, judul, subjudul, dan scroll body otomatis.
 * ==============================================================================
 */

import { X } from "lucide-react";
import { useEffect } from "react";

export function Modal({
  open,              // Status boolean apakah modal tampil
  onClose,           // Callback fungsi ketika tombol tutup atau ESC ditekan
  title,             // Judul modal
  subtitle,          // Subjudul atau deskripsi singkat di bawah judul (opsional)
  maxWidth = "max-w-xl", // Lebar maksimal kontainer modal (default: max-w-xl)
  children,          // Isi konten internal modal
}) {
  // Listener tombol 'Escape' pada keyboard untuk aksesibilitas UX
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && open) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  // Jika kondisi open bernilai false, komponen tidak dirender sama sekali
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-3 sm:p-4">
      <div
        className={`w-full ${maxWidth} max-h-[90vh] flex flex-col rounded-2xl bg-white shadow-2xl animate-modal-pop`}
      >
        {/* Header Modal */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              {title}
            </h2>
            {subtitle && (
              <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
            aria-label="Tutup modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Konten Body Modal (Dengan Scrollbar Halus) */}
        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
}
