import { motion } from 'framer-motion';
import { FiBookOpen, FiCheckCircle, FiAlertTriangle } from 'react-icons/fi';

const iconConfig = {
  warning: {
    icon: FiBookOpen,
    bgClass: 'bg-light-blue',
    textClass: 'text-primary-blue',
    ring: 'ring-light-blue',
  },
  success: {
    icon: FiCheckCircle,
    bgClass: 'bg-emerald-50',
    textClass: 'text-emerald-600',
    ring: 'ring-emerald-50',
  },
  danger: {
    icon: FiAlertTriangle,
    bgClass: 'bg-rose-50',
    textClass: 'text-rose-500',
    ring: 'ring-rose-50',
  },
};

export default function StatCard({ label, nilai, satuan, tipe = 'warning' }) {
  const current = iconConfig[tipe] || iconConfig.warning;
  const IconComponent = current.icon;

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-gray-100 flex items-center space-x-4 sm:space-x-5 group cursor-pointer relative overflow-hidden"
    >
      <div className={`absolute top-0 right-0 w-24 h-24 rounded-bl-full ${current.bgClass} opacity-50 -z-10 group-hover:scale-110 transition-transform duration-500`}></div>
      
      <div className={`p-3 sm:p-4 ${current.bgClass} ${current.textClass} rounded-2xl text-xl sm:text-2xl shrink-0 shadow-sm ring-4 ${current.ring} group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
        <IconComponent />
      </div>
      <div>
        <p className="text-text-sekunder text-[11px] sm:text-xs font-semibold mb-0.5 sm:mb-1 uppercase tracking-wide">
          {label}
        </p>
        <h3 className="text-2xl sm:text-3xl font-black text-dark-navy tracking-tight flex items-baseline">
          {nilai}
          {satuan && <span className="text-xs sm:text-sm font-semibold text-text-sekunder ml-1.5">{satuan}</span>}
        </h3>
      </div>
    </motion.div>
  );
}
