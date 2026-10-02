import { motion } from 'framer-motion';
import { FiCheckCircle, FiBook } from 'react-icons/fi';

export default function RecentReadCard({ buku = null }) {
  if (!buku) return null;

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-5 sm:p-6 border-b border-gray-100 flex items-center space-x-2">
        <FiCheckCircle className="text-emerald-500 text-lg" />
        <h3 className="font-bold text-base sm:text-lg text-dark-navy">Baru Selesai Dibaca</h3>
      </div>
      <div className="p-4 sm:p-6">
        <motion.div
          whileHover={{ scale: 1.01 }}
          className="flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 group"
        >
          <div className="w-11 h-14 sm:w-12 sm:h-16 bg-gradient-to-b from-emerald-100 to-emerald-200 rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden shadow-sm group-hover:shadow-md transition-shadow">
            <FiBook className="text-emerald-400 text-lg" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-text-utama text-sm sm:text-base truncate">
              {buku.judul}
            </h4>
            <p className="text-[10px] sm:text-xs text-text-sekunder mt-0.5 sm:mt-1">
              Dikembalikan: <span className="font-semibold text-text-utama">{buku.dikembalikan}</span>
            </p>
          </div>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, delay: 0.3 }}
          >
            <FiCheckCircle className="text-xl sm:text-2xl text-emerald-500 shrink-0" />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
