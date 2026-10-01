import { Modal } from "../../../components/common/Modal";

export function BorrowModal({
  open,
  onClose,
  form,
  onChange,
  onSubmit,
  members,
  books,
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Peminjaman Baru"
      subtitle="Catat transaksi peminjaman buku perpustakaan."
      maxWidth="max-w-lg"
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-700">
            Anggota *
          </label>
          <select
            name="memberNis"
            value={form.memberNis}
            onChange={onChange}
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm outline-none focus:border-blue-500"
          >
            <option value="">Pilih Anggota</option>
            {members.map((m) => (
              <option key={m.nis} value={m.nis}>
                {m.name} ({m.nis})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-700">
            Buku *
          </label>
          <select
            name="bookId"
            value={form.bookId}
            onChange={onChange}
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm outline-none focus:border-blue-500"
          >
            <option value="">Pilih Buku</option>
            {books.map((b) => (
              <option key={b.id} value={b.id} disabled={b.available <= 0}>
                {b.title} (Sisa: {b.available})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-700">
            Tanggal Peminjaman
          </label>
          <input
            type="date"
            name="borrowDate"
            value={form.borrowDate}
            onChange={onChange}
            className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs sm:text-sm outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
          >
            Batal
          </button>
          <button
            type="submit"
            className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-semibold text-white hover:bg-blue-700 active:scale-95"
          >
            Proses Pinjam
          </button>
        </div>
      </form>
    </Modal>
  );
}
