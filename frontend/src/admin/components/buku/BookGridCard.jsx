import { BookOpen, Pencil, Trash2 } from "lucide-react";
import { StatusBadge } from "../../../components/common/StatusBadge";

export function BookGridCard({ book, onEdit, onDelete }) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm hover:shadow-md transition space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <BookOpen size={18} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="font-semibold text-slate-900 text-sm truncate">
                {book.title}
              </h3>
              {book.isEbook && (
                <span className="shrink-0 rounded bg-purple-100 px-1.5 py-0.5 text-[9px] font-bold text-purple-700">
                  E-BOOK
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 truncate">{book.author}</p>
          </div>
        </div>
        <StatusBadge status={book.status} type="book" />
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs border-y border-slate-100 py-2.5">
        <div>
          <span className="text-slate-400">Kategori:</span>{" "}
          <span className="font-medium text-slate-700">{book.category}</span>
        </div>
        <div>
          <span className="text-slate-400">Rak:</span>{" "}
          <span className="font-medium text-slate-700">{book.shelf}</span>
        </div>
        <div>
          <span className="text-slate-400">Stok:</span>{" "}
          <span className="font-semibold text-slate-900">
            {book.available}/{book.stock}
          </span>
        </div>
        <div>
          <span className="text-slate-400">DDC:</span>{" "}
          <span className="font-medium text-slate-700">{book.ddc}</span>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-1">
        <button
          onClick={() => onEdit(book)}
          className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition active:scale-95"
        >
          <Pencil size={13} /> Edit
        </button>
        <button
          onClick={() => onDelete(book.id)}
          className="flex items-center gap-1 rounded-lg border border-red-200 bg-red-50/50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100/50 transition active:scale-95"
        >
          <Trash2 size={13} /> Hapus
        </button>
      </div>
    </div>
  );
}
