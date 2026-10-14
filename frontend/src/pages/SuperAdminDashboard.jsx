import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminSchoolService } from '../services/adminSchool.js';
import { useAuth } from '../lib/auth.jsx';

export default function SuperAdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('schools');
  const [schools, setSchools] = useState([]);
  const [logs, setLogs] = useState([]);
  
  // Form New School
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [libUser, setLibUser] = useState('');
  const [libName, setLibName] = useState('');
  const [password, setPassword] = useState('');
  const [createMsg, setCreateMsg] = useState('');
  const [createdInfo, setCreatedInfo] = useState(null);
  const [creating, setCreating] = useState(false);

  // Form Change Password
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdMsg, setPwdMsg] = useState({ text: '', type: '' });
  const [pwdLoading, setPwdLoading] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const loadSchools = async () => {
    try {
      setLoading(true);
      const res = await AdminSchoolService.getSchools();
      setSchools(res.data);
    } catch {
      setErrorMsg('Gagal memuat daftar sekolah');
    } finally {
      setLoading(false);
    }
  };

  const loadAuditLogs = async () => {
    try {
      setLoading(true);
      const res = await AdminSchoolService.getAuditLogs(50);
      setLogs(res.data);
    } catch {
      setErrorMsg('Gagal memuat audit log');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'schools') {
      loadSchools();
    } else if (activeTab === 'audit') {
      loadAuditLogs();
    }
  }, [activeTab]);

  const handleCreateSchool = async (e) => {
    e.preventDefault();
    setCreating(true);
    setCreateMsg('');
    setCreatedInfo(null);
    try {
      const res = await AdminSchoolService.createSchool({
        code: code.trim().toUpperCase(),
        name: name.trim(),
        librarianUsername: libUser.trim().toLowerCase(),
        librarianName: libName.trim(),
        password: password ? password.trim() : undefined,
      });
      setCreatedInfo(res.data);
      setCreateMsg('Sekolah baru berhasil didaftarkan dan diaktivasi!');
      setCode('');
      setName('');
      setLibUser('');
      setLibName('');
      setPassword('');
      loadSchools();
    } catch (err) {
      setCreateMsg(err.response?.data?.error || 'Gagal mendaftarkan sekolah.');
    } finally {
      setCreating(false);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      await AdminSchoolService.toggleStatus(id, !currentStatus);
      loadSchools();
    } catch {
      alert('Gagal mengubah status sekolah.');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPwdMsg({ text: 'Konfirmasi password baru tidak cocok.', type: 'error' });
      return;
    }
    setPwdLoading(true);
    setPwdMsg({ text: '', type: '' });
    try {
      await AdminSchoolService.changePassword({ currentPassword, newPassword });
      setPwdMsg({ text: 'Kata sandi berhasil diperbarui dengan aman.', type: 'success' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPwdMsg({
        text: err.response?.data?.error || 'Gagal mengubah password.',
        type: 'error',
      });
    } finally {
      setPwdLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    localStorage.removeItem('simpus_token');
    localStorage.removeItem('simpus_user');
    navigate('/superadmin/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-16">
      {/* Top Navbar */}
      <header className="bg-slate-900 text-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white text-lg">
              S
            </div>
            <div>
              <span className="font-semibold text-lg tracking-wide">SATAK Super Admin</span>
              <span className="text-xs text-slate-400 block -mt-1">SIMPUS Multi-Tenant Control Hub</span>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-slate-300 hidden sm:inline">
              User: <strong className="text-white">{user?.username || 'superadmin'}</strong>
            </span>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs border border-slate-700 font-medium transition"
            >
              Keluar
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 gap-2">
          <button
            onClick={() => setActiveTab('schools')}
            className={`pb-3 px-4 text-sm font-semibold transition border-b-2 ${
              activeTab === 'schools'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Sekolah Pelanggan ({schools.length})
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`pb-3 px-4 text-sm font-semibold transition border-b-2 ${
              activeTab === 'audit'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Audit Log & Keamanan
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`pb-3 px-4 text-sm font-semibold transition border-b-2 ${
              activeTab === 'security'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Keamanan Akun
          </button>
        </div>

        {errorMsg && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {errorMsg}
          </div>
        )}

        {/* Tab 1: Manajemen Sekolah */}
        {activeTab === 'schools' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form Pendaftaran Sekolah Baru */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">Aktivasi Sekolah Pelanggan</h2>
                <p className="text-xs text-slate-500">
                  Daftarkan instansi sekolah pengguna internet Satak untuk provisioning otomatis SIMPUS.
                </p>
              </div>

              {createMsg && (
                <div
                  className={`p-3 rounded-lg text-xs font-medium border ${
                    createdInfo
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-red-50 border-red-200 text-red-800'
                  }`}
                >
                  {createMsg}
                </div>
              )}

              {createdInfo && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-slate-700 space-y-1 font-mono">
                  <div><strong>Kode:</strong> {createdInfo.school?.code}</div>
                  <div><strong>Pustakawan:</strong> {createdInfo.librarian}</div>
                  <div><strong>Password Sementara:</strong> <span className="bg-blue-200 px-1 rounded select-all font-bold">{createdInfo.temporaryPassword}</span></div>
                  <div className="text-[10px] text-slate-500 pt-1 font-sans">
                    *Salin password ini dan berikan kepada pustakawan instansi terkait.
                  </div>
                </div>
              )}

              <form onSubmit={handleCreateSchool} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Kode Sekolah (Tenant ID)</label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Contoh: SMAN1SATAK"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono uppercase focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400">Harus unik, huruf kapital & angka.</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Lengkap Sekolah</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: SMA Negeri 1 Satak"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Username Pustakawan Awal</label>
                  <input
                    type="text"
                    required
                    value={libUser}
                    onChange={(e) => setLibUser(e.target.value)}
                    placeholder="Contoh: admin_sman1"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Petugas Pustakawan</label>
                  <input
                    type="text"
                    required
                    value={libName}
                    onChange={(e) => setLibName(e.target.value)}
                    placeholder="Contoh: Rina Suryani, S.Pd"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Password Akun Pustakawan</label>
                  <input
                    type="text"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Kosongkan jika ingin generate otomatis"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400">Opsional: isi manual (min. 8 karakter) atau biarkan kosong agar dibuatkan otomatis.</span>
                </div>

                <button
                  type="submit"
                  disabled={creating}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg text-xs shadow transition disabled:opacity-50 mt-2"
                >
                  {creating ? 'Memproses Provisioning...' : 'Provisioning Sekolah Baru'}
                </button>
              </form>
            </div>

            {/* List Sekolah Pelanggan */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
              <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Daftar Tenant Sekolah SIMPUS</h2>
                  <p className="text-xs text-slate-500">Isolasi data database terjamin via schoolId terikat.</p>
                </div>
                <button
                  onClick={loadSchools}
                  className="text-xs bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded font-medium text-slate-700 border border-slate-300 transition"
                >
                  Segarkan
                </button>
              </div>

              <div className="overflow-x-auto flex-1">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase">
                    <tr>
                      <th className="p-3 font-semibold">Kode Tenant</th>
                      <th className="p-3 font-semibold">Nama Sekolah</th>
                      <th className="p-3 font-semibold">Status Layanan</th>
                      <th className="p-3 font-semibold">Terdaftar Pada</th>
                      <th className="p-3 font-semibold text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {loading ? (
                      <tr>
                        <td colSpan={5} className="p-6 text-center text-slate-400">
                          Memuat data sekolah...
                        </td>
                      </tr>
                    ) : schools.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-6 text-center text-slate-400">
                          Belum ada sekolah yang terdaftar.
                        </td>
                      </tr>
                    ) : (
                      schools.map((s) => (
                        <tr key={s.id} className="hover:bg-slate-50 transition">
                          <td className="p-3 font-mono font-bold text-slate-900">{s.code}</td>
                          <td className="p-3 font-medium">{s.name}</td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase ${
                                s.isActive
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {s.isActive ? 'Aktif' : 'Non-Aktif'}
                            </span>
                          </td>
                          <td className="p-3 text-slate-400">
                            {new Date(s.createdAt).toLocaleDateString('id-ID')}
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => handleToggleStatus(s.id, s.isActive)}
                              className={`px-2.5 py-1 rounded text-[11px] font-semibold border transition ${
                                s.isActive
                                  ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
                                  : 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100'
                              }`}
                            >
                              {s.isActive ? 'Suspend' : 'Aktivasi'}
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Audit Logs */}
        {activeTab === 'audit' && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">Audit Trail & Log Keamanan</h2>
                <p className="text-xs text-slate-500">Merekam setiap aktivitas administratif dan insiden keamanan secara real-time.</p>
              </div>
              <button
                onClick={loadAuditLogs}
                className="text-xs bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded font-medium text-slate-700 border border-slate-300 transition"
              >
                Segarkan
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase">
                  <tr>
                    <th className="p-3 font-semibold">Waktu</th>
                    <th className="p-3 font-semibold">Aksi</th>
                    <th className="p-3 font-semibold">User</th>
                    <th className="p-3 font-semibold">Tenant</th>
                    <th className="p-3 font-semibold">Alamat IP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-slate-400">
                        Memuat riwayat audit...
                      </td>
                    </tr>
                  ) : logs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-slate-400">
                        Belum ada riwayat audit log tercatat.
                      </td>
                    </tr>
                  ) : (
                    logs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50 font-mono text-[11px]">
                        <td className="p-3 text-slate-400 whitespace-nowrap">
                          {new Date(log.createdAt).toLocaleString('id-ID')}
                        </td>
                        <td className="p-3 font-semibold">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] ${
                              log.action.includes('FAILED')
                                ? 'bg-red-100 text-red-700'
                                : log.action.includes('SUCCESS')
                                ? 'bg-green-100 text-green-700'
                                : 'bg-blue-100 text-blue-700'
                            }`}
                          >
                            {log.action}
                          </span>
                        </td>
                        <td className="p-3 text-slate-600 font-sans">
                          {log.user ? `${log.user.username} (${log.user.role})` : '-'}
                        </td>
                        <td className="p-3 font-sans">
                          {log.school ? log.school.code : 'SISTEM GLOBAL'}
                        </td>
                        <td className="p-3 text-slate-500">{log.ipAddress || '-'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Security & Password */}
        {activeTab === 'security' && (
          <div className="max-w-md bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Perbarui Kata Sandi Super Admin</h2>
              <p className="text-xs text-slate-500">Terapkan standar sandi tinggi (minimal 12 karakter alfanumerik).</p>
            </div>

            {pwdMsg.text && (
              <div
                className={`p-3 rounded-lg text-xs font-medium border ${
                  pwdMsg.type === 'success'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-red-50 border-red-200 text-red-800'
                }`}
              >
                {pwdMsg.text}
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Kata Sandi Saat Ini</label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Kata Sandi Baru</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimal 12 karakter"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Konfirmasi Kata Sandi Baru</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={pwdLoading}
                className="w-full bg-slate-900 hover:bg-black text-white font-medium py-2 rounded-lg text-xs shadow transition disabled:opacity-50 mt-2"
              >
                {pwdLoading ? 'Menyimpan...' : 'Perbarui Kata Sandi'}
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
