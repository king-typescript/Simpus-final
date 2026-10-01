/**
 * ==============================================================================
 * Halaman: Profil Siswa
 * Deskripsi: Halaman pengelola kartu digital anggota perpustakaan dan pembaruan
 *            kontak data pribadi siswa.
 * ==============================================================================
 */

import { motion } from 'framer-motion';
import DigitalCard from '../../siswa/components/profile/DigitalCard';
import ProfileForm from '../../siswa/components/profile/ProfileForm';

export default function ProfileSiswa() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4 sm:space-y-6"
    >
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-dark-navy">Profil Siswa</h2>
        <p className="text-xs sm:text-sm text-text-sekunder mt-0.5">
          Kelola data kartu anggota digital dan informasi kontak perpustakaanmu.
        </p>
      </div>

      {/* Grid Kartu Digital dan Form Informasi Akun */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 items-start">
        <DigitalCard />
        <ProfileForm />
      </div>
    </motion.div>
  );
}
