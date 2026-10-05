import { createContext, useContext, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, AlertTriangle, X } from "lucide-react";

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [notification, setNotification] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null);

  const showSuccess = useCallback((title, message = "") => {
    setNotification({
      type: "success",
      title,
      message,
    });
  }, []);

  const showError = useCallback((title, message = "") => {
    setNotification({
      type: "error",
      title,
      message,
    });
  }, []);

  const showConfirm = useCallback(
    ({
      title,
      message,
      confirmText = "Ya, Lanjutkan",
      cancelText = "Batal",
      confirmVariant = "danger",
      onConfirm,
      onCancel,
    }) => {
      setConfirmDialog({
        title,
        message,
        confirmText,
        cancelText,
        confirmVariant,
        onConfirm,
        onCancel,
      });
    },
    []
  );

  const closeNotification = useCallback(() => {
    setNotification(null);
  }, []);

  const handleConfirm = useCallback(async () => {
    if (confirmDialog?.onConfirm) {
      await confirmDialog.onConfirm();
    }
    setConfirmDialog(null);
  }, [confirmDialog]);

  const handleCancel = useCallback(() => {
    if (confirmDialog?.onCancel) {
      confirmDialog.onCancel();
    }
    setConfirmDialog(null);
  }, [confirmDialog]);

  return (
    <NotificationContext.Provider
      value={{ showSuccess, showError, showConfirm }}
    >
      {children}

      {/* ================= CENTER NOTIFICATION MODAL ================= */}
      <AnimatePresence>
        {notification && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeNotification}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", duration: 0.35, bounce: 0.2 }}
              className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 text-center z-10"
            >
              <button
                onClick={closeNotification}
                className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 transition"
              >
                <X size={18} />
              </button>

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full mb-4">
                {notification.type === "success" ? (
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                    <CheckCircle2 size={32} />
                  </div>
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                    <XCircle size={32} />
                  </div>
                )}
              </div>

              <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1">
                {notification.title}
              </h3>

              {notification.message && (
                <p className="text-xs sm:text-sm text-slate-600 mb-5 leading-relaxed">
                  {notification.message}
                </p>
              )}

              <button
                type="button"
                onClick={closeNotification}
                className={`w-full rounded-xl py-2.5 px-4 text-xs sm:text-sm font-semibold text-white shadow-sm transition active:scale-95 ${
                  notification.type === "success"
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-rose-600 hover:bg-rose-700"
                }`}
              >
                Selesai
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= CENTER CONFIRMATION MODAL ================= */}
      <AnimatePresence>
        {confirmDialog && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCancel}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", duration: 0.35, bounce: 0.2 }}
              className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 text-center z-10"
            >
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-600 mb-4">
                <AlertTriangle size={32} />
              </div>

              <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1">
                {confirmDialog.title}
              </h3>

              {confirmDialog.message && (
                <p className="text-xs sm:text-sm text-slate-600 mb-6 leading-relaxed">
                  {confirmDialog.message}
                </p>
              )}

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 rounded-xl border border-slate-200 py-2.5 px-4 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 transition active:scale-95"
                >
                  {confirmDialog.cancelText}
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  className={`flex-1 rounded-xl py-2.5 px-4 text-xs sm:text-sm font-semibold text-white shadow-sm transition active:scale-95 ${
                    confirmDialog.confirmVariant === "danger"
                      ? "bg-rose-600 hover:bg-rose-700"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {confirmDialog.confirmText}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotification harus digunakan di dalam NotificationProvider"
    );
  }
  return context;
}
