import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { PageHeader } from "../../components/common/PageHeader";
import { SearchInput } from "../../components/common/SearchInput";
import { ViewToggle } from "../../components/common/ViewToggle";
import Statcard from "../../admin/components/Statcard";
import { MemberModal } from "../../admin/components/anggota/MemberModal";
import { MemberCardModal } from "../../admin/components/anggota/MemberCardModal";
import { MemberTable } from "../../admin/components/anggota/MemberTable";
import { MemberGridCard } from "../../admin/components/anggota/MemberGridCard";
import { MemberService } from "../../services/api";
import { useNotification } from "../../context/NotificationContext";

const initialMembers = [
  {
    id: 1,
    nis: "20260001",
    name: "Ahmad Fauzan",
    className: "XII IPA 1",
    phone: "081234567890",
    status: "Aktif",
    joined: "10 Jan 2026",
  },
  {
    id: 2,
    nis: "20260002",
    name: "Siti Rahma",
    className: "XI IPA 2",
    phone: "081234567891",
    status: "Aktif",
    joined: "11 Jan 2026",
  },
  {
    id: 3,
    nis: "20260003",
    name: "Budi Santoso",
    className: "X IPS 1",
    phone: "081234567892",
    status: "Aktif",
    joined: "12 Jan 2026",
  },
  {
    id: 4,
    nis: "20260004",
    name: "Nur Aisyah",
    className: "XII IPS 2",
    phone: "081234567893",
    status: "Aktif",
    joined: "13 Jan 2026",
  },
  {
    id: 5,
    nis: "20260005",
    name: "Rizky Maulana",
    className: "XI IPA 1",
    phone: "081234567894",
    status: "Nonaktif",
    joined: "14 Jan 2026",
  },
];

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

