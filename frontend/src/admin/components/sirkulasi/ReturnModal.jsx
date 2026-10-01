import { Modal } from "../../../components/common/Modal";
import { formatDate, calculateLateDays, calculateFine, formatRupiah } from "../../../utils/formatters";

export function ReturnModal({
  open,
  onClose,
  transaction,
  finePerDay,
  onConfirm,
}) {
  if (!transaction) return null;

  const lateDays = calculateLateDays(transaction.dueDate);
  const fine = calculateFine(lateDays, finePerDay);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Konfirmasi Pengembalian"
      subtitle="Periksa detail buku sebelum memproses pengembalian."
      maxWidth="max-w-md"
    >
      <div className="space-y-4">
        <div className="rounded-xl bg-slate-50 p-4 space-y-2 text-xs">
          <p>
            <span className="text-slate-400">Peminjam:</span>{" "}
            <span className="font-bold text-slate-900">
              {transaction.memberName}
            </span>
          </p>
          <p>
            <span className="text-slate-400">Buku:</span>{" "}
            <span className="font-semibold text-slate-800">
              {transaction.bookTitle}
            </span>
          </p>
          <p>
            <span className="text-slate-400">Jatuh Tempo:</span>{" "}
            <span className="font-medium text-slate-700">
              {formatDate(transaction.dueDate)}
            </span>
          </p>
          {lateDays > 0 && (
            <div className="mt-2 pt-2 border-t border-slate-200 text-red-600 font-bold">
              Terlambat {lateDays} hari — Denda: {formatRupiah(fine)}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            className="rounded-xl bg-emerald-600 px-5 py-2 text-xs font-semibold text-white hover:bg-emerald-700 active:scale-95"
          >
            Konfirmasi Kembalikan
          </button>
        </div>
      </div>
    </Modal>
  );
}
