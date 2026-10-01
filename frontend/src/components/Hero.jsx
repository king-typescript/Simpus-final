import { Search, BookOpen } from "lucide-react";
import { useState } from "react";
import heroImage from "../assets/image/ASSET CG 2.png";

export default function Hero() {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    const target = document.getElementById("katalog");
    if (target) {
      const offset = (document.querySelector("header")?.offsetHeight ?? 72) + 12;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
    }
    window.dispatchEvent(
      new CustomEvent("simpus-search", { detail: searchQuery }),
    );
  };

  const handleKatalogClick = (e) => {
    e.preventDefault();
    const target = document.getElementById("katalog");
    if (target) {
      const offset = (document.querySelector("header")?.offsetHeight ?? 72) + 12;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
    }
  };

  return (
    <section
      id="beranda"
      className="relative flex min-h-[100svh] w-full overflow-hidden font-poppins"
    >
      <div className="absolute inset-0 z-0 h-full w-full">
        <img
          src={heroImage}
          alt="Latar Belakang Perpustakaan Simpus Satak"
          className="h-full w-full object-cover object-[100%_center] sm:object-center"
          loading="eager"
        />
      </div>

      <div className="container-page relative z-20 flex w-full items-center py-16 sm:py-20 lg:py-24">
        <div className="grid w-full grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="max-w-full lg:col-span-8 xl:col-span-7">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#60759A] sm:text-base sm:tracking-[0.25em] lg:text-[20px]">
              SELAMAT DATANG DI
            </p>

            <h1 className="mt-2 break-words font-bold leading-[1.1] tracking-[0.08em] text-[#102E68] text-4xl sm:text-5xl sm:tracking-[0.18em] lg:text-[52px] lg:tracking-[0.25em]">
              SIMPUS SATAK
            </h1>

            <p className="mt-2 text-lg font-semibold tracking-normal text-[#102E68] sm:text-xl lg:text-[26px]">
              Sistem Informasi & Manajemen Perpustakaan
            </p>

            <p className="mt-4 max-w-2xl text-base font-semibold leading-relaxed tracking-normal text-[#60759A] sm:text-lg lg:text-[20px]">
              Mudah Mencari, Cepat meminjam, <br className="hidden sm:inline" />
              dan selalu terhubung dengan koneksi terbaik{" "}
              <br className="hidden sm:inline" />
              untuk mendukung ilmu dan masa depan Anda.
            </p>

            <div className="mt-8 flex w-full flex-col gap-4 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:gap-6 lg:gap-[77px]">
              <form
                onSubmit={handleSearch}
                className="flex w-full sm:w-auto"
              >
                <button
                  type="submit"
                  style={{ backgroundColor: "#0B78E3" }}
                  className="inline-flex h-[50px] w-full min-h-[44px] touch-manipulation items-center justify-center gap-[16px] rounded-[20px] text-white shadow-md transition hover:opacity-90 active:scale-[0.98] sm:w-[245px] sm:gap-[24px]"
                >
                  <Search className="h-[24px] w-[24px] shrink-0 text-white sm:h-[30px] sm:w-[30px]" />
                  <span style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontSize: "18px" }}>Cari Buku</span>
                </button>
              </form>

              <a
                href="#katalog"
                onClick={handleKatalogClick}
                className="group inline-flex h-[50px] w-full min-h-[44px] touch-manipulation items-center justify-center gap-2.5 rounded-[50px] border border-[#0B78E3] bg-white font-semibold text-[#0B78E3] shadow-sm transition-all duration-300 ease-out hover:bg-[#0B78E3] hover:text-white hover:shadow-lg hover:shadow-blue-500/25 motion-safe:hover:-translate-y-0.5 active:translate-y-0 active:scale-95 sm:w-[245px]"
              >
                <BookOpen className="h-[24px] w-[24px] shrink-0 transition-transform duration-300 ease-out group-hover:scale-110 group-hover:-rotate-12 sm:h-[30px] sm:w-[30px]" />
                <span style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontSize: "18px" }} className="transition-colors duration-300">Lihat Katalog</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
