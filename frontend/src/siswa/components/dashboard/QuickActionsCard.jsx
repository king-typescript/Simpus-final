import { motion } from 'framer-motion';
import { FiSearch, FiClock, FiUser, FiBookmark } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

export default function QuickActionsCard() {
  const navigate = useNavigate();

  const actions = [
    {
      id: 'katalog',
      label: 'Cari Buku',
      icon: FiSearch,
      color: 'bg-blue-50 text-primary-blue hover:bg-primary-blue hover:text-white',
      path: '/siswa/katalog',
    },
    {
      id: 'riwayat',
      label: 'Riwayat',
      icon: FiClock,
      color: 'bg-amber-50 text-amber-600 hover:bg-amber-500 hover:text-white',
      path: '/siswa/riwayat',
    },
    {
      id: 'profil',
      label: 'Kartu Digital',
      icon: FiUser,
      color: 'bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white',
      path: '/siswa/profil',
    },
    {
      id: 'koleksi',
      label: 'Koleksi Populer',
      icon: FiBookmark,
      color: 'bg-purple-50 text-purple-600 hover:bg-purple-500 hover:text-white',
      path: '/siswa/katalog',
    },
  ];

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5 sm:p-6">
      <h3 className="font-bold text-base sm:text-lg text-dark-navy mb-4">Aksi Cepat</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <motion.button
              key={action.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(action.path)}
              className={`p-3.5 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all duration-300 font-semibold text-xs shadow-sm border border-gray-50 ${action.color}`}
            >
              <Icon className="text-xl" />
              <span>{action.label}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
