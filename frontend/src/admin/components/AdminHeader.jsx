import { useEffect, useState, useRef } from "react";
import { Bell, Search, Menu, X, Settings, LogOut, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../lib/auth.jsx";
import { useProfileName } from "../hooks/useProfileName";

const notificationsList = [
  {
    id: 1,
    title: "Peminjaman Baru",
    message: "Ahmad Fauzan meminjam Algoritma dan Pemrograman",
    time: "5m lalu",
    unread: true,
  },
  {
    id: 2,
    title: "Pengembalian Buku",
    message: "Siti Rahma telah mengembalikan Bahasa Indonesia",
    time: "18m lalu",
    unread: true,
  },
  {
    id: 3,
    title: "Keterlambatan",
    message: "Budi Santoso terlambat 2 hari mengembalikan buku",
    time: "1j lalu",
    unread: false,
  },
];

function AdminHeader({ onOpenSidebar }) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [notifications, setNotifications] = useState(notificationsList);

  const notifRef = useRef(null);
  const userMenuRef = useRef(null);

  const profileName = useProfileName();

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, unread: false })));
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 sm:h-20 items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 sm:px-6 md:px-8 backdrop-blur-md transition-all">
      {/* Left: Mobile Toggle & Title/Search */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSidebar}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600 transition hover:bg-slate-100 md:hidden active:scale-95"
          aria-label="Buka Sidebar Menu"
        >
          <Menu size={20} />
        </button>

        {/* Desktop Search */}
        <div className="hidden sm:relative sm:block sm:w-72 md:w-96">
          <Search
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Cari buku, anggota, sirkulasi..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50/80 py-2 sm:py-2.5 pl-10 pr-4 text-xs sm:text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100/60"
          />
        </div>
      </div>

      {/* Mobile Search Overlay */}
      {showMobileSearch && (
        <div className="absolute inset-x-0 top-0 z-40 flex h-16 sm:h-20 items-center bg-white px-4 shadow-md sm:hidden animate-page-enter">
          <div className="relative flex flex-1 items-center">
            <Search size={18} className="absolute left-3 text-slate-400" />
            <input
              type="text"
              autoFocus
              placeholder="Cari sesuatu..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-xs outline-none focus:border-blue-500"
            />
          </div>
          <button
            onClick={() => setShowMobileSearch(false)}
            className="ml-2 rounded-lg p-2 text-slate-500 hover:bg-slate-100"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Mobile Search Icon Button */}
        <button
          onClick={() => setShowMobileSearch(!showMobileSearch)}
          className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 sm:hidden"
        >
          <Search size={19} />
        </button>

        {/* Notifications Popover */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowUserMenu(false);
            }}
            className="relative flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 active:scale-95"
            aria-label="Notifikasi"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white animate-pulse" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl z-50 animate-modal-pop">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-900 text-sm">Notifikasi</h3>
                  {unreadCount > 0 && (
                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-semibold text-blue-700">
                      {unreadCount} baru
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="flex items-center gap-1 text-xs text-blue-600 hover:underline font-medium"
                  >
                    <Check size={13} /> tandai dibaca
                  </button>
                )}
              </div>

              <div className="mt-3 space-y-2 max-h-72 overflow-y-auto custom-scrollbar">
                {notifications.map((item) => (
                  <div
                    key={item.id}
                    className={`rounded-xl p-3 text-xs transition ${
                      item.unread ? "bg-blue-50/70 border border-blue-100" : "bg-slate-50/60"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <p className="font-bold text-slate-900">{item.title}</p>
                      <span className="text-[10px] text-slate-400">{item.time}</span>
                    </div>
                    <p className="mt-1 text-slate-600 leading-snug">{item.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Avatar Menu Dropdown */}
        <div className="relative border-l border-slate-200 pl-2 sm:pl-4" ref={userMenuRef}>
          <button
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowNotifications(false);
            }}
            className="flex items-center gap-3 rounded-xl p-1 transition hover:bg-slate-100/80 active:scale-95"
          >
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 font-bold text-white text-sm shadow-sm">
              {profileName.charAt(0).toUpperCase()}
            </div>

            <div className="hidden text-left sm:block">
              <p className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
                {profileName}
              </p>
              <p className="text-[11px] font-medium text-slate-400">Pustakawan</p>
            </div>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-3 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl z-50 animate-modal-pop">
              <div className="border-b border-slate-100 px-3 py-2.5">
                <p className="text-xs font-medium text-slate-400">Akun terhubung</p>
                <p className="text-sm font-bold text-slate-900 truncate">{profileName}</p>
              </div>

              <div className="mt-1 space-y-1">
                <button
                  onClick={() => {
                    navigate("/admin/pengaturan");
                    setShowUserMenu(false);
                  }}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 transition"
                >
                  <Settings size={15} className="text-slate-400" />
                  <span>Pengaturan Akun</span>
                </button>

                <button
                  onClick={async () => {
                    setShowUserMenu(false);
                    await logout();
                    navigate("/login");
                  }}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition"
                >
                  <LogOut size={15} />
                  <span>Keluar</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default AdminHeader;
