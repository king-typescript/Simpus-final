import { BookOpen, Users, ArrowLeftRight, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const actions = [
  {
    label: "Tambah Buku",
    path: "/admin/buku",
    icon: BookOpen,
    bg: "bg-blue-50 hover:bg-blue-100",
    text: "text-blue-700",
  },
  {
    label: "Tambah Anggota",
    path: "/admin/anggota",
    icon: Users,
    bg: "bg-indigo-50 hover:bg-indigo-100",
    text: "text-indigo-700",
  },
  {
    label: "Peminjaman",
    path: "/admin/sirkulasi",
    icon: ArrowLeftRight,
    bg: "bg-emerald-50 hover:bg-emerald-100",
    text: "text-emerald-700",
  },
  {
    label: "Kelola Denda",
    path: "/admin/denda",
    icon: AlertCircle,
    bg: "bg-red-50 hover:bg-red-100",
    text: "text-red-700",
  },
];

export function QuickActions() {
  const navigate = useNavigate();

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-6 shadow-sm">
      <h2 className="font-bold text-slate-900 text-sm sm:text-base mb-4">
        Akses Cepat
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.label}
              onClick={() => navigate(action.path)}
              className={`flex flex-col items-center gap-2 rounded-xl p-3 sm:p-4 transition duration-200 ${action.bg} active:scale-95`}
            >
              <Icon size={20} className={`sm:size-[22px] ${action.text}`} />
              <span className={`text-xs font-semibold text-center ${action.text}`}>
                {action.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
