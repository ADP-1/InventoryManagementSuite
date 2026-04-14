import React from 'react';
import { Box, Users, FileText, AlertTriangle } from 'lucide-react';
import PageHeader from '../../components/shared/PageHeader';
import { useProducts } from '../../hooks/useProducts';
import { useCustomers } from '../../hooks/useCustomers';
import { useInvoices } from '../../hooks/useInvoices';
import { cn, formatCurrency } from '../../lib/utils';
import LoadingSpinner from '../../components/shared/LoadingSpinner';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  description?: string;
  className?: string;
  isLoading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, description, className, isLoading }) => (
  <div className={cn("bg-white p-6 rounded-2xl border border-slate-200 shadow-sm", className)}>
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        {isLoading ? (
          <div className="h-8 w-24 bg-slate-100 animate-pulse rounded mt-1" />
        ) : (
          <h3 className="text-2xl font-bold text-slate-900 mt-1">{value}</h3>
        )}
        {description && <p className="text-xs text-slate-400 mt-1">{description}</p>}
      </div>
      <div className={cn("p-3 rounded-xl", className?.includes('border-red') ? "bg-red-50 text-red-600" : "bg-indigo-50 text-indigo-600")}>
        <Icon size={24} />
      </div>
    </div>
  </div>
);

const DashboardPage: React.FC = () => {
  const { products, isLoading: isLoadingProducts } = useProducts({ size: 1000 });
  const { customers, isLoading: isLoadingCustomers } = useCustomers({ size: 1000 });
  const { invoices, isLoading: isLoadingInvoices } = useInvoices({ size: 1000 });

  const lowStockProducts = products?.content.filter(p => p.quantity < 10) || [];
  const totalInvoicesValue = invoices?.content.reduce((sum, inv) => sum + inv.total, 0) || 0;

  return (
    <div>
      <PageHeader 
        title="Dashboard" 
        description="Overview of your business performance and inventory status"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Total Products" 
          value={products?.totalElements || 0} 
          icon={Box} 
          isLoading={isLoadingProducts}
        />
        <StatCard 
          title="Total Customers" 
          value={customers?.totalElements || 0} 
          icon={Users} 
          isLoading={isLoadingCustomers}
        />
        <StatCard 
          title="Total Sales" 
          value={formatCurrency(totalInvoicesValue)} 
          icon={FileText} 
          isLoading={isLoadingInvoices}
          description={`${invoices?.totalElements || 0} invoices generated`}
        />
        <StatCard 
          title="Low Stock Alerts" 
          value={lowStockProducts.length} 
          icon={AlertTriangle} 
          isLoading={isLoadingProducts}
          className={lowStockProducts.length > 0 ? "border-red-200 ring-2 ring-red-50" : ""}
          description={lowStockProducts.length > 0 ? "Requires attention" : "All stock levels healthy"}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center">
            <AlertTriangle className="mr-2 text-amber-500" size={20} />
            Low Stock Products
          </h3>
          
          {isLoadingProducts ? (
            <LoadingSpinner />
          ) : lowStockProducts.length > 0 ? (
            <div className="space-y-4">
              {lowStockProducts.map(product => (
                <div key={product.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div>
                    <p className="font-semibold text-slate-900">{product.name}</p>
                    <p className="text-xs text-slate-500">SKU: {product.sku}</p>
                  </div>
                  <div className="text-right">
                    <p className={cn("font-bold", product.quantity === 0 ? "text-red-600" : "text-amber-600")}>
                      {product.quantity} left
                    </p>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Inventory Status</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <p className="text-slate-400 font-medium">No low stock alerts today</p>
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Recent Activity</h3>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="w-2 h-2 rounded-full bg-indigo-500 mt-2 shrink-0" />
              <div>
                <p className="text-sm font-medium text-slate-900">System initialization complete</p>
                <p className="text-xs text-slate-500 mt-1">Today at 10:00 AM</p>
              </div>
            </div>
            {/* Additional activity items would be mapped here from an activity log API if available */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
