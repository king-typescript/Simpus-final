import { motion } from 'framer-motion';
import { FiBook, FiTablet } from 'react-icons/fi';

export default function BookCard({ buku, onDetailClick }) {
  const isTersedia = buku.stok > 0;

  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm flex flex-col group"
    >
      <div className="h-40 sm:h-48 bg-gradient-to-t from-gray-200 to-gray-100 flex justify-center items-center relative overflow-hidden">
        {buku.sampul ? (
          <img src={buku.sampul} alt={buku.judul} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
        ) : (
          <div className="flex flex-col items-center justify-center group-hover:scale-110 transition-transform duration-500">
            {buku.isEbook ? <FiTablet className="text-3xl text-gray-400 mb-1" /> : <FiBook className="text-3xl text-gray-300 mb-1" />}
            <span className="text-gray-400 font-bold text-[10px] uppercase tracking-wider">Cover</span>
          </div>
        )}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          <span className="text-[10px] font-bold text-white bg-primary-blue/80 backdrop-blur-sm px-2.5 py-1 rounded-lg uppercase tracking-wider shadow-sm">
            {buku.kategori}
          </span>
          {buku.isEbook && (
            <span className="text-[10px] font-black text-purple-800 bg-purple-300/90 backdrop-blur-sm px-2.5 py-1 rounded-lg uppercase tracking-wider shadow-sm flex items-center gap-1">
              <FiTablet /> E-BOOK
            </span>
          )}
        </div>
      </div>

      <div className="p-4 sm:p-5 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-2 gap-2">
          <h3 className="font-bold text-text-utama text-sm sm:text-base leading-tight group-hover:text-primary-blue transition-colors line-clamp-2 flex-1">
            {buku.judul}
          </h3>
          <span className="text-[10px] font-semibold text-text-sekunder shrink-0 bg-gray-50 px-2 py-0.5 rounded-md">
            {buku.rak}
          </span>
        </div>

        <p className="text-xs text-text-sekunder mb-3">
          <span className="text-text-utama font-medium">{buku.penulis}</span>
        </p>

        <div className="mt-auto pt-3 border-t border-gray-100">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] sm:text-xs font-semibold text-text-sekunder">Ketersediaan</span>
            {isTersedia ? (
              <span className="bg-emerald-100 text-emerald-700 font-bold px-2.5 py-0.5 rounded-full text-[10px]">
                Tersedia ({buku.stok})
              </span>
            ) : (
              <span className="bg-rose-100 text-rose-600 font-bold px-2.5 py-0.5 rounded-full text-[10px]">
                Dipinjam
              </span>
            )}
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => onDetailClick(buku)}
            className="w-full py-2.5 bg-light-blue text-primary-blue hover:bg-primary-blue hover:text-white rounded-2xl text-xs sm:text-sm font-bold transition-all duration-300 shadow-sm"
          >
            Lihat Detail
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
