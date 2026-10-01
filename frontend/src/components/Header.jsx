import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import logoBiru from "../assets/image/logobiru.png";
import iconUserSolid from "../assets/icon/basil_user-solid.svg";
import { useAuth } from "../lib/auth.jsx";

const NAV_LINKS = [
  { label: "Beranda", href: "#beranda" },
  { label: "Informasi Perpustakaan", href: "#informasi" },
  { label: "Katalog Buku", href: "#katalog" },
];

function scrollToTarget(id) {
  const el = document.querySelector(id);
  if (!el) return;
  const header = document.querySelector("header");
  const offset = (header?.offsetHeight ?? 72) + 12;
  const top = el.getBoundingClientRect().top + window.scrollY - offset;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo({ top: Math.max(0, top), behavior: reduce ? "auto" : "smooth" });
}

export default function Header() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("Beranda");
  const { user } = useAuth();

  useEffect(() => {
    const ids = NAV_LINKS.map((l) => l.href);
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        const label = NAV_LINKS.find((l) => l.href === `#${visible.target.id}`)?.label;
        if (label) setActive(label);
      },
      { rootMargin: "-72px 0px -55% 0px", threshold: [0, 0.25, 0.5, 1] }
    );
    ids.forEach((id) => {
      const el = document.querySelector(id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const handleNav = (e, link) => {
    e.preventDefault();
    setActive(link.label);
    setOpen(false);
    requestAnimationFrame(() => scrollToTarget(link.href));
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="container-page flex min-h-[64px] items-center justify-between gap-3 py-2 sm:min-h-[72px]">
        <a
          href="#beranda"
          onClick={(e) => handleNav(e, NAV_LINKS[0])}
          className="flex min-w-0 flex-1 items-center gap-3 sm:gap-[19px] lg:flex-none"
        >
          <img src={logoBiru} alt="Logo Simpus Satak" className="h-8 w-auto shrink-0 object-contain sm:h-10" />
          <div className="min-w-0 leading-tight">
            <p className="truncate font-['Poppins'] text-base font-bold tracking-wide text-[#0B2960] sm:text-[20px]">
              SIMPUS SATAK
            </p>
            <p className="truncate font-['Poppins'] text-[10px] font-normal text-[#0B2960]">
              Sistem Informasi & Manajemen Perpustakaan
            </p>
          </div>
        </a>

        <nav className="hidden items-center gap-6 lg:flex xl:gap-9">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={(e) => handleNav(e, link)}
              className={`relative whitespace-nowrap pb-1 font-['Inter'] text-base font-bold transition-colors duration-200 xl:text-[18px] ${
                active === link.label ? "text-[#0B78E3]" : "text-[#0B2960] hover:text-[#0B78E3]"
              }`}
            >
              {link.label}
              {active === link.label && (
                <span className="absolute -bottom-[1px] left-0 right-0 h-[2px] rounded-full bg-[#0B78E3]" />
              )}
            </a>
          ))}
        </nav>

            {user ? (
              <Link
                to="/admin"
                className="hidden shrink-0 items-center justify-center gap-2 rounded-[20px] bg-[#0B78E3] px-5 font-['Inter'] text-[16px] font-bold text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.98] lg:inline-flex lg:h-[40px]"
              >
                Dashboard Admin
              </Link>
            ) : (
              <Link
                to="/login"
                className="hidden shrink-0 items-center justify-center gap-[15px] rounded-[20px] bg-[#0B78E3] font-['Inter'] text-[18px] font-bold text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.98] lg:inline-flex lg:h-[40px] lg:w-[133px]"
              >
                <img src={iconUserSolid} alt="User Icon" className="h-[25px] w-[25px] object-contain" />
                Login
              </Link>
            )}


        <button
          type="button"
          className="-m-2 flex min-h-[44px] min-w-[44px] touch-manipulation items-center justify-center p-2 text-[#0B2960] lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Buka menu"
          aria-expanded={open}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-slate-100 bg-white lg:hidden">
          <div className="container-page flex max-h-[calc(100svh-64px)] flex-col gap-1 overflow-y-auto py-3">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => handleNav(e, link)}
                className={`rounded-lg px-3 py-3 font-['Inter'] text-base font-bold transition-colors sm:text-[18px] ${
                  active === link.label ? "bg-blue-50 text-[#0B78E3]" : "text-[#0B2960] active:bg-slate-50"
                }`}
              >
                {link.label}
              </a>
            ))}
            {user ? (
              <Link
                to="/admin"
                className="mt-2 inline-flex min-h-[44px] w-full touch-manipulation items-center justify-center gap-[15px] rounded-[20px] bg-[#0B78E3] font-['Inter'] text-[18px] font-bold text-white"
              >
                Dashboard Admin
              </Link>
            ) : (
              <Link
                to="/login"
                className="mt-2 inline-flex min-h-[44px] w-full touch-manipulation items-center justify-center gap-[15px] rounded-[20px] bg-[#0B78E3] font-['Inter'] text-[18px] font-bold text-white"
              >
                <img src={iconUserSolid} alt="User Icon" className="h-[25px] w-[25px] object-contain" />
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
