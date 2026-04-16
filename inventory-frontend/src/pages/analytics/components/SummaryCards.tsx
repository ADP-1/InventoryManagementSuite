import React from 'react';
import { DollarSign, FileText, Users, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SummaryStats } from '../../../types/analytics.types';
import { formatCurrency } from '../../../lib/utils';
import StatCard from '../../../components/shared/StatCard';

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
      iconColor: 'bg-orange-100 text-orange-600',
      trend: data ? data.revenueGrowthPercent : 0,
    },
    {
      title: 'Total Invoices',
      value: data ? data.totalInvoices.toString() : '0',
      subtitle: data ? `${data.invoicesThisWeek} this week` : '',
      icon: FileText,
      iconColor: 'bg-blue-100 text-blue-600',
    },
    {
      title: 'Total Customers',
      value: data ? data.totalCustomers.toString() : '0',
      subtitle: data ? `${data.newCustomersThisMonth} new this month` : '',
      icon: Users,
      iconColor: 'bg-amber-100 text-amber-600',
    },
    {
      title: 'Low Stock Alerts',
      value: data ? `${data.lowStockCount} products` : '0 products',
      subtitle: 'needs reorder',
      icon: AlertTriangle,
      iconColor: 'bg-red-100 text-red-600',
      onClick: () => navigate('/inventory/products?filter=lowstock'),
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, idx) => (
        <StatCard
          key={idx}
          title={card.title}
          value={card.value}
          icon={card.icon}
          iconColor={card.iconColor}
          subtitle={card.subtitle}
          trend={card.trend}
          onClick={card.onClick}
          isLoading={isLoading}
        />
      ))}
    </div>
  );
};

export default SummaryCards;
