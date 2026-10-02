export function StatTile({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="rounded-2xl border border-cream-300 bg-white p-5">
      <p className="text-sm text-navy-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-navy-900">{value}</p>
      {hint && <p className="mt-1 text-xs font-medium text-success-text">{hint}</p>}
    </div>
  )
}
