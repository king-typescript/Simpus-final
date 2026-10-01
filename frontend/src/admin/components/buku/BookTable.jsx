import { BookOpen, Pencil, Trash2 } from "lucide-react";
import { StatusBadge } from "../../../components/common/StatusBadge";
import { EmptyState } from "../../../components/common/EmptyState";

export function BookTable({ books, onEdit, onDelete }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full min-w-[800px] text-left">
          <thead className="border-b border-slate-100 bg-slate-50/75">
            <tr>
              <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Buku
              </th>
              <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                ISBN
              </th>
              <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Kategori
              </th>
              <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Rak
              </th>
              <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Stok
              </th>
              <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Status
              </th>
              <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {books.length > 0 ? (
              books.map((book) => (
                <tr key={book.id} className="transition hover:bg-slate-50/70">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <BookOpen size={16} />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 text-sm">
                          {book.title}
                        </p>
                        <p className="text-xs text-slate-400">{book.author}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-slate-600">
                    {book.isbn}
                  </td>
                  <td className="px-5 py-3.5 text-xs text-slate-600">
                    {book.category}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                      {book.shelf}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="text-xs font-semibold text-slate-900">
                      {book.available} / {book.stock}
                    </p>
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={book.status} type="book" />
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex justify-end gap-1.5">
                      <button
                        title="Edit"
                        onClick={() => onEdit(book)}
                        className="rounded-lg p-1.5 text-slate-400 transition hover:bg-blue-50 hover:text-blue-600"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        title="Hapus"
                        onClick={() => onDelete(book.id)}
                        className="rounded-lg p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7">
                  <EmptyState icon={BookOpen} message="Buku tidak ditemukan" />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
