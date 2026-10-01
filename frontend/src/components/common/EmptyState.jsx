export function EmptyState({ icon: Icon, message = "Data tidak ditemukan" }) {
  return (
    <div className="py-12 text-center">
      {Icon && <Icon size={36} className="mx-auto text-slate-300" />}
      <p className="mt-2 text-sm font-medium text-slate-600">{message}</p>
    </div>
  );
}
