import { useState } from "react";
import { Plus, Trash2, Edit2, Check, X, GraduationCap } from "lucide-react";
import { Modal } from "../../../components/common/Modal";
import { ClassService } from "../../../services/api";
import { useNotification } from "../../../context/NotificationContext";

export function ClassManagerModal({ open, onClose, classes = [], onClassesChange }) {
  const { showSuccess, showError, showConfirm } = useNotification();
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [newName, setNewName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newName.trim()) {
      showError("Input Tidak Lengkap", "Nama kelas wajib diisi.");
      return;
    }
    setIsSubmitting(true);
    try {
      await ClassService.create({ name: newName.trim() });
      setNewName("");
      showSuccess("Kelas Ditambahkan", "Data kelas berhasil disimpan.");
      onClassesChange?.();
    } catch (err) {
      showError("Gagal Menambahkan", err?.response?.data?.error || "Gagal membuat kelas.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEdit = (cls) => {
    setEditingId(cls.id);
    setEditName(cls.name);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
  };

  const handleUpdate = async (id) => {
    if (!editName.trim()) {
      showError("Input Tidak Lengkap", "Nama kelas tidak boleh kosong.");
      return;
    }
    setIsSubmitting(true);
    try {
      await ClassService.update(id, { name: editName.trim() });
      setEditingId(null);
      showSuccess("Kelas Diperbarui", "Perubahan nama kelas berhasil disimpan.");
      onClassesChange?.();
    } catch (err) {
      showError("Gagal Memperbarui", err?.response?.data?.error || "Gagal memperbarui kelas.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (cls) => {
    showConfirm({
      title: "Hapus Kelas?",
      message: `Yakin ingin menghapus kelas "${cls.name}"? Kelas yang memiliki siswa tidak dapat dihapus.`,
      confirmText: "Ya, Hapus",
      cancelText: "Batal",
      confirmVariant: "danger",
      onConfirm: async () => {
        try {
          await ClassService.delete(cls.id);
          showSuccess("Kelas Dihapus", `Kelas "${cls.name}" berhasil dihapus.`);
          onClassesChange?.();
        } catch (err) {
          showError("Gagal Menghapus", err?.response?.data?.error || "Kelas masih digunakan oleh siswa.");
        }
      },
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Kelola Data Kelas"
      subtitle="Tambah, edit, atau hapus daftar kelas siswa sekolah."
      maxWidth="max-w-md"
    >
      <div className="space-y-5">
        {/* Form Tambah Kelas */}
        <form onSubmit={handleCreate} className="flex gap-2">
          <input
            type="text"
            placeholder="Nama kelas (cth: X IPA 1)"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="flex-1 rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 active:scale-95 disabled:opacity-50"
          >
            <Plus size={14} /> Tambah
          </button>
        </form>

        {/* List Kelas */}
        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Daftar Kelas ({classes.length})
          </p>
          {classes.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-400">Belum ada kelas terdaftar.</div>
          ) : (
            classes.map((cls) => (
              <div
                key={cls.id}
                className="flex items-center justify-between gap-2 rounded-xl border border-slate-200/80 bg-white p-2.5 text-xs transition hover:border-slate-300"
              >
                {editingId === cls.id ? (
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="flex-1 rounded-lg border border-blue-400 px-2 py-1 text-xs outline-none"
                    autoFocus
                  />
                ) : (
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                      <GraduationCap size={14} />
                    </div>
                    <span className="font-semibold text-slate-800 truncate">{cls.name}</span>
                    {cls.studentCount > 0 && (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-500 font-medium">
                        {cls.studentCount} siswa
                      </span>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-1 shrink-0">
                  {editingId === cls.id ? (
                    <>
                      <button
                        type="button"
                        onClick={() => handleUpdate(cls.id)}
                        disabled={isSubmitting}
                        className="rounded-lg p-1.5 text-emerald-600 hover:bg-emerald-50"
                        title="Simpan"
                      >
                        <Check size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
                        title="Batal"
                      >
                        <X size={14} />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => startEdit(cls)}
                        className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                        title="Edit"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(cls)}
                        className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 hover:text-red-700"
                        title="Hapus"
                      >
                        <Trash2 size={13} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="flex justify-end border-t border-slate-100 pt-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Tutup
          </button>
        </div>
      </div>
    </Modal>
  );
}
