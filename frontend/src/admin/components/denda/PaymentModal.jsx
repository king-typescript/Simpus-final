import { Modal } from "../../../components/common/Modal";
import { Banknote, Building2, QrCode } from "lucide-react";
import { calculateFine, formatRupiah } from "../../../utils/formatters";

export function PaymentModal({
  open,
  onClose,
  fine,
  finePerDay,
  paymentMethod,
  setPaymentMethod,
  onConfirm,
}) {
  if (!fine) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Pembayaran Denda"
      subtitle="Konfirmasi pembayaran denda anggota."
      maxWidth="max-w-md"
    >
      <div className="space-y-4">
        <div className="rounded-xl bg-slate-50 p-4 text-xs space-y-2">
          <div className="flex justify-between">
            <span className="text-slate-500">Anggota</span>
            <span className="font-semibold text-slate-900">{fine.member}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Keterlambatan</span>
            <span className="font-semibold text-red-600">
              {fine.lateDays} hari
            </span>
          </div>
          <div className="flex justify-between pt-2 border-t border-slate-200/60 mt-2">
            <span className="text-sm font-semibold text-slate-700">
              Total Denda
            </span>
            <span className="text-lg font-black text-slate-900">
              {formatRupiah(calculateFine(fine.lateDays, finePerDay))}
            </span>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold text-slate-700">
            Metode Pembayaran
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: "Tunai", icon: Banknote },
              { id: "Transfer", icon: Building2 },
              { id: "QRIS", icon: QrCode },
            ].map((method) => {
              const Icon = method.icon;
              return (
                <button
                  key={method.id}
                  onClick={() => setPaymentMethod(method.id)}
                  className={`flex flex-col items-center justify-center gap-1 rounded-xl border p-3 transition active:scale-95 ${
                    paymentMethod === method.id
                      ? "border-blue-600 bg-blue-50 text-blue-700"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Icon
                    size={18}
                    className={
                      paymentMethod === method.id
                        ? "text-blue-600"
                        : "text-slate-400"
                    }
                  />
                  <span className="text-[11px] font-semibold">{method.id}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-100 pt-4 mt-6">
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            className="rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-blue-700 active:scale-95 shadow-sm shadow-blue-500/20"
          >
            Konfirmasi Pembayaran
          </button>
        </div>
      </div>
    </Modal>
  );
}
