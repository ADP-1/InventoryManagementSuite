import React from 'react';
import { DollarSign, FileText, Users, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SummaryStats } from '../../../types/analytics.types';
import { formatCurrency } from '../../../lib/utils';
import { cn } from '../../../lib/utils';

interface SummaryCardsProps {
  data?: SummaryStats;
  isLoading: boolean;
}

const SummaryCards: React.FC<SummaryCardsProps> = ({ data, isLoading }) => {
  const navigate = useNavigate();

  const cards = [
    {
      title: 'Total Revenue',
      value: data ? formatCurrency(data.totalRevenue) : '₹0',
      subtitle: data ? `${data.revenueGrowthPercent >= 0 ? '+' : ''}${data.revenueGrowthPercent.toFixed(1)}% this month` : '',
      icon: DollarSign,
      color: 'bg-teal-500',
      textColor: 'text-teal-600',
      trend: data ? data.revenueGrowthPercent : 0,
    },
    {
      title: 'Total Invoices',
      value: data ? data.totalInvoices.toString() : '0',
      subtitle: data ? `${data.invoicesThisWeek} this week` : '',
      icon: FileText,
      color: 'bg-indigo-500',
      textColor: 'text-indigo-600',
    },
    {
      title: 'Total Customers',
      value: data ? data.totalCustomers.toString() : '0',
      subtitle: data ? `${data.newCustomersThisMonth} new this month` : '',
      icon: Users,
      color: 'bg-amber-500',
      textColor: 'text-amber-600',
    },
    {
      title: 'Low Stock Alerts',
      value: data ? `${data.lowStockCount} products` : '0 products',
      subtitle: 'needs reorder',
      icon: AlertTriangle,
      color: 'bg-red-500',
      textColor: 'text-red-600',
      onClick: () => navigate('/inventory/products?filter=lowstock'),
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm animate-pulse">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-slate-200 rounded-xl" />
            </div>
            <div className="h-4 bg-slate-200 rounded w-1/2 mb-2" />
            <div className="h-8 bg-slate-200 rounded w-3/4 mb-2" />
            <div className="h-4 bg-slate-200 rounded w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className={cn(
              "bg-white p-6 rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md",
              card.onClick && "cursor-pointer active:scale-95"
            )}
            onClick={card.onClick}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={cn("p-2.5 rounded-xl text-white shadow-lg shadow-opacity-20", card.color)}>
                <Icon size={20} />
              </div>
              {card.trend !== undefined && (
                <div className={cn(
                  "flex items-center text-xs font-bold px-2 py-1 rounded-full",
                  card.trend >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                )}>
                  {card.trend >= 0 ? <TrendingUp size={12} className="mr-1" /> : <TrendingDown size={12} className="mr-1" />}
                  {Math.abs(card.trend).toFixed(1)}%
                </div>
              )}
            </div>
            <h3 className="text-slate-500 text-sm font-medium">{card.title}</h3>
            <p className="text-2xl font-bold text-slate-900 mt-1">{card.value}</p>
            <p className="text-slate-400 text-xs mt-1 font-medium">{card.subtitle}</p>
          </div>
        );
      })}
    </div>
  );
};

export default SummaryCards;
