import { ArrowDownToLine } from "lucide-react";
import { Avatar } from "../../../components/common/Avatar";
import { StatusBadge } from "../../../components/common/StatusBadge";
import { EmptyState } from "../../../components/common/EmptyState";
import { formatDate, calculateLateDays, calculateFine, formatRupiah } from "../../../utils/formatters";

export function CirculationTable({
  transactions,
  finePerDay,
  onExtend,
  onOpenReturn,
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full min-w-[850px] text-left">
          <thead className="border-b border-slate-100 bg-slate-50/75">
            <tr>
              <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Anggota
              </th>
              <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Buku
              </th>
              <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Tgl Pinjam
              </th>
              <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Jatuh Tempo
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
            {transactions.length > 0 ? (
              transactions.map((t) => {
                const lateDays =
                  t.status === "Terlambat" ? calculateLateDays(t.dueDate) : 0;
                const fine = calculateFine(lateDays, finePerDay);

                return (
                  <tr key={t.id} className="transition hover:bg-slate-50/70">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={t.memberName} size="md" />
                        <div>
                          <p className="font-semibold text-slate-900 text-sm">
                            {t.memberName}
                          </p>
                          <p className="text-xs text-slate-400">NIS {t.nis}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-3.5">
                      <p className="font-medium text-slate-900 text-xs sm:text-sm line-clamp-1">
                        {t.bookTitle}
                      </p>
                      <p className="text-[11px] text-slate-400">{t.isbn}</p>
                    </td>

                    <td className="px-5 py-3.5 text-xs text-slate-600">
                      {formatDate(t.borrowDate)}
                    </td>

                    <td className="px-5 py-3.5">
                      <p className="text-xs font-medium text-slate-800">
                        {formatDate(t.dueDate)}
                      </p>
                      {t.extension > 0 && (
                        <p className="text-[10px] text-blue-600">Diperpanjang 1x</p>
                      )}
                      {fine > 0 && (
                        <p className="text-[10px] text-red-600 font-bold">
                          Denda: {formatRupiah(fine)}
                        </p>
                      )}
                    </td>

                    <td className="px-5 py-3.5">
                      <StatusBadge status={t.status} type="loan" />
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      <div className="flex justify-end gap-1.5">
                        {(t.status === "Dipinjam" ||
                          t.status === "Terlambat") && (
                          <>
                            <button
                              onClick={() => onExtend(t)}
                              className="rounded-lg border border-blue-200 bg-blue-50/50 px-2.5 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-100/50 active:scale-95 transition"
                              title="Perpanjang 7 hari"
                            >
                              Perpanjang
                            </button>
                            <button
                              onClick={() => onOpenReturn(t)}
                              className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 active:scale-95 transition shadow-sm"
                            >
                              <ArrowDownToLine size={13} /> Kembalikan
                            </button>
                          </>
                        )}

                        {t.status === "Dikembalikan" && (
                          <span className="text-xs text-slate-400">
                            {formatDate(t.returnDate)}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="6">
                  <EmptyState message="Tidak ada transaksi sirkulasi." />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
