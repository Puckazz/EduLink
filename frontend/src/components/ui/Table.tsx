import type { ReactNode } from 'react';

interface Column<T> {
  key: keyof T;
  header: string;
  render?: (value: T[keyof T], row: T) => ReactNode;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  emptyText?: string;
}

export function Table<T extends { id: string | number }>({
  columns,
  data,
  emptyText = 'Không có dữ liệu',
}: TableProps<T>) {
  return (
    <div className="w-full overflow-x-auto rounded-lg border border-gray-200">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-gray-600">
          <tr>
            {columns.map((col) => (
              <th
                key={String(col.key)}
                className="px-4 py-3 text-left font-medium"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-8 text-center text-gray-400"
              >
                {emptyText}
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50">
                {columns.map((col) => (
                  <td key={String(col.key)} className="px-4 py-3">
                    {col.render
                      ? col.render(row[col.key], row)
                      : String(row[col.key] ?? '')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
