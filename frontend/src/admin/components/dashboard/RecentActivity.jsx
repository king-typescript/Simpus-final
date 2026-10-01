import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Avatar } from "../../../components/common/Avatar";

const typeStyle = {
  borrow: "bg-blue-100 text-blue-700",
  return: "bg-emerald-100 text-emerald-700",
  fine: "bg-orange-100 text-orange-700",
};

export function RecentActivity({ activities }) {
  const navigate = useNavigate();

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-6 shadow-sm flex flex-col">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-slate-900 text-sm sm:text-base">
            Aktivitas Terbaru
          </h2>
          <p className="mt-0.5 text-xs sm:text-sm text-slate-500">
            Aktivitas hari ini
          </p>
        </div>
      </div>

      <div className="mt-4 sm:mt-5 space-y-3 flex-1">
        {activities.map((item, i) => (
          <div
            key={i}
            className="flex items-start gap-3 rounded-xl p-2.5 transition hover:bg-slate-50/80"
          >
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-bold text-xs ${
                typeStyle[item.type] || "bg-slate-100 text-slate-700"
              }`}
            >
              {item.name.charAt(0)}
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-slate-700 leading-tight">
                <span className="font-semibold text-slate-900">{item.name}</span>{" "}
                {item.action}
              </p>
              <p className="mt-0.5 truncate text-[11px] sm:text-xs text-slate-500">
                {item.detail}
              </p>
              <p className="mt-0.5 text-[10px] text-slate-400">{item.time}</p>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => navigate("/admin/sirkulasi")}
        className="mt-4 flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 py-2.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition active:scale-95"
      >
        Lihat semua aktivitas
        <ArrowRight size={13} />
      </button>
    </div>
  );
}
