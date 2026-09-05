
interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  pageSize?: number
  onPageSizeChange?: (size: number) => void
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  pageSize = 10,
  onPageSizeChange,
}: PaginationProps) {
  const pageSizes = [10, 25, 50, 100]

  return (
    <div className="flex items-center justify-between py-4">
      <div className="flex items-center gap-2">
        <label htmlFor="pageSize" className="text-sm text-[var(--muted)]">
          Items per page:
        </label>
        <select
          id="pageSize"
          value={pageSize}
          onChange={(e) => onPageSizeChange?.(Number(e.target.value))}
          className="bg-[var(--surface-2)] text-[var(--text)] rounded px-2 py-1 text-sm"
        >
          {pageSizes.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 rounded text-sm bg-[var(--surface-2)] text-[var(--text)] disabled:opacity-50"
        >
          ←
        </button>

        <span className="text-sm text-[var(--muted)]">
          Page {currentPage} of {totalPages}
        </span>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 rounded text-sm bg-[var(--surface-2)] text-[var(--text)] disabled:opacity-50"
        >
          →
        </button>
      </div>
    </div>
  )
}

