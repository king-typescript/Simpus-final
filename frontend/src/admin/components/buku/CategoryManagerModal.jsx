import { useState } from "react";
import { Plus, Trash2, Edit2, Check, X, Tag } from "lucide-react";
import { Modal } from "../../../components/common/Modal";
import { CategoryService } from "../../../services/api";
import { useNotification } from "../../../context/NotificationContext";

export function CategoryManagerModal({ open, onClose, categories = [], onCategoriesChange }) {
  const { showSuccess, showError, showConfirm } = useNotification();
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", ddcCode: "", description: "" });
  const [newForm, setNewForm] = useState({ name: "", ddcCode: "", description: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newForm.name.trim() || !newForm.ddcCode.trim()) {
      showError("Input Tidak Lengkap", "Nama kategori dan kode DDC wajib diisi.");
      return;
    }
    setIsSubmitting(true);
    try {
      await CategoryService.create({
        name: newForm.name.trim(),
        ddcCode: newForm.ddcCode.trim(),
        description: newForm.description.trim() || null,
      });
      setNewForm({ name: "", ddcCode: "", description: "" });
      showSuccess("Kategori Dibuat", "Kategori baru berhasil ditambahkan.");
      onCategoriesChange?.();
    } catch (err) {
      showError("Gagal Membuat Kategori", err?.response?.data?.error || "Gagal menyimpan kategori.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEdit = (cat) => {
    setEditingId(cat.id);
    setEditForm({ name: cat.name, ddcCode: cat.ddcCode, description: cat.description || "" });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ name: "", ddcCode: "", description: "" });
  };

  const handleUpdate = async (id) => {
    if (!editForm.name.trim() || !editForm.ddcCode.trim()) {
      showError("Input Tidak Lengkap", "Nama kategori dan kode DDC wajib diisi.");
      return;
    }
    setIsSubmitting(true);
    try {
      await CategoryService.update(id, {
        name: editForm.name.trim(),
        ddcCode: editForm.ddcCode.trim(),
        description: editForm.description.trim() || null,
      });
      setEditingId(null);
      showSuccess("Kategori Diperbarui", "Perubahan kategori berhasil disimpan.");
      onCategoriesChange?.();
    } catch (err) {
      showError("Gagal Memperbarui", err?.response?.data?.error || "Gagal memperbarui kategori.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (cat) => {
    showConfirm({
      title: "Hapus Kategori?",
      message: `Yakin ingin menghapus kategori "${cat.name}"? Kategori yang masih memiliki buku tidak dapat dihapus.`,
      confirmText: "Ya, Hapus",
      cancelText: "Batal",
      confirmVariant: "danger",
      onConfirm: async () => {
        try {
          await CategoryService.delete(cat.id);
          showSuccess("Kategori Dihapus", `Kategori "${cat.name}" berhasil dihapus.`);
          onCategoriesChange?.();
        } catch (err) {
          showError("Gagal Menghapus", err?.response?.data?.error || "Kategori masih digunakan oleh buku.");
        }
      },
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Kelola Kategori Buku"
      subtitle="Tambah, edit, atau hapus klasifikasi kategori perpustakaan."
      maxWidth="max-w-2xl"
    >
      <div className="space-y-6">
        {/* Form Tambah Kategori Baru */}
        <form onSubmit={handleCreate} className="rounded-xl border border-blue-100 bg-blue-50/40 p-3.5 space-y-3">
          <p className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
            <Plus size={14} /> Tambah Kategori Baru
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <input
              type="text"
              placeholder="Nama Kategori (cth: Sains)"
              value={newForm.name}
              onChange={(e) => setNewForm({ ...newForm, name: e.target.value })}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-blue-500"
            />
            <input
              type="text"
              placeholder="Kode DDC (cth: 500)"
              value={newForm.ddcCode}
              onChange={(e) => setNewForm({ ...newForm, ddcCode: e.target.value })}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-blue-500"
            />
            <input
              type="text"
              placeholder="Deskripsi singkat (opsional)"
              value={newForm.description}
              onChange={(e) => setNewForm({ ...newForm, description: e.target.value })}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? "Menyimpan..." : "Simpan Kategori"}
            </button>
          </div>
        </form>

        {/* Daftar Kategori */}
        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Daftar Kategori Tersedia ({categories.length})
          </p>
          {categories.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-400">Belum ada kategori.</div>
          ) : (
            categories.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center justify-between gap-2 rounded-xl border border-slate-200/80 bg-white p-2.5 text-xs transition hover:border-slate-300"
              >
                {editingId === cat.id ? (
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="rounded-lg border border-blue-400 px-2 py-1 text-xs outline-none"
                    />
                    <input
                      type="text"
                      value={editForm.ddcCode}
                      onChange={(e) => setEditForm({ ...editForm, ddcCode: e.target.value })}
                      className="rounded-lg border border-blue-400 px-2 py-1 text-xs outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Deskripsi"
                      value={editForm.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      className="rounded-lg border border-blue-400 px-2 py-1 text-xs outline-none"
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                      <Tag size={13} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-800 truncate">{cat.name}</p>
                      <p className="text-[10px] text-slate-400">DDC: {cat.ddcCode}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-1 shrink-0">
                  {editingId === cat.id ? (
                    <>
                      <button
                        type="button"
                        onClick={() => handleUpdate(cat.id)}
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
                        onClick={() => startEdit(cat)}
                        className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                        title="Edit"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(cat)}
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
