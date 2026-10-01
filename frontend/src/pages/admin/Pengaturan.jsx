import { useEffect, useState } from "react";
import {
  User,
  BookOpen,
  Wallet,
  Bell,
  Shield,
  Save,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

// ======================================================
// DATA DEFAULT
// ======================================================

const defaultProfile = {
  name: "Pustakawan",
  email: "pustakawan@perpustakaan.id",
  phone: "081234567890",
};

const defaultLoanSettings = {
  maxBooks: 3,
  loanDays: 7,
  maxExtension: 1,
};

const defaultFineSettings = {
  finePerDay: 1000,
};

const defaultNotifications = {
  loanReminder: true,
  lateReminder: true,
  paymentNotification: true,
};

// ======================================================
// COMPONENT
// ======================================================

export default function Pengaturan() {
  const [activeTab, setActiveTab] = useState("profil");

  const [saved, setSaved] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // ====================================================
  // PROFIL
  // ====================================================

  const [profile, setProfile] = useState(defaultProfile);

  // ====================================================
  // PEMINJAMAN
  // ====================================================

  const [loanSettings, setLoanSettings] =
    useState(defaultLoanSettings);

  // ====================================================
  // DENDA
  // ====================================================

  const [fineSettings, setFineSettings] =
    useState(defaultFineSettings);

  // ====================================================
  // NOTIFIKASI
  // ====================================================

  const [notifications, setNotifications] =
    useState(defaultNotifications);

  // ====================================================
  // KEAMANAN
  // ====================================================

  const [security, setSecurity] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // ====================================================
  // LOAD SEMUA DATA DARI LOCAL STORAGE
  // ====================================================

  useEffect(() => {
    try {
      // -------------------------------
      // PROFILE
      // -------------------------------

      const savedProfile = localStorage.getItem(
        "perpustakaan_profile"
      );

      if (savedProfile) {
        const profileData = JSON.parse(savedProfile);

        setProfile({
          ...defaultProfile,
          ...profileData,
        });
      }

      // -------------------------------
      // LOAN
      // -------------------------------

      const savedLoan = localStorage.getItem(
        "perpustakaan_loan_settings"
      );

      if (savedLoan) {
        const loanData = JSON.parse(savedLoan);

        setLoanSettings({
          ...defaultLoanSettings,
          ...loanData,
        });
      }

      // -------------------------------
      // FINE
      // -------------------------------

      const savedFine = localStorage.getItem(
        "perpustakaan_fine_settings"
      );

      if (savedFine) {
        const fineData = JSON.parse(savedFine);

        setFineSettings({
          ...defaultFineSettings,
          ...fineData,
        });
      }

      // -------------------------------
      // NOTIFICATIONS
      // -------------------------------

      const savedNotifications = localStorage.getItem(
        "perpustakaan_notifications"
      );

      if (savedNotifications) {
        const notificationData =
          JSON.parse(savedNotifications);

        setNotifications({
          ...defaultNotifications,
          ...notificationData,
        });
      }
    } catch (error) {
      console.error(
        "Gagal membaca pengaturan:",
        error
      );
    }
  }, []);

  // ====================================================
  // SIMPAN PERUBAHAN
  // ====================================================

  const handleSave = () => {
    setSaved(false);
    setErrorMessage("");

    try {
      // ==================================================
      // VALIDASI KEAMANAN
      // ==================================================

      if (
        activeTab === "keamanan" &&
        (
          security.oldPassword ||
          security.newPassword ||
          security.confirmPassword
        )
      ) {
        if (!security.oldPassword) {
          setErrorMessage(
            "Password lama harus diisi."
          );
          return;
        }

        if (!security.newPassword) {
          setErrorMessage(
            "Password baru harus diisi."
          );
          return;
        }

        if (security.newPassword.length < 6) {
          setErrorMessage(
            "Password baru minimal 6 karakter."
          );
          return;
        }

        if (
          security.newPassword !==
          security.confirmPassword
        ) {
          setErrorMessage(
            "Konfirmasi password tidak sama."
          );
          return;
        }
      }

      // ==================================================
      // DATA PROFIL
      // ==================================================

      const profileData = {
        name: profile.name.trim(),
        email: profile.email.trim(),
        phone: profile.phone.trim(),
      };

      // ==================================================
      // DATA PEMINJAMAN
      // ==================================================

      const loanData = {
        maxBooks: Number(loanSettings.maxBooks),
        loanDays: Number(loanSettings.loanDays),
        maxExtension: Number(
          loanSettings.maxExtension
        ),
      };

      // ==================================================
      // DATA DENDA
      // ==================================================

      const fineData = {
        finePerDay: Number(
          fineSettings.finePerDay
        ),
      };

      // ==================================================
      // DATA NOTIFIKASI
      // ==================================================

      const notificationData = {
        loanReminder:
          notifications.loanReminder,

        lateReminder:
          notifications.lateReminder,

        paymentNotification:
          notifications.paymentNotification,
      };

      // ==================================================
      // SIMPAN KE LOCAL STORAGE
      // ==================================================

      localStorage.setItem(
        "perpustakaan_profile",
        JSON.stringify(profileData)
      );

      localStorage.setItem(
        "perpustakaan_loan_settings",
        JSON.stringify(loanData)
      );

      localStorage.setItem(
        "perpustakaan_fine_settings",
        JSON.stringify(fineData)
      );

      localStorage.setItem(
        "perpustakaan_notifications",
        JSON.stringify(notificationData)
      );

      // ==================================================
      // UPDATE STATE
      // ==================================================

      setProfile(profileData);
      setLoanSettings(loanData);
      setFineSettings(fineData);
      setNotifications(notificationData);

      // ==================================================
      // BERITAHU HEADER & SIDEBAR
      // ==================================================

      window.dispatchEvent(
        new Event("profileUpdated")
      );

      // ==================================================
      // BERSIHKAN PASSWORD DARI INPUT
      // ==================================================

      if (activeTab === "keamanan") {
        setSecurity({
          oldPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      }

      // ==================================================
      // NOTIFIKASI BERHASIL
      // ==================================================

      setSaved(true);

      setTimeout(() => {
        setSaved(false);
      }, 3000);

      console.log(
        "Pengaturan berhasil disimpan:",
        {
          profileData,
          loanData,
          fineData,
          notificationData,
        }
      );
    } catch (error) {
      console.error(
        "Gagal menyimpan pengaturan:",
        error
      );

      setErrorMessage(
        "Terjadi kesalahan saat menyimpan pengaturan."
      );
    }
  };

  // ====================================================
  // TAB
  // ====================================================

  const tabs = [
    {
      id: "profil",
      title: "Profil",
      icon: User,
    },
    {
      id: "peminjaman",
      title: "Peminjaman",
      icon: BookOpen,
    },
    {
      id: "denda",
      title: "Denda",
      icon: Wallet,
    },
    {
      id: "notifikasi",
      title: "Notifikasi",
      icon: Bell,
    },
    {
      id: "keamanan",
      title: "Keamanan",
      icon: Shield,
    },
  ];

  // ====================================================
  // RETURN
  // ====================================================

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* HEADER */}
      <div className="mb-2 sm:mb-4">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
          Pengaturan
        </h1>
        <p className="mt-0.5 text-xs sm:text-sm text-slate-500">
          Kelola pengaturan sistem perpustakaan.
        </p>
      </div>

        {/* ==================================================
            NOTIFIKASI BERHASIL
        ================================================== */}

        {saved && (
          <div className="mb-5 flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-green-700 animate-page-enter">
            <CheckCircle size={20} />
            <div>
              <p className="font-semibold text-sm">Berhasil disimpan</p>
              <p className="text-xs">Pengaturan telah disimpan.</p>
            </div>
          </div>
        )}

        {/* ==================================================
            NOTIFIKASI ERROR
        ================================================== */}

        {errorMessage && (
          <div className="mb-5 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 animate-page-enter">
            <AlertCircle size={20} />
            <div>
              <p className="font-semibold text-sm">Gagal menyimpan</p>
              <p className="text-xs">{errorMessage}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[240px_1fr]">

          {/* ==================================================
              SIDEBAR TAB (Horizontal on Mobile, Vertical on Desktop)
          ================================================== */}

          <div className="h-fit rounded-2xl border border-slate-200/80 bg-white p-2.5 sm:p-3 shadow-sm flex lg:flex-col overflow-x-auto custom-scrollbar gap-1.5 sm:gap-1">

            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.id);
                    setSaved(false);
                    setErrorMessage("");
                  }}
                  className={`flex shrink-0 lg:w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 sm:py-3 text-left text-xs sm:text-sm font-medium transition active:scale-95 ${
                    active
                      ? "bg-slate-900 text-white shadow-md"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <Icon size={16} className="sm:size-[18px]" />
                  {tab.title}
                </button>
              );
            })}
          </div>

          {/* ==================================================
              CONTENT
          ================================================== */}

          <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden animate-page-enter" key={activeTab}>
            <div className="p-4 sm:p-5 md:p-7">

              {/* ==================================================
                  PROFIL
              ================================================== */}

              {activeTab === "profil" && (
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Profil Pustakawan
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Informasi akun pustakawan
                  </p>

                  <div className="mt-6 grid gap-5 md:grid-cols-2">

                    {/* Nama */}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Nama
                      </label>

                      <input
                        type="text"
                        value={profile.name}
                        onChange={(e) =>
                          setProfile((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Email
                      </label>

                      <input
                        type="email"
                        value={profile.email}
                        onChange={(e) =>
                          setProfile((prev) => ({
                            ...prev,
                            email: e.target.value,
                          }))
                        }
                        className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                      />
                    </div>

                    {/* Telepon */}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Nomor Telepon
                      </label>

                      <input
                        type="text"
                        value={profile.phone}
                        onChange={(e) =>
                          setProfile((prev) => ({
                            ...prev,
                            phone: e.target.value,
                          }))
                        }
                        className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                      />
                    </div>

                  </div>
                </div>
              )}

              {/* ==================================================
                  PEMINJAMAN
              ================================================== */}

              {activeTab === "peminjaman" && (
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Pengaturan Peminjaman
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Atur aturan peminjaman buku
                  </p>

                  <div className="mt-6 grid gap-5 md:grid-cols-3">

                    {/* Maksimal Buku */}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Maksimal Buku
                      </label>

                      <input
                        type="number"
                        min="1"
                        value={loanSettings.maxBooks}
                        onChange={(e) =>
                          setLoanSettings((prev) => ({
                            ...prev,
                            maxBooks: Number(
                              e.target.value
                            ),
                          }))
                        }
                        className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                      />
                    </div>

                    {/* Lama Peminjaman */}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Lama Peminjaman (Hari)
                      </label>

                      <input
                        type="number"
                        min="1"
                        value={loanSettings.loanDays}
                        onChange={(e) =>
                          setLoanSettings((prev) => ({
                            ...prev,
                            loanDays: Number(
                              e.target.value
                            ),
                          }))
                        }
                        className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                      />
                    </div>

                    {/* Maksimal Perpanjangan */}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Maksimal Perpanjangan
                      </label>

                      <input
                        type="number"
                        min="0"
                        value={loanSettings.maxExtension}
                        onChange={(e) =>
                          setLoanSettings((prev) => ({
                            ...prev,
                            maxExtension: Number(
                              e.target.value
                            ),
                          }))
                        }
                        className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                      />
                    </div>

                  </div>
                </div>
              )}

              {/* ==================================================
                  DENDA
              ================================================== */}

              {activeTab === "denda" && (
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Pengaturan Denda
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Atur biaya denda keterlambatan
                  </p>

                  <div className="mt-6 max-w-md">

                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Denda Per Hari
                    </label>

                    <div className="flex items-center">

                      <span className="rounded-l-xl border border-r-0 border-slate-300 bg-slate-100 px-4 py-3 text-sm">
                        Rp
                      </span>

                      <input
                        type="number"
                        min="0"
                        value={fineSettings.finePerDay}
                        onChange={(e) =>
                          setFineSettings({
                            finePerDay: Number(
                              e.target.value
                            ),
                          })
                        }
                        className="w-full rounded-r-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                      />

                    </div>
                  </div>
                </div>
              )}

              {/* ==================================================
                  NOTIFIKASI
              ================================================== */}

              {activeTab === "notifikasi" && (
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Pengaturan Notifikasi
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Atur notifikasi sistem
                  </p>

                  <div className="mt-6 space-y-4">

                    {/* Loan Reminder */}
                    <label className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-200 p-4">

                      <div>
                        <p className="font-medium text-slate-800">
                          Pengingat Peminjaman
                        </p>

                        <p className="text-sm text-slate-500">
                          Kirim pengingat ketika masa
                          peminjaman hampir berakhir
                        </p>
                      </div>

                      <input
                        type="checkbox"
                        checked={
                          notifications.loanReminder
                        }
                        onChange={(e) =>
                          setNotifications(
                            (prev) => ({
                              ...prev,
                              loanReminder:
                                e.target.checked,
                            })
                          )
                        }
                        className="h-5 w-5"
                      />

                    </label>

                    {/* Late Reminder */}
                    <label className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-200 p-4">

                      <div>
                        <p className="font-medium text-slate-800">
                          Pengingat Keterlambatan
                        </p>

                        <p className="text-sm text-slate-500">
                          Berikan notifikasi jika buku
                          terlambat
                        </p>
                      </div>

                      <input
                        type="checkbox"
                        checked={
                          notifications.lateReminder
                        }
                        onChange={(e) =>
                          setNotifications(
                            (prev) => ({
                              ...prev,
                              lateReminder:
                                e.target.checked,
                            })
                          )
                        }
                        className="h-5 w-5"
                      />

                    </label>

                    {/* Payment Notification */}
                    <label className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-200 p-4">

                      <div>
                        <p className="font-medium text-slate-800">
                          Notifikasi Pembayaran
                        </p>

                        <p className="text-sm text-slate-500">
                          Tampilkan notifikasi ketika
                          denda dibayar
                        </p>
                      </div>

                      <input
                        type="checkbox"
                        checked={
                          notifications.paymentNotification
                        }
                        onChange={(e) =>
                          setNotifications(
                            (prev) => ({
                              ...prev,
                              paymentNotification:
                                e.target.checked,
                            })
                          )
                        }
                        className="h-5 w-5"
                      />

                    </label>

                  </div>
                </div>
              )}

              {/* ==================================================
                  KEAMANAN
              ================================================== */}

              {activeTab === "keamanan" && (
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Keamanan
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Kelola password akun
                  </p>

                  <div className="mt-6 max-w-xl space-y-5">

                    {/* Password Lama */}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Password Lama
                      </label>

                      <input
                        type="password"
                        value={security.oldPassword}
                        onChange={(e) =>
                          setSecurity((prev) => ({
                            ...prev,
                            oldPassword:
                              e.target.value,
                          }))
                        }
                        placeholder="Masukkan password lama"
                        className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                      />
                    </div>

                    {/* Password Baru */}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Password Baru
                      </label>

                      <input
                        type="password"
                        value={security.newPassword}
                        onChange={(e) =>
                          setSecurity((prev) => ({
                            ...prev,
                            newPassword:
                              e.target.value,
                          }))
                        }
                        placeholder="Masukkan password baru"
                        className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                      />
                    </div>

                    {/* Konfirmasi */}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Konfirmasi Password
                      </label>

                      <input
                        type="password"
                        value={
                          security.confirmPassword
                        }
                        onChange={(e) =>
                          setSecurity((prev) => ({
                            ...prev,
                            confirmPassword:
                              e.target.value,
                          }))
                        }
                        placeholder="Ulangi password baru"
                        className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                      />
                    </div>

                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
                      Password akan benar-benar diubah
                      setelah sistem login terhubung ke
                      backend. Untuk keamanan, password
                      tidak disimpan di localStorage.
                    </div>

                  </div>
                </div>
              )}

              <div className="mt-6 sm:mt-8 flex justify-end border-t border-slate-100 pt-5">
                <button
                  type="button"
                  onClick={handleSave}
                  className="flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white transition hover:bg-slate-800 active:scale-95"
                >
                  <Save size={16} />
                  {saved ? "Tersimpan" : "Simpan Perubahan"}
                </button>
              </div>

            </div>
          </div>
        </div>
    </div>
  );
}
