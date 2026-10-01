import { motion } from 'framer-motion';
import { FiArrowRight, FiBookOpen } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { koleksiTerbaru } from '../../data/mockData';

export default function NewCollectionCard() {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 flex-1 flex flex-col overflow-hidden">
      <div className="p-5 sm:p-6 border-b border-gray-100 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <FiBookOpen className="text-primary-blue text-lg" />
          <h3 className="font-bold text-base sm:text-lg text-dark-navy">Koleksi Terbaru</h3>
        </div>
        <motion.button
          whileHover={{ x: 3 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/siswa/katalog')}
          className="text-xs font-bold text-primary-blue hover:text-dark-navy flex items-center space-x-1 focus:outline-none transition-colors"
        >
          <span>Lihat Semua</span>
          <FiArrowRight className="text-sm" />
        </motion.button>
      </div>

      <div className="p-4 sm:p-6 flex gap-3 sm:gap-4 overflow-x-auto pb-3 sm:pb-4 no-scrollbar">
        {koleksiTerbaru.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -6, scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => navigate('/siswa/katalog')}
            className="w-24 sm:w-28 shrink-0 cursor-pointer group flex flex-col"
          >
            <div className="w-24 sm:w-28 h-32 sm:h-36 bg-gradient-to-tr from-slate-100 to-slate-200 rounded-2xl flex flex-col items-center justify-center p-3 mb-2 shadow-sm group-hover:shadow-lg group-hover:border-primary-blue/30 border border-transparent transition-all duration-300 relative overflow-hidden">
              <div className="absolute inset-0 bg-primary-blue/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <FiBookOpen className="text-2xl text-slate-400 group-hover:text-primary-blue transition-colors mb-2" />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center line-clamp-1">
                {item.kategori}
              </span>
            </div>
            <p className="text-xs font-bold text-text-utama truncate group-hover:text-primary-blue transition-colors">
              {item.judul}
            </p>
            <p className="text-[10px] text-text-sekunder truncate">
              {item.penulis}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
