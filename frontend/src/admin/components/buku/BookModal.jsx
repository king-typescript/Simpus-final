import { useRef, useState } from "react";
import { Upload, X, Image as ImageIcon, Settings } from "lucide-react";
import { Modal } from "../../../components/common/Modal";
import { UploadService } from "../../../services/api";

export function BookModal({
  open,
  onClose,
  selectedBook,
  form,
  categories = [],
  onChange,
  onSubmit,
  onOpenCategoryManager,
}) {
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const coverInputRef = useRef(null);
  const pdfInputRef = useRef(null);

  const handleCoverUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setUploadError("Hanya file gambar (JPG, PNG, WebP) yang diperbolehkan.");
      return;
    }

    setUploadingCover(true);
    setUploadError("");
    try {
      const res = await UploadService.uploadFile(file);
      if (res.data?.data?.url) {
        onChange({ target: { name: "coverUrl", value: res.data.data.url } });
      }
    } catch (err) {
      setUploadError(err?.response?.data?.error || "Gagal mengunggah cover buku.");
    } finally {
      setUploadingCover(false);
      if (coverInputRef.current) coverInputRef.current.value = "";
    }
  };

  const handlePdfUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      setUploadError("Hanya file PDF yang diperbolehkan untuk e-book.");
      return;
    }

    setUploadingPdf(true);
    setUploadError("");
    try {
      const res = await UploadService.uploadFile(file);
      if (res.data?.data?.url) {
        onChange({ target: { name: "fileUrl", value: res.data.data.url } });
      }
    } catch (err) {
      setUploadError(err?.response?.data?.error || "Gagal mengunggah file PDF.");
    } finally {
      setUploadingPdf(false);
      if (pdfInputRef.current) pdfInputRef.current.value = "";
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={selectedBook ? "Edit Koleksi Buku" : "Tambah Koleksi Buku"}
      subtitle="Lengkapi data detail buku perpustakaan secara akurat."
      maxWidth="max-w-2xl"
    >
      <form onSubmit={onSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto px-1 pr-2">
        {uploadError && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
            {uploadError}
          </div>
        )}

        {/* 1. Format / Tipe Buku */}
        <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-3">
          <label className="mb-1.5 block text-xs font-bold text-blue-900">
            Format / Tipe Buku *
          </label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
              <input
                type="radio"
                name="isEbook"
                checked={!form.isEbook}
                onChange={() => onChange({ target: { name: "isEbook", value: false } })}
                className="text-blue-600 focus:ring-blue-500"
              />
              📖 Buku Cetak Fisik
            </label>
            <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
              <input
                type="radio"
                name="isEbook"
                checked={Boolean(form.isEbook)}
                onChange={() => onChange({ target: { name: "isEbook", value: true } })}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span className="font-semibold text-purple-700">📱 E-Book Digital (PDF)</span>
            </label>
          </div>
        </div>

        {/* 2. Judul Buku */}
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-700">
            Judul Buku *
          </label>
          <input
            name="title"
            value={form.title}
            onChange={onChange}
            required
            placeholder="Masukkan judul buku lengkap"
            className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs sm:text-sm outline-none focus:border-blue-500"
          />
        </div>

        {/* 3. Penulis & Penerbit */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Penulis *
            </label>
            <input
              name="author"
              value={form.author}
              onChange={onChange}
              required
              placeholder="Nama penulis"
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs sm:text-sm outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Penerbit
            </label>
            <input
              name="publisher"
              value={form.publisher || ""}
              onChange={onChange}
              placeholder="Nama penerbit (cth: Gramedia)"
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs sm:text-sm outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* 4. ISBN, Tahun Terbit & Halaman */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              ISBN *
            </label>
            <input
              name="isbn"
              value={form.isbn}
              onChange={onChange}
              required
              placeholder="978-..."
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs sm:text-sm outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Tahun Terbit
            </label>
            <input
              type="number"
              name="publicationYear"
              value={form.publicationYear || ""}
              onChange={onChange}
              placeholder="2024"
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs sm:text-sm outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Jumlah Halaman
            </label>
            <input
              type="number"
              min="1"
              name="pageCount"
              value={form.pageCount || ""}
              onChange={onChange}
              placeholder="Cth: 284"
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs sm:text-sm outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* 5. Kategori (Dinamis dengan tombol Kelola) & DDC */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">
                Kategori Buku
              </label>
              <button
                type="button"
                onClick={onOpenCategoryManager}
                className="text-[11px] text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 cursor-pointer"
              >
                <Settings size={12} /> Kelola Kategori
              </button>
            </div>
            <select
              name="categoryId"
              value={form.categoryId || ""}
              onChange={(e) => {
                const selectedCat = categories.find((c) => c.id === e.target.value);
                onChange({ target: { name: "categoryId", value: e.target.value } });
                if (selectedCat) {
                  onChange({ target: { name: "category", value: selectedCat.name } });
                  onChange({ target: { name: "ddc", value: selectedCat.ddcCode || "" } });
                }
              }}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm outline-none focus:border-blue-500"
            >
              <option value="">Pilih Kategori</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name} ({cat.ddcCode})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Kode DDC
            </label>
            <input
              name="ddc"
              value={form.ddc || ""}
              onChange={onChange}
              placeholder="005.1"
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs sm:text-sm outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* 6. Stok Fisik, Lokasi Rak & Status Ketersediaan */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {!form.isEbook && (
            <>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  Lokasi Rak *
                </label>
                <input
                  name="shelf"
                  value={form.shelf || ""}
                  onChange={onChange}
                  placeholder="Cth: Rak A-01, Lemari 2"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs sm:text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  Jumlah Stok Fisik *
                </label>
                <input
                  type="number"
                  min="0"
                  name="stock"
                  value={form.stock !== undefined ? form.stock : ""}
                  onChange={onChange}
                  placeholder="Minimal 1 buku"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs sm:text-sm outline-none focus:border-blue-500"
                />
              </div>
            </>
          )}

          <div className={form.isEbook ? "sm:col-span-3" : ""}>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Status Ketersediaan
            </label>
            <select
              name="status"
              value={form.status || "Tersedia"}
              onChange={onChange}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm outline-none focus:border-blue-500"
            >
              <option value="Tersedia">Tersedia</option>
              <option value="Tidak Tersedia">Tidak Tersedia</option>
            </select>
          </div>
        </div>

        {/* 7. File PDF (Khusus E-Book) */}
        {form.isEbook && (
          <div className="rounded-xl border border-purple-200 bg-purple-50/40 p-3.5 space-y-2">
            <label className="block text-xs font-bold text-purple-900">
              File Dokumen E-Book (PDF) *
            </label>
            <div className="flex items-center gap-3">
              <input
                type="file"
                ref={pdfInputRef}
                accept="application/pdf"
                onChange={handlePdfUpload}
                className="hidden"
                id="ebook-file-input"
              />
              <label
                htmlFor="ebook-file-input"
                className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg border border-purple-300 bg-white px-3.5 py-2 text-xs font-semibold text-purple-700 hover:bg-purple-50 active:scale-95 shadow-xs"
              >
                <Upload size={14} />
                {uploadingPdf ? "Mengunggah PDF..." : "Pilih File PDF Dari Perangkat"}
              </label>
              {form.fileUrl && (
                <span className="text-[11px] text-emerald-700 font-medium truncate max-w-xs">
                  ✓ File terpilih: {form.fileUrl}
                </span>
              )}
            </div>
          </div>
        )}

        {/* 8. Cover Gambar (Dari Perangkat) */}
        <div className="rounded-xl border border-slate-200 p-3.5 space-y-2.5">
          <label className="block text-xs font-semibold text-slate-700">
            Cover Buku (Ambil Gambar dari Perangkat)
          </label>
          <div className="flex items-start gap-4">
            {form.coverUrl ? (
              <div className="relative h-24 w-18 shrink-0 rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
                <img src={form.coverUrl} alt="Cover preview" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => onChange({ target: { name: "coverUrl", value: "" } })}
                  className="absolute top-1 right-1 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
                  title="Hapus gambar"
                >
                  <X size={10} />
                </button>
              </div>
            ) : (
              <div className="flex h-24 w-18 shrink-0 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 text-slate-400">
                <ImageIcon size={24} />
              </div>
            )}

            <div className="flex-1 space-y-2">
              <input
                type="file"
                ref={coverInputRef}
                accept="image/*"
                onChange={handleCoverUpload}
                className="hidden"
                id="book-cover-input"
              />
              <label
                htmlFor="book-cover-input"
                className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 active:scale-95 shadow-xs"
              >
                <Upload size={13} />
                {uploadingCover ? "Mengunggah Gambar..." : "Pilih Gambar Cover"}
              </label>
              <p className="text-[10px] text-slate-400">
                Mendukung format JPG, PNG, atau WebP (maks. 10MB).
              </p>
              {form.coverUrl && (
                <input
                  type="text"
                  name="coverUrl"
                  value={form.coverUrl}
                  onChange={onChange}
                  placeholder="URL cover"
                  className="w-full text-[11px] text-slate-400 border border-slate-100 rounded px-2 py-1 bg-slate-50"
                />
              )}
            </div>
          </div>
        </div>

        {/* 9. Sinopsis dan Deskripsi */}
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-700">
            Sinopsis & Deskripsi Buku
          </label>
          <textarea
            rows={3}
            name="description"
            value={form.description || ""}
            onChange={onChange}
            placeholder="Tuliskan ringkasan, sinopsis, atau deskripsi buku..."
            className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs sm:text-sm outline-none focus:border-blue-500 resize-none"
          />
        </div>

        {/* Tombol Aksi */}
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
            disabled={uploadingCover || uploadingPdf}
            className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-semibold text-white hover:bg-blue-700 active:scale-95 disabled:opacity-50"
          >
            {selectedBook ? "Simpan Perubahan" : "Tambah Buku"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
