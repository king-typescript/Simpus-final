import { useState } from 'react'
import { motion } from 'framer-motion'
import { FiBook, FiTablet, FiClock, FiShield } from 'react-icons/fi'
import { formatTimeRemaining } from '../../../utils/ebookStore'

export default function ActiveLoansCard({ bukuList = [], ebookLoans = [], onReadEbook }) {
  const [activeTab, setActiveTab] = useState(ebookLoans.length > 0 && bukuList.length === 0 ? 'ebook' : 'fisik')

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col h-full overflow-hidden">
      {/* Card Header & Tabs */}
      <div className="p-5 sm:p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <FiBook className="text-primary-blue text-lg" />
          <h3 className="font-bold text-base sm:text-lg text-dark-navy">Peminjaman Aktif</h3>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-gray-100/80 p-1 rounded-xl text-xs font-semibold self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('fisik')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'fisik'
                ? 'bg-white text-primary-blue shadow-sm font-bold'
                : 'text-text-sekunder hover:text-dark-navy'
            }`}
          >
            Buku Fisik ({bukuList.length})
          </button>
          <button
            onClick={() => setActiveTab('ebook')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              activeTab === 'ebook'
                ? 'bg-white text-purple-700 shadow-sm font-bold'
                : 'text-text-sekunder hover:text-dark-navy'
            }`}
          >
            <FiTablet className="text-purple-600" />
            E-Book Digital ({ebookLoans.length})
          </button>
        </div>
      </div>

      <div className="p-4 sm:p-6 space-y-3 sm:space-y-4 flex-1">
        {/* Tab 1: Physical Books */}
        {activeTab === 'fisik' && (
          <>
            {bukuList.length > 0 ? (
              bukuList.map((buku, index) => (
                <motion.div
                  key={buku.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.01 }}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-light-blue/30 rounded-2xl border border-light-blue/50 gap-3 group"
                >
                  <div className="flex space-x-3 sm:space-x-4 items-center min-w-0">
                    <div className="w-11 h-14 sm:w-12 sm:h-16 bg-gradient-to-b from-gray-100 to-gray-200 rounded-xl flex-shrink-0 flex items-center justify-center text-xs text-gray-400 font-bold overflow-hidden shadow-sm group-hover:shadow-md transition-shadow">
                      <FiBook className="text-gray-300 text-lg" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-text-utama text-sm sm:text-base leading-snug truncate">
                        {buku.judul}
                      </h4>
                      <p className="text-[10px] sm:text-xs text-text-sekunder mt-0.5 sm:mt-1">
                        Rak: <span className="font-semibold">{buku.rak}</span> | Kode: <span className="font-semibold">{buku.kode}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-start sm:items-end shrink-0 gap-1">
                    <span className="bg-amber-100 text-amber-700 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] font-bold shadow-sm">
                      Jatuh Tempo: {buku.jatuhTempo}
                    </span>
                    <p className="text-[10px] text-text-sekunder italic">
                      {buku.catatan}
                    </p>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-8 text-text-sekunder text-sm">
                Tidak ada buku fisik yang sedang dipinjam.
              </div>
            )}
          </>
        )}

        {/* Tab 2: Digital E-Books with DRM & Expiration Countdown */}
        {activeTab === 'ebook' && (
          <>
            {ebookLoans.length > 0 ? (
              ebookLoans.map((loan, index) => {
                const sisaWaktu = formatTimeRemaining(loan.dueDate)
                return (
                  <motion.div
                    key={loan.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.01 }}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 sm:p-4 bg-purple-50/50 rounded-2xl border border-purple-100 gap-3 group"
                  >
                    <div className="flex space-x-3 sm:space-x-4 items-center min-w-0">
                      <div className="w-12 h-16 bg-purple-100 rounded-xl flex-shrink-0 flex items-center justify-center text-xs text-purple-600 font-bold overflow-hidden shadow-sm group-hover:shadow-md transition-shadow">
                        {loan.coverUrl ? (
                          <img src={loan.coverUrl} alt={loan.title} className="w-full h-full object-cover" />
                        ) : (
                          <FiTablet className="text-purple-500 text-xl" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="bg-purple-200 text-purple-800 text-[9px] font-black px-1.5 py-0.5 rounded">
                            E-BOOK
                          </span>
                          <h4 className="font-bold text-dark-navy text-sm sm:text-base leading-snug truncate">
                            {loan.title}
                          </h4>
                        </div>
                        <p className="text-[11px] text-text-sekunder mt-0.5">
                          Penulis: <span className="font-medium text-dark-navy">{loan.author}</span>
                        </p>
                        <div className="flex items-center gap-1.5 text-[10px] text-amber-600 font-semibold mt-1">
                          <FiClock size={12} />
                          <span>Maks 7 Hari • {sisaWaktu}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center shrink-0 gap-2">
                      <button
                        onClick={() => onReadEbook && onReadEbook(loan)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-sm hover:shadow transition active:scale-95"
                      >
                        <FiShield size={13} />
                        Baca Sekarang
                      </button>
                      <span className="text-[9px] text-slate-400 font-medium">
                        Anti-Piracy Protected
                      </span>
                    </div>
                  </motion.div>
                )
              })
            ) : (
              <div className="text-center py-8 text-text-sekunder text-sm">
                Belum ada e-book yang dipinjam. Buka katalog untuk meminjam e-book secara online.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
