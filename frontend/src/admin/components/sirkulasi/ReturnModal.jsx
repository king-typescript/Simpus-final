import { useState } from "react";
import { Modal } from "../../../components/common/Modal";
import { formatDate, calculateLateDays, calculateFine, formatRupiah } from "../../../utils/formatters";

export function ReturnModal({
  open,
  onClose,
  transaction,
  finePerDay,
  onConfirm,
  submitting = false,
}) {
  const [status, setStatus] = useState("TERSEDIA");
  const [returnCondition, setReturnCondition] = useState("");
  const [returnNote, setReturnNote] = useState("");
  const [validationError, setValidationError] = useState("");

  if (!transaction) return null;

  const lateDays = calculateLateDays(transaction.dueDate);
  const fine = calculateFine(lateDays, finePerDay);

  const handleSubmit = (e) => {
    e.preventDefault();
    if ((status === "RUSAK" || status === "HILANG") && !returnCondition.trim()) {
      setValidationError("Kondisi pengembalian wajib diisi jika buku rusak atau hilang.");
      return;
    }
    setValidationError("");
    onConfirm({ status, returnCondition: returnCondition.trim() || null, returnNote: returnNote.trim() || null });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Konfirmasi Pengembalian"
      subtitle="Periksa detail buku sebelum memproses pengembalian."
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {validationError && (
          <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs font-semibold text-rose-700">
            {validationError}
          </div>
        )}

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

        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-700">
            Kondisi Pengembalian Buku *
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 outline-none focus:border-blue-500"
          >
            <option value="TERSEDIA">Baik (Tersedia kembali)</option>
            <option value="RUSAK">Rusak</option>
            <option value="HILANG">Hilang</option>
          </select>
        </div>

        {(status === "RUSAK" || status === "HILANG") && (
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Deskripsi Kerusakan/Kehilangan *
            </label>
            <textarea
              value={returnCondition}
              onChange={(e) => setReturnCondition(e.target.value)}
              placeholder="Jelaskan kondisi detail kerusakan atau alasan hilang..."
              rows={2}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs outline-none focus:border-blue-500"
            />
          </div>
        )}

        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-700">
            Catatan Tambahan (opsional)
          </label>
          <input
            type="text"
            value={returnNote}
            onChange={(e) => setReturnNote(e.target.value)}
            placeholder="Catatan transaksi..."
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-xl bg-emerald-600 px-5 py-2 text-xs font-semibold text-white hover:bg-emerald-700 active:scale-95 disabled:opacity-50"
          >
            {submitting ? "Memproses..." : "Konfirmasi Kembalikan"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