function Anggota() {
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("Semua");
  const [statusFilter, setStatusFilter] = useState("Semua");
  const [viewMode, setViewMode] = useState("table");

  const { showSuccess, showError, showConfirm } = useNotification();

  const [showModal, setShowModal] = useState(false);
  const [showCardModal, setShowCardModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  const [form, setForm] = useState({
    nis: "",
    name: "",
    className: "",
    phone: "",
    status: "Aktif",
    password: "",
  });

  const [submitting, setSubmitting] = useState(false);

  const fetchMembers = async () => {
    try {
      const res = await MemberService.getAll({ limit: 100 });
      if (res.data?.data) {
        const apiMembers = res.data.data.map((m) => ({
          id: m.id,
          nis: m.nis,
          name: m.name,
          className: m.className,
          phone: m.phone || "-",
          status: m.isActive ? "Aktif" : "Nonaktif",
          joined: m.joinedAt
            ? new Date(m.joinedAt).toLocaleDateString("id-ID", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })
            : "-",
        }));
        setMembers(apiMembers);
      }
    } catch (err) {
      console.error("Gagal memuat anggota dari backend:", err);
    }
  };

  useEffect(() => {
    let mounted = true;
    const loadMembers = async () => {
      try {
        const res = await MemberService.getAll({ limit: 100 });
        if (mounted && res.data?.data) {
          const apiMembers = res.data.data.map(m => ({
            id: m.id,
            nis: m.nis,
            name: m.name,
            className: m.className,
            phone: m.phone || "-",
            status: m.isActive ? "Aktif" : "Nonaktif",
            joined: m.joinedAt ? new Date(m.joinedAt).toLocaleDateString("id-ID", {
              day: "2-digit",
              month: "short",
              year: "numeric"
            }) : "-",
          }));

          setMembers(apiMembers);
        }
      } catch (err) {
        console.error("Gagal memuat anggota dari backend:", err);
      }
    };

    loadMembers();
    return () => { mounted = false; };
  }, []);

  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      const keyword = search.toLowerCase();
      const searchMatch =
        member.name.toLowerCase().includes(keyword) ||
        member.nis.toLowerCase().includes(keyword);

      const classMatch =
        classFilter === "Semua" || member.className === classFilter;

      const statusMatch =
        statusFilter === "Semua" || member.status === statusFilter;

      return searchMatch && classMatch && statusMatch;
    });
  }, [members, search, classFilter, statusFilter]);

  const openAddModal = () => {
    setSelectedMember(null);
    setForm({
      nis: "",
      name: "",
      className: "",
      phone: "",
      status: "Aktif",
      password: "",
    });
    setShowModal(true);
  };

  const openEditModal = (member) => {
    setSelectedMember(member);
    setForm({
      nis: member.nis,
      name: member.name,
      className: member.className,
      phone: member.phone,
      status: member.status,
      password: "",
    });
    setShowModal(true);
  };

  const openCard = (member) => {
    setSelectedMember(member);
    setShowCardModal(true);
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
    if (!form.nis || !form.name || !form.className) {
      showError("Input Tidak Lengkap", "NIS, nama, dan kelas wajib diisi.");
      return;
    }

    if (!selectedMember && form.password && form.password.length < 12) {
      showError("Password Terlalu Pendek", "Password minimal harus 12 karakter.");
      return;
    }

    setSubmitting(true);
    try {
      const isEditing = Boolean(selectedMember && typeof selectedMember.id === "string");
      if (isEditing) {
        await MemberService.update(selectedMember.id, {
          nis: form.nis,
          name: form.name,
          className: form.className,
          phone: form.phone || null,
          isActive: form.status === "Aktif",
        });
      } else {
        await MemberService.create({
          username: form.nis,
          password: form.password ? form.password : "passwordSiswa123",
          nis: form.nis,
          name: form.name,
          className: form.className,
          libraryCardNumber: `KARTU-${form.nis}`,
          phone: form.phone || null,
        });
      }
      
      // Muat ulang data setelah sukses
      await fetchMembers();
      setShowModal(false);
      showSuccess(
        isEditing ? "Anggota Berhasil Diperbarui" : "Anggota Berhasil Ditambahkan",
        isEditing
          ? `Data anggota ${form.name} berhasil diperbarui di database.`
          : `Anggota baru ${form.name} (NIS: ${form.nis}) berhasil didaftarkan.`
      );
    } catch (err) {
      if (err?.response?.status === 401 || err?.response?.status === 403) {
        showError("Akses Ditolak", "Sesi autentikasi telah habis atau tidak memiliki hak akses. Silakan login kembali.");
      } else {
        showError("Gagal Menyimpan", err?.response?.data?.error || "Gagal menyimpan data anggota.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (id) => {
    const memberTarget = members.find((m) => m.id === id);
    const memberName = memberTarget ? memberTarget.name : "anggota ini";

    showConfirm({
      title: "Nonaktifkan Anggota?",
      message: `Apakah Anda yakin ingin menonaktifkan ${memberName}? Akun tidak akan dapat meminjam buku sebelum diaktifkan kembali.`,
      confirmText: "Ya, Nonaktifkan",
      cancelText: "Batal",
      confirmVariant: "danger",
      onConfirm: async () => {
        try {
          if (typeof id === "string") {
            await MemberService.delete(id);
          }
          await fetchMembers();
          showSuccess("Berhasil", `Anggota ${memberName} telah dinonaktifkan.`);
        } catch (err) {
          showError("Gagal", err?.response?.data?.error || "Gagal menonaktifkan anggota.");
        }
      },
    });
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Header */}
      <PageHeader
        title="Anggota Perpustakaan"
        subtitle="Kelola data siswa yang terdaftar di perpustakaan."
      >
        <button
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 sm:px-5 sm:py-3 text-xs sm:text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-95 w-full sm:w-auto"
        >
          <Plus size={16} />
          Tambah Anggota
        </button>
      </PageHeader>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <Statcard title="Total Anggota" value={members.length} color="blue" />
        <Statcard
          title="Aktif"
          value={members.filter((m) => m.status === "Aktif").length}
          color="emerald"
        />
        <Statcard
          title="Nonaktif"
          value={members.filter((m) => m.status === "Nonaktif").length}
          color="blue"
        />
      </div>

      {/* Filter and View mode */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <SearchInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari NIS atau nama siswa..."
          />

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="flex-1 sm:w-44 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs sm:text-sm text-slate-700 outline-none focus:border-blue-500"
            >
              <option value="Semua">Semua Kelas</option>
              {classOptions.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex-1 sm:w-36 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs sm:text-sm text-slate-700 outline-none focus:border-blue-500"
            >
              <option value="Semua">Semua Status</option>
              <option value="Aktif">Aktif</option>
              <option value="Nonaktif">Nonaktif</option>
            </select>

            <ViewToggle value={viewMode} onChange={setViewMode} />
          </div>
        </div>
      </div>

      {/* Grid or Table View */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMembers.map((member) => (
            <MemberGridCard
              key={member.id}
              member={member}
              onEdit={openEditModal}
              onDelete={handleDelete}
              onOpenCard={openCard}
            />
          ))}
        </div>
      ) : (
        <MemberTable
          members={filteredMembers}
          onEdit={openEditModal}
          onDelete={handleDelete}
          onOpenCard={openCard}
        />
      )}

      {/* Modal Add/Edit Member */}
      <MemberModal
        open={showModal}
        onClose={() => setShowModal(false)}
        selectedMember={selectedMember}
        form={form}
        onChange={handleChange}
        onSubmit={handleSubmit}
        submitting={submitting}
      />

      {/* Member Card Preview Modal */}
      <MemberCardModal
        open={showCardModal}
        onClose={() => setShowCardModal(false)}
        member={selectedMember}
      />
    </div>
  );
}

export default Anggota;
