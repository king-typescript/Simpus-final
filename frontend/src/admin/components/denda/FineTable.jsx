import { Wallet } from "lucide-react";
import { StatusBadge } from "../../../components/common/StatusBadge";
import { EmptyState } from "../../../components/common/EmptyState";
import { formatDate, calculateFine, formatRupiah } from "../../../utils/formatters";

export function FineTable({ fines, finePerDay, onOpenPayment }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full min-w-[900px] text-left">
          <thead className="border-b border-slate-100 bg-slate-50/75">
            <tr>
              <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Anggota
              </th>
              <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Buku
              </th>
              <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Keterlambatan
              </th>
              <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Denda
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
            {fines.length > 0 ? (
              fines.map((fine) => (
                <tr key={fine.id} className="transition hover:bg-slate-50/70">
                  <td className="px-5 py-3.5">
                    <p className="font-semibold text-slate-900 text-sm">
                      {fine.member}
                    </p>
                    <p className="text-xs text-slate-400">NIS {fine.nis}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="text-sm font-medium text-slate-800 line-clamp-1 max-w-[200px]">
                      {fine.book}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Jatuh Tempo: {formatDate(fine.dueDate)}
                    </p>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-sm font-semibold text-slate-800">
                      {fine.lateDays} hari
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="text-sm font-bold text-red-600">
                      {formatRupiah(calculateFine(fine.lateDays, finePerDay))}
                    </p>
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={fine.status} type="fine" />
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    {fine.status === "Belum Dibayar" ? (
                      <button
                        onClick={() => onOpenPayment(fine)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 active:scale-95 transition shadow-sm shadow-blue-500/20"
                      >
                        <Wallet size={13} /> Bayar
                      </button>
                    ) : (
                      <span className="text-[11px] font-medium text-slate-400 mr-2">
                        Selesai
                      </span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6">
                  <EmptyState message="Data denda tidak ditemukan." />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
