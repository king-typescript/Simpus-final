import { useEffect } from "react";
import logoBiru from "../../assets/image/logobiru.png";
import { useAuth } from "../../lib/auth.jsx";
import { useProfileName } from "../hooks/useProfileName";

import {
  LayoutDashboard,
  BookOpen,
  Users,
  ArrowLeftRight,
  Wallet,
  BarChart3,
  Settings,
  X,
  LogOut,
  Home,
} from "lucide-react";

import { useLocation, useNavigate } from "react-router-dom";

const menuItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    path: "/admin",
  },
  {
    title: "Koleksi Buku",
    icon: BookOpen,
    path: "/admin/buku",
  },
  {
    title: "Anggota",
    icon: Users,
    path: "/admin/anggota",
  },
  {
    title: "Sirkulasi",
    icon: ArrowLeftRight,
    path: "/admin/sirkulasi",
  },
  {
    title: "Denda",
    icon: Wallet,
    path: "/admin/denda",
  },
  {
    title: "Laporan",
    icon: BarChart3,
    path: "/admin/laporan",
  },
  {
    title: "Pengaturan",
    icon: Settings,
    path: "/admin/pengaturan",
  },
];

function AdminSidebar({ isOpen, setIsOpen }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const profileName = useProfileName();

  // Tutup drawer saat tombol ESC ditekan
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, setIsOpen]);

  return (
    <>
      {/* Backdrop/Overlay Hitam Transparan saat Sidebar Terbuka di Mobile / Tablet */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300 md:hidden"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-64 md:w-64 flex-col border-r border-slate-200/80 bg-white shadow-xl md:shadow-none transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Logo & Tombol Close Mobile */}
        <div className="flex h-16 sm:h-20 items-center justify-between border-b border-slate-100 px-5 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm ring-4 ring-blue-50">
              <img
                src={logoBiru}
                alt="Logo SIMPUS SATAK"
                className="h-full w-full object-contain"
              />
            </div>

            <div className="min-w-0">
              <h1 className="truncate text-base sm:text-lg font-bold text-slate-900 leading-tight">
                SIMPUS SATAK
              </h1>
              <p className="truncate text-xs text-slate-500 font-medium">
                Perpustakaan Digital
              </p>
            </div>
          </div>

          {/* Tombol Close untuk Mobile */}
          <button
            onClick={() => setIsOpen(false)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 md:hidden transition active:scale-95"
            aria-label="Tutup Menu"
          >
            <X size={19} />
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 space-y-1 px-3 sm:px-4 py-4 sm:py-6 overflow-y-auto custom-scrollbar">
          <p className="mb-2.5 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Menu Utama
          </p>

          {menuItems.map((item) => {
            const Icon = item.icon;
            const active =
              item.path === "/admin"
                ? location.pathname === "/admin"
                : location.pathname.startsWith(item.path);

            return (
              <button
                key={item.title}
                onClick={() => {
                  navigate(item.path);
                  setIsOpen(false);
                }}
                className={`group flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 sm:py-3 text-sm font-medium transition-all duration-200 active:scale-[0.98] ${
                  active
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/20 font-semibold"
                    : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    size={19}
                    className={`transition-transform duration-200 ${
                      active ? "text-white" : "text-slate-400 group-hover:text-blue-600"
                    }`}
                  />
                  <span>{item.title}</span>
                </div>

                {active && (
                  <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse md:inline-block hidden" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer info & Actions */}
        <div className="border-t border-slate-100 p-3 sm:p-4 space-y-2.5 bg-slate-50/50">
          <div className="flex items-center gap-3 rounded-xl bg-white p-2.5 border border-slate-200/70 shadow-2xs">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700 font-bold text-sm">
              {profileName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-medium text-slate-400">Pustakawan</p>
              <p className="truncate text-xs sm:text-sm font-semibold text-slate-800">
                {profileName}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                navigate("/");
                setIsOpen(false);
              }}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-2 text-xs font-medium text-slate-700 shadow-2xs transition hover:bg-slate-50 active:scale-95"
              title="Ke Halaman Utama"
            >
              <Home size={14} />
              <span>Landing</span>
            </button>

            <button
              onClick={async () => {
                await logout();
                navigate("/login");
              }}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-red-50/80 py-2 text-xs font-medium text-red-600 shadow-2xs transition hover:bg-red-100/80 active:scale-95"
              title="Keluar dari akun"
            >
              <LogOut size={14} />
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

export default AdminSidebar;
