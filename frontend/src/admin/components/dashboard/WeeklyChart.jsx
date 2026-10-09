import { TrendingUp } from "lucide-react";

export function WeeklyChart({ data = [] }) {
  const maxBar = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="xl:col-span-2 rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-slate-900 text-sm sm:text-base">
            Statistik Peminjaman
          </h2>
          <p className="mt-0.5 text-xs sm:text-sm text-slate-500">
            Aktivitas minggu ini
          </p>
        </div>
        <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <TrendingUp size={18} />
        </div>
      </div>

      <div className="mt-6 flex h-44 sm:h-56 lg:h-64 items-end justify-between gap-2 sm:gap-3">
        {data.map(({ day, value }) => (
          <div
            key={day}
            className="group flex flex-1 flex-col items-center gap-1.5 sm:gap-2"
          >
            <span className="text-[10px] font-medium text-slate-500 opacity-0 group-hover:opacity-100 transition">
              {value}
            </span>
            <div
              className="w-full max-w-9 sm:max-w-12 rounded-t-xl bg-gradient-to-t from-blue-600 to-blue-400 transition-all duration-300 hover:from-indigo-600 hover:to-blue-400 cursor-pointer"
              style={{ height: `${(value / maxBar) * 100}%` }}
            />
            <span className="text-[10px] sm:text-xs text-slate-400 font-medium">
              {day}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
