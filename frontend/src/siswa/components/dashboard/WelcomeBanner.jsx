import { motion } from 'framer-motion';
import { FaBullhorn } from 'react-icons/fa6';
import { useAuth } from '../../../lib/auth.jsx';

export default function WelcomeBanner() {
  const { user } = useAuth();
  const todayFormatted = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
      {/* Greeting Banner */}
      <motion.div
        whileHover={{ scale: 1.005 }}
        className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8 border-l-4 border-accent flex flex-col justify-center lg:col-span-2 transition-all duration-300 relative overflow-hidden"
      >
        <div className="absolute right-[-20px] top-[-20px] w-32 h-32 bg-light-blue/40 rounded-full blur-2xl pointer-events-none" />
        <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-dark-navy tracking-tight">
          Selamat datang kembali, <span className="text-primary-blue">{user?.name || 'Siswa'}</span>!
        </h2>
        <p className="text-text-sekunder mt-2 text-sm sm:text-base font-normal">
          Ini adalah ringkasan keanggotaan perpustakaanmu per tanggal <span className="font-semibold text-text-utama">{todayFormatted}</span>.
        </p>
      </motion.div>

      {/* Announcement Card */}
      <motion.div
        whileHover={{ scale: 1.01, y: -2 }}
        whileTap={{ scale: 0.99 }}
        className="bg-gradient-to-br from-primary-blue via-dark-navy to-dark-navy rounded-3xl shadow-md p-6 text-white flex flex-col justify-center relative overflow-hidden group border border-blue-900/20"
      >
        <FaBullhorn className="absolute top-3 right-3 opacity-15 text-7xl group-hover:scale-125 group-hover:rotate-12 group-hover:opacity-25 transition-all duration-500 text-white" />
        <div className="flex items-center space-x-2 mb-2 relative z-10">
          <span className="bg-white/20 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            Pengumuman
          </span>
        </div>
        <h3 className="font-bold text-base sm:text-lg mb-1.5 relative z-10 text-white">
          Layanan Sirkulasi Aktif
        </h3>
        <p className="text-xs sm:text-sm text-light-blue/90 relative z-10 leading-relaxed font-normal">
          Peminjaman dan pengembalian buku dapat dilakukan secara langsung di meja sirkulasi perpustakaan.
        </p>
      </motion.div>
    </div>
  );
}
