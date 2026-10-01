import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { PageHeader } from "../../components/common/PageHeader";
import { SearchInput } from "../../components/common/SearchInput";
import { ViewToggle } from "../../components/common/ViewToggle";
import Statcard from "../../admin/components/Statcard";
import { BookModal } from "../../admin/components/buku/BookModal";
import { BookTable } from "../../admin/components/buku/BookTable";
import { BookGridCard } from "../../admin/components/buku/BookGridCard";
import { BookService, CategoryService } from "../../services/api";

const initialBooks = [
  {
    id: 1,
    title: "Algoritma dan Pemrograman",
    isbn: "978-602-1234-01-1",
    author: "Ahmad Fauzan",
    category: "Informatika",
    ddc: "005.1",
    shelf: "A-01",
    stock: 5,
    available: 5,
    status: "Tersedia",
  },
  {
    id: 2,
    title: "Matematika Dasar",
    isbn: "978-602-1234-02-8",
    author: "Budi Santoso",
    category: "Matematika",
    ddc: "510",
    shelf: "B-02",
    stock: 4,
    available: 2,
    status: "Dipinjam",
  },
  {
    id: 3,
    title: "Bahasa Indonesia",
    isbn: "978-602-1234-03-5",
    author: "Siti Rahma",
    category: "Bahasa",
    ddc: "410",
    shelf: "C-01",
    stock: 6,
    available: 6,
    status: "Tersedia",
  },
  {
    id: 4,
    title: "Dasar-Dasar Fisika",
    isbn: "978-602-1234-04-2",
    author: "Nur Aisyah",
    category: "Fisika",
    ddc: "530",
    shelf: "D-03",
    stock: 3,
    available: 0,
    status: "Dipinjam",
  },
  {
    id: 5,
    title: "Ilmu Pengetahuan Alam",
    isbn: "978-602-1234-05-9",
    author: "Rizky Maulana",
    category: "Sains",
    ddc: "500",
    shelf: "E-01",
    stock: 4,
    available: 0,
    status: "Rusak",
  },
];

function Buku() {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Semua");
  const [status, setStatus] = useState("Semua");
  const [viewMode, setViewMode] = useState("table");

  const [showModal, setShowModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);

  const [form, setForm] = useState({
    title: "",
    isbn: "",
    author: "",
    category: "",
    categoryId: "",
    ddc: "",
    shelf: "",
    stock: "",
  });

  const loadBooks = async () => {
    try {
      const res = await BookService.search({ limit: 100 });
      if (res.data?.data) {
        const apiBooks = res.data.data.map((b) => ({
          id: b.id,
          title: b.title || "-",
          isbn: b.isbn || "-",
          author: b.authors?.map((a) => a.name).join(", ") || "-",
          category: b.category?.name || "Lainnya",
          categoryId: b.category?.id || "",
          ddc: b.category?.ddcCode || "-",
          shelf: "-",
          stock: b.copyCount || 0,
          available: b.copyCount || 0,
          status: b.copyCount > 0 ? "Tersedia" : "Tidak Tersedia",
        }));
        setBooks(apiBooks);
      }
    } catch (err) {
      console.error("Gagal memuat buku:", err);
    }
  };

  useEffect(() => {
    let mounted = true;

    const loadCategories = async () => {
      try {
        const res = await CategoryService.getAll({ limit: 100 });
        if (mounted && res.data?.data) {
          setCategories(res.data.data);
        }
      } catch (err) {
        console.error("Gagal memuat kategori:", err);
      }
    };

    loadCategories();
    loadBooks();

    return () => {
      mounted = false;
    };
  }, []);

  const filteredBooks = useMemo(() => {
    return books.filter((book) => {
      const searchMatch =
        book.title.toLowerCase().includes(search.toLowerCase()) ||
        book.isbn.toLowerCase().includes(search.toLowerCase()) ||
        book.author.toLowerCase().includes(search.toLowerCase());

      const categoryMatch =
        categoryFilter === "Semua" || book.category === categoryFilter;

      const statusMatch =
        status === "Semua" || book.status === status;

      return searchMatch && categoryMatch && statusMatch;
    });
  }, [books, search, categoryFilter, status]);

  const openAddModal = () => {
    setSelectedBook(null);
    setForm({
      title: "",
      isbn: "",
      author: "",
      category: "",
      categoryId: "",
      ddc: "",
      shelf: "",
      stock: "",
    });
    setShowModal(true);
  };

  const openEditModal = (book) => {
    setSelectedBook(book);
    setForm({
      title: book.title,
      isbn: book.isbn,
      author: book.author,
      category: book.category,
      categoryId: book.categoryId || "",
      ddc: book.ddc,
      shelf: book.shelf,
      stock: book.stock,
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
      alert("Judul, ISBN, dan penulis wajib diisi.");
      return;
    }

    try {
      if (selectedBook && typeof selectedBook.id === "string") {
        const updateData = {
          title: form.title,
          isbn: form.isbn,
        };

        if (form.categoryId) {
          updateData.categoryId = form.categoryId;
        }

        await BookService.update(selectedBook.id, updateData);
      } else {
        await BookService.create({
          title: form.title,
          isbn: form.isbn,
          authorName: form.author,
          categoryName: form.category,
          stock: Number(form.stock) || 0,
        });
      }
      
      await loadBooks();
      setShowModal(false);
    } catch (err) {
      alert(err?.response?.data?.error || "Terjadi kesalahan saat menyimpan buku.");
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Apakah kamu yakin ingin menghapus buku ini?"
    );
    if (!confirmDelete) return;

    try {
      if (typeof id === "string") {
        await BookService.delete(id);
      }
      setBooks((prev) => prev.filter((book) => book.id !== id));
      await loadBooks();
    } catch (err) {
      alert(err?.response?.data?.error || "Gagal menghapus buku.");
    }
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Header */}
      <PageHeader
        title="Koleksi Buku"
        subtitle="Kelola koleksi dan ketersediaan stok buku."
      >
        <button
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 sm:px-5 sm:py-3 text-xs sm:text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-95 w-full sm:w-auto"
        >
          <Plus size={16} />
          Tambah Buku
        </button>
      </PageHeader>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <Statcard title="Total Judul" value={books.length} color="blue" />
        <Statcard
          title="Total Stok"
          value={books.reduce((total, book) => total + Number(book.stock), 0)}
          color="blue"
        />
        <Statcard
          title="Tersedia"
          value={books.reduce((total, book) => total + Number(book.available), 0)}
          color="emerald"
        />
        <Statcard
          title="Dipinjam"
          value={books.reduce(
            (total, book) =>
              total + (Number(book.stock) - Number(book.available)),
            0
          )}
          color="blue"
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
              {categories.length > 0 ? (
                categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)
              ) : (
                <>
                  <option value="Informatika">Informatika</option>
                  <option value="Matematika">Matematika</option>
                  <option value="Bahasa">Bahasa</option>
                  <option value="Fisika">Fisika</option>
                  <option value="Sains">Sains</option>
                </>
              )}
            </select>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="flex-1 sm:w-40 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs sm:text-sm text-slate-700 outline-none focus:border-blue-500"
            >
              <option value="Semua">Semua Status</option>
              <option value="Tersedia">Tersedia</option>
              <option value="Dipinjam">Dipinjam</option>
              <option value="Rusak">Rusak</option>
              <option value="Hilang">Hilang</option>
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
        onChange={handleChange}
        onSubmit={handleSubmit}
      />
    </div>
  );
}

export default Buku;
