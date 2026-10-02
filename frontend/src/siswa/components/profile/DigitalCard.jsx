import { motion } from 'framer-motion';
import { FiUser, FiCamera } from 'react-icons/fi';
import { useAuth } from '../../../lib/auth.jsx';

export default function DigitalCard() {
  const { user } = useAuth();
  const displayName = user?.name || 'Siswa Perpustakaan';
  const displayNis = user?.nis || '-';
  const displayCardNumber = user?.libraryCardNumber || displayNis;
  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=102E68&color=fff`;

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -3 }}
      className="bg-gradient-to-b from-dark-navy to-[#0d2257] rounded-3xl p-6 sm:p-8 shadow-xl text-white flex flex-col items-center relative overflow-hidden"
    >
      {/* Dekoratif circle */}
      <div className="absolute top-[-30px] right-[-30px] w-48 h-48 rounded-full bg-primary-blue/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-30px] left-[-30px] w-36 h-36 rounded-full bg-accent/10 blur-2xl pointer-events-none" />
      <FiUser className="absolute top-4 right-4 opacity-10 text-7xl sm:text-8xl pointer-events-none" />

      {/* Avatar */}
      <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full border-4 border-white/80 overflow-hidden mb-4 relative group cursor-pointer shadow-2xl ring-4 ring-primary-blue/30">
        <img
          src={avatarUrl}
          alt="Foto Profil Siswa"
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex-col gap-1">
          <FiCamera className="text-white text-xl" />
          <span className="text-white text-[10px] font-bold">Ubah Foto</span>
        </div>
      </div>

      <motion.h3
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-base sm:text-lg md:text-xl font-bold text-center px-2 leading-snug"
      >
        {displayName}
      </motion.h3>
      <p className="text-light-blue/80 text-xs sm:text-sm mb-4 sm:mb-6 font-medium">
        Siswa / Anggota Aktif
      </p>

      {/* Kartu Anggota */}
      <div className="w-full bg-white rounded-2xl p-3 sm:p-4 flex flex-col items-center shadow-inner border border-gray-50">
        <p className="text-[9px] sm:text-[10px] text-gray-400 font-bold uppercase mb-2 sm:mb-3 tracking-widest">
          Kartu Anggota Digital
        </p>
        <div className="w-full h-10 sm:h-12 flex justify-center items-center space-x-0.5 sm:space-x-1 px-2 overflow-hidden">
          {[...Array(28)].map((_, i) => (
            <div
              key={i}
              className={`bg-dark-navy h-full rounded-[1px] ${
                i % 5 === 0 ? 'w-2 sm:w-2.5' : i % 3 === 0 ? 'w-1 sm:w-1.5' : 'w-0.5 sm:w-1'
              }`}
            />
          ))}
        </div>
        <p className="text-dark-navy font-black tracking-[0.15em] sm:tracking-[0.2em] mt-2 text-xs sm:text-sm font-mono">
          {displayCardNumber}
        </p>
      </div>

      {/* Status Badge */}
      <div className="mt-3 sm:mt-4 flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 w-full justify-center">
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-xs font-semibold text-white/90">Keanggotaan {user?.status || 'Aktif'}</span>
      </div>
    </motion.div>
  );
}
