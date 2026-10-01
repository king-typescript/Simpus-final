import { Pencil, Trash2, CreditCard } from "lucide-react";
import { Avatar } from "../../../components/common/Avatar";
import { StatusBadge } from "../../../components/common/StatusBadge";

export function MemberGridCard({ member, onEdit, onDelete, onOpenCard }) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm hover:shadow-md transition space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar name={member.name} size="lg" />
          <div className="min-w-0">
            <h3 className="font-semibold text-slate-900 text-sm truncate">
              {member.name}
            </h3>
            <p className="text-xs text-slate-400">NIS: {member.nis}</p>
          </div>
        </div>
        <StatusBadge status={member.status} type="member" />
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs border-y border-slate-100 py-2.5">
        <div>
          <span className="text-slate-400">Kelas:</span>{" "}
          <span className="font-medium text-slate-800">{member.className}</span>
        </div>
        <div>
          <span className="text-slate-400">No HP:</span>{" "}
          <span className="font-medium text-slate-800 truncate block">
            {member.phone}
          </span>
        </div>
      </div>

      <div className="flex justify-between items-center pt-1">
        <button
          onClick={() => onOpenCard(member)}
          className="flex items-center gap-1.5 text-xs text-blue-600 font-medium hover:underline cursor-pointer"
        >
          <CreditCard size={14} /> Kartu Anggota
        </button>

        <div className="flex gap-1.5">
          <button
            onClick={() => onEdit(member)}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition active:scale-95"
            title="Edit"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={() => onDelete(member.id)}
            className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition active:scale-95"
            title="Hapus"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
