import { motion } from 'framer-motion';
import { FiClock, FiCheckCircle, FiTablet, FiBook, FiEye, FiCornerUpLeft } from 'react-icons/fi';

export default function RiwayatItem({ item, onRead, onReturn }) {
  const isSelesai = item.status === 'Selesai';
  const isEbook = Boolean(item.isEbook);

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 sm:p-5 border border-gray-100 rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow group"
    >
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-2">
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
          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
            isEbook ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
          }`}>
            {isEbook ? <FiTablet size={11} /> : <FiBook size={11} />}
            {isEbook ? 'E-Book' : 'Fisik'}
          </span>
        </div>
        <h4 className="font-bold text-text-utama text-sm sm:text-base leading-tight mb-2">
          {item.judul}
        </h4>
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-[11px] sm:text-xs text-text-sekunder bg-gray-50/70 p-2 sm:p-2.5 rounded-xl border border-gray-100/60 w-full sm:w-auto sm:inline-flex">
          <p>Pinjam: <span className="text-text-utama font-semibold">{item.waktuPinjam}</span></p>
          <span className="hidden sm:inline text-gray-300">|</span>
          <p>Kembali: <span className="text-text-utama font-semibold">{item.waktuKembali}</span></p>
        </div>
        {isEbook && !isSelesai && (
          <div className="mt-3 flex flex-wrap gap-2">
            {onRead && (
              <button
                type="button"
                onClick={onRead}
                className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-purple-700 active:scale-95"
              >
                <FiEye size={14} />
                Baca Sekarang
              </button>
            )}
            {onReturn && (
              <button
                type="button"
                onClick={onReturn}
                className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50 active:scale-95"
              >
                <FiCornerUpLeft size={14} />
                Kembalikan
              </button>
            )}
          </div>
        )}
      </div>
      <div className="shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-gray-100 text-left md:text-right flex md:flex-col justify-between md:items-end gap-1">
        <p className="text-[10px] sm:text-xs font-semibold text-text-sekunder uppercase tracking-wide">Status Denda</p>
        <p className={`text-xs sm:text-sm font-bold ${
          item.denda === 'Tidak Ada (-)' ? 'text-gray-400' : 'text-rose-500'
        }`}>
          {item.denda}
        </p>
      </div>
    </motion.div>
  );
}
