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
import { DashboardService } from '../../services/api';
import { getAllEbookLoans, returnEbookEarly } from '../../utils/ebookStore';
import { useAuth } from '../../lib/auth';
import EbookReaderModal from '../../siswa/components/reader/EbookReaderModal';

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
  const { user } = useAuth();
  const [riwayat, setRiwayat] = useState([]);
  const [readingEbook, setReadingEbook] = useState(null);

  const loadRiwayat = async () => {
    try {
      const res = await DashboardService.get();
      const allRiwayat = [];
      
      // 1. Data dari API (Fisik)
      if (res.data?.data?.recentLoans) {
        const mapped = res.data.data.recentLoans.map((loan) => {
          const bookTitle = loan.items?.[0]?.copy?.book?.title || 'Buku Perpustakaan';
          const isFinished = loan.status === 'SELESAI' || loan.returnedAt;
          return {
            id: loan.id,
            judul: bookTitle,
            status: isFinished ? 'Selesai' : 'Dipinjam',
            waktuPinjam: new Date(loan.loanDate).toLocaleDateString('id-ID'),
            waktuKembali: loan.returnedAt ? new Date(loan.returnedAt).toLocaleDateString('id-ID') : 'Jatuh tempo: ' + new Date(loan.dueDate).toLocaleDateString('id-ID', {day:'2-digit', month:'short'}),
            denda: 'Tidak Ada (-)',
            isEbook: false
          };
        });
        allRiwayat.push(...mapped);
      }

      // 2. Data dari LocalStorage (E-Book)
      if (user?.id) {
        const eLoans = getAllEbookLoans(user.id);
        const mappedEbook = eLoans.map(loan => ({
          ...loan,
          id: loan.id,
          judul: loan.title,
          status: loan.status === 'SELESAI' ? 'Selesai' : 'Dipinjam',
          waktuPinjam: new Date(loan.borrowedAt).toLocaleDateString('id-ID'),
          waktuKembali: loan.returnedAt ? new Date(loan.returnedAt).toLocaleDateString('id-ID') : 'Jatuh tempo: ' + new Date(loan.dueDate).toLocaleDateString('id-ID', {day:'2-digit', month:'short'}),
          denda: 'Tidak Ada (-)',
          isEbook: true
        }));
        allRiwayat.push(...mappedEbook);
      }

      setRiwayat(allRiwayat.sort((a,b) => new Date(b.waktuPinjam) - new Date(a.waktuPinjam)));
    } catch (err) {
      console.error('Gagal memuat riwayat:', err);
    }
  };

  useEffect(() => {
    loadRiwayat();
  }, [user]);

  const handleReturnEbook = (id) => {
    if (confirm('Kembalikan e-book sekarang?')) {
      returnEbookEarly(id);
      loadRiwayat();
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-5 sm:p-6 border-b border-gray-100 flex items-center space-x-2">
        <FiClock className="text-primary-blue text-lg" />
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-dark-navy">Riwayat Peminjaman</h2>
          <p className="text-xs sm:text-sm text-text-sekunder mt-0.5">Daftar buku fisik & e-book yang pernah dipinjam.</p>
        </div>
      </div>

      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="p-4 sm:p-6 space-y-3 sm:space-y-4">
        {riwayat.length > 0 ? (
          riwayat.map((item) => (
            <motion.div key={item.id} variants={itemVariants}>
              <RiwayatItem 
                item={item} 
                onRead={() => setReadingEbook({ title: item.judul, fileUrl: item.fileUrl })} 
                onReturn={item.isEbook && item.status !== 'Selesai' ? () => handleReturnEbook(item.id) : null}
              />
            </motion.div>
          ))
        ) : (
          <div className="text-center py-12 text-text-sekunder text-sm">Belum ada riwayat peminjaman.</div>
        )}
      </motion.div>

      {readingEbook && (
        <EbookReaderModal ebook={readingEbook} student={user} onClose={() => setReadingEbook(null)} />
      )}
    </div>
  );
}
