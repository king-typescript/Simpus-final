import { FiSearch } from 'react-icons/fi';

export default function CatalogHeader({
  searchQuery,
  setSearchQuery,
  kategoriFilter,
  setKategoriFilter,
  categories = [],
}) {
  return (
    <div className="bg-white p-5 sm:p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all duration-300">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-dark-navy tracking-tight">
          Katalog Buku
        </h2>
        <p className="text-xs sm:text-sm text-text-sekunder mt-0.5">
        </p>
      </div>

      <div className="flex flex-col sm:flex-row w-full md:w-auto gap-2.5 sm:gap-3">
        {/* Search */}
        <div className="flex w-full sm:w-72 shadow-sm rounded-2xl overflow-hidden border border-gray-200 focus-within:border-primary-blue focus-within:ring-2 focus-within:ring-light-blue transition-all bg-gray-50/50">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari judul, penulis, rak..."
            className="w-full px-4 py-2.5 bg-transparent focus:outline-none text-sm text-text-utama placeholder-gray-400"
          />
          <div className="bg-primary-blue text-white px-4 flex items-center justify-center shrink-0">
            <FiSearch className="text-base" />
          </div>
        </div>

        {/* Dropdown Filter */}
        <select
          value={kategoriFilter}
          onChange={(e) => setKategoriFilter(e.target.value)}
          className="w-full sm:w-48 px-4 py-2.5 bg-gray-50/50 text-text-sekunder text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-light-blue border border-gray-200 rounded-2xl cursor-pointer transition-all"
        >
          <option value="">Semua Kategori</option>
          {categories.map((kat) => (
            <option key={kat.id || kat.name} value={kat.name}>
              {kat.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
