export function PageHeader({ title, subtitle, children }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-0.5 text-xs sm:text-sm text-slate-500">
            {subtitle}
          </p>
        )}
      </div>
      {children && (
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {children}
        </div>
      )}
    </div>
  );
}
