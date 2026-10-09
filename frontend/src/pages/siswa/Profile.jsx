import { motion } from 'framer-motion';
import { FiUser, FiMail, FiMapPin, FiPhone, FiLogOut } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../lib/auth.jsx'; // Mengambil fungsi auth

export default function ProfileSiswa() {
  const navigate = useNavigate();
  // MENYAMBUNGKAN KE BACKEND
  const { user, logout } = useAuth(); 

  const handleLogout = async () => {
    await logout(); // Menjalankan fungsi logout API
    navigate('/login');
  };

  return (
    <div className="max-w-2xl mx-auto w-full space-y-6">
      <div className="flex items-center justify-between">
         <h1 className="text-2xl font-extrabold text-dark-navy">Profil Saya</h1>
         <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-sm">
           <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
           {user?.status || 'Anggota Aktif'}
         </span>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden"
      >
        <div className="h-24 sm:h-32 bg-slate-700 relative">
           <div className="absolute inset-0 bg-white/5 pattern-dots"></div>
        </div>

        <div className="px-6 sm:px-8 pb-8 relative">
          <div className="flex justify-center -mt-12 sm:-mt-16 mb-4 relative z-10">
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-white p-1.5 shadow-md">
               <div className="w-full h-full rounded-full bg-slate-100 border-4 border-white flex items-center justify-center text-4xl sm:text-5xl font-bold text-slate-300">
                  <FiUser />
               </div>
            </div>
          </div>

          <div className="text-center mb-8">
             <h2 className="text-xl sm:text-2xl font-extrabold text-dark-navy">{user?.name || 'Siswa'}</h2>
             <p className="text-slate-500 font-semibold mt-1">{user?.nis || '-'} • {user?.className || 'Belum ada kelas'}</p>
          </div>

          <div className="bg-slate-50/50 rounded-2xl border border-slate-100 p-5 sm:p-6 space-y-4">
             <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Informasi Kontak & Detail</h3>
             
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
                   <FiMail />
                 </div>
                 <div className="overflow-hidden">
                   <p className="text-[10px] sm:text-xs text-slate-500 font-semibold">Email</p>
                   <p className="text-sm font-bold text-dark-navy truncate">{user?.email || '-'}</p>
                 </div>
               </div>

               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
                   <FiPhone />
                 </div>
                 <div>
                   <p className="text-[10px] sm:text-xs text-slate-500 font-semibold">No. Telepon</p>
                   <p className="text-sm font-bold text-dark-navy">{user?.phone || '-'}</p>
                 </div>
               </div>

               <div className="flex items-center gap-3 sm:col-span-2">
                 <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
                   <FiMapPin />
                 </div>
                 <div>
                   <p className="text-[10px] sm:text-xs text-slate-500 font-semibold">Alamat</p>
                   <p className="text-sm font-bold text-dark-navy">{user?.address || '-'}</p>
                 </div>
               </div>
             </div>
          </div>
        </div>
      </motion.div>

      <motion.button 
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleLogout}
        className="w-full bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-colors border border-rose-100"
      >
        <FiLogOut />
        Keluar dari Aplikasi
      </motion.button>
    </div>
  );
}