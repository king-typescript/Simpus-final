import { motion } from 'framer-motion';
import { FiClock, FiCheckCircle } from 'react-icons/fi';

export default function RiwayatItem({ item }) {
  const isSelesai = item.status === 'Selesai';
  
  return (
    <motion.div 
      whileHover={{ scale: 1.01, y: -2 }}
      className="flex flex-col md:flex-row md:items-center justify-between p-4 sm:p-5 border border-gray-100 rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow group"
    >
      <div className="flex-1">
        <div className="flex items-center space-x-2.5 mb-2">
          {isSelesai ? (
            <FiCheckCircle className="text-emerald-500 text-lg shrink-0" />
          ) : (
            <FiClock className="text-amber-500 text-lg shrink-0" />
          )}
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
            isSelesai ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
          }`}>
            {item.status}
          </span>
        </div>
        <h4 className="font-bold text-text-utama text-sm sm:text-base leading-tight mb-2 group-hover:text-primary-blue transition-colors">
          {item.judul}
        </h4>
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-[10px] sm:text-xs text-text-sekunder bg-gray-50/50 p-2 sm:p-2.5 rounded-lg border border-gray-100/50 inline-flex w-full sm:w-auto">
          <p>Pinjam: <span className="text-text-utama font-semibold">{item.waktuPinjam}</span></p>
          <span className="hidden sm:inline text-gray-300">|</span>
          <p>Kembali: <span className="text-text-utama font-semibold">{item.waktuKembali}</span></p>
        </div>
      </div>
      <div className="mt-3 md:mt-0 pt-3 md:pt-0 border-t md:border-t-0 border-gray-100 text-left md:text-right flex justify-between md:flex-col md:items-end">
        <p className="text-[10px] sm:text-xs font-semibold text-text-sekunder uppercase tracking-wide">Status Denda</p>
        <p className={`text-xs sm:text-sm font-bold mt-0.5 ${
          item.denda === 'Tidak Ada (-)' ? 'text-gray-400' : 'text-rose-500'
        }`}>
          {item.denda}
        </p>
      </div>
    </motion.div>
  );
}
