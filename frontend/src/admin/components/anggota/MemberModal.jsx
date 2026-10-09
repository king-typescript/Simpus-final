import { Settings } from "lucide-react";
import { Modal } from "../../../components/common/Modal";

export function MemberModal({
  open,
  onClose,
  selectedMember,
  form,
  classes = [],
  onChange,
  onSubmit,
  onOpenClassManager,
  submitting = false,
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
            required
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
            required
            className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs sm:text-sm outline-none focus:border-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">
                Kelas *
              </label>
              <button
                type="button"
                onClick={onOpenClassManager}
                className="text-[11px] text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 cursor-pointer"
              >
                <Settings size={12} /> Kelola Kelas
              </button>
            </div>
            <select
              name="className"
              value={form.className}
              onChange={onChange}
              required
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm outline-none focus:border-blue-500"
            >
              <option value="">Pilih kelas</option>
              {classes.map((item) => (
                <option key={item.id || item.name} value={item.name}>
                  {item.name}
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
              value={form.phone || ""}
              onChange={onChange}
              placeholder="08xxxxxxxxxx"
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs sm:text-sm outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {!selectedMember && (
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Password Akun Siswa (Opsional)
            </label>
            <input
              type="password"
              name="password"
              value={form.password || ""}
              onChange={onChange}
              placeholder="Default: passwordSiswa123 (min 12 karakter)"
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs sm:text-sm outline-none focus:border-blue-500"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Jika dikosongkan, password default adalah <code>passwordSiswa123</code>.
            </p>
          </div>
        )}

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
            disabled={submitting}
            className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-semibold text-white hover:bg-blue-700 active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
          >
            {submitting ? "Memproses..." : selectedMember ? "Simpan Perubahan" : "Tambah Anggota"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
