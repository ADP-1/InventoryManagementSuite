import React from 'react';
import { ChevronLeft, ChevronRight, Inbox } from 'lucide-react';
import { cn } from '../../lib/utils';
import LoadingSpinner from './LoadingSpinner';

interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => React.ReactNode);
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data?: T[];
  isLoading?: boolean;
  pageNumber?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  emptyMessage?: string;
}

const DataTable = <T extends { id: string | number }>({
  columns,
  data,
  isLoading,
  pageNumber = 0,
  totalPages = 1,
  onPageChange,
  emptyMessage = "No records found"
}: DataTableProps<T>) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 flex flex-col items-center justify-center">
        <LoadingSpinner size={40} />
        <p className="mt-4 text-slate-500 font-medium">Loading data...</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-16 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
          <Inbox className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900">{emptyMessage}</h3>
        <p className="text-slate-500 mt-1 max-w-xs">Try adjusting your filters or add a new record to get started.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {columns.map((column, idx) => (
                <th
                  key={idx}
                  className={cn(
                    "px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider",
                    column.className
                  )}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {data.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                {columns.map((column, idx) => (
                  <td
                    key={idx}
                    className={cn(
                      "px-6 py-4 text-sm text-slate-600 whitespace-nowrap",
                      column.className
                    )}
                  >
                    {typeof column.accessor === 'function'
                      ? column.accessor(item)
                      : (item[column.accessor] as React.ReactNode)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Page <span className="font-medium">{pageNumber + 1}</span> of <span className="font-medium">{totalPages}</span>
          </p>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onPageChange?.(pageNumber - 1)}
              disabled={pageNumber === 0}
              className="p-2 rounded-md border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => onPageChange?.(pageNumber + 1)}
              disabled={pageNumber >= totalPages - 1}
              className="p-2 rounded-md border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
