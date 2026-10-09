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
import { DashboardService } from "../../services/api";

const barData = [
  { day: "Sen", value: 45 },
  { day: "Sel", value: 65 },
  { day: "Rab", value: 50 },
  { day: "Kam", value: 80 },
  { day: "Jum", value: 60 },
  { day: "Sab", value: 90 },
  { day: "Min", value: 72 },
];

function formatStats(d) {
  return [
    {
      title: "Total Buku",
      value: d ? String(d.books?.active ?? d.books?.total ?? "0") : "-",
      description: "Katalog aktif",
      icon: BookOpen,
      color: "blue",
      path: "/admin/buku",
    },
    {
      title: "Total Anggota",
      value: d ? String(d.members?.active ?? "0") : "-",
      description: "Anggota aktif",
      icon: Users,
      color: "indigo",
      path: "/admin/anggota",
    },
    {
      title: "Buku Dipinjam",
      value: d ? String(d.loans?.active ?? "0") : "-",
      description: "Aktif saat ini",
      icon: ArrowLeftRight,
      color: "emerald",
      path: "/admin/sirkulasi",
    },
    {
      title: "Terlambat",
      value: d ? String(d.loans?.overdue ?? "0") : "-",
      description: "Perlu ditindaklanjuti",
      icon: AlertCircle,
      color: "red",
      path: "/admin/denda",
    },
  ];
}

function formatActivities(d) {
  if (!d?.recentLoans || d.recentLoans.length === 0) return [];
  return d.recentLoans.slice(0, 5).map((l) => ({
    name: l.student?.name || "Anggota",
    action: l.returnedAt ? "mengembalikan" : "meminjam",
    detail: l.items?.[0]?.copy?.book?.title || "Buku Perpustakaan",
    time: l.returnedAt || l.loanDate ? new Date(l.returnedAt || l.loanDate).toLocaleDateString("id-ID") : "Baru saja",
    type: l.returnedAt ? "return" : "borrow",
  }));
}

function Dashboard() {
  const navigate = useNavigate();

  // Ambil data cache terlebih dahulu jika ada (Instant Render 0 ms)
  const cachedResponse = DashboardService.getCached();
  const cachedData = cachedResponse?.data?.data;

  const [stats, setStats] = useState(() => formatStats(cachedData));
  const [activities, setActivities] = useState(() => formatActivities(cachedData));
  const [loading, setLoading] = useState(() => !cachedData);

  useEffect(() => {
    let mounted = true;

    const fetchDashboardData = async () => {
      try {
        // Ambil data (menggunakan cache atau revalidasi background)
        const res = await DashboardService.get(!cachedData);
        if (mounted && res.data?.data) {
          const d = res.data.data;
          setStats(formatStats(d));
          setActivities(formatActivities(d));
          setLoading(false);
        }
      } catch (err) {
        console.error("Gagal memuat dashboard API:", err);
        if (mounted) setLoading(false);
      }
    };

    fetchDashboardData();
    return () => {
      mounted = false;
    };
  }, [cachedData]);

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
            loading={loading && item.value === "-"}
            onClick={() => navigate(item.path)}
          />
        ))}
      </div>

      {/* Charts & Activity */}
      <div className="grid gap-5 sm:gap-6 xl:grid-cols-3">
        <WeeklyChart data={barData} />
        <RecentActivity activities={activities} loading={loading && activities.length === 0} />
      </div>

      {/* Quick Actions */}
      <QuickActions />
    </div>
  );
}

export default Dashboard;
