import { useEffect, useState } from "react";
import {
  BookOpen,
  Users,
  ArrowLeftRight,
  AlertCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "../../components/common/PageHeader";
import Statcard from "../../admin/components/Statcard";
import { WeeklyChart } from "../../admin/components/dashboard/WeeklyChart";
import { RecentActivity } from "../../admin/components/dashboard/RecentActivity";
import { QuickActions } from "../../admin/components/dashboard/QuickActions";
import { AuthService } from "../../services/api";

const initialStatistics = [
  {
    title: "Total Buku",
    value: "1.245",
    description: "+12 buku bulan ini",
    icon: BookOpen,
    color: "blue",
    path: "/admin/buku",
  },
  {
    title: "Total Anggota",
    value: "328",
    description: "+24 anggota baru",
    icon: Users,
    color: "indigo",
    path: "/admin/anggota",
  },
  {
    title: "Buku Dipinjam",
    value: "87",
    description: "Aktif hari ini",
    icon: ArrowLeftRight,
    color: "emerald",
    path: "/admin/sirkulasi",
  },
  {
    title: "Terlambat",
    value: "12",
    description: "Perlu ditindaklanjuti",
    icon: AlertCircle,
    color: "red",
    path: "/admin/denda",
  },
];

const barData = [
  { day: "Sen", value: 45 },
  { day: "Sel", value: 65 },
  { day: "Rab", value: 50 },
  { day: "Kam", value: 80 },
  { day: "Jum", value: 60 },
  { day: "Sab", value: 90 },
  { day: "Min", value: 72 },
];

const initialActivities = [
  {
    name: "Ahmad Fauzan",
    action: "meminjam",
    detail: "Algoritma Pemrograman",
    time: "5m lalu",
    type: "borrow",
  },
  {
    name: "Siti Rahma",
    action: "mengembalikan",
    detail: "Matematika Dasar",
    time: "18m lalu",
    type: "return",
  },
  {
    name: "Budi Santoso",
    action: "membayar denda",
    detail: "Rp5.000",
    time: "32m lalu",
    type: "fine",
  },
  {
    name: "Nur Aisyah",
    action: "meminjam",
    detail: "Bahasa Indonesia",
    time: "1j lalu",
    type: "borrow",
  },
  {
    name: "Rizky Maulana",
    action: "mengembalikan",
    detail: "Dasar-Dasar Fisika",
    time: "2j lalu",
    type: "return",
  },
];

function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(initialStatistics);
  const [activities, setActivities] = useState(initialActivities);

  useEffect(() => {
    let mounted = true;
    const fetchDashboardData = async () => {
      try {
        const res = await AuthService.me();
        if (mounted && res.data?.data) {
          const d = res.data.data;
          setStats([
            {
              title: "Total Buku",
              value: String(d.books?.active ?? d.books?.total ?? "0"),
              description: "Katalog aktif",
              icon: BookOpen,
              color: "blue",
              path: "/admin/buku",
            },
            {
              title: "Total Anggota",
              value: String(d.members?.active ?? "0"),
              description: "Anggota aktif",
              icon: Users,
              color: "indigo",
              path: "/admin/anggota",
            },
            {
              title: "Buku Dipinjam",
              value: String(d.loans?.active ?? "0"),
              description: "Aktif saat ini",
              icon: ArrowLeftRight,
              color: "emerald",
              path: "/admin/sirkulasi",
            },
            {
              title: "Terlambat",
              value: String(d.loans?.overdue ?? "0"),
              description: "Perlu ditindaklanjuti",
              icon: AlertCircle,
              color: "red",
              path: "/admin/denda",
            },
          ]);

          if (d.recentLoans && d.recentLoans.length > 0) {
            const apiActivities = d.recentLoans.slice(0, 5).map((l) => ({
              name: l.student?.name || "Anggota",
              action: l.returnedAt ? "mengembalikan" : "meminjam",
              detail: l.items?.[0]?.copy?.book?.title || "Buku Perpustakaan",
              time: l.returnedAt || l.loanDate ? new Date(l.returnedAt || l.loanDate).toLocaleDateString("id-ID") : "Baru saja",
              type: l.returnedAt ? "return" : "borrow",
            }));
            setActivities(apiActivities);
          }
        }
      } catch (err) {
        console.error("Gagal memuat dashboard API:", err);
      }
    };

    fetchDashboardData();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="space-y-5 sm:space-y-6 lg:space-y-8">
      {/* Heading */}
      <PageHeader
        title="Dashboard"
        subtitle="Kelola aktivitas perpustakaan sekolah."
      >
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-xs text-xs font-medium text-slate-600 w-fit">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          Sistem Online
        </div>
      </PageHeader>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {stats.map((item) => (
          <Statcard
            key={item.title}
            title={item.title}
            value={item.value}
            description={item.description}
            icon={item.icon}
            color={item.color}
            onClick={() => navigate(item.path)}
          />
        ))}
      </div>

      {/* Charts & Activity */}
      <div className="grid gap-5 sm:gap-6 xl:grid-cols-3">
        <WeeklyChart data={barData} />
        <RecentActivity activities={activities} />
      </div>

      {/* Quick Actions */}
      <QuickActions />
    </div>
  );
}

export default Dashboard;
