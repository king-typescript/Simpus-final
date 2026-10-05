import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpFromLine,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Plus,
} from "lucide-react";
import { PageHeader } from "../../components/common/PageHeader";
import { SearchInput } from "../../components/common/SearchInput";
import Statcard from "../../admin/components/Statcard";
import { BorrowModal } from "../../admin/components/sirkulasi/BorrowModal";
import { ReturnModal } from "../../admin/components/sirkulasi/ReturnModal";
import { CirculationTable } from "../../admin/components/sirkulasi/CirculationTable";
import { useFineSettings } from "../../admin/hooks/useFineSettings";
import { calculateFine, formatRupiah } from "../../utils/formatters";
import { LoanService, MemberService, BookService } from "../../services/api";
import { useNotification } from "../../context/NotificationContext";

const initialTransactions = [
  {
    id: 1,
    memberName: "Ahmad Fauzan",
    nis: "20260001",
    bookTitle: "Algoritma dan Pemrograman",
    isbn: "978-602-1234-01-1",
    borrowDate: "2026-09-20",
    dueDate: "2026-09-27",
    returnDate: null,
    status: "Dipinjam",
    extension: 0,
  },
  {
    id: 2,
    memberName: "Siti Rahma",
    nis: "20260002",
    bookTitle: "Bahasa Indonesia",
    isbn: "978-602-1234-03-5",
    borrowDate: "2026-09-15",
    dueDate: "2026-09-22",
    returnDate: null,
    status: "Terlambat",
    extension: 0,
  },
  {
    id: 3,
    memberName: "Budi Santoso",
    nis: "20260003",
    bookTitle: "Matematika Dasar",
    isbn: "978-602-1234-02-8",
    borrowDate: "2026-09-10",
    dueDate: "2026-09-17",
    returnDate: "2026-09-17",
    status: "Dikembalikan",
    extension: 0,
  },
  {
    id: 4,
    memberName: "Nur Aisyah",
    nis: "20260004",
    bookTitle: "Dasar-Dasar Fisika",
    isbn: "978-602-1234-04-2",
    borrowDate: "2026-09-23",
    dueDate: "2026-09-30",
    returnDate: null,
    status: "Dipinjam",
    extension: 0,
  },
];

const defaultMembers = [
  { nis: "20260001", name: "Ahmad Fauzan" },
  { nis: "20260002", name: "Siti Rahma" },
  { nis: "20260003", name: "Budi Santoso" },
  { nis: "20260004", name: "Nur Aisyah" },
  { nis: "20260005", name: "Rizky Maulana" },
];

const defaultBooks = [
  { id: 1, title: "Algoritma dan Pemrograman", isbn: "978-602-1234-01-1", available: 5 },
  { id: 2, title: "Matematika Dasar", isbn: "978-602-1234-02-8", available: 2 },
  { id: 3, title: "Bahasa Indonesia", isbn: "978-602-1234-03-5", available: 6 },
  { id: 4, title: "Dasar-Dasar Fisika", isbn: "978-602-1234-04-2", available: 2 },
];

