import { useEffect, useMemo, useState } from "react";
import {
  Wallet,
  CheckCircle2,
  Clock3,
  Banknote,
} from "lucide-react";
import { PageHeader } from "../../components/common/PageHeader";
import { SearchInput } from "../../components/common/SearchInput";
import Statcard from "../../admin/components/Statcard";
import { FineTable } from "../../admin/components/denda/FineTable";
import { PaymentModal } from "../../admin/components/denda/PaymentModal";
import { useFineSettings } from "../../admin/hooks/useFineSettings";
import { calculateFine, formatRupiah } from "../../utils/formatters";
import { FineService } from "../../services/api";

const initialFines = [
  {
    id: 1,
    member: "Siti Rahma",
    nis: "20260002",
    book: "Bahasa Indonesia",
    dueDate: "2026-09-22",
    returnDate: "-",
    lateDays: 4,
    fine: 4000,
    status: "Belum Dibayar",
  },
  {
    id: 2,
    member: "Ahmad Fauzan",
    nis: "20260001",
    book: "Algoritma dan Pemrograman",
    dueDate: "2026-09-08",
    returnDate: "2026-09-12",
    lateDays: 4,
    fine: 4000,
    status: "Sudah Dibayar",
  },
  {
    id: 3,
    member: "Budi Santoso",
    nis: "20260003",
    book: "Matematika Dasar",
    dueDate: "2026-08-27",
    returnDate: "2026-09-01",
    lateDays: 5,
    fine: 5000,
    status: "Belum Dibayar",
  },
  {
    id: 4,
    member: "Nur Aisyah",
    nis: "20260004",
    book: "Dasar-Dasar Fisika",
    dueDate: "2026-08-17",
    returnDate: "2026-08-20",
    lateDays: 3,
    fine: 3000,
    status: "Sudah Dibayar",
  },
];

export default function Denda() {
  const [fines, setFines] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua Status");

  const [selectedFine, setSelectedFine] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("Tunai");

  const finePerDay = useFineSettings();

  const loadFines = async () => {
    try {
      const res = await FineService.getAll({ limit: 100 });
      if (res.data?.data) {
        const apiFines = res.data.data.map((f) => ({
          id: f.id,
          member: f.loanItem?.loan?.student?.name || "Siswa",
          nis: f.loanItem?.loan?.student?.nis || "-",
          book: f.loanItem?.copy?.book?.title || "Buku",
          dueDate: f.loanItem?.loan?.dueDate ? f.loanItem.loan.dueDate.split("T")[0] : "-",
          returnDate: f.loanItem?.returnedAt ? f.loanItem.returnedAt.split("T")[0] : "-",
          lateDays: f.daysLate || 0,
          fine: Number(f.amount) || 0,
          status: f.status === "LUNAS" ? "Sudah Dibayar" : "Belum Dibayar",
        }));
        setFines(apiFines);
      }
    } catch (err) {
      console.error("Gagal memuat denda dari API:", err);
    }
  };

  useEffect(() => {
    let mounted = true;
    if (mounted) loadFines();
    return () => {
      mounted = false;
    };
  }, []);

  const stats = useMemo(() => {
    const total = fines.reduce(
      (sum, item) => sum + calculateFine(item.lateDays, finePerDay),
      0
    );

    const unpaid = fines
      .filter((item) => item.status === "Belum Dibayar")
      .reduce(
        (sum, item) => sum + calculateFine(item.lateDays, finePerDay),
        0
      );

    const paid = fines
      .filter((item) => item.status === "Sudah Dibayar")
      .reduce(
        (sum, item) => sum + calculateFine(item.lateDays, finePerDay),
        0
      );

    return { total, unpaid, paid, count: fines.length };
  }, [fines, finePerDay]);

  const filteredFines = useMemo(() => {
    return fines.filter((item) => {
      const keyword = search.toLowerCase();
      const matchesSearch =
        item.member.toLowerCase().includes(keyword) ||
        item.nis.toLowerCase().includes(keyword) ||
        item.book.toLowerCase().includes(keyword);

      const matchesStatus =
        statusFilter === "Semua Status" || item.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [fines, search, statusFilter]);

  const openPaymentModal = (fine) => {
    setSelectedFine(fine);
    setPaymentMethod("Tunai");
    setShowPaymentModal(true);
  };

  const closePaymentModal = () => {
    setSelectedFine(null);
    setShowPaymentModal(false);
  };

  const confirmPayment = async () => {
    if (!selectedFine) return;
    try {
      await FineService.pay(selectedFine.id, {
        paymentMethod: "CASH",
      });
      await loadFines();
    } catch (err) {
      alert(err?.response?.data?.error || "Gagal memproses pembayaran denda.");
    }
    closePaymentModal();
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Header */}
      <PageHeader
        title="Denda"
        subtitle="Kelola dan pantau pembayaran denda keterlambatan buku."
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <Statcard
          title="Total Denda"
          value={formatRupiah(stats.total)}
          icon={Wallet}
          color="blue"
        />
        <Statcard
          title="Belum Dibayar"
          value={formatRupiah(stats.unpaid)}
          icon={Clock3}
          color="red"
        />
        <Statcard
          title="Sudah Dibayar"
          value={formatRupiah(stats.paid)}
          icon={CheckCircle2}
          color="emerald"
        />
        <Statcard
          title="Tarif per Hari"
          value={formatRupiah(finePerDay)}
          icon={Banknote}
          color="purple"
        />
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row">
          <SearchInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama, NIS, atau judul buku..."
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-48 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs sm:text-sm text-slate-700 outline-none focus:border-blue-500"
          >
            <option value="Semua Status">Semua Status</option>
            <option value="Belum Dibayar">Belum Dibayar</option>
            <option value="Sudah Dibayar">Sudah Dibayar</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <FineTable
        fines={filteredFines}
        finePerDay={finePerDay}
        onOpenPayment={openPaymentModal}
      />

      {/* Payment Modal */}
      <PaymentModal
        open={showPaymentModal}
        onClose={closePaymentModal}
        fine={selectedFine}
        finePerDay={finePerDay}
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
        onConfirm={confirmPayment}
      />
    </div>
  );
}
