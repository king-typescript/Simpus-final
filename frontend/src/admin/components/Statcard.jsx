export default function Statcard({
  title,
  value,
  description,
  icon: Icon,
  color = "blue",
  onClick,
  className = "",
  loading = false,
}) {
  const colorMap = {
    blue: {
      icon: "bg-blue-50 text-blue-600",
      value: "text-slate-900",
      border: "hover:border-blue-200",
    },
    emerald: {
      icon: "bg-emerald-50 text-emerald-600",
      value: "text-emerald-600",
      border: "hover:border-emerald-200",
    },
    green: {
      icon: "bg-green-50 text-green-600",
      value: "text-green-600",
      border: "hover:border-green-200",
    },
    orange: {
      icon: "bg-orange-50 text-orange-600",
      value: "text-orange-600",
      border: "hover:border-orange-200",
    },
    red: {
      icon: "bg-red-50 text-red-600",
      value: "text-red-600",
      border: "hover:border-red-200",
    },
    purple: {
      icon: "bg-purple-50 text-purple-600",
      value: "text-purple-600",
      border: "hover:border-purple-200",
    },
    indigo: {
      icon: "bg-indigo-50 text-indigo-600",
      value: "text-slate-900",
      border: "hover:border-indigo-200",
    },
  };

  const style = colorMap[color] || colorMap.blue;
  const isClickable = Boolean(onClick);

  return (
    <div
      onClick={onClick}
      className={`rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-sm transition duration-200 ${
        isClickable
          ? `cursor-pointer hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98] ${style.border}`
          : ""
      } ${className}`}
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-xs sm:text-sm font-medium text-slate-500 truncate">
            {title}
          </p>
          {loading ? (
            <div className="mt-2 h-7 w-16 animate-pulse rounded-lg bg-slate-200" />
          ) : (
            <h2
              className={`mt-1.5 text-xl sm:text-2xl font-bold ${
                Icon ? "text-slate-900" : style.value
              }`}
            >
              {value}
            </h2>
          )}
        </div>
        {Icon && (
          <div
            className={`flex h-9 w-9 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl ${style.icon} transition`}
          >
            <Icon size={18} className="sm:size-[20px]" />
          </div>
        )}
      </div>
      {description && (
        <p className="mt-1.5 text-[11px] sm:text-xs text-slate-500 leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
}

export { Statcard as StatCard };
