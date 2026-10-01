/**
 * ==============================================================================
 * Halaman: Riwayat Peminjaman Siswa
 * Deskripsi: Menampilkan riwayat transaksi peminjaman buku beserta status
 *            denda dan waktu pengembalian.
 * ==============================================================================
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiClock } from 'react-icons/fi';
import RiwayatItem from '../../siswa/components/riwayat/RiwayatItem';
import { daftarRiwayat } from '../../siswa/data/mockData';
import { AuthService } from '../../services/api';

// Varian animasi list container
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

// Varian animasi per item riwayat
const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

export default function RiwayatSiswa() {
  const [riwayat, setRiwayat] = useState([]);

  useEffect(() => {
    let mounted = true;
    const loadRiwayat = async () => {
      try {
        const res = await AuthService.me();
        if (mounted && res.data?.data?.recentLoans) {
          const mapped = res.data.data.recentLoans.map((loan) => {
            const bookTitle = loan.items?.[0]?.copy?.book?.title || 'Buku Perpustakaan';
            const isFinished = loan.status === 'SELESAI' || loan.returnedAt;
            const borrowDateStr = loan.loanDate ? new Date(loan.loanDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';
            const returnDateStr = loan.returnedAt
              ? new Date(loan.returnedAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
              : loan.dueDate
              ? `Jatuh tempo: ${new Date(loan.dueDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}`
              : '-';

            return {
              id: loan.id,
              judul: bookTitle,
              status: isFinished ? 'Selesai' : 'Dipinjam',
              waktuPinjam: borrowDateStr,
              waktuKembali: returnDateStr,
              denda: 'Tidak Ada (-)',
            };
          });
          setRiwayat(mapped);
        }
      } catch (err) {
        console.error('Gagal memuat riwayat:', err);
      }
    };
    loadRiwayat();
    return () => {
      mounted = false;
    };
  }, []);
  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header Halaman Riwayat */}
      <div className="p-5 sm:p-6 border-b border-gray-100 flex items-center space-x-2">
        <FiClock className="text-primary-blue text-lg" />
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-dark-navy">Riwayat Peminjaman</h2>
          <p className="text-xs sm:text-sm text-text-sekunder mt-0.5">Daftar buku yang pernah dipinjam atau sedang diproses.</p>
        </div>
      </div>

      {/* Daftar Riwayat Peminjaman */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="p-4 sm:p-6 space-y-3 sm:space-y-4"
      >
        {riwayat.length > 0 ? (
          riwayat.map((item) => (
            <motion.div key={item.id} variants={itemVariants}>
              <RiwayatItem item={item} />
            </motion.div>
          ))
        ) : (
          <div className="text-center py-12 text-text-sekunder text-sm">
            Belum ada riwayat peminjaman.
          </div>
        )}
      </motion.div>
    </div>
  );
}
