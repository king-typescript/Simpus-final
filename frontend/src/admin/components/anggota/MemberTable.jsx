import { Users, Pencil, Trash2, CreditCard } from "lucide-react";
import { Avatar } from "../../../components/common/Avatar";
import { StatusBadge } from "../../../components/common/StatusBadge";
import { EmptyState } from "../../../components/common/EmptyState";

export function MemberTable({ members, onEdit, onDelete, onOpenCard }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full min-w-[700px] text-left">
          <thead className="border-b border-slate-100 bg-slate-50/75">
            <tr>
              <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Anggota
              </th>
              <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                NIS
              </th>
              <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Kelas
              </th>
              <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                No. HP
              </th>
              <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Status
              </th>
              <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {members.length > 0 ? (
              members.map((member) => (
                <tr key={member.id} className="transition hover:bg-slate-50/70">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <Avatar name={member.name} size="md" />
                      <div>
                        <p className="font-semibold text-slate-900 text-sm">
                          {member.name}
                        </p>
                        <p className="text-xs text-slate-400">
                          Bergabung {member.joined}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-slate-600">
                    {member.nis}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                      {member.className}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-slate-600">
                    {member.phone}
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={member.status} type="member" />
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex justify-end gap-1.5">
                      <button
                        onClick={() => onOpenCard(member)}
                        title="Kartu Anggota"
                        className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-blue-600"
                      >
                        <CreditCard size={15} />
                      </button>
                      <button
                        onClick={() => onEdit(member)}
                        title="Edit"
                        className="rounded-lg p-1.5 text-slate-400 transition hover:bg-blue-50 hover:text-blue-600"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => onDelete(member.id)}
                        title="Hapus"
                        className="rounded-lg p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6">
                  <EmptyState icon={Users} message="Anggota tidak ditemukan" />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
