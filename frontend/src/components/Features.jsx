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
    <section id="informasi" className="scroll-mt-20 bg-white py-12 font-poppins sm:py-16">
      <div className="container-page grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 lg:divide-x lg:divide-slate-200/80">
        {FEATURES.map(({ icon, iconAlt, bg, title, desc }) => (
          <div key={title} className="flex flex-col items-center px-4 text-center">
            <div
              className="mb-5 flex h-[80px] w-[80px] items-center justify-center transition-transform motion-safe:hover:scale-105 sm:mb-6 sm:h-[94px] sm:w-[94px]"
              style={{ backgroundColor: bg, borderRadius: "25px" }}
            >
              <img
                src={icon}
                alt={iconAlt}
                className="h-[40px] w-[40px] object-contain sm:h-[50px] sm:w-[50px]"
                loading="lazy"
              />
            </div>

            <h3
              style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600, color: "#000000" }}
              className="text-xl leading-snug sm:text-2xl lg:text-[26px]"
            >
              {title}
            </h3>

            <p
              style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 400, color: "#000000" }}
              className="mt-2 max-w-[280px] text-sm leading-relaxed sm:mt-3 sm:max-w-[240px] sm:text-[15px]"
            >
              {desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
