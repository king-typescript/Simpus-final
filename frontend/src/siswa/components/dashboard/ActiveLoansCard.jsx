import { motion } from 'framer-motion';
import { FiBook } from 'react-icons/fi';

export default function ActiveLoansCard({ bukuList = [] }) {
  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col h-full overflow-hidden">
      <div className="p-5 sm:p-6 border-b border-gray-100 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <FiBook className="text-primary-blue text-lg" />
          <h3 className="font-bold text-base sm:text-lg text-dark-navy">Buku Aktif Dipinjam</h3>
        </div>
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
          className="text-[10px] sm:text-xs font-bold px-2.5 py-1 bg-primary-blue/10 text-primary-blue rounded-full"
        >
          {bukuList.length} Aktif
        </motion.span>
      </div>

      <div className="p-4 sm:p-6 space-y-3 sm:space-y-4 flex-1">
        {bukuList.length > 0 ? (
          bukuList.map((buku, index) => (
            <motion.div
              key={buku.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.01 }}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-light-blue/30 rounded-2xl border border-light-blue/50 gap-3 group"
            >
              <div className="flex space-x-3 sm:space-x-4 items-center min-w-0">
                <div className="w-11 h-14 sm:w-12 sm:h-16 bg-gradient-to-b from-gray-100 to-gray-200 rounded-xl flex-shrink-0 flex items-center justify-center text-xs text-gray-400 font-bold overflow-hidden shadow-sm group-hover:shadow-md transition-shadow">
                  <FiBook className="text-gray-300 text-lg" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-text-utama text-sm sm:text-base leading-snug truncate">
                    {buku.judul}
                  </h4>
                  <p className="text-[10px] sm:text-xs text-text-sekunder mt-0.5 sm:mt-1">
                    Rak: <span className="font-semibold">{buku.rak}</span> | Kode: <span className="font-semibold">{buku.kode}</span>
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-start sm:items-end shrink-0 gap-1">
                <span className="bg-amber-100 text-amber-700 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] font-bold shadow-sm">
                  Jatuh Tempo: {buku.jatuhTempo}
                </span>
                <p className="text-[10px] text-text-sekunder italic">
                  {buku.catatan}
                </p>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-8 text-text-sekunder text-sm">
            Tidak ada buku yang sedang dipinjam.
          </div>
        )}
      </div>
    </div>
  );
}