function Sirkulasi() {
  const [transactions, setTransactions] = useState([]);
  const [members, setMembers] = useState([]);
  const [books, setBooks] = useState([]);
  const finePerDay = useFineSettings();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua");

  const { showSuccess, showError, showConfirm } = useNotification();

  const [showBorrowModal, setShowBorrowModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  const [borrowForm, setBorrowForm] = useState({
    memberNis: "",
    bookId: "",
    borrowDate: new Date().toISOString().split("T")[0],
  });

  const loadCirculationData = async () => {
    try {
      const [activeLoansRes, membersRes, booksRes] = await Promise.allSettled([
        LoanService.getActive(),
        MemberService.getAll({ limit: 100 }),
        BookService.search({ limit: 100 }),
      ]);

      if (membersRes.status === "fulfilled" && membersRes.value?.data?.data) {
        const apiMembers = membersRes.value.data.data.map((m) => ({
          id: m.id,
          nis: m.nis,
          name: m.name,
        }));
        setMembers(apiMembers);
      }

      if (booksRes.status === "fulfilled" && booksRes.value?.data?.data) {
        const apiBooks = booksRes.value.data.data.map((b) => ({
          id: b.id,
          title: b.title,
          isbn: b.isbn || "-",
          available: b.copyCount || 0,
        }));
        setBooks(apiBooks);
      }

      if (activeLoansRes.status === "fulfilled" && activeLoansRes.value?.data?.data) {
        const apiLoans = activeLoansRes.value.data.data.flatMap((l) =>
          (l.items || []).map((item) => ({
            id: item.id || l.id,
            loanId: l.id,
            copyId: item.copyId || item.copy?.id,
            memberName: l.student?.name || "-",
            nis: l.student?.nis || "-",
            bookTitle: item.copy?.book?.title || "Buku",
            isbn: item.copy?.barcode || "-",
            borrowDate: l.loanDate ? l.loanDate.split("T")[0] : "-",
            dueDate: l.dueDate ? l.dueDate.split("T")[0] : "-",
            returnDate: null,
            status: l.daysLate > 0 ? "Terlambat" : "Dipinjam",
            extension: 0,
          }))
        );
        setTransactions(apiLoans);
      }
    } catch (err) {
      console.error("Gagal memuat sirkulasi:", err);
    }
  };

  useEffect(() => {
    let mounted = true;
    if (mounted) loadCirculationData();
    return () => {
      mounted = false;
    };
  }, []);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const keyword = search.toLowerCase();
      const searchMatch =
        t.memberName.toLowerCase().includes(keyword) ||
        t.nis.toLowerCase().includes(keyword) ||
        t.bookTitle.toLowerCase().includes(keyword) ||
        t.isbn.toLowerCase().includes(keyword);

      const statusMatch =
        statusFilter === "Semua" || t.status === statusFilter;

      return searchMatch && statusMatch;
    });
  }, [transactions, search, statusFilter]);

  const activeTransactions = transactions.filter(
    (t) => t.status === "Dipinjam" || t.status === "Terlambat"
  );
  const returnedTransactions = transactions.filter(
    (t) => t.status === "Dikembalikan"
  );
  const lateTransactions = transactions.filter(
    (t) => t.status === "Terlambat"
  );

  const totalFine = lateTransactions.reduce(
    (total, t) => total + calculateFine(t.dueDate, finePerDay),
    0
  );

  const openBorrowModal = () => {
    setBorrowForm({
      memberNis: "",
      bookId: "",
      borrowDate: new Date().toISOString().split("T")[0],
    });
    setShowBorrowModal(true);
  };

  const handleBorrow = async (e) => {
    e.preventDefault();
    if (!borrowForm.memberNis || !borrowForm.bookId) {
      showError("Data Belum Lengkap", "Silakan pilih anggota dan buku yang akan dipinjam.");
      return;
    }

    const member = members.find((m) => m.nis === borrowForm.memberNis);
    const book = books.find((b) => String(b.id) === String(borrowForm.bookId));

    if (!member || !book) return;

    try {
      await LoanService.borrow({
        studentId: member.id,
        bookId: book.id,
        dueDate: borrowForm.borrowDate,
      });
      await loadCirculationData();
      setShowBorrowModal(false);
      showSuccess(
        "Peminjaman Berhasil",
        `Buku "${book.title}" berhasil dipinjamkan kepada ${member.name} (${member.nis}).`
      );
    } catch (err) {
      showError("Gagal Meminjam", err?.response?.data?.error || "Gagal memproses peminjaman.");
    }
  };

  const openReturnModal = (t) => {
    setSelectedTransaction(t);
    setShowReturnModal(true);
  };

  const [isReturning, setIsReturning] = useState(false);

  const handleReturn = async (returnData) => {
    if (!selectedTransaction) return;
    
    setIsReturning(true);
    try {
      await LoanService.returnBook({
        loanItemId: selectedTransaction.id,
        status: returnData.status,
        returnCondition: returnData.returnCondition,
        returnNote: returnData.returnNote,
      });
      await loadCirculationData();
      setShowReturnModal(false);
      const title = selectedTransaction.bookTitle;
      setSelectedTransaction(null);
      showSuccess("Pengembalian Berhasil", `Buku "${title}" telah berhasil dikembalikan ke perpustakaan.`);
    } catch (err) {
      showError("Gagal Pengembalian", err?.response?.data?.error || "Gagal memproses pengembalian buku.");
    } finally {
      setIsReturning(false);
    }
  };

  const handleExtend = (t) => {
    if (t.extension >= 1) {
      showError("Tidak Dapat Diperpanjang", "Transaksi ini sudah pernah diperpanjang.");
      return;
    }
    
    showConfirm({
      title: "Perpanjang Peminjaman?",
      message: `Perpanjang masa pinjam buku "${t.bookTitle}" untuk peminjam ${t.memberName}?`,
      confirmText: "Perpanjang",
      cancelText: "Batal",
      confirmVariant: "primary",
      onConfirm: async () => {
        try {
          await LoanService.extend({ loanId: t.loanId });
          await loadCirculationData();
          showSuccess("Berhasil Diperpanjang", `Masa pinjam buku "${t.bookTitle}" telah diperpanjang.`);
        } catch (err) {
          showError("Gagal Memperpanjang", err?.response?.data?.error || "Gagal memperpanjang masa peminjaman.");
        }
      },
    });
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Header */}
      <PageHeader
        title="Sirkulasi"
        subtitle="Peminjaman dan pengembalian buku."
      >
        <button
          onClick={openBorrowModal}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 sm:px-5 sm:py-3 text-xs sm:text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-95 w-full sm:w-auto"
        >
          <Plus size={16} />
          Peminjaman Baru
        </button>
      </PageHeader>

      {/* Statistics */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <Statcard
          title="Dipinjam"
          value={activeTransactions.length}
          icon={ArrowUpFromLine}
          color="blue"
        />
        <Statcard
          title="Terlambat"
          value={lateTransactions.length}
          icon={Clock3}
          color="red"
        />
        <Statcard
          title="Dikembalikan"
          value={returnedTransactions.length}
          icon={CheckCircle2}
          color="emerald"
        />
        <Statcard
          title="Est. Denda"
          value={formatRupiah(totalFine)}
          icon={CalendarDays}
          color="orange"
        />
      </div>

      {/* Filter */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3">
          <SearchInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari anggota, NIS, atau judul buku..."
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-44 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs sm:text-sm text-slate-700 outline-none focus:border-blue-500"
          >
            <option value="Semua">Semua Status</option>
            <option value="Dipinjam">Dipinjam</option>
            <option value="Terlambat">Terlambat</option>
            <option value="Dikembalikan">Dikembalikan</option>
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <CirculationTable
        transactions={filteredTransactions}
        finePerDay={finePerDay}
        onExtend={handleExtend}
        onOpenReturn={openReturnModal}
      />

      {/* Modal Peminjaman */}
      <BorrowModal
        open={showBorrowModal}
        onClose={() => setShowBorrowModal(false)}
        form={borrowForm}
        onChange={(e) =>
          setBorrowForm({ ...borrowForm, [e.target.name]: e.target.value })
        }
        onSubmit={handleBorrow}
        members={members}
        books={books}
      />

      {/* Modal Pengembalian */}
      <ReturnModal
        open={showReturnModal}
        onClose={() => setShowReturnModal(false)}
        transaction={selectedTransaction}
        finePerDay={finePerDay}
        onConfirm={handleReturn}
        submitting={isReturning}
      />
    </div>
  );
}

export default Sirkulasi;
