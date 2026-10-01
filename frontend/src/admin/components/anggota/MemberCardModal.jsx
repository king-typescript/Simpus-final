import { Modal } from "../../../components/common/Modal";
import { Printer } from "lucide-react";

export function MemberCardModal({ open, onClose, member }) {
  if (!member) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Kartu Anggota Digital"
      subtitle="Pratinjau kartu anggota perpustakaan."
      maxWidth="max-w-md"
    >
      <div className="space-y-4">
        {/* Realistic Library Card */}
        <div className="rounded-2xl bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-800 p-5 text-white shadow-xl relative overflow-hidden">
          <div className="absolute -right-8 -bottom-8 h-36 w-36 rounded-full bg-white/10 blur-xl pointer-events-none" />
          <div className="flex justify-between items-start border-b border-white/20 pb-3">
            <div>
              <h3 className="font-bold text-sm tracking-wide">SIMPUS SATAK</h3>
              <p className="text-[10px] text-blue-100 font-light">
                KARTU ANGGOTA PERPUSTAKAAN
              </p>
            </div>
            <span className="rounded-full bg-emerald-400/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-200 border border-emerald-400/30">
              {member.status}
            </span>
          </div>

          <div className="mt-4 flex gap-4 items-center">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-white/20 text-2xl font-black text-white shadow-inner border border-white/30">
              {member.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold truncate leading-tight">
                {member.name}
              </p>
              <p className="text-xs text-blue-100 mt-1 font-mono">
                NIS: {member.nis}
              </p>
              <p className="text-xs text-blue-200 mt-0.5">
                Kelas: {member.className}
              </p>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-white/15 flex justify-between items-center text-[10px] text-blue-200">
            <span>Berlaku s/d Kelulusan</span>
            <span className="font-mono">SIMPUS-ID-2026</span>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <button
            onClick={() => window.print()}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition active:scale-95"
          >
            <Printer size={15} /> Cetak Kartu
          </button>
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-semibold text-white hover:bg-slate-800 transition active:scale-95"
          >
            Tutup
          </button>
        </div>
      </div>
    </Modal>
  );
}
