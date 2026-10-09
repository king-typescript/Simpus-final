/**
 * ==============================================================================
 * Layout: Siswa Layout Wrapper (VERSI REVISI - Navbar Fixed & Animasi Transisi)
 * ==============================================================================
 */

import { motion, AnimatePresence } from 'framer-motion';
import { Outlet, useLocation } from 'react-router-dom';
import TopNav from './TopNav';
import BottomNav from './BottomNav';

export default function SiswaLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[#F4F7FB] flex flex-col font-sans relative overflow-x-hidden">
      
      {/* 1. Header Navigasi Atas (Desktop) - Dibuat Fixed */}
      <div className="fixed top-0 left-0 right-0 z-50">
         <TopNav />
      </div>
      
      {/* 2. Area Konten Utama Halaman Siswa */}
      {/* Padding top (pt-20/24) ditambahkan agar konten tidak tertutup navbar fixed */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pt-20 sm:pt-24 pb-24 md:pb-8 flex flex-col relative z-10">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 15 }} // Animasi masuk dari bawah
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}   // Animasi keluar ke atas
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="w-full h-full flex-1"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* 3. Bar Navigasi Bawah (Mobile/Tablet) */}
      <BottomNav />
    </div>
  );
}