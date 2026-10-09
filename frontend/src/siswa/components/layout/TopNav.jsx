import { Link } from 'react-router-dom';

export default function TopNav() {
  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Logo Kiri (Teks sekarang tampil di semua layar) */}
          <Link to="/siswa" className="flex items-center gap-3">
             <div className="w-8 h-8 bg-primary-blue rounded-lg flex items-center justify-center text-white font-bold">
               S
             </div>
             <span className="font-extrabold text-xl text-dark-navy tracking-tight">
               SIMPUS<span className="text-primary-blue">.</span>
             </span>
          </Link>

          {/* Menu Tengah (Hanya tampil di Desktop, disembunyikan di Mobile) */}
          <div className="hidden md:flex space-x-8">
            <Link to="/siswa" className="text-gray-500 hover:text-primary-blue font-semibold transition-colors">Beranda</Link>
            <Link to="/siswa/katalog" className="text-gray-500 hover:text-primary-blue font-semibold transition-colors">Katalog</Link>
            <Link to="/siswa/riwayat" className="text-gray-500 hover:text-primary-blue font-semibold transition-colors">Riwayat</Link>
          </div>

          {/* Profil Avatar (Hanya tampil di Desktop) */}
          <div className="flex items-center gap-4">
            <Link to="/siswa/profil" className="hidden md:block">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary-blue to-blue-400 border-2 border-white shadow-sm flex items-center justify-center text-white font-bold cursor-pointer">
                R
              </div>
            </Link>
          </div>

        </div>
      </div>
    </nav>
  );
}