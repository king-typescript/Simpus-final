import { Modal } from "../../../components/common/Modal";

const classOptions = [
  "X IPA 1",
  "X IPA 2",
  "X IPS 1",
  "X IPS 2",
  "XI IPA 1",
  "XI IPA 2",
  "XI IPS 1",
  "XI IPS 2",
  "XII IPA 1",
  "XII IPA 2",
  "XII IPS 1",
  "XII IPS 2",
];

export function MemberModal({
  open,
  onClose,
  selectedMember,
  form,
  onChange,
  onSubmit,
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={selectedMember ? "Edit Anggota" : "Tambah Anggota"}
      subtitle="Lengkapi data siswa anggota perpustakaan."
      maxWidth="max-w-lg"
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-700">
            NIS *
          </label>
          <input
            name="nis"
            value={form.nis}
            onChange={onChange}
            placeholder="20260001"
            className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs sm:text-sm outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-700">
            Nama Lengkap *
          </label>
          <input
            name="name"
            value={form.name}
            onChange={onChange}
            placeholder="Nama siswa"
            className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs sm:text-sm outline-none focus:border-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Kelas *
            </label>
            <select
              name="className"
              value={form.className}
              onChange={onChange}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm outline-none focus:border-blue-500"
            >
              <option value="">Pilih kelas</option>
              {classOptions.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Nomor HP
            </label>
            <input
              name="phone"
              value={form.phone}
              onChange={onChange}
              placeholder="08xxxxxxxxxx"
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs sm:text-sm outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-700">
            Status
          </label>
          <select
            name="status"
            value={form.status}
            onChange={onChange}
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm outline-none focus:border-blue-500"
          >
            <option value="Aktif">Aktif</option>
            <option value="Nonaktif">Nonaktif</option>
          </select>
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
            {selectedMember ? "Simpan Perubahan" : "Tambah Anggota"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
