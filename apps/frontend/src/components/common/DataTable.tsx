import React from 'react'

interface TableColumn<T> {
  key: keyof T | string
  label: string
  render?: (value: any, row: T) => React.ReactNode
  align?: 'left' | 'center' | 'right'
  width?: string
}

interface DataTableProps<T> {
  columns: TableColumn<T>[]
  data: T[]
  loading?: boolean
  empty?: boolean
  onRowClick?: (row: T) => void
  actions?: (row: T) => React.ReactNode
}

export function DataTable<T extends { id?: string | number }>({
  columns,
  data,
  loading,
  empty,
  onRowClick,
  actions,
}: DataTableProps<T>) {
  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="w-8 h-8 border-4 border-[var(--surface-2)] border-t-[var(--brand)] rounded-full animate-spin" />
      </div>
    )
  }

  if (empty || data.length === 0) {
    return (
      <div className="text-center py-8 text-[var(--muted)]">
        No data available
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-[var(--surface-2)]">
            {columns.map((col) => (
              <th
                key={String(col.key)}
                className={`px-4 py-3 text-left text-sm font-semibold text-[var(--muted)] text-${
                  col.align || 'left'
                }`}
                style={{ width: col.width }}
              >
                {col.label}
              </th>
            ))}
            {actions && <th className="px-4 py-3 text-right text-sm font-semibold text-[var(--muted)]">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr
              key={row.id || idx}
              className="border-b border-[var(--surface-2)] hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
              onClick={() => onRowClick?.(row)}
            >
              {columns.map((col) => (
                <td
                  key={String(col.key)}
                  className={`px-4 py-4 text-sm text-${col.align || 'left'}`}
                >
                  {col.render
                    ? col.render((row as any)[String(col.key)], row)
                    : (row as any)[String(col.key)]}
                </td>
              ))}
              {actions && (
                <td className="px-4 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                  {actions(row)}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

