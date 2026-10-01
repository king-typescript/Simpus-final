import { Instagram, Facebook, Mail } from "lucide-react";
import logoBiru from "../assets/image/logobiru.png";

export default function Footer() {
  return (
    <footer className="bg-navy-900 py-10 text-white font-poppins">
      <div className="container-page flex flex-col items-center justify-between gap-6 md:flex-row">
        <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:text-left">
          <div className="flex h-[60px] w-[100px] shrink-0 items-center justify-center overflow-hidden sm:h-[68px] sm:w-[112px]">
            <img
              src={logoBiru}
              alt="Logo SIMPUS SATAK"
              className="h-full w-full object-contain"
              loading="lazy"
            />
          </div>

          <div>
            <p className="text-lg font-bold text-[#FFFFFF] leading-tight sm:text-[20px]">
              SIMPUS SATAK
            </p>
            <p className="mt-1 text-[10px] font-normal text-[#FFFFFF] leading-tight">
              Sistem Informasi & Manajemen Perpustakaan
            </p>
          </div>
        </div>

        <p className="hidden max-w-xs text-center text-sm italic text-white/70 lg:block">
          Membaca hari ini, memperluas masa depan.
        </p>

        <div className="flex items-center gap-3 sm:gap-4">
          <SocialIcon href="#" label="Instagram">
            <Instagram className="h-4 w-4" />
          </SocialIcon>
          <SocialIcon href="#" label="Facebook">
            <Facebook className="h-4 w-4" />
          </SocialIcon>
          <SocialIcon href="mailto:info@simpus-satak.sch.id" label="Email">
            <Mail className="h-4 w-4" />
          </SocialIcon>
        </div>
      </div>

      <div className="container-page mt-8 border-t border-white/10 pt-6 text-center text-xs text-white/50">
        © {new Date().getFullYear()} SIMPUS SATAK. Seluruh hak cipta dilindungi.
      </div>
    </footer>
  );
}

function SocialIcon({ href, label, children }) {
  return (
    <a
      href={href}
      aria-label={label}
      className="flex min-h-[44px] min-w-[44px] touch-manipulation items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20 active:scale-95 sm:h-9 sm:w-9"
    >
      {children}
    </a>
  );
}
