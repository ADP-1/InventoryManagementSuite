import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ExternalLink, ArrowRight } from 'lucide-react';
import { InvoiceResponse } from '../../../types/analytics.types';
import { formatCurrency, formatDate } from '../../../lib/utils';
import { cn } from '../../../lib/utils';

interface RecentInvoicesTableProps {
  data?: InvoiceResponse[];
  isLoading: boolean;
}

const statusColors = {
  DRAFT: 'bg-slate-100 text-slate-700',
  ISSUED: 'bg-indigo-100 text-indigo-700',
  PAID: 'bg-emerald-100 text-emerald-700',
  CANCELLED: 'bg-rose-100 text-rose-700',
};

const RecentInvoicesTable: React.FC<RecentInvoicesTableProps> = ({ data, isLoading }) => {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm animate-pulse">
        <div className="h-4 bg-slate-200 rounded w-1/4 mb-6" />
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-10 bg-slate-100 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-full">
      <div className="p-6 pb-4">
        <h3 className="text-slate-900 font-bold text-lg">Recent Invoices</h3>
        <p className="text-slate-500 text-sm">Latest billing activity</p>
      </div>

      <div className="flex-1 overflow-x-auto">
        <table className="w-full text-left">
          <tbody className="divide-y divide-slate-100">
            {data?.map((invoice) => (
              <tr 
                key={invoice.id} 
                className="hover:bg-slate-50/50 transition-colors cursor-pointer group"
                onClick={() => navigate('/billing/invoices')}
              >
                <td className="px-6 py-4">
                  <div className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {invoice.invoiceNumber}
                  </div>
                  <div className="text-[11px] text-slate-400 font-medium">{formatDate(invoice.createdAt)}</div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                  {invoice.customerName}
                </td>
                <td className="px-6 py-4 text-sm font-bold text-slate-900 text-right">
                  {formatCurrency(invoice.total)}
                </td>
                <td className="px-6 py-4 text-right">
                  <span className={cn(
                    "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                    statusColors[invoice.status]
                  )}>
                    {invoice.status}
                  </span>
                </td>
              </tr>
            ))}
            {(!data || data.length === 0) && (
              <tr>
                <td colSpan={4} className="px-6 py-10 text-center text-slate-400 font-medium">
                  No recent invoices found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Link 
        to="/billing/invoices" 
        className="p-4 border-t border-slate-100 text-center text-indigo-600 text-sm font-bold hover:bg-slate-50 transition-colors flex items-center justify-center gap-1.5"
      >
        View all invoices <ArrowRight size={14} />
      </Link>
    </div>
  );
};

export default RecentInvoicesTable;
