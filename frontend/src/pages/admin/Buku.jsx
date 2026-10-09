import { useEffect, useMemo, useState } from "react";
import { Plus, Tag } from "lucide-react";
import { PageHeader } from "../../components/common/PageHeader";
import { SearchInput } from "../../components/common/SearchInput";
import { ViewToggle } from "../../components/common/ViewToggle";
import Statcard from "../../admin/components/Statcard";
import { BookModal } from "../../admin/components/buku/BookModal";
import { BookTable } from "../../admin/components/buku/BookTable";
import { BookGridCard } from "../../admin/components/buku/BookGridCard";
import { CategoryManagerModal } from "../../admin/components/buku/CategoryManagerModal";
import { BookService, CategoryService } from "../../services/api";
import { useNotification } from "../../context/NotificationContext";

function Buku() {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Semua");
  const [status, setStatus] = useState("Semua");
  const [typeFilter, setTypeFilter] = useState("Semua");
  const [viewMode, setViewMode] = useState("table");

  const { showSuccess, showError, showConfirm } = useNotification();

  const [showModal, setShowModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);

  const [form, setForm] = useState({
    title: "",
    isbn: "",
    author: "",
    publisher: "",
    publicationYear: "",
    pageCount: "",
    category: "",
    categoryId: "",
    ddc: "",
    shelf: "",
    stock: "1",
    status: "Tersedia",
    isEbook: false,
    coverUrl: "",
    fileUrl: "",
    description: "",
  });

  const loadCategories = async () => {
    try {
      const res = await CategoryService.getAll({ limit: 100 });
      if (res.data?.data) {
        setCategories(res.data.data);
      }
    } catch (err) {
      console.error("Gagal memuat kategori:", err);
    }
  };

  const loadBooks = async () => {
    try {
      const res = await BookService.search({ limit: 100 });
      if (res.data?.data) {
        const apiBooks = res.data.data.map((b) => ({
          id: b.id,
          title: b.title || "-",
          isbn: b.isbn || "-",
          author: b.authors?.map((a) => a.name).join(", ") || "-",
          publisher: b.publisher || "-",
          publicationYear: b.publicationYear || null,
          pageCount: b.pageCount || null,
          category: b.category?.name || "Lainnya",
          categoryId: b.category?.id || "",
          ddc: b.category?.ddcCode || "-",
          shelf: b.shelf || "-",
          stock: b.isEbook ? 99 : (b.copyCount || 0),
          available: b.isEbook ? 99 : (b.copyCount || 0),
          status: b.isEbook || b.copyCount > 0 ? "Tersedia" : "Tidak Tersedia",
          isEbook: Boolean(b.isEbook),
          coverUrl: b.coverUrl || "",
          fileUrl: b.fileUrl || "",
          description: b.description || "",
        }));
        setBooks(apiBooks);
      }
    } catch (err) {
      console.error("Gagal memuat buku:", err);
    }
  };

  useEffect(() => {
    loadCategories();
    loadBooks();
  }, []);

  const filteredBooks = useMemo(() => {
    return books.filter((book) => {
      const searchMatch =
        (book.title || "").toLowerCase().includes(search.toLowerCase()) ||
        (book.isbn || "").toLowerCase().includes(search.toLowerCase()) ||
        (book.author || "").toLowerCase().includes(search.toLowerCase());

      const categoryMatch =
        categoryFilter === "Semua" || book.category === categoryFilter;

      const statusMatch =
        status === "Semua" || book.status === status;

      const typeMatch =
        typeFilter === "Semua" ||
        (typeFilter === "Fisik" && !book.isEbook) ||
        (typeFilter === "E-Book" && Boolean(book.isEbook));

      return searchMatch && categoryMatch && statusMatch && typeMatch;
    });
  }, [books, search, categoryFilter, status, typeFilter]);

  const openAddModal = () => {
    setSelectedBook(null);
    setForm({
      title: "",
      isbn: "",
      author: "",
      publisher: "",
      publicationYear: "",
      pageCount: "",
      category: "",
      categoryId: "",
      ddc: "",
      shelf: "",
      stock: "1",
      status: "Tersedia",
      isEbook: false,
      coverUrl: "",
      fileUrl: "",
      description: "",
    });
    setShowModal(true);
  };

  const openEditModal = (book) => {
    setSelectedBook(book);
    setForm({
      title: book.title || "",
      isbn: book.isbn || "",
      author: book.author || "",
      publisher: book.publisher === "-" ? "" : book.publisher || "",
      publicationYear: book.publicationYear || "",
      pageCount: book.pageCount || "",
      category: book.category || "",
      categoryId: book.categoryId || "",
      ddc: book.ddc === "-" ? "" : book.ddc || "",
      shelf: book.shelf === "-" ? "" : book.shelf || "",
      stock: book.isEbook ? "" : String(book.stock || "1"),
      status: book.status || "Tersedia",
      isEbook: Boolean(book.isEbook),
      coverUrl: book.coverUrl || "",
      fileUrl: book.fileUrl || "",
      description: book.description || "",
    });
    setShowModal(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title || !form.isbn || !form.author) {
      showError("Input Tidak Lengkap", "Judul, ISBN, dan penulis wajib diisi.");
      return;
    }

    if (!form.isEbook && form.status === "Tersedia" && Number(form.stock) <= 0) {
      showError("Stok Tidak Valid", "Buku fisik dengan status 'Tersedia' harus memiliki stok minimal 1.");
      return;
    }

    try {
      const calculatedStock = form.isEbook
        ? 0
        : form.status === "Tidak Tersedia"
        ? 0
        : Math.max(1, Number(form.stock) || 1);

      const payload = {
        title: form.title.trim(),
        isbn: form.isbn.trim(),
        authorName: form.author.trim(),
        publisher: form.publisher?.trim() || null,
        publicationYear: form.publicationYear ? Number(form.publicationYear) : null,
        pageCount: form.pageCount ? Number(form.pageCount) : null,
        description: form.description?.trim() || null,
        coverUrl: form.coverUrl?.trim() || null,
        isEbook: Boolean(form.isEbook),
        fileUrl: form.isEbook ? form.fileUrl?.trim() || null : null,
        shelf: form.isEbook ? null : form.shelf?.trim() || null,
        stock: calculatedStock,
      };

      if (form.categoryId) {
        payload.categoryId = form.categoryId;
      } else if (form.category?.trim()) {
        payload.categoryName = form.category.trim();
      }

      if (selectedBook?.id) {
        await BookService.update(selectedBook.id, payload);
      } else {
        await BookService.create(payload);
      }

      await loadBooks();
      setShowModal(false);
      showSuccess(
        selectedBook ? "Buku Berhasil Diperbarui" : "Buku Berhasil Ditambahkan",
        `Data koleksi "${form.title}" berhasil disimpan ke sistem.`
      );
    } catch (err) {
      showError("Gagal Menyimpan Buku", err?.response?.data?.error || "Terjadi kesalahan saat menyimpan buku.");
    }
  };

  const handleDelete = (id) => {
    const bookTarget = books.find((b) => b.id === id);
    const bookTitle = bookTarget ? bookTarget.title : "buku ini";

    showConfirm({
      title: "Hapus Buku?",
      message: `Apakah Anda yakin ingin menghapus buku "${bookTitle}"? Buku tanpa riwayat sirkulasi akan dihapus permanen, sedangkan buku yang pernah dipinjam akan diarsipkan secara otomatis demi menjaga catatan riwayat.`,
      confirmText: "Ya, Hapus",
      cancelText: "Batal",
      confirmVariant: "danger",
      onConfirm: async () => {
        try {
          const res = await BookService.delete(id);
          if (res?.data?.data?.action === "ARCHIVED") {
            showSuccess("Buku Diarsipkan", `Buku "${bookTitle}" dan eksemplarnya telah diarsipkan karena memiliki riwayat sirkulasi.`);
          } else {
            showSuccess("Berhasil Dihapus", `Buku "${bookTitle}" berhasil dihapus permanen dari sistem.`);
          }
          setBooks((prev) => prev.filter((book) => book.id !== id));
          await loadBooks();
        } catch (err) {
          showError("Gagal Menghapus", err?.response?.data?.error || "Gagal menghapus buku.");
        }
      },
    });
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Header */}
      <PageHeader
        title="Koleksi Buku"
        subtitle="Kelola koleksi buku fisik dan e-book perpustakaan secara terintegrasi."
      >
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowCategoryModal(true)}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-95 cursor-pointer"
          >
            <Tag size={15} />
            Kelola Kategori
          </button>
          <button
            onClick={openAddModal}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 sm:px-5 sm:py-2.5 text-xs sm:text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-95"
          >
            <Plus size={16} />
            Tambah Buku
          </button>
        </div>
      </PageHeader>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <Statcard title="Total Judul" value={books.length} color="blue" />
        <Statcard
          title="Total Stok Fisik"
          value={books.filter((b) => !b.isEbook).reduce((total, book) => total + Number(book.stock), 0)}
          color="blue"
        />
        <Statcard
          title="Tersedia Fisik"
          value={books.filter((b) => !b.isEbook).reduce((total, book) => total + Number(book.available), 0)}
          color="emerald"
        />
        <Statcard
          title="Koleksi E-Book"
          value={books.filter((b) => b.isEbook).length}
          color="indigo"
        />
      </div>

      {/* Filter and View Mode */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <SearchInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari judul, ISBN, atau penulis..."
          />

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="flex-1 sm:w-44 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs sm:text-sm text-slate-700 outline-none focus:border-blue-500"
            >
              <option value="Semua">Semua Kategori</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="flex-1 sm:w-40 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs sm:text-sm text-slate-700 outline-none focus:border-blue-500"
            >
              <option value="Semua">Semua Status</option>
              <option value="Tersedia">Tersedia</option>
              <option value="Tidak Tersedia">Tidak Tersedia</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="flex-1 sm:w-36 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs sm:text-sm text-slate-700 outline-none focus:border-blue-500"
            >
              <option value="Semua">Semua Tipe</option>
              <option value="Fisik">📖 Fisik</option>
              <option value="E-Book">📱 E-Book</option>
            </select>

            <ViewToggle value={viewMode} onChange={setViewMode} />
          </div>
        </div>
      </div>

      {/* Grid or Table View */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBooks.map((book) => (
            <BookGridCard
              key={book.id}
              book={book}
              onEdit={openEditModal}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <BookTable
          books={filteredBooks}
          onEdit={openEditModal}
          onDelete={handleDelete}
        />
      )}

      {/* Book Add/Edit Modal */}
      <BookModal
        open={showModal}
        onClose={() => setShowModal(false)}
        selectedBook={selectedBook}
        form={form}
        categories={categories}
        onChange={handleChange}
        onSubmit={handleSubmit}
        onOpenCategoryManager={() => setShowCategoryModal(true)}
      />

      {/* Category Manager Modal */}
      <CategoryManagerModal
        open={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        categories={categories}
        onCategoriesChange={loadCategories}
      />
    </div>
  );
}

export default Buku;
