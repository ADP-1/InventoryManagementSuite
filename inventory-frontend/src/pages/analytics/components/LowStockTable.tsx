import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import { LowStockItem } from '../../../types/analytics.types';
import { cn } from '../../../lib/utils';

interface LowStockTableProps {
  data?: LowStockItem[];
  isLoading: boolean;
}

const LowStockTable: React.FC<LowStockTableProps> = ({ data, isLoading }) => {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm animate-pulse">
        <div className="h-4 bg-slate-200 rounded w-1/4 mb-6" />
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-10 bg-slate-100 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  const getStockBadge = (quantity: number) => {
    if (quantity === 0) return { label: 'Out of stock', class: 'bg-rose-100 text-rose-700' };
    if (quantity <= 5) return { label: 'Critical', class: 'bg-rose-100 text-rose-700' };
    return { label: 'Low', class: 'bg-amber-100 text-amber-700' };
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-6 pb-0 flex items-center justify-between mb-4">
        <div>
          <h3 className="text-slate-900 font-bold text-lg">Low Stock Alerts</h3>
          <p className="text-slate-500 text-sm">Products that need replenishment</p>
        </div>
        <Link 
          to="/inventory/products?filter=lowstock" 
          className="text-orange-500 text-sm font-bold hover:underline inline-flex items-center"
        >
          View All <ExternalLink size={14} className="ml-1" />
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 border-y border-slate-100">
              <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Product</th>
              <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">SKU</th>
              <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Stock</th>
              <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data?.slice(0, 8).map((item) => {
              const badge = getStockBadge(item.currentQuantity);
              return (
                <tr key={item.sku} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-900 truncate max-w-[200px]">{item.productName}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 font-medium">{item.sku}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{item.categoryName}</td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-900 text-center">{item.currentQuantity}</td>
                  <td className="px-6 py-4">
                    <span className={cn("px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider", badge.class)}>
                      {badge.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => navigate('/inventory/products')}
                      className="p-1.5 text-slate-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-all"
                    >
                      <ExternalLink size={16} />
                    </button>
                  </td>
                </tr>
              );
            })}
            {(!data || data.length === 0) && (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-slate-400 font-medium">
                  All products have sufficient stock levels.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LowStockTable;
