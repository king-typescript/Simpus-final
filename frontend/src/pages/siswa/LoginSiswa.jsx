import { useState } from 'react';
import gambarHeader from '../../assets/image/siswa/bg-perpus.jpeg';

export default function LoginSiswa() {
  const [peran, setPeran] = useState('siswa'); 

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-3xl shadow-2xl overflow-hidden relative">
        <div className="relative p-6 text-center bg-dark-navy">
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-40"
            style={{ backgroundImage: `url(${gambarHeader})` }}
          ></div>
          <div className="relative z-10">
            <h2 className="text-2xl font-bold text-white drop-shadow-md">Sistem Perpustakaan</h2>
            <p className="text-light-blue text-sm mt-1 drop-shadow-md">Satak Perpustakaan</p>
          </div>
        </div>

        <div className="relative p-8 bg-bg-color">
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-40 pointer-events-none"
            style={{ backgroundImage: `url(${gambarHeader})` }}
          ></div>

          <div className="relative z-10">
            <div className="relative flex bg-light-blue rounded-3xl p-1 mb-8 shadow-sm overflow-hidden">
              <div 
                className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-3xl shadow-md transition-all duration-500 ease-out ${
                  peran === 'siswa' ? 'left-1 bg-primary-blue' : 'left-1/2 bg-accent'
                }`}
              ></div>

              <button
                type="button"
                onClick={() => setPeran('siswa')}
                className={`relative z-10 flex-1 py-2 rounded-3xl text-sm font-semibold transition-colors duration-500 ${
                  peran === 'siswa' 
                    ? 'text-white' 
                    : 'text-text-sekunder hover:text-text-utama'
                }`}
              >
                Siswa / Peminjam
              </button>
              
              <button
                type="button"
                onClick={() => setPeran('admin')}
                className={`relative z-10 flex-1 py-2 rounded-3xl text-sm font-semibold transition-colors duration-300 ${
                  peran === 'admin' 
                    ? 'text-white' 
                    : 'text-text-sekunder hover:text-text-utama'
                }`}
              >
                Admin / Penjaga
              </button>
            </div>

            <form className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-text-utama mb-2">
                  {peran === 'siswa' ? 'Username Siswa' : 'Username Admin'}
                </label>
                <input
                  type="text"
                  placeholder={peran === 'siswa' ? 'Contoh: siswa001' : 'Contoh: admin'}
                  className="w-full px-4 py-3 bg-white/90 rounded-3xl border focus:outline-none focus:border-primary-blue focus:ring-2 focus:ring-light-blue text-text-utama transition-colors relative z-20"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-text-utama mb-2">
                  Kata Sandi
                </label>
                <input
                  type="password"
                  placeholder="Masukkan kata sandi"
                  className="w-full px-4 py-3 bg-white/90 rounded-3xl border focus:outline-none focus:border-primary-blue focus:ring-2 focus:ring-light-blue text-text-utama transition-colors relative z-20"
                />
              </div>

              <div className="flex justify-end">
                <a href="#" className="text-sm font-semibold text-primary-blue hover:text-dark-navy">
                  Lupa kata sandi?
                </a>
              </div>

              <button
                type="submit"
                className={`w-full py-3 mt-4 rounded-full text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-500 ease-in-out ${
                  peran === 'siswa' ? 'bg-primary-blue hover:bg-dark-navy' : 'bg-accent hover:opacity-90'
                }`}
              >
                Masuk Sekarang
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
