export function Pagination({
  count,
  page,
  pageSize,
  onPageChange,
}: {
  count: number
  page: number
  pageSize: number
  onPageChange: (page: number) => void
}) {
  const totalPages = Math.max(1, Math.ceil(count / pageSize))
  const start = count === 0 ? 0 : (page - 1) * pageSize + 1
  const end = Math.min(page * pageSize, count)

  return (
    <div className="flex items-center justify-between border-t border-cream-200 pt-3 text-sm text-navy-500">
      <span>
        Showing {start} to {end} of {count} results
      </span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="rounded-md border border-cream-300 px-2.5 py-1 text-navy-600 transition-colors hover:bg-cream-200 disabled:cursor-not-allowed disabled:opacity-40"
        >
          ←
        </button>
        <span className="rounded-md bg-navy-900 px-3 py-1 font-semibold text-white">{page}</span>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="rounded-md border border-cream-300 px-2.5 py-1 text-navy-600 transition-colors hover:bg-cream-200 disabled:cursor-not-allowed disabled:opacity-40"
        >
          →
        </button>
      </div>
    </div>
  )
}
