import { Search } from "lucide-react";

export function SearchInput({
  value,
  onChange,
  placeholder = "Cari...",
  className = "",
}) {
  return (
    <div className={`relative flex-1 ${className}`}>
      <Search
        size={17}
        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
      />
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-xs sm:text-sm outline-none transition focus:border-blue-500 focus:bg-white"
      />
    </div>
  );
}
