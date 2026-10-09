import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiBook, FiUser, FiCalendar, FiMapPin, FiHash, FiTablet, FiCheck, FiShield } from 'react-icons/fi';
import { borrowEbookOnline } from '../../../utils/ebookStore';

export default function BookDetailModal({ buku, student, onClose, onOpenReader }) {
  const [borrowSuccess, setBorrowSuccess] = useState(false);
  const [borrowMessage, setBorrowMessage] = useState('');

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  if (!buku) return null;

  const handleBorrowOnline = () => {
    const res = borrowEbookOnline(student?.id || 'siswa-demo', {
      id: buku.id,
      title: buku.judul,
      author: buku.penulis,
      coverUrl: buku.sampul,
      fileUrl: buku.fileUrl,
    }, 7);

    if (res.success) {
      setBorrowSuccess(true);
      setBorrowMessage(res.message);
    }
  };


  const metaItems = [
    { label: 'Kategori', value: buku.kategori, icon: FiBook },
    { label: 'Penerbit', value: buku.penerbit, icon: FiUser },
    { label: 'Tahun Terbit', value: buku.tahun, icon: FiCalendar },
    { label: 'Bahasa', value: buku.bahasa, icon: null },
    { label: 'Halaman', value: `${buku.halaman} hlm`, icon: null },
    { label: 'ISBN', value: buku.isbn, icon: FiHash },
    { label: 'Posisi Rak', value: buku.rak, icon: FiMapPin, full: false, accent: true },
  ];

  return (
    <AnimatePresence>
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        role="dialog"
        aria-modal="true"
        className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-dark-navy/70 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          key="modal"
          initial={{ opacity: 0, scale: 0.92, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 30 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-5 sm:px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white shrink-0">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-light-blue rounded-lg">
                <FiBook className="text-primary-blue text-base" />
              </div>
              <h3 className="font-bold text-base sm:text-lg text-dark-navy">Detail Buku</h3>
            </div>
            <motion.button
              whileHover={{ rotate: 90, scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              aria-label="Tutup detail buku"
              className="p-2 bg-gray-100 hover:bg-rose-100 hover:text-rose-600 rounded-full transition-colors"
            >
              <FiX className="text-lg" />
            </motion.button>
          </div>

          {/* Body */}
          <div className="p-5 sm:p-6 overflow-y-auto flex flex-col sm:flex-row gap-5 sm:gap-6">
            {/* Cover */}
            <div className="w-full sm:w-[140px] sm:shrink-0">
              <div className="w-full sm:w-[140px] aspect-[2/3] bg-gradient-to-b from-gray-100 to-gray-200 rounded-2xl flex flex-col items-center justify-center border border-gray-100 shadow-inner overflow-hidden">
                {buku.sampul ? (
                  <img src={buku.sampul} alt={buku.judul} className="w-full h-full object-cover" />
                ) : (
                  <>
                    {buku.isEbook ? <FiTablet className="text-4xl text-purple-400 mb-2" /> : <FiBook className="text-4xl text-gray-300 mb-2" />}
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Cover</span>
                  </>
                )}
              </div>
              <div className="mt-3">
                {buku.isEbook ? (
                  <span className="px-4 py-1.5 rounded-full text-xs font-bold w-full text-center flex justify-center bg-purple-100 text-purple-800 border border-purple-200">
                    E-Book Digital
                  </span>
                ) : (
                  <span className={`px-4 py-1.5 rounded-full text-xs font-bold w-full text-center flex justify-center ${
                    buku.stok > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-600'
                  }`}>
                    {buku.stok > 0 ? `Stok: ${buku.stok} Buku` : 'Habis Dipinjam'}
                  </span>
                )}
              </div>
            </div>

            {/* Metadata */}
            <div className="flex-1 space-y-4 min-w-0">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-dark-navy leading-tight">
                  {buku.judul}
                </h2>
                <p className="text-primary-blue font-semibold mt-1 text-sm sm:text-base">
                  Oleh: {buku.penulis}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-y-3 gap-x-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                {metaItems.map((item) => (
                  <div key={item.label} className={item.full ? 'col-span-2' : ''}>
                    <span className="block text-[10px] text-text-sekunder uppercase font-bold tracking-wide">
                      {item.label}
                    </span>
                    <span className={`font-semibold text-sm ${item.accent ? 'text-accent' : 'text-text-utama'}`}>
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>

              <div>
                <span className="block text-[10px] text-text-sekunder font-bold uppercase mb-2 tracking-wide">
                  Sinopsis
                </span>
                <p className="text-sm text-text-utama leading-relaxed">
                  {buku.deskripsi}
                </p>
              </div>
            </div>
          </div>

          {/* Footer CTA */}
          <div className="px-5 sm:px-6 py-4 border-t border-gray-100 bg-gray-50/50 shrink-0">
            {buku.isEbook ? (
              <div className="space-y-2">
                {borrowSuccess && (
                  <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-2 rounded-xl text-xs font-semibold">
                    <FiCheck className="text-sm shrink-0" />
                    <span>{borrowMessage}</span>
                  </div>
                )}
                <div className="flex gap-2">
                  {!borrowSuccess ? (
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleBorrowOnline}
                      className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-2xl text-xs sm:text-sm transition shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                    >
                      <FiTablet />
                      Pinjam E-Book Online (Maks 7 Hari)
                    </motion.button>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => onOpenReader && onOpenReader({
                        id: buku.id,
                        title: buku.judul,
                        author: buku.penulis,
                        coverUrl: buku.sampul,
                        fileUrl: buku.fileUrl,
                      })}
                      className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-xs sm:text-sm transition shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                    >
                      <FiShield />
                      Buka & Baca E-Book Sekarang
                    </motion.button>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onClose}
                    className="px-5 py-3 bg-gray-200 hover:bg-gray-300 text-dark-navy font-bold rounded-2xl text-xs sm:text-sm transition"
                  >
                    Tutup
                  </motion.button>
                </div>
              </div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className="w-full py-3 bg-primary-blue hover:bg-dark-navy text-white font-bold rounded-2xl text-sm transition-all duration-300 shadow-md hover:shadow-lg"
              >
                Tutup
              </motion.button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
