import { Modal } from "../../../components/common/Modal";

export function BookModal({
  open,
  onClose,
  selectedBook,
  form,
  onChange,
  onSubmit,
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={selectedBook ? "Edit Buku" : "Tambah Buku Baru"}
      subtitle="Lengkapi data detail buku."
      maxWidth="max-w-xl"
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-700">
            Judul Buku *
          </label>
          <input
            name="title"
            value={form.title}
            onChange={onChange}
            placeholder="Masukkan judul buku"
            className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs sm:text-sm outline-none focus:border-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              ISBN *
            </label>
            <input
              name="isbn"
              value={form.isbn}
              onChange={onChange}
              placeholder="978-..."
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs sm:text-sm outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Penulis *
            </label>
            <input
              name="author"
              value={form.author}
              onChange={onChange}
              placeholder="Nama penulis"
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs sm:text-sm outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Kategori
            </label>
            <select
              name="category"
              value={form.category}
              onChange={onChange}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm outline-none focus:border-blue-500"
            >
              <option value="">Pilih kategori</option>
              <option value="Informatika">Informatika</option>
              <option value="Matematika">Matematika</option>
              <option value="Bahasa">Bahasa</option>
              <option value="Fisika">Fisika</option>
              <option value="Sains">Sains</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              DDC
            </label>
            <input
              name="ddc"
              value={form.ddc}
              onChange={onChange}
              placeholder="005.1"
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs sm:text-sm outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Rak
            </label>
            <input
              name="shelf"
              value={form.shelf}
              onChange={onChange}
              placeholder="A-01"
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs sm:text-sm outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Jumlah Stok
            </label>
            <input
              type="number"
              min="0"
              name="stock"
              value={form.stock}
              onChange={onChange}
              placeholder="5"
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs sm:text-sm outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-100 pt-4 mt-6">
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
            {selectedBook ? "Simpan Perubahan" : "Tambah Buku"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
