import iconBook from "../assets/icon/akar-icons_book-open.svg";
import iconHistory from "../assets/icon/ant-design_history-outlined.svg";
import iconLaptop from "../assets/icon/bi_laptop.svg";
import iconUsers from "../assets/icon/flowbite_users-group-solid.svg";

const FEATURES = [
  {
    icon: iconBook,
    iconAlt: "Koleksi Lengkap Icon",
    bg: "rgba(11, 120, 227, 0.15)",
    title: "Koleksi Lengkap",
    desc: "Ribuan buku dari berbagai tema dan kategori",
  },
  {
    icon: iconHistory,
    iconAlt: "Peminjaman Mudah Icon",
    bg: "rgba(22, 184, 166, 0.15)",
    title: "Peminjaman Mudah",
    desc: "Proses cepat dan praktis dengan sistem terintegrasi",
  },
  {
    icon: iconLaptop,
    iconAlt: "Akses Informasi Icon",
    bg: "rgba(93, 64, 239, 0.15)",
    title: "Akses Informasi",
    desc: "Cek ketersediaan buku, riwayat peminjaman, dan informasi perpustakaan lainnya.",
  },
  {
    icon: iconUsers,
    iconAlt: "Untuk Semua Icon",
    bg: "rgba(252, 148, 14, 0.15)",
    title: "Untuk Semua",
    desc: "Dosen, mahasiswa, dan seluruh civitas akademi",
  },
];

export default function Features() {
  return (
    <section id="informasi" className="scroll-mt-20 bg-gradient-to-b from-white via-slate-50/50 to-white py-12 sm:py-16 font-poppins">
      <div className="container-page">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:gap-6">
          {FEATURES.map(({ icon, iconAlt, bg, title, desc }) => (
            <div
              key={title}
              className="group flex flex-col items-center rounded-3xl border border-slate-100 bg-white p-6 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-slate-200/80 hover:shadow-xl sm:p-7"
            >
              <div
                className="mb-4 flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-105 shadow-sm"
                style={{ backgroundColor: bg }}
              >
                <img
                  src={icon}
                  alt={iconAlt}
                  className="h-7 w-7 sm:h-8 sm:w-8 object-contain"
                  loading="lazy"
                />
              </div>

              <h3 className="text-base sm:text-lg font-bold text-navy-900 leading-snug">
                {title}
              </h3>

              <p className="mt-2 text-xs sm:text-sm text-slate-copy leading-relaxed">
                {desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
