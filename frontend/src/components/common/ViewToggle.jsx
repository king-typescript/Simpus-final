import { LayoutGrid, List } from "lucide-react";

export function ViewToggle({ value, onChange }) {
  return (
    <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1">
      <button
        onClick={() => onChange("table")}
        className={`rounded-lg p-1.5 transition ${
          value === "table"
            ? "bg-white text-blue-600 shadow-xs"
            : "text-slate-400 hover:text-slate-600"
        }`}
        title="Tampilan Tabel"
      >
        <List size={16} />
      </button>
      <button
        onClick={() => onChange("grid")}
        className={`rounded-lg p-1.5 transition ${
          value === "grid"
            ? "bg-white text-blue-600 shadow-xs"
            : "text-slate-400 hover:text-slate-600"
        }`}
        title="Tampilan Kartu"
      >
        <LayoutGrid size={16} />
      </button>
    </div>
  );
}
